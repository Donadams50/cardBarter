import mongoose from 'mongoose';

const adminconfigSchema = new mongoose.Schema(
        {
               minimumWithdrawer: {
                        type: Number,
                        required: true,
                },
                maximumWithdrawer: {
                        type: Number,
                        required: true,
                },
                // automatedWithdrawer: {
                //        type: Boolean ,
                //        required: true
                // }
        },
        {
                timestamps: true,
        }
);

const Adminconfig = mongoose.model('Adminconfig', adminconfigSchema);

export { Adminconfig };
