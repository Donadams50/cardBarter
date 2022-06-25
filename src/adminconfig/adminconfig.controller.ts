import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { emailUtility } from '../helpers/emailhelper';
import { Adminconfig } from './adminconfig.model';
import { Tradegiftcard } from '../trades/trade.giftcard.model';
import { Withdrawrequest } from '../withdrawrequest/withdrawrequest.model';
import { Member } from '../members/members.model';
import { Transaction } from '../transactions/transaction.model';
 dotenv.config();



// create configuration
export async function postConfiguration(req: Request, res: Response): Promise<Response> {
    const { minimumWithdrawer, maximumWithdrawer , automatedWithdrawer} = req.body;
     
                try{
                    const emailTo = process.env.user!
                    const from = {
                        name: process.env.emailName,
                        address: process.env.user	
                        }
                    const emailFrom = from;
                    const subject = "Configuratiion created"
                    const link = process.env.adminUrl!
                    const link2 = process.env.adminUrl2!
                    const name =  "Admin"
                    const message = "You just created the minimum and maximum withdrawer configuration, Please confirm if you just did that. Thanks "
                    const adminconfig = new Adminconfig({
                            minimumWithdrawer: minimumWithdrawer,
                            maximumWithdrawer: maximumWithdrawer
                            // automatedWithdrawer :automatedWithdrawer 
                    });
                    const saveadminconfig = await adminconfig.save()
                    emailUtility(emailFrom, emailTo, subject,  link, link2, message, name);
                    return res.status(201).send({ status: 201,message:"Configuration created successfully "})
                    
                }catch(err){
                    console.log(err)
                    return res.status(500).send({ status: 500,message:"Error while creating configuration "})
                }  
};

// update configuration
export async function updateConfiguration(req: Request, res: Response): Promise<Response> {
    const _id = req.params.id;
 
    const { minimumWithdrawer, maximumWithdrawer ,automatedWithdrawer} = req.body;  
            try{
                 const emailTo = process.env.user!
                 const from = {
                    name: process.env.emailName,
                    address: process.env.user	
                    }
                const emailFrom = from;
                 const subject = "Configuratiion updated"
                 const link = process.env.adminUrl!
                 const link2 = process.env.adminUrl2!
                 const name =  "Admin"
                 const message = "You just updated the minimum and maximum withdrawer configuration, Please confirm if you just did that. Thanks "
                 
                 const adminconfig = new Adminconfig({
                        _id : _id,
                        minimumWithdrawer: minimumWithdrawer,
                        maximumWithdrawer: maximumWithdrawer
                        // automatedWithdrawer: automatedWithdrawer
                     });
                     console.log(adminconfig)
                     const updaterate = await Adminconfig.updateOne( {_id}, adminconfig)
                      emailUtility(emailFrom, emailTo, subject,  link, link2, message, name);
                     return res.status(200).send({ status: 200,message:"Configuration updated successfully "})
                
                  }catch(err){
                        console.log(err)
                      return  res.status(500).send({ status: 500,message:"Error while updating configuration "})
             }
          
};


// Find configuration
export async function getConfiguration(req: Request, res: Response): Promise<Response> {
    try{
            const findConfiguration= await Adminconfig.findOne();    
            return  res.status(200).send({ status: 200, message: findConfiguration})
        
       }catch(err){
           console.log(err)
           return res.status(500).send({ status: 500, message:"Error while getting configuration "})
       }
};



// Find dashboard details
export async function getDashboardDetails(req: Request, res: Response): Promise<Response> {
    try{

        const countPendingRequest = await Withdrawrequest.countDocuments({ status: "Pending", } )
        const countCompletedTradeGiftcard = await Tradegiftcard.countDocuments({ tradeStatus: "Completed", } )
        const completedtrade = countCompletedTradeGiftcard
        const countUsers = await Member.countDocuments({ role: "Exchanger", } ) 
        const countPendingTransactions = await Transaction.countDocuments({ status: "Pending", } )
        const countSuccessfulTransactions = await Transaction.countDocuments({ status: "Successful", } )
        const countFailedTransactions= await Transaction.countDocuments({ status: "Failed", } )
        let transactionanalytics = [
            {
                transactionName : "Pending", 
                value: countPendingTransactions
            },
            {
                transactionName : "Successful",
                value: countSuccessfulTransactions
            },
            {
                transactionName : "Failed",
                value: countFailedTransactions
            }
        ]
        
            // const totalOutflow = 5656
            const sumTotalTrade = await Withdrawrequest.aggregate(
                [
                    { $match: { status: "Completed" } },
                {  
                
                $group : {
                    _id : null ,
                    totalAmount: { $sum: "$amount"} || 5, 
                    
                }
                }
            ])
            

            if(sumTotalTrade.length === 0){
                var sumTrade = 0
            
            }else{
                 sumTrade =sumTotalTrade[0].totalAmount
            }


        return  res.status(200).send({ status: 200, message: { totalOutflow: sumTrade, pendingWithdrawerRequest: countPendingRequest, completedTrade: completedtrade , allUsersCount: countUsers, transactionAnalytics : transactionanalytics }})
        
       }catch(err){
           console.log(err)
           return res.status(500).send({ status: 500, message:"Error while getting dashboard "})
       }
};
