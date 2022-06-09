import mongoose from "mongoose";

const ratecalculatorcategorySchema = new mongoose.Schema(
  {
    categoryname: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Ratecalculatorcategory = mongoose.model(
  "ratecalculatorcategory",
  ratecalculatorcategorySchema
);

export { Ratecalculatorcategory };
