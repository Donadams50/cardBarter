import express from "express";

import {
  verifyToken,
  isAdmin,
  isExchanger,
  isAdminOrSubadmin,
  verify,
} from "../helpers/jwtTokenUtils";

import * as validator from '../validators/validator';

const {
    expressValidator,
    postConfigurationValidator,
} = validator;

import * as adminconfig from "./adminconfig.controller";


const router = express.Router();

router.post("/new", verifyToken, isAdminOrSubadmin, postConfigurationValidator(), expressValidator,  adminconfig.postConfiguration);
router.put("/:id", verifyToken,  isAdminOrSubadmin, postConfigurationValidator(), expressValidator,  adminconfig.updateConfiguration);
router.get("/", verifyToken, isAdminOrSubadmin, adminconfig.getConfiguration)
router.get("/dasboard/details", verifyToken, isAdminOrSubadmin, adminconfig.getDashboardDetails)


export { router as adminconfigRouter };

