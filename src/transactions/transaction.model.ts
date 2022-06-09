import mongoose, { Schema } from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    accountName: String,
    accountNumber: String,
    bankName : String,
    narration : String,
    bankCode: String,
    reference: String,
    sellerId: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        required: true,
      },
      tradeId :{ 
          type: String
      },
      sellerDetails:  { type: Schema.Types.ObjectId, ref: 'Member' },
      tradeDetails:  { type: Schema.Types.ObjectId, ref: 'tradegiftcard' },

      type: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      initialBalance: {
        type: Number,
        required: true,
      },
      finalBalance: {
        type: Number,
        required: true
      },
   

  },

  {
    timestamps: true,
  }
);

const Transaction = mongoose.model(
  "transaction",
  transactionSchema
);

export { Transaction };
