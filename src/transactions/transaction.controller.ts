
import { Transaction } from './transaction.model';
import dotenv from 'dotenv';
dotenv.config();
import moment from 'moment';

  
// get all transactions
export async function getAllTransactions (req: any, res: any): Promise<Response> {
    try{
            const query = getQueryNoAmount({ ...req.query })
            const findAllTransactions= await Transaction.find(query).sort({"_id": -1})
            .populate('sellerDetails') 
             return res.status(200).send({status: 200, message:findAllTransactions})
       }catch(err){
           console.log(err)
          return  res.status(500).send({message:"Error while getting all transactions "})
       }
};



// get all user transactions 
export async function userGetTransactions(req: any, res: any): Promise<Response> {
    try{
            const query = getQueryNoAmount({ ...req.query })
            const finduserTransactions = await Transaction.find({...query, sellerId: req.user.id}).sort({"_id": -1})
            .populate('sellerDetails')  
             return res.status(200).send({status: 200, message:finduserTransactions})
    }catch(err){
           console.log(err)
          return  res.status(500).send({message:"Error while getting user transactions "})
       }
};


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