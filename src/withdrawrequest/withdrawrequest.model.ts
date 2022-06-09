import mongoose, { Schema } from "mongoose";

const withdrawrequestSchema = new mongoose.Schema(
        {
                accountName: {
                        type: String,
                        required: true,
                },
                accountNumber: {
                        type: String,
                        required: true,
                },
                bankName: {
                    type: String,
                    required: true,
                },
                bankCode: {
                    type: String,
                    required: true
                  },
                userId: {
                    type: String,
                    required: true,
                },
                status: {
                    type: String,
                    required: true,
                },
                userDetails:  { type: Schema.Types.ObjectId, ref: 'Member' },
                transactionId: { type: Schema.Types.ObjectId, ref: 'transaction' },
                amount: {
                    type: Number,
                    required: true,
                  },
                narration :{ 
                    type: String,
                   
                },
                reference: {
                    type: String
                   
                },
                flutterPaymentId: {
                    type: String
                 
                },
                 
               
        },
        {
                timestamps: true,
        }

);

const Withdrawrequest = mongoose.model('Withdrawrequest', withdrawrequestSchema);

export { Withdrawrequest };
