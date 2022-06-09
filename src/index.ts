import express, { Request, Response } from 'express';
import { json } from 'body-parser';


import cors from 'cors';

import dotenv from 'dotenv';
import { mongoConfig } from './mongoose/index';

import { memberRouter } from './members/members.routes';
import {  ratecalculatorRouter } from './ratecalculator/ratecalculator.routes';
import {  tradeRouter } from './trades/trade.routes';
import {  transactionRouter } from './transactions/transaction.routes';
import {  adminconfigRouter } from './adminconfig/adminconfig.routes';
import {  withdrawrequestRouter } from './withdrawrequest/withdrawrequest.routes';
import {  notificationsRouter } from './notifications/notifications.routes';
import {  uploadFileRouter } from './files/files.routes';


// Connect to port
const port = process.env.PORT || 4000;
mongoConfig;

const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));


app.use(json());
app.use(cors());

app.use('/auth', memberRouter);
app.use('/ratecalculator', ratecalculatorRouter);
app.use('/trade', tradeRouter);
app.use('/transaction', transactionRouter)
app.use('/adminconfig', adminconfigRouter)
app.use('/withdrawer/request', withdrawrequestRouter)
app.use('/notifications', notificationsRouter);
app.use('/files', uploadFileRouter);


dotenv.config();

app.get(
        '/',
        async (req: Request, res: Response): Promise<Response> =>
                res.status(200).send({
                        message: 'Welcome to Cardbarter!',
                })
);

app.listen(port, () => {
        console.log(`server is listoning on port ${port}`);
});
