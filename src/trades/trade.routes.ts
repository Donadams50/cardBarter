import express from "express";

import {
  verifyToken,
  isAdmin,
  isExchanger,
  isAdminOrSubadmin
} from "../helpers/jwtTokenUtils";

import * as validator from "../validators/validator";


import * as tradegiftcard from "./trade.giftcard.controller";

const { expressValidator, postGiftcardTradeValidator } = validator;

const router = express.Router();

//gift card routes
router.post("/giftcard/new", verifyToken,   isExchanger,  postGiftcardTradeValidator(), expressValidator,  tradegiftcard.postNewGiftcardTrade)
router.get("/giftcard/trade/all",  verifyToken, isAdminOrSubadmin,   tradegiftcard.getAllGiftcardTrade)
router.get("/giftcard/trade/user",  verifyToken, isExchanger,   tradegiftcard.getUserGiftcardTrade)
router.patch("/giftcard/approve/:tradeId",  verifyToken, isAdminOrSubadmin,   tradegiftcard.approveGiftcardTrade)
router.patch("/giftcard/decline/:tradeId",  verifyToken, isAdminOrSubadmin,   tradegiftcard.declineGiftcardTrade)
router.get("/giftcard/completed/trade",  verifyToken, isExchanger,   tradegiftcard.userCompletedTrade)

export { router as tradeRouter };

