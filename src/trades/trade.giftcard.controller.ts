
import { Tradegiftcard } from './trade.giftcard.model';
import { Ratecalculatorsubcategory } from '../ratecalculator/ratecalculator.subcategory.model';
import { Transaction } from '../transactions/transaction.model';
import { Notifications } from '../notifications/notifications.model';
import { Member } from '../members/members.model';
import axios from 'axios';
import dotenv from 'dotenv';
import { emailUtility } from '../helpers/emailhelper';
dotenv.config();
const cloudinary = require('cloudinary').v2;
import moment from 'moment';

// create new giftcard trade
export async function postNewGiftcardTrade (req: any, res: any): Promise<Response> {
//console.log(req.body)
const {  imageUrl , categoryId  , subCategoryId, amount , comment, cardAmount} = req.body;
    var timestamp = Math.round((new Date).getTime()/1000);
    // Get  signature using the Node.js SDK method api_sign_request
    var signature = cloudinary.utils.api_sign_request({
               timestamp: timestamp
    }, process.env.API_SECRET);
    try{
        const emailList = await Member.find({ $or: [ { role: "Admin" }, { role: "SubAdmin" } ] })

        let proccessedImg : Array<string> = []
         await Promise.all(imageUrl.map( async (imageBase : string)=> {
               const  params = {
                    file : imageBase
                }
                const  postImages = await axios.post('https://api.cloudinary.com/v1_1/'+process.env.CLOUD_NAME+'/image/upload?&timestamp='+timestamp+'&signature='+signature+'&api_key='+process.env.API_KEY+'', params)
                console.log(postImages.data.secure_url);
                proccessedImg.push(postImages.data.secure_url)
            }))
            console.log("proccessedImg");
            console.log(proccessedImg);
            const findsubcategory = await Ratecalculatorsubcategory.findOne({_id: subCategoryId})
            console.log(findsubcategory)
            const trade = new Tradegiftcard({      
                tradeStatus: "Pending",
                userId: req.user.id,
                userDetails: req.user.id,
                imageUrl: proccessedImg,
                categoryId: categoryId,
                subCategoryDetails:findsubcategory ,
                subCategoryId : subCategoryId,
                amount: amount,
                cardStatus: "Good",
                comment:  comment || "",
                cardAmount : cardAmount,
                            
            });
                
          const notify = new Notifications({      
            userId: req.user.id,
            userDetails: req.user.id,
            title: "Trade card",
            isRead: false,
            message : "You submitted a trade order for "+findsubcategory.subcategoryname+" card"
                           
          });
          const postNotification = await  notify.save()
            // const getadmin = await Member.findOne({role: "Admin"} )
            emailList.map(email => {
                       const from = {
                            name: process.env.emailName,
                            address: process.env.user	
                         }
                        const emailFrom = from;
                        const subject = 'New Giftcard trade Alert';                      
                        const hostUrl = process.env.adminUrl
                        const hostUrl2 = process.env.adminUrl2    
                        const username =  "Admin"
                        const   text = "An new trade from "+req.user.firstName+" "+req.user.lastName+" has been placed, Login to the dashboard to view and complete the transaction" 
                        const emailTo = email
                        const link = `${hostUrl}`;
                        const link2 = `${hostUrl2}`;
                        emailUtility(emailFrom, emailTo, subject, link, link2, text, username);
                })
             const saveTrade = await  trade.save()
             return res.status(201).send({ status: 201, message:"Giftcard Trade created Succesfully"})
        }catch(err){
            console.log(err)
            return res.status(500).send({ status: 500, message:"Error while creating gift card trade "})
        }
    

                        
};

// approve giftcard trade
export async function approveGiftcardTrade (req: any, res: any): Promise<Response> {
    try{
        const _id = req.params.tradeId;
        const  getTrade = await Tradegiftcard.findOne({_id: _id})
            //console.log(getTrade)
        if(getTrade.tradeStatus === "Pending"){
             const getExchangerDetails = await Member.findOne({_id:getTrade.userId}, )
             const postIsComplete = await Tradegiftcard.updateOne({ _id : _id}, { tradeStatus: "Completed" });  
               const notify = new Notifications({      
                    userId: getExchangerDetails._id,
                    userDetails: getExchangerDetails._id,
                    title: "Giftcard Approved",
                    isRead: false,
                    message : "Your giftcard has been approved"                                              
                  })
                const postNotification = await  notify.save()
             const tradeAmount =  getTrade.amount.toFixed(2)
             const initialBalance =  getExchangerDetails.waletBalance
             const finalBalance =  parseFloat(getExchangerDetails.waletBalance) + parseFloat(tradeAmount)
  
             const transaction = new Transaction({ 
              amount: tradeAmount,
              tradeId: _id,
              tradeDetails: _id,
              sellerId: getExchangerDetails._id,
              sellerDetails: getExchangerDetails._id,
              initialBalance: initialBalance.toFixed(2),
              finalBalance: finalBalance.toFixed(2),
              status : "Successful", 
              type: "Credit",
              narration: "Payment from trading card",
              transactionLabel: "Giftcaard"        
            })
            const postTransaction = await  transaction.save()
            const updateWallet= await Member.updateOne({ _id: getExchangerDetails._id }, {waletBalance: finalBalance.toFixed(2)}); 
             const emailFrom = process.env.emailFrom!;
             const subject = 'Trade status';                      
             const hostUrl = process.env.hostUrl
              const hostUrl2 = process.env.hostUrl2  
             const username =  getExchangerDetails.firstName
             const   text = "Your trade has been approved" 
             const emailTo = getExchangerDetails.email
             const link = `${hostUrl}`;
             const link2 = `${hostUrl2}`;
              emailUtility(emailFrom, emailTo, subject, link, link2, text, username);
  
              return  res.status(200).send({ status: 200, message:"Gift card trade approved Succesfull" })
            }else{
               return  res.status(400).send({ status: 400, message:"This trade has been completed or Invalid"})
            }
    }catch(err){
        console.log(err)
        return res.status(500).send({ status: 500, message:"Error while completing trade "})
    }
  
};
  
// decline giftcard trade 
export async function declineGiftcardTrade (req: any, res: any): Promise<Response> {
      try{
            const _id = req.params.tradeId;
            if(!req.body.declinedReason)  return res.status(400).send({ status: 400, message:"Add a reason for declining"})
            const declinedReason = req.body.declinedReason
            const getTrade = await Tradegiftcard.findOne({_id: _id})
              //console.log(getTrade)
             if(getTrade.tradeStatus === "Pending" ){
                 const getExchangerDetails = await Member.findOne({_id:getTrade.userId}, )
                 const updatetrade = await Tradegiftcard.updateOne({ _id : _id}, { tradeStatus: "Declined", declinedReason: declinedReason });  
                  const notify = new Notifications({      
                      userId: getExchangerDetails._id,
                      userDetails: getExchangerDetails._id,
                      title: "Giftcard Declined",
                      isRead: false,
                      message : "Your giftcard has been rejected"                                              
                  })
             
                const postNotification = await  notify.save()
             
               const emailFrom = process.env.emailFrom!;
               const subject = 'Gift card Trade status';                      
               const hostUrl = process.env.hostUrl
                const hostUrl2 = process.env.hostUrl2  
               const username =  getExchangerDetails.firstName
               const   text = "Your giftcard trade has been decliined" 
               const emailTo = getExchangerDetails.email
               const link = `${hostUrl}`;
               const link2 = `${hostUrl2}`;
                emailUtility(emailFrom, emailTo, subject, link, link2, text, username);
  
                 return res.status(200).send({ status: 200, message:"Giftcard trade declined Succesfull" })
              }else{
                 return res.status(400).send({ status: 400, message:"This trade has been completed or Invalid"})
              }
          
  
     
      }catch(err){
          console.log(err)
          return  res.status(500).send({ status: 500, message:"Error while completing trade "})
      }
  
};
  
// get all gift card trade 
export async function getAllGiftcardTrade (req: any, res: any): Promise<Response> {
    try{
            const query = getQueryNoAmount({ ...req.query })
            const findAllTrade = await Tradegiftcard.find(query).sort({"_id": -1})
            .populate('userDetails')  
             return res.status(200).send({status: 200, message:findAllTrade})
       }catch(err){
           console.log(err)
          return  res.status(500).send({message:"Error while getting all giftcard trade "})
       }
};

// get all gift card trade 
export async function getUserGiftcardTrade (req: any, res: any): Promise<Response> {
    try{
            const query = getQueryNoAmount({ ...req.query })
            const finduserTrade = await Tradegiftcard.find({...query, userId: req.user.id}).sort({"_id": -1})
            .populate('userDetails')  
             return res.status(200).send({status: 200, message:finduserTrade})
    }catch(err){
           console.log(err)
          return  res.status(500).send({message:"Error while getting user giftcard trade "})
       }
};


const getQueryNoAmount = (queryObj: any) =>{
    let monthAgo = moment().subtract(1, 'months').format('YYYY-MM-DD');
    let today = moment(new Date()).format('YYYY-MM-DD');
    let {  from_date=monthAgo, to_date=today, status= /.*/ } = queryObj
    if(status==="All"){
        status = /.*/
    }
   const query = { tradeStatus:status, createdAt:{ $gte: new Date(new Date(from_date).setHours(0, 0, 0)), $lte: new Date(new Date(to_date).setHours(23, 59, 59)) }}
   return query
}