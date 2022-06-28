import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { emailUtility } from '../helpers/emailhelper';
import { Member } from './members.model';
import { Tradegiftcard } from '../trades/trade.giftcard.model';
import { Withdrawrequest } from '../withdrawrequest/withdrawrequest.model';
import { Transaction } from '../transactions/transaction.model';
import { hashPassword, comparePassword } from '../helpers/passwordUtils';
import { signToken } from '../helpers/jwtTokenUtils';
import {v4} from 'uuid';
import axios from 'axios';
import moment from 'moment';

dotenv.config();

// Add new Admin
export async function addAdmin(req: Request, res: Response): Promise<Response> {
        const harshedPassword = await hashPassword(req.body.password);
        const emailEntry = req.body.email.toLowerCase();
        const codeGenerated = getCode();
        const members = new Member({
                firstName: req.body.firstName,
                role: "SubAdmin",
                lastName: req.body.lastName,
                phoneNumber: req.body.phoneNumber || '',
                email: emailEntry,
                password: harshedPassword,
                forgotPasswordCode: '',
                isVerified: false,
                verificationCode: codeGenerated,
                isEnabled: true,
                forgotPasswordCodeStatus: false,
                profilePic: '',
             
        });
        try {
                const isUserExist = await Member.findOne({ $or:[{'email': emailEntry}, {'phoneNumber':  req.body.phoneNumber} ]});
                if (isUserExist) {
                        return res.status(400).send({ status: 400, message: ' Email already exists' });
                }
                const from = {
                        name: process.env.emailName,
                        address: process.env.user	
                    }
                const emailFrom = from;
                const subject = 'Verification link';
                const hostUrl = `${process.env.adminUrl}/verifyemail/${codeGenerated}`;
                const hostUrl2 = `${process.env.adminUrl2}/verifyemail/${codeGenerated}`;
                const { firstName } = req.body;
                const text = 'Welcome to Cardbarter, verify your account by clicking the link below';
                const emailTo = req.body.email.toLowerCase();
                const link = `${hostUrl}`;
                const link2 = `${hostUrl2}`;
                emailUtility(emailFrom, emailTo, subject, link, link2, text, firstName);

                const savemember = await members.save();
                console.log(savemember);
                if (savemember._id) {
                        return res.status(201).send({ status: 201, message: 'Admin  created successfully' });
                }
                return res.status(400).send({ status: 400, message: 'Error while creating profile ' });
        } catch (err) {
                console.log(err);
                return res.status(500).send({ status: 500, message: 'Error while creating profile ' });
        }
}

// Add new exchanger
export async function addExchanger(req: Request, res: Response): Promise<Response> {
        const harshedPassword = await hashPassword(req.body.password);
        const emailEntry = req.body.email.toLowerCase();
        const codeGenerated = getCode();
        const members = new Member({
                firstName: req.body.firstName,
                role: "Exchanger",
                lastName: req.body.lastName,
                phoneNumber: req.body.phoneNumber || '',
                email: emailEntry,
                password: harshedPassword,
                forgotPasswordCode: '',
                isVerified: false,
                verificationCode: codeGenerated,
                isEnabled: true,
                forgotPasswordCodeStatus: false,
                profilePic: '',
                waletBalance: 0.0,
                isSetPin: false,
                pin: ""
        });
        try {
                const isUserExist = await Member.findOne({ $or:[{'email': emailEntry}, {'phoneNumber':  req.body.phoneNumber} ]});
                if (isUserExist) {
                        return res.status(400).send({ status: 400, message: ' Email already exists' });
                }
                
                const from = {
                        name: process.env.emailName,
                        address: process.env.user	
                    }
                const emailFrom = from;
                const subject = 'Verification link';
                const hostUrl = `${process.env.hostUrl}/verifyemail/${codeGenerated}`;
                const hostUrl2 = `${process.env.hostUrl2}/verifyemail/${codeGenerated}`;
                const { firstName } = req.body;
                const text = 'Welcome to Cardbarter, verify your account by clicking the link below';
                const emailTo = req.body.email.toLowerCase();
                const link = `${hostUrl}`;
                const link2 = `${hostUrl2}`;
                emailUtility(emailFrom, emailTo, subject, link, link2, text, firstName);

                const savemember = await members.save();
                console.log(savemember);
                if (savemember._id) {
                        return res.status(201).send({ status: 201, message: 'Exchanger created successfully' });
                }
                return res.status(400).send({ status: 400, message: 'Error while creating profile ' });
        } catch (err) {
                console.log(err);
                return res.status(500).send({ status: 500, message: 'Error while creating profile ' });
        }
}

// Login admin
export async function loginAdmin(req: Request, res: Response): Promise<Response> {
        const emailEntry = req.body.email.toLowerCase();
        const passwordIncoming = req.body.password;
        try {
                const User = await Member.findOne({ email: emailEntry });
                if (User) {
                        const id = User._id;
                        const retrievedPassword = User.password;
                        const { firstName, lastName, phoneNumber, email, isVerified, isEnabled, role } = User;
                        const profilePic = User.profilePic || '';
                        const isMatch = await comparePassword(passwordIncoming, retrievedPassword);
                        console.log(User.role);
                        if (User.role !== 'Admin' && User.role !== 'SubAdmin') {
                                return res.status(403).json({ status: 403, message: 'Unauthorized access' });
                        }
                        if (isMatch) {
                                if (User.isEnabled === false) {
                                        return res.status(400).json({
                                                status: 400,
                                                message: 'Your account has been disabled contact the admin to enable your account',
                                        });
                                }

                                const tokens = await signToken(
                                        id,
                                        firstName,
                                        lastName,
                                        phoneNumber,
                                        email,
                                        isVerified,
                                        isEnabled,
                                        profilePic,
                                        role
                                );
                                const user = {
                                        profile: {},
                                        token: '',
                                };
                                user.profile = {
                                        id,
                                        firstName,
                                        lastName,
                                        phoneNumber,
                                        email,
                                        isVerified,
                                        isEnabled,
                                        profilePic,
                                        role,
                                };
                                user.token = tokens;
                                return res.status(200).send({ status: 200, message: user });
                        }
                        return res.status(400).json({ status: 400, message: 'Incorrect Login Details' });
                }
                return res.status(400).send({ status: 400, message: 'Incorrect Login details' });
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: 'Error while signing in ' });
        }
}

// Login exchanger
export async function loginExchanger(req: Request, res: Response): Promise<Response> {
        const emailEntry = req.body.email.toLowerCase();
        const passwordIncoming = req.body.password;
        try {
                const User = await Member.findOne({ email: emailEntry });
                if (User) {
                        const id = User._id;
                        const retrievedPassword = User.password;
                        const {
                                firstName,
                                lastName,
                                phoneNumber,
                                email,
                                isVerified,
                                isEnabled,
                                walletBalance,
                                role,
                                accountDetails,
                                isSetPin,
                                createdAt
                        } = User;
                        const profilePic = User.profilePic || '';
                        const isMatch = await comparePassword(passwordIncoming, retrievedPassword);
                        console.log(isMatch);
                        if (User.role != 'Exchanger') {
                                return res.status(403).json({ status: 403, message: 'Unauthorized access' });
                        }
                        if (isMatch) {
                                if (User.isEnabled === false) {
                                        return res.status(400).json({
                                                status: 400,
                                                message: 'Your account has been disabled contact the admin to enable your account',
                                        });
                                }

                                const tokens = await signToken(
                                        id,
                                        firstName,
                                        lastName,
                                        phoneNumber,
                                        email,
                                        isVerified,
                                        isEnabled,
                                        profilePic,
                                        role
                                );
                                const user = {
                                        profile: {},
                                        token: '',
                                };
                                user.profile = {
                                        id,
                                        firstName,
                                        lastName,
                                        phoneNumber,
                                        email,
                                        isVerified,
                                        isEnabled,
                                        walletBalance,
                                        profilePic,
                                        role,
                                        accountDetails,
                                        isSetPin,
                                        createdAt
                                };
                                user.token = tokens;
                                return res.status(200).send({ status: 200, message: user });
                        }
                        return res.status(400).json({ status: 400, message: 'Incorrect Login Details' });
                }
                return res.status(400).send({ status: 400, message: 'Incorrect Login details' });
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: 'Error while signing in ' });
        }
}

// verify user
export async function verifyUser(req: Request, res: Response): Promise<Response> {
        const { verificationCode } = req.body;
        try {
                const findVerificationCode = await Member.findOne({ verificationCode });
                if (findVerificationCode) {
                        if (findVerificationCode.isVerified === false) {
                                const { _id } = findVerificationCode;
                                const verifyUser = await Member.findOneAndUpdate({ _id }, { isVerified: true });
                                if (verifyUser) {
                                        return res
                                                .status(200)
                                                .send({ status: 200, message: 'Email Verified succesfully' });
                                }
                                return res.status(400).send({ status: 400, message: ' Error while verifying user ' });
                        }
                        return res.status(400).send({ status: 400, message: ' Email has already been verified' });
                }
                return res.status(400).send({ status: 400, message: ' Link has been used or Invalid code' });
        } catch (err) {
                console.log(err);
                return res.status(500).send({ status: 500, message: 'Error while getting member ' });
        }
}

// enable user
export async function enableUser(req: Request, res: Response): Promise<Response> {
        const { userId } = req.body;
        try {
                const isUserExist = await Member.findOne({ _id: userId });
                if (isUserExist) {
                        const { _id } = isUserExist;
                        const enableUser = await Member.findOneAndUpdate({ _id }, { isEnabled: true });
                        if (enableUser) {
                                return res.status(200).send({ status: 200, message: 'User Enabled succesfully' });
                        }
                        return res.status(400).send({ status: 400, message: ' Error while Enabling user ' });
                }
                return res.status(400).send({ status: 400, message: 'Invalid user' });
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: 'Error while Enabling user ' });
        }
}

// disable user
export async function disableUser(req: Request, res: Response): Promise<Response> {
        console.log('ff');
        const { userId } = req.body;
        try {
                const isUserExist = await Member.findOne({ _id: userId });
                if (isUserExist) {
                        const { _id } = isUserExist;
                        const enableUser = await Member.findOneAndUpdate({ _id }, { isEnabled: false });
                        if (enableUser) {
                                return res.status(200).send({ status: 200, message: 'User Disabled succesfully' });
                        }
                        return res.status(400).send({ status: 400, message: ' Error while disabling user ' });
                }
                return res.status(400).send({ status: 400, message: 'Invalid user' });
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: 'Error while disabling user ' });
        }
}

 // user change password
export async function changePassword(req: any, res: Response): Promise<Response> {
      
        const  oldpassword  = req.body.oldPassword;
        const  newpassword  = req.body.newPassword;
        try{
                const email = req.user.email
                console.log(req.user.email)
           
              const getpassword = await Member.findOne({email: email} )
              const retrievedPassword = getpassword.password
              const isMatch = await comparePassword(oldpassword, retrievedPassword);
              console.log(isMatch )
               if (isMatch){ 
                const newharshpassword = await hashPassword(newpassword);
                console.log("newpassword")
                console.log(newpassword) 
                console.log(getpassword._id)              
               
                const _id  = getpassword._id
                const updatePassword = await Member.findOneAndUpdate({ _id }, { password: newharshpassword });
                console.log(updatePassword)

                const from = {
                        name: process.env.emailName,
                        address: process.env.user	
                    }
                const emailFrom = from;
                const subject = 'Reset Password Succesful ';                      
                const hostUrl = process.env.hostUrl
                 const hostUrl2 = process.env.hostUrl2  
                const   text = "Your password has just been changed"
                const emailTo = req.user.email.toLowerCase();
                const link = `${hostUrl}`;
                const link2 = `${hostUrl2}`;
                emailUtility(emailFrom, emailTo, subject, link, link2, text, req.user.firstName);
                  
                 return res.status(200).send({ status: 200, message:"Password changed succesfully"})
                                 
             
               }else{
                return res.status(400).send({ status: 400, message:"Incorrect old password "})
               }        
                
            }catch(err){
                console.log(err)
                return res.status(500).send({status: 500, message:"Error while changing password "})
            }
}

// forgot password endpoint
export async function forgotPassword(req: any, res: Response): Promise<Response> {
        const  email  = req.body.email;
        try{
                const isUserExist = await Member.findOne({email: email.toLowerCase()} )
                        if(isUserExist){
                                const code = v4()
                                const _id = isUserExist._id;
                                const saveCode = await Member.findOneAndUpdate({ _id }, { forgotPasswordCode: code });
                                console.log(saveCode)
                                if(saveCode){
                                        const username = isUserExist.firstName;
                                        const from = {
                                                name: process.env.emailName,
                                                address: process.env.user	
                                            }
                                        const emailFrom = from;
                                        const subject = 'Reset password link';                      
                                        const hostUrl = ""+process.env.hostUrl+"/resetpassword?code="+code+""
                                        const hostUrl2 = ""+process.env.hostUrl2+"/resetpassword?code="+code+""   
                                        const   text = "Your password reset link is shown below. Click on the reset button to change your password"
                                        const emailTo = req.body.email.toLowerCase();
                                        const link = `${hostUrl}`;
                                        const link2 = `${hostUrl2}`;
                                        emailUtility(emailFrom, emailTo, subject, link, link2, text, username);
                                
                                        return res.status(200).send({ status: 200, message:"Reset link sent succesfully"})
                                }{ 
                                        return  res.status(400).send({status: 400,message:"Invalid exist"})

                                }
                
                                        
                        }
                        else{
                                return  res.status(400).send({message:"User does not exist"})
                        }
                                
                        
        }catch(err){
                console.log(err)
                return res.status(500).send({ status : 500, message:"Error while resetting password   "})
        }
}


export async function verifyForgotpasswordlink(req: any, res: Response): Promise<Response> {
        const code = req.body.code
        try{
                const getcode = await Member.findOne({forgotPasswordCode: code} )
                if(getcode){
                        return res.status(200).send({ status: 200, message:"Link is valid"}) 
                }else{
                        return  res.status(400).send({
                        status: 400,
                        message:"This link you selected has already been used. or invalid "
                        });
                }          
        }catch(err){
                console.log(err)
                return res.status(500).send({ status : 500, message:"Error while resetting password   "})
        }   
}


export async function resendVerificationLink(req: any, res: Response): Promise<Response> {
        const emailNew = req.body.email
        try{
                const getuser = await Member.findOne({email: emailNew} )
                if(getuser){
                        console.log(getuser.isVerified)
                        if(getuser.isVerified) return res.status(400).send({ status: 400, message:"User have been verified"}) 
                        const codeGenerated = getCode();
                        const from = {
                                name: process.env.emailName,
                                address: process.env.user	
                            }
                        const emailFrom = from;
                        const subject = 'Verification link';
                        const hostUrl = `${process.env.hostUrl}/verifyemail/${codeGenerated}`;
                        const hostUrl2 = `${process.env.hostUrl2}/verifyemail/${codeGenerated}`;
                        const { firstName } = req.body;
                        const text = 'Welcome to Cardbarter, verify your account by clicking the link below';
                        const emailTo = req.body.email.toLowerCase();
                        const link = `${hostUrl}`;
                        const link2 = `${hostUrl2}`;
                        emailUtility(emailFrom, emailTo, subject, link, link2, text, firstName);
                        return res.status(200).send({ status: 200, message:"Link sent successfully"}) 
                }else{
                        return  res.status(400).send({
                        status: 400,
                        message:"User not invalid "
                        });
                }          
        }catch(err){
                console.log(err)
                return res.status(500).send({ status : 500, message:"Error while resetting password   "})
        }   
}


// reset password endpoint
export async function resetPassword(req: any, res: Response): Promise<Response> {
        const  newpassword  = req.body.newPassword;
        const code = req.body.code;

        try{
                const getuser = await Member.findOne({forgotPasswordCode: req.body.code} )
                if(getuser){
                        const newHarsedpassword = await hashPassword(newpassword);
                        const _id =   getuser._id
                        const newForgotPasswordCode = ""
                        const updatePassword = await Member.findOneAndUpdate({ _id}, { password: newHarsedpassword });
                        if(updatePassword){
                                const updateCode = await Member.findOneAndUpdate({_id}, { forgotPasswordCode: newForgotPasswordCode  });
                                const from = {
                                        name: process.env.emailName,
                                        address: process.env.user	
                                    }
                                const emailFrom = from;
                                const subject = 'Reset Password Succesful ';                      
                                const hostUrl = process.env.hostUrl
                                const hostUrl2 = process.env.hostUrl2    
                                const   text = 'Your password has been changed succesfully'
                                const emailTo = getuser.email.toLowerCase()
                                const link = `${hostUrl}`;
                                const link2 = `${hostUrl2}`;
                                const fullName = getuser.firstName
                                emailUtility(emailFrom, emailTo, subject, link, link2, text, fullName);
                               return res.status(200).send({ status: 200, message:"Password reset was succesfull"})
                        }else{
                                return res.status(500).send({ status : 500, message:"Error while resetting password   "})
     
                        }          
               
              }else{
                        return  res.status(400).send({
                        status: 400,
                        message:"This link you selected has already been used. or invalid "
                        });
              } 
                  
        }catch(err){
                console.log(err)
                return res.status(500).send({ status : 500, message:"Error while resetting password   "})

        } 
     
       
}


export async function createAccountDetails(req: any, res: Response): Promise<Response> {
        const { accountName, accountNumber, bankName, bankCode } = req.body;
  
        const accountdetails ={
                accountName: accountName,
                accountNumber : accountNumber,
                bankName: bankName,
                id : v4() ,
                bankCode : bankCode
        }
                    
            try{ 
                const postAccountNumber = await Member.updateOne({_id: req.user.id}, { $addToSet: { accountDetails: [accountdetails] } } ) 
                const findMemberById = await Member.findOne({_id: req.user.id})
          
               return res.status(200).send({ status: 200, message:"Account details updated succesfully", accountDetails : findMemberById.accountDetails})           
                
            }catch(err){
                console.log(err)
               return res.status(500).send({ status: 500, message:"Error while updating account details "})
            }
}



export async function updateAccountDetails(req: any, res: Response): Promise<Response> {
        const { accountName, accountNumber, bankName, bankCode } = req.body;
        const accountId  = req.params.id
        const _id = req.user.id
            try{
                const updateAccountDetails = await Member.updateOne( { _id: _id, "accountDetails.id": accountId },  { $set: {  
                    "accountDetails.$.id" : accountId,
                    "accountDetails.$.accountName": accountName,
                    "accountDetails.$.accountNumber" : accountNumber,
                    "accountDetails.$.bankName" : bankName,
                    "accountDetails.$.bankCode": bankCode
                    

                  }})
                  const findMemberById = await Member.findOne({_id: req.user.id})
               return  res.status(200).send({ status: 200, message:"Account details updated succesfully", accountDetails : findMemberById.accountDetails})           
                
            }catch(err){
                console.log(err)
                return res.status(500).send({ status: 500, message:"Error while updating account details "})
            }
}



export async function deleteAccountDetails(req: any, res: Response): Promise<Response> {
        const accountId  = req.params.id
        const _id = req.user.id

        try{
            const deleteAccountDetails = await Member.updateOne(
                { _id: _id },
                { $pull: { accountDetails: { id: accountId} } },
                { multi: true }
              )
            const findMemberById = await Member.findOne({_id: req.user.id})     
            return res.status(200).send({  status:200, message:"Account details deleted succesfully", accountDetails : findMemberById.accountDetails})           
            
        }catch(err){
            console.log(err)
            return res.status(500).send({  status:500, message:"Error while deleting account details "})
        }
    




}



export async function createPin(req: any, res: Response): Promise<Response> {
        const { pin  } = req.body;

              if(Number.isInteger(pin) &&  pin.toString().length === 4  ){
                try{
                     const email = req.user.email
                     const isUserExist = await Member.findOne({email: email.toLowerCase()} )
                             if(isUserExist){
                                if(isUserExist.isSetPin === false &&  isUserExist.pin === ""  ){
                                    const _id = isUserExist._id
                                    const hashedPin = await hashPassword(pin);
                                    const from = {
                                        name: process.env.emailName,
                                        address: process.env.user	
                                        }
                                    const emailFrom = from;
                                    const subject = 'Pin created';                      
                                    const hostUrl =  process.env.hostUrl
                                    const hostUrl2 = process.env.hostUrl2 
                                    const username = req.user.username
                                    const text = 'This is to inform you that you created a pin for your transactions'
                                    const emailTo = req.user.email.toLowerCase();
                                    const link = `${hostUrl}`;
                                    const link2 = `${hostUrl2}`;
                                    const updatePin = await Member.findOneAndUpdate({ _id }, { pin: hashedPin });
                                    const updatePinStatus = await Member.updateOne({ _id: req.user.id }, { isSetPin: true });
                                    emailUtility(emailFrom, emailTo, subject, link, link2, text, username);
                                  return res.status(201).send({ status:200, message:"User pin  created"})
                                  
                                }else{
                                    return res.status(400).send({status:400,message:"You pin has been created previously"})  
                                }
                             }else{
                                
                               return  res.status(400).send({status:400,message:"User details not found"})  
    
                            }
         
        
                    }catch(err){
                            console.log(err)
                            return res.status(500).send(  {status: 500, message:"Error while creating pin "})
                    }
              }else{ 
                return res.status(400).send({
                    status : 400,
                    message:"Pin must be an integer and length must be equal to 4" 
                });             
              }
};


export async function updatePin(req: any, res: Response): Promise<Response> {
    const { oldPin, newPin} = req.body;
        if(Number.isInteger(newPin) &&  newPin.toString().length === 4  ){
                try{
                    const email = req.user.email
                    const getpin = await Member.findOne({email: email} )
                    if(getpin.isSetPin === false) return res.status(400).send({  status:400, message:"User needs to create a  pin before changing pin"})
                    const retrievedPin = getpin.pin
                    const isMatch = await comparePassword(oldPin, retrievedPin);
                    if(isMatch){ 
                        const harsedPin = await hashPassword(newPin);
                        const _id  = getpin._id
                        const updatePin = await Member.findOneAndUpdate({ _id }, { pin: harsedPin });
                        const from = {
                                name: process.env.emailName,
                                address: process.env.user	
                            }
                        const emailFrom = from;
                        const subject = 'Pin changed Successfully ';                      
                        const hostUrl = process.env.hostUrl
                         const hostUrl2 = process.env.hostUrl2  
                        const   text = "Your pin has just been changed"
                        const emailTo = req.user.email.toLowerCase();
                        const link = `${hostUrl}`;
                        const link2 = `${hostUrl2}`;
                        emailUtility(emailFrom, emailTo, subject, link, link2, text, req.user.username);
                        return res.status(200).send({  status:200, message:"Pin changed succesfully"}) 
                    }else{
                        return res.status(400).send({  status:400, message:"Incorrect old pin "})
                    }        
                    
                }catch(err){
                    console.log(err)
                    return res.status(500).send({
                        status:500, message:"Error while changing pin "})
                }
        }else{
                return res.status(400).send({
                        status:400,
                        message:"Pin must be an integer and length must be equal to 4" 
                });
        }
       
};
    

export async function forgotPin(req: any, res: Response): Promise<Response> {
        const { email , phoneNumber} = req.body;
                try{
                    const isUserExist = await Member.findOne({email: email.toLowerCase(), phoneNumber: phoneNumber } )
                    if(isUserExist){ 
                        if(isUserExist.isSetPin === false) return res.status(400).send({  status:400, message:"User needs to create a  pin before forgot pin"})
                        const code = getCode();
                        const _id = isUserExist._id;
                        const saveCode = await Member.findOneAndUpdate({ _id }, { forgotPasswordCode: code });
                        if(saveCode){
                            const username = isUserExist.username;
                            const from = {
                                name: process.env.emailName,
                                address: process.env.user	
                            }
                          const emailFrom = from;
                            const subject = 'Reset Pin Token';                      
                            const hostUrl = process.env.hostUrl
                            const hostUrl2 = process.env.hostUrl2  
                            const   text = "Please use the Token "+code+" to complete your reset pin"
                            const emailTo = req.body.email.toLowerCase();
                            const link = `${hostUrl}`;
                            const link2 = `${hostUrl2}`;
                            emailUtility(emailFrom, emailTo, subject, link, link2, text, username);
                            return res.status(201).send({ status:200, message:" Pin Reset link sent to your mail succesfully"})
                        }else{ 
                           return res.status(400).send({ status:200, message:"Error while forgetting password"})
                        }                  
                    }
                    else{
                       return  res.status(400).send({status:400, message:"User details not correct"})
                    } 
                }catch(err){
                    console.log(err)
                    return  res.status(500).send({status:500,message:"Error while resetting password   "})
                }
};


export async function findWalletBalance(req: any, res: Response): Promise<Response> {
        try{
            let id = req.user.id
            const findWalletBalance = await Member.findOne({_id: id}, "waletBalance")

        //     const countPendingTrade = await Trades.countDocuments({userId: id, tradeStatus: "Created", } )
        //     const countCompletedTrade = await Trades.countDocuments({userId: id, tradeStatus: "Confirmed", } )
       
            return res.status(200).send({ status: 200, message : {waletBalance:findWalletBalance.waletBalance }})         
        }catch(err){
            console.log(err)
            return res.status(500).send({ status:500,message:"Error while getting wallet balance "})
        }
};
    

export async function resetPin(req: any, res: Response): Promise<Response> {
        const { pin, code} = req.body;
            if(Number.isInteger(pin) && pin.toString().length === 4){
                try{
                    const getuser = await Member.findOne({forgotPasswordCode: code} )
                    if(getuser ){
                          if(getuser.isSetPin === false) return res.status(400).send({  status:400, message:"User needs to create a  pin before reset"})
                            const temporaryPin = pin
                            const newpin =  await hashPassword(temporaryPin)
                            const newForgotPinCode = ""
                            const _id =   getuser._id 
                            const updatePin= await Member.findOneAndUpdate({ _id}, { pin: newpin });
                            const updateCode = await Member.findOneAndUpdate({_id}, { forgotPasswordCode: newForgotPinCode  });
                            const from = {
                                name: process.env.emailName,
                                address: process.env.user	
                                }
                                const emailFrom = from;
                            const subject = 'Reset pin Successful  ';                      
                            const hostUrl = process.env.hostUrl
                            const hostUrl2 = process.env.hostUrl2    
                            const   text = 'Your pin has been changed Successfully '
                            const emailTo = getuser.email.toLowerCase()
                            const link = `${hostUrl}`;
                            const link2 = `${hostUrl2}`;
                            const username = getuser.username
                            emailUtility(emailFrom, emailTo, subject, link, link2, text, username);
                            return res.status(200).send({status:200,message:"Pin reset was successful"})
                                  
                    }else{
                            return res.status(400).send({
                                status:400,
                                message:"This link you selected has already been used or invalid "
                            });
                        } 
                    
                }catch(err){
                    console.log(err)
                    return res.status(500).send({ status:500,message:"Error while reseting pin "})
                }
               
            }else{
                return res.status(400).send({
                    status:400,
                    message:"Pin must be an integer and length must be equal to 4"
                });
            }
};
    


export async function findAllMembers(req: any, res: Response): Promise<Response> {
        try{
        
                const{ limit}= req.query
                const{ role}= req.query
                if(limit){
                        const findAllMembers = await Member.find({role: role}).sort({"_id": -1}).limit(limit)
                  
                      return  res.status(200).send({ status: 200, message: findAllMembers})
                 }else{
                    const findAllMembers = await Member.find({role: role}).sort({"_id": -1})  

                  
                   return  res.status(200).send({ status: 200, message: findAllMembers})
                 }
                
        }catch(err){
                console.log(err)
                return  res.status(500).send({ status: 500, message:"Error while getting all users "})
        }
}


export async function findMembeById(req: any, res: Response): Promise<Response> {
        try{
            let id = req.params.id
            const findMemberById = await Member.findOne({_id: id})
             return res.status(200).send({ status: 200, message:findMemberById})
               
           }catch(err){
               console.log(err)
             return res.status(500).send({ status: 500, message:"Error while getting member "})
           }
        
}


// get bank code
export async function getBanksCode(req: any, res: Response): Promise<Response> {
       const  bankCodeUrl  = 'https://api.flutterwave.com/v3/banks/NG'
     
        try{
            console.log("getBankCode")
            const headers = {
                'Authorization': process.env.flutterwaveToken!,
                'Content-Type': 'application/json'      
                }
            
            const  getAllCode = await axios.get(bankCodeUrl, {headers: headers}) 
                let allCode = getAllCode.data.data
                if(getAllCode.status === 200){
                   return res.status(200).send({ status: 200, message: allCode})
                }else{
                    return res.status(400).send({ status: 400, message: "error while calling flutter wave"})
                }
          
           }catch(err){
               console.log(err)
               return res.status(500).send({ status: 500, message:"Error while getting bank code "})
           }
};

export async function userDashboard(req: any, res: Response): Promise<Response> {
        try{

            let id = req.user.id
            const query = getQueryThisMonth()

             //all time debit    
            const sumTotalthisMonthDebit = await Withdrawrequest.aggregate(
                [
                    { $match: {...query, status: "Completed",  userId: id } },
                {  
                
                $group : {
                    _id : null ,
                    totalAmount: { $sum: "$amount"} || 5, 
                    
                }
                }
            ])

            if(sumTotalthisMonthDebit.length === 0){
                var thisMonthDebit = 0
            }else{
                thisMonthDebit =sumTotalthisMonthDebit[0].totalAmount
            }


            // income this month
            const sumTotalThisMonthCreditGiftcard = await Tradegiftcard.aggregate(
                [
                    { $match: { ...query, tradeStatus: "Completed",  userId: id } },
                {  
                
                $group : {
                    _id : null ,
                    totalAmount: { $sum: "$amount"} || 5, 
                    
                }
                }
            ])

            if(sumTotalThisMonthCreditGiftcard.length === 0){
                var thisMonthCreditGiftcard = 0
            
            }else{
                thisMonthCreditGiftcard =sumTotalThisMonthCreditGiftcard[0].totalAmount
            }
          
        
            // total spent
            const sumTotalallTimeDebit = await Withdrawrequest.aggregate(
                [
                    { $match: {status: "Completed",  userId: id } },
                {  
                
                $group : {
                    _id : null ,
                    totalAmount: { $sum: "$amount"} || 5, 
                    
                }
                }
            ])

            if(sumTotalallTimeDebit.length === 0){
                var allTimeDebit = 0
            }else{
                allTimeDebit =sumTotalallTimeDebit[0].totalAmount
            }

            //wallet balance
            const findWalletBalance = await Member.findOne({_id: id}, "waletBalance")


            return res.status(200).send({ status: 200, message : { thisMonthIncome: thisMonthCreditGiftcard,  thisMonthWithdrawal: thisMonthDebit, totalSpent: allTimeDebit, walletBalance: findWalletBalance.waletBalance}})         
        }catch(err){
            console.log(err)
            return res.status(500).send({ status:500,message:"Error while getting wallet balance "})
        }
};
    
















const getQueryThisMonth = () =>{
        const from_date = moment().startOf('month').format('YYYY-MM-DD hh:mm');
        let to_date = moment(new Date()).format('YYYY-MM-DD');
      
       const query = {  createdAt:{ $gte: new Date(new Date(from_date).setHours(0, 0, 0)), $lte: new Date(new Date(to_date).setHours(23, 59, 59)) }}
       return query
    }






// generate 6 alphanumeric code
function getCode() {
        const numbers = '0123456789';

        const chars = 'abcdefghijklmnopqrstuvwxyz';

        const code_length = 6;
        let number_count = 3;
        let letter_count = 3;

        let code = '';

        for (let i = 0; i < code_length; i++) {
                const letterOrNumber = Math.floor(Math.random() * 2);
                if ((letterOrNumber == 0 || number_count == 0) && letter_count > 0) {
                        letter_count--;
                        const rnum = Math.floor(Math.random() * chars.length);
                        code += chars[rnum];
                } else {
                        number_count--;
                        const rnum2 = Math.floor(Math.random() * numbers.length);
                        code += numbers[rnum2];
                }
        }
        return code;
}
