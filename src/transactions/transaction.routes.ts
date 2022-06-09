import express from "express";

import {
  verifyToken,
  isAdmin,
  isExchanger,
  isAdminOrSubadmin,
  verify,
} from "../helpers/jwtTokenUtils";

import * as transaction from "./transaction.controller";


const router = express.Router();

router.get("/all",  verifyToken, isAdminOrSubadmin,   transaction.getAllTransactions)
router.get("/user",  verifyToken, isExchanger,   transaction.userGetTransactions)




export { router as transactionRouter };

