import { Notifications} from './notifications.model';
import { emailSupportSystem } from '../helpers/emailhelper';
import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';


// get all trade by query parameter
export async function getNotificationByUser (req: any, res: any): Promise<Response> {
    try{
             if(!req.query.offset || !req.query.limit) return  res.status(400).send({status: 400, message:"limit and Offset query parameters is required"})
             const offset1 = parseInt(req.query.offset);
             const lim = parseInt(req.query.limit) 
            if(offset1 === 1){ 
                const findNotification = await Notifications.find({userId : req.user.id}).sort({"_id": -1}).limit(lim)
                const unReadCount = await Notifications.countDocuments({userId : req.user.id, isRead : false})   
                const allCount = await Notifications.countDocuments({userId : req.user.id})  
                return res.status(200).send({ status: 200, findNotification:findNotification,unReadCount:unReadCount, allCount: allCount})
            }else{
                const page = offset1 -1;
                const findNotification = await Notifications.find({userId : req.user.id}).sort({"_id": -1}).limit(lim).skip(lim * page)
                const unReadCount = await Notifications.countDocuments({userId : req.user.id, isRead : false})   
                const allCount = await Notifications.countDocuments({userId : req.user.id})    
                return res.status(200).send({ status: 200, findNotification:findNotification,unReadCount:unReadCount, allCount: allCount})   
             } 
    }catch(err){
           console.log(err)
           return res.status(500).send({status: 500, message:"Error while getting all users notifications "})
    }
};

// mark read
export async function markRead (req: any, res: any): Promise<Response> {
            try{
                const postNotification = await  Notifications.updateMany(
                    { userId: { $in: req.user.id } }, 
                    { $set: { isRead: true }}
                );

                 return res.status(200).send({ status: 200, message:"Mark read Succesfully"})                       
                
            }catch(err){
                console.log(err)
                return res.status(500).send({ status: 500, message:"Error while creating trade "})
            }
};

export async function contactSupport (req: any, res: any): Promise<Response> {
        const { firstName, lastName,message,email, subject } = req.body;
                try{
                    const name = `${firstName} ${lastName}`
                     const emailTo = process.env.usersupport!
                     const from = {
                        name: process.env.emailName,
                        address: process.env.user	
                    }
                    const emailFrom = from;
                     emailSupportSystem(emailFrom, emailTo, subject,  message, name, email);
                     return res.status(200).send({ status: 200, message:"Sent  Succesfully"}) 
                    
                      }catch(err){
                            console.log(err)
                            return  res.status(500).send({ status: 500, message:"Error while sending support message"})
                 }
               
};
    
export async function getDropletBalance (req: any, res: any): Promise<Response> {
                try{
                    const headers = {
                        'Authorization': process.env.digitalBearer!,
                        'Content-Type': 'application/json',
                        
                        }
                    const params = {
                                apiKey:process.env.apiKey!
                        }
                    const  getBalnce = await axios.get(' https://api.digitalocean.com/v2/customers/my/balance', {headers: headers}) 
                        return res.status(200).send({ status: 200, Balance:getBalnce.data})
                  
                   }catch(err){
                       console.log(err)
                        return res.status(500).send({status: 500, message:"Error while getting balance "})
                   }
};

export async function getBankCode (req: any, res: any): Promise<Response> {
    try{
        console.log("getBankCode")
        const headers = {
            'Authorization': process.env.flutterwaveToken!,
            'Content-Type': 'application/json'      
            }
        
        const  getBankCode = await axios.get('https://api.flutterwave.com/v3/banks/NG', {headers: headers}) 
            //console.log(getBankCode)
             return res.status(200).send({ status: 200, bankCode:getBankCode.data})
      
       }catch(err){
           console.log(err)
            return res.status(500).send({status: 500, message:"Error while getting bank code "})
       }
};
            
            