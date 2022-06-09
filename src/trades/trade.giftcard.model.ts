import mongoose, { Schema } from "mongoose";

const tradegiftcardSchema = new mongoose.Schema(
  {
      userId: {
        type: String,
        required: true,
      },
      tradeStatus: {
        type: String,
        required: true,
      },
      imageUrl :{ 
          type: Array,
          required: true
      },
      userDetails:  { type: Schema.Types.ObjectId, ref: 'Member' },

      categoryId: {
        type: String,
        required: true,
      },
      subCategoryId: {
        type: String,
        required: true,
      },
      subCategoryDetails: {
        type: Object,
        required: true,
      },
      cardStatus: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      cardAmount: {
        type: Number,
        required: true,
      },
      comment: {
        type: String
      },
     declinedReason: {
      type: Object,
    }

  },

  {
    timestamps: true,
  }
);

const Tradegiftcard = mongoose.model(
  "tradegiftcard",
  tradegiftcardSchema
);

export { Tradegiftcard };
