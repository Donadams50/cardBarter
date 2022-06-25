
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { emailUtility } from '../helpers/emailhelper';
import { Withdrawrequest } from './withdrawrequest.model';
import { Member } from '../members/members.model';
import { Adminconfig } from '../adminconfig/adminconfig.model';
import { Notifications } from '../notifications/notifications.model';
import { Transaction } from '../transactions/transaction.model';
import axios from 'axios';
import {v4} from 'uuid';
import moment from 'moment';
 dotenv.config();



// withdraw  funds
export async function withdrawFunds(req: any, res: any): Promise<Response> {
        const {amount, accountName, accountNumber, bankName ,  bankCode, narration } = req.body;
        const emailList = await Member.find({ $or: [ { role: "Admin" }, { role: "SubAdmin" } ] })
        try{
            const _id = req.user.id
            const getUser = await Member.findOne({_id: _id});
            const findConfiguration = await Adminconfig.findOne();
            const transAmount =    parseFloat(amount)
            const walletBalance =  parseFloat(getUser.waletBalance)
            const finalBalance  =  walletBalance - transAmount
            const minimumWithdrawer = parseFloat(findConfiguration.minimumWithdrawer) 
            const maximumWithdrawer = parseFloat(findConfiguration.maximumWithdrawer)
            const narrations =  narration || "Fund withdrawer"
            if(walletBalance >= transAmount ){
                if(transAmount >= minimumWithdrawer &&  transAmount <= maximumWithdrawer ){

                        const transaction = new Transaction({      
                            status: "Pending",
                            sellerId: _id,  
                            sellerDetails: _id,            
                            amount: transAmount.toFixed(2), 
                            type : "Debit",
                            initialBalance : walletBalance.toFixed(2),
                            finalBalance: finalBalance.toFixed(2),
                            bankName: bankName,
                            accountName: accountName,
                            accountNumber: accountNumber,
                            bankCode: bankCode,
                            narration : narrations || "Fund Withdrawer"
                            });

                        const withdrawrequest = new Withdrawrequest({      
                            status: "Pending",
                            userDetails: _id,
                            userId:  _id,
                            bankName: bankName,
                            accountName: accountName,
                            accountNumber: accountNumber,
                            amount:transAmount.toFixed(2),
                            bankCode: bankCode,
                            narration : narration || "Fund withdrawer"
                        });   

                            const saveTransaction = await  transaction.save()
                            const saveWithdrawerRequest = await withdrawrequest.save() 
                            const withdrawerRequestId = saveWithdrawerRequest._id
                            const updateUserWallet = await Member.findOneAndUpdate({ _id }, { waletBalance: finalBalance.toFixed(2) });  
                            const updateWithdrawerRequest = await Withdrawrequest.updateOne({ _id: withdrawerRequestId }, { transactionId: saveTransaction._id }); 

                            emailList.map(email => {       
                                const from = {
                                    name: process.env.emailName,
                                    address: process.env.user	
                                  }
                                    const emailFrom = from;
                                    const subject = 'New withdrawer request';                      
                                    const hostUrl =  process.env.adminUrl
                                    const hostUrl2 =   process.env.adminUrl2
                                    const username = "Admin"
                                    const   text = "You have a new withdrawal request to attend to, Please login to your dashboard to view this." 
                                    const emailTo = email.email;
                                    const link = `${hostUrl}`;
                                    const link2 = `${hostUrl2}`;
                                    emailUtility(emailFrom, emailTo, subject, link, link2, text, username);
                            }) 
                            const notify = new Notifications({      
                                userId: _id,
                                userDetails: _id,
                                title: "Fund Withdrawer",
                                isRead: false,
                                message : "You submitted a Withdrawer request of  NGN "+transAmount+" "
                            })
                            await  notify.save()

                            return res.status(200).send({ status: 200, message:"Processing your request"})
                    
                }else{
                    return res.status(400).send({status: 400, message:"Minimum or Maximum withdrawer exceeded"})
                }
            }else{
                return res.status(400).send({status: 400, message:"Insufficient funds in your wallet"})
            }

        }catch(err){
            console.log(err)
            return res.status(500).send({ status: 500, message:"Error while making withdrawer request "})
        }
};


  //find  all withdrawer
export async function getAllWithdrawerrequest(req: any, res: any): Promise<Response> {
    // console.log("i enter")
     try{
         if(req.query.limit){
             const resultsPerPage =  parseInt(req.query.limit);
             const query = getQueryNoAmount({ ...req.query })
             const findWithdrawerRequest = await Withdrawrequest.find(query).sort({ _id: "desc" }).limit(resultsPerPage).populate('userDetails')
             return res.status(200).send({status: 200, message: findWithdrawerRequest})
         }else{
             const query = getQueryNoAmount({ ...req.query })
             const findWithdrawerRequest = await Withdrawrequest.find(query).sort({ _id: "desc" }).populate('userDetails')
             return res.status(200).send({status: 200, message: findWithdrawerRequest})
         }
        }catch(err){
            console.log(err)
            return res.status(500).send({message:"Error while getting Withdrawer request "})
        }
 };

       
export async function cancelWithdrawerRequest(req: any, res: any): Promise<Response> {
    try{
              const _id = req.params.withdrawerrequestId;
              const getWithdrawerRequest = await Withdrawrequest.findOne({_id: _id})
              const getUserDetails = await Member.findOne({_id:getWithdrawerRequest.userId})
              const userId = getUserDetails._id
             if(getWithdrawerRequest.status === "Completed" || getWithdrawerRequest.status === "Declined" ){
                   return res.status(400).send({ status: 400, message:"This withdrawer request has been completed or cancelled"})

             }else{    
                    const amount =  getWithdrawerRequest.amount
                    const transAmount = parseFloat(amount)
                    const walletBalance =  parseFloat(getUserDetails.waletBalance)
                    const finalBalance  =  parseFloat(getUserDetails.waletBalance) + parseFloat(amount) 
                    const transactionId = getWithdrawerRequest.transactionId
    
                    const updateWithdrawerrequest= await Withdrawrequest.findOneAndUpdate({ _id }, { status: "Declined" });    
                    const updateTransaction = await Transaction.updateOne({_id:  transactionId }, { status: "Failed" });  

                    const  transaction = new Transaction({      
                                status: "Successful",
                                sellerId: userId, 
                                sellerDetails: userId,             
                                amount: amount.toFixed(2),
                                type : "Credit",
                                initialBalance : walletBalance.toFixed(2),
                                finalBalance: finalBalance.toFixed(2),
                                bankName: getWithdrawerRequest.bankName,
                                accountName: getWithdrawerRequest.accountName,
                                accountNumber: getWithdrawerRequest.accountNumber,
                                bankCode: getWithdrawerRequest.bankCode,
                                narration : "Transaction Reversed",
                                transactionLabel: "transaction_reversed"
                            });
                    
                            const saveTransaction = await  transaction.save()      
                            const updateUserWallet = await Member.updateOne({_id:  userId }, { waletBalance: finalBalance.toFixed(2) });  
        
                            const notify = new Notifications({      
                                userId: userId,
                                userDetails: userId,
                                title: "Withdrawer request cancelled",
                                isRead: false,
                                message : "Your Withdrawer request has been rejected and you funds has been reversed "
                              })
                              const postNotification = await  notify.save()
                              const from = {
                                name: process.env.emailName,
                                    address: process.env.user	
                                }
                            const emailFrom = from;
                            const subject = 'Funds reversed';                      
                            const hostUrl =  process.env.hostUrl!
                            const hostUrl2 =   process.env.hostUrl2!
                            const username =  getUserDetails.username
                            const   text = "Your withdrawer request has been rejected and you funds has been reversed" 
                            const emailTo = getUserDetails.email
                            const link = `${hostUrl}`;
                            const link2 = `${hostUrl2}`;
                            emailUtility(emailFrom, emailTo, subject, link, link2, text, username);
    
                      return  res.status(200).send({ status: 200, message:"Withdrawer request declined succesfully"})
            }
    }
    catch(err){
        console.log(err)
        return res.status(500).send({ status: 500, message:"Error while cancelling order "})
    }

};


       
export async function getWithdrawerRequestById(req: any, res: any): Promise<Response> {
    try{
        const id = req.params.withdrawerrequestId
        const findWithdrawerRequestById = await Withdrawrequest.findOne({_id: id}).populate('userDetails')
        return res.status(200).send( {status:200, findWithdrawerRequestById})
    }catch(err){
        console.log(err)
        return res.status(500).send({ status:500,message:"Error while getting single withdrawer request "})
    }
};

//manual success
export async function manualSuccessWithdrawerRequest(req: any, res: any): Promise<Response> {
    try{
              const _id = req.params.withdrawerrequestId;
              const getWithdrawerRequest = await Withdrawrequest.findOne({_id: _id})
              const getUserDetails = await Member.findOne({_id: getWithdrawerRequest.userDetails})
              const userId = getUserDetails._id
             if(getWithdrawerRequest.status === "Completed" || getWithdrawerRequest.status === "Declined" ){
                   return res.status(400).send({ status: 400, message:"This withdrawer request has been completed or cancelled"})

             }else{    
                    const transactionId = getWithdrawerRequest.transactionId
                    const updateWithdrawerrequest= await Withdrawrequest.findOneAndUpdate({ _id }, { status: "Completed" });  
                     await Withdrawrequest.findOneAndUpdate({ _id }, { reference: "manual_success" });    
                    const updateTransaction = await Transaction.updateOne({_id:  transactionId }, { status: "Successful" });  
                    const from = {
                        name: process.env.emailName,
                        address: process.env.user	
                        }
                    const emailFrom = from;
                    const subject = 'Funds sent';                      
                    const hostUrl =  process.env.hostUrl
                    const hostUrl2 =   process.env.hostUrl2
                    const username =  getUserDetails.username
                    const   text = "Your withdrawer request has been approved and you funds has been sent" 
                    const emailTo = getUserDetails.email
                    const link = `${hostUrl}`;
                    const link2 = `${hostUrl2}`;
                    emailUtility(emailFrom, emailTo, subject, link, link2, text, username);
                    const notify = new Notifications({      
                        userId: getUserDetails._id,
                        userDetails: getUserDetails._id,
                        title: "Withdrawal Request",
                        isRead: false,
                        message : "Your withdrawal request of NGN "+getWithdrawerRequest.amount+" has been approved by Cardbarter."
                      })
                      const postNotification = await  notify.save()
                    return  res.status(200).send({ status: 200, message:"Manual success posted succesfully"})
             }
    }
    catch(err){
        console.log(err)
       return  res.status(500).send({ status: 500, message:"Error while approving withdrawer request through manual success"})
    }

};


export async function flutterwaveWithdrawer (req: any, res: any): Promise<Response> {

       
    try{
             //const sess = await mongoose.startSession()
           //  sess.startTransaction()
              
              const _id = req.params.withdrawerrequestId;
              const  getWithdrawerRequest = await Withdrawrequest.findOne({_id: _id})
               const  getUserDetails = await Member.findOne({_id: getWithdrawerRequest.userDetails})
             const userId = getUserDetails._id
             if(getWithdrawerRequest.status === "Completed" || getWithdrawerRequest.status === "Declined" ){
                return  res.status(400).send({ status: 400, message:"This withdrawer request has been completed or cancelled"})

             }else{    
                        const transactionId = getWithdrawerRequest.transactionId
                        const reference = v4()
                        const account_bank= getWithdrawerRequest.bankCode
                        const  account_number = getWithdrawerRequest.accountNumber
                        const amount = getWithdrawerRequest.amount
                        
                        const bankBranch = getWithdrawerRequest.bankBranch
                        const accountName = getWithdrawerRequest.accountName
                        const narration = "Sent Fund by Admin"
                        const currency = "NGN"
                        const makepayment = await makePaymentNigeria(account_bank , account_number  , amount, narration , currency, reference,  accountName)
                            console.log(makepayment.data)
                            console.log(makepayment.status)
                            console.log(makepayment.data.status)
                             //console.log(sendmoney.data)
                        
                            


                   
                    if (makepayment.data  && makepayment.data.status === "success") {
                        const updateReference = await Withdrawrequest.updateOne({ _id: _id }, { reference: reference }); 
                        const updateTransaction = await Transaction.updateOne({_id:  transactionId }, { reference: reference });

                            if (makepayment.data.data.status === "SUCCESSFUL" && makepayment.data.data.complete_message === "Transaction was successful"  ) {
                                const updateWithdrawerrequest= await Withdrawrequest.updateOne({ _id: _id }, { status: "Completed",  flutterPaymentId: makepayment.data.data.id });    
                                const updateTransaction = await Transaction.updateOne({_id:  transactionId }, { status: "Successful" });
                                const from = {
                                    name: process.env.emailName,
                                    address: process.env.user	
                                }
                                const emailFrom = from; 
                                const subject = 'Funds sent';                      
                                const hostUrl =  process.env.hostUrl
                                const hostUrl2 =   process.env.hostUrl2
                                const username =  getUserDetails.username
                                const   text = "Your withdrawer request has been approved and you funds has been sent" 
                                const emailTo = getUserDetails.email
                                const link = `${hostUrl}`;
                                const link2 = `${hostUrl2}`;
                                emailUtility(emailFrom, emailTo, subject, link, link2, text, username);
    
                              return res.status(200).send({ status: 200, message:"Flutter wave withdrawer posted succesfully"})
                            }else{
        
                                    const updatePaymentStatus = await Withdrawrequest.updateOne({ _id : _id}, { status: "Processing", flutterPaymentId: makepayment.data.data.id });    
                                    const from = {
                                        name: process.env.emailName,
                                        address: process.env.user	
                                    }
                                    const emailFrom = from; 
                                    const subject = 'Fund processed';                      
                                    const hostUrl =  process.env.hostUrl
                                    const hostUrl2 =   process.env.hostUrl2
                                    const username =  getUserDetails.username
                                    const   text = "Your withdrawer request has been processsed, you will receive your funds soo" 
                                    const emailTo = getUserDetails.email
                                    const link = `${hostUrl}`;
                                    const link2 = `${hostUrl2}`;
                                    emailUtility(emailFrom, emailTo, subject, link, link2, text, username);
                
                                     return res.status(200).send({ status: 200, message:"Payment is being processed"})      
                            }
                    
    
                    }else{
    
                        console.log("enter trade")
                        // console.log(reference)
                       return res.status(400).send({ status: 400, message:"Payment not successful"})   
                        // const updatePaymentStatus = await Trades.findOneAndUpdate({ _id }, { paymentStatus: "Failed" });  
                    } 

                   // await sess.commitTransaction()
                   // sess.endSession(); 
            }
    }
    catch(err){
        console.log(err)
       return res.status(500).send({ status: 500, message:"Error while approving withdrawer request "})
    }

};



export async function updateFlutterResponse (req: any, res: any): Promise<Response> {
    const {  id , status  , reference, complete_message} = req.body.data;
    console.log("complete_message")  
    console.log(complete_message)

    console.log("reference")  
    console.log(reference)
     
      console.log("status")
      console.log(status)
      try{
       
          const getwithdrawerrequest = await Withdrawrequest.findOne({reference: reference})
          const getTransaction= await Transaction.findOne({reference: reference})
          console.log("User Id")
          console.log(getwithdrawerrequest)
          const getUserDetails = await Member.findOne({_id:getwithdrawerrequest.userId})
          //const sess = await mongoose.startSession()
        //  sess.startTransaction()
          const userId = getUserDetails._id
          console.log("User Id")
          console.log(userId)
          console.log("getwithdrawerrequest")
          console.log(getwithdrawerrequest)
          const _id = getwithdrawerrequest._id;
          const transactionId = getTransaction._id
          if(getwithdrawerrequest.status === "Processing"){
              if (status === "SUCCESSFUL" && complete_message === "Transaction was successful"  ) {
                    const updateWithdrawerrequest= await Withdrawrequest.updateOne({ _id: _id }, { status: "Completed" });    
                    const updateTransaction = await Transaction.updateOne({_id:  transactionId }, { status: "Successful" });
                    const from = {
                        name: process.env.emailName,
                        address: process.env.user	
                    }
                    const emailFrom = from; 
                    const subject = 'Funds sent';                      
                    const hostUrl =  process.env.hostUrl
                    const hostUrl2 =   process.env.hostUrl2
                    const username =  getUserDetails.username
                    const   text = "Your withdrawer request has been approved and you funds has been sent" 
                    const emailTo = getUserDetails.email
                    const link = `${hostUrl}`;
                    const link2 = `${hostUrl2}`;
                    emailUtility(emailFrom, emailTo, subject, link, link2, text, username);
                  
                
                    return res.status(200).send({message:"Success"})
              }else if (status === "FAILED" ) {
                                    const amount =  getwithdrawerrequest.amount
                                    const transAmount = parseFloat(amount)
                                    const walletBalance =  parseFloat(getUserDetails.walletBalance)
                                    const finalBalance  =  parseFloat(getUserDetails.walletBalance) + parseFloat(amount) 

                                    if (getwithdrawerrequest.accountType === "Bank"){
                                            var transactions = new Transaction({      
                                                status: "Successful",
                                                sellerId: userId, 
                                                sellerDetails: userId,             
                                                amount: amount.toFixed(2),
                                                type : "Credit",
                                                initialBalance : walletBalance.toFixed(2),
                                                finalBalance: finalBalance.toFixed(2),
                                                bankName: getwithdrawerrequest.bankName,
                                                accountName: getwithdrawerrequest.accountName,
                                                accountNumber: getwithdrawerrequest.accountNumber,
                                                narration : "Transaction Reversed",
                                                accountType: getwithdrawerrequest.accountType,
                                                bankBranch: getwithdrawerrequest.bankBranch,
                                                branchName: getwithdrawerrequest.branchName
                                                
                                            });
                                           
                                    }else{
                                            transactions = new Transaction({      
                                                status: "Successful",
                                                sellerId: userId,    
                                                sellerDetails: userId,          
                                                amount: amount.toFixed(2),
                                                type : "Credit",
                                                initialBalance : walletBalance.toFixed(2),
                                                finalBalance: finalBalance.toFixed(2),
                                                mobileNumber: getwithdrawerrequest.mobileNumber,
                                                mobileNetwork: getwithdrawerrequest.mobileNetwork,
                                                narration : "Transaction Reversed",
                                                accountType: getwithdrawerrequest.accountType,
                                                accountName: getwithdrawerrequest.accountName
                                                
                                            });
                                         
                                   }
                                            const saveTransaction = await  transactions.save()      
                                            const updateUserWallet = await Member.updateOne({_id:  userId }, { walletBalance: finalBalance.toFixed(2) });  
                                            const updatePaymentStatus = await Withdrawrequest.updateOne({ _id : _id }, { status: "Declined" });  
                                            const updateTransaction = await Transaction.updateOne({_id:  transactionId }, { status: "Failed" });
                                             return res.status(200).send({message:"Success"})
  
              }else {
                   console.log("i think its still processing")
                   console.log(status)
                   return  res.status(200).send({message:"Success"})
              }
          }else{
                console.log("This trade has been completed ,  Invalid or has not been paid")
                return res.status(200).send({message:"Success"})
          }  
         // await sess.commitTransaction()
         // sess.endSession();
      }catch(err){
          console.log(err)
           return  res.status(500).send({message:"Error while completing trade "})
      }
  };



  const makePaymentNigeria = async (account_bank: string , account_number: string  , amount: string, narration :string, currency: string, reference: string,  accountName: string) => {
    try {
     // const referenceNumber =
      console.log("make payment")
      const headers = {
          'Authorization': process.env.flutterwaveToken!,
          'Content-Type': 'application/json'      
          }
          const params = {

            

            account_bank: account_bank,
            account_number: account_number,
            amount: amount,
            narration: narration || "Withdraw funds",
            currency: currency,
            reference : `${reference}`,
             callback_url : `https://fierce-sierra-41986.herokuapp.com/flutter/webhook/payment/status/${reference}`,
            beneficiary_name: accountName,
          
          }  
         // console.log(params)
       const  sendmoney = await axios.post('https://api.flutterwave.com/v3/transfers', params, {headers: headers}) 
         // console.log(sendmoney.data)
        
  
      return sendmoney.data
    } catch (err) { 
      console.log(err)
      return err
    }
  }




const getQueryNoAmount = (queryObj: any) =>{
    let monthAgo = moment().subtract(1, 'months').format('YYYY-MM-DD');
    let today = moment(new Date()).format('YYYY-MM-DD');
    let {  from_date=monthAgo, to_date=today, status= /.*/ } = queryObj
    if(status==="All"){
        status = /.*/
    }
   const query = { status:status, createdAt:{ $gte: new Date(new Date(from_date).setHours(0, 0, 0)), $lte: new Date(new Date(to_date).setHours(23, 59, 59)) }}
   return query
}