import express from "express";

import {
  verifyToken,
  isAdmin,
  isExchanger,
  isAdminOrSubadmin,
  verify,
  isSetTransactionPinValid, 
} from "../helpers/jwtTokenUtils";

import * as validator from '../validators/validator';

const {
    expressValidator,
    postWithdrawRequestValidator,
} = validator;

import * as withdrawrequest from "./withdrawrequest.controller";


const router = express.Router();

router.post("/new", verifyToken, isExchanger, postWithdrawRequestValidator(), expressValidator,   isSetTransactionPinValid,  isSetTransactionPinValid,  withdrawrequest.withdrawFunds);
router.get("/all",  verifyToken, isAdminOrSubadmin,  withdrawrequest.getAllWithdrawerrequest)
router.get("/:withdrawerrequestId",  verifyToken,  withdrawrequest.getWithdrawerRequestById)
router.patch("/cancel/:withdrawerrequestId", verifyToken, isAdminOrSubadmin,  withdrawrequest.cancelWithdrawerRequest)
router.patch("/manualsuccess/:withdrawerrequestId",  verifyToken, isAdminOrSubadmin,  withdrawrequest.manualSuccessWithdrawerRequest)



export { router as withdrawrequestRouter };

