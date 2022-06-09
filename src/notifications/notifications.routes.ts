import express from "express";

import {
  verifyToken,
  isAdmin,
  isExchanger,
  isAdminOrSubadmin,
  verify,
} from "../helpers/jwtTokenUtils";

import * as validator from "../validators/validator";

import * as notification from "./notifications.controller";

const { expressValidator, postContactSupportValidator } = validator;

const router = express.Router();

router.get(
  "/user",
  verifyToken,
  isExchanger,
  notification.getNotificationByUser
);

router.patch("/markread", verifyToken, isExchanger, notification.markRead);

router.post("/support",  postContactSupportValidator(), expressValidator, notification.contactSupport);

router.get("/droplet/balance", notification.getDropletBalance);

router.get("/bank/code", notification.getBankCode);

export { router as notificationsRouter };
