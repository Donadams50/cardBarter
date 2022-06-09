import mongoose from "mongoose";

const ratecalculatorsubcategorySchema = new mongoose.Schema(
  {
    categoryname: {
      type: String,
      required: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
    subcategoryname: {
      type: String,
      required: true,
    },
    termsandconditions: {
      type: String
    },
    nairarate: {
      type: Number,
      required: true,
    },
    btcrate: {
      type: Number,
    },
    cardapproveltime: {
      type: Number,
    },
    minimumAmount: {
      type: Number,
    },
    maximumAmount: {
      type: Number,
    },
    waletBalance: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Ratecalculatorsubcategory = mongoose.model( "ratecalculatorsubcategory",ratecalculatorsubcategorySchema);

export { Ratecalculatorsubcategory };
