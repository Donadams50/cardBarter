import express from "express";

import {
  verifyToken,
  isAdmin,
  isExchanger,
  isAdminOrSubadmin,
  verify,
} from "../helpers/jwtTokenUtils";

import * as validator from "../validators/validator";

import * as ratecalculator from "./ratecalculator.controller";

const { expressValidator, postSubcategoryValidator } = validator;

const router = express.Router();

//gift card routes rate calculator
router.get("/giftcard/category/listing", verify, ratecalculator.getAllGiftcardCategory);

router.get("/giftcard/subcategory/listing/:id", verify, ratecalculator.getGiftcardSubCategoryByCategoryId);

router.get("/giftcard/subcategory/listing", verifyToken, ratecalculator.getAllGiftcardSubCategory);

router.put("/giftcard/subcategory/listing/:id", verifyToken, isAdmin, postSubcategoryValidator(), expressValidator, ratecalculator.updateGiftcardSubCategory);

router.post("/giftcard/category/subcategory", verifyToken, isAdmin, postSubcategoryValidator(), expressValidator, ratecalculator.createGiftcardSubCategory);

router.delete("/giftcard/subcategory/listing/:id", verifyToken, isAdmin, ratecalculator.deleteGiftcardSubCategory);



//router.post("/giftcard/categories",  ratecalculator.createGiftCardCategory);



export { router as ratecalculatorRouter };

