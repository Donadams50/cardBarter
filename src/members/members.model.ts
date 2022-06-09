import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
        {
                firstName: {
                        type: String,
                        required: true,
                },
                lastName: {
                        type: String,
                        required: true,
                },
                role: {
                        type: String,
                        required: true,
                },
                password: {
                        type: String,
                        required: true,
                },
                pin: {
                        type: String,
                     
                },
                email: {
                        type: String,
                        required: true,
                },
                phoneNumber: {
                        type: String,
                },
                forgotPasswordCode: {
                        type: String,
                },
                verificationCode: {
                        type: String,
                },
                isVerified: {
                        type: Boolean,
                },
                waletBalance: {
                        type: Number,
                },
                profilePics: {
                        type: String,
                },
                isEnabled: {
                        type: Boolean,
                },
                isSetPin: {
                        type: Boolean,
                },
                accountDetails: {
                        type: Array,
                },
        },
        {
                timestamps: true,
        }
);

const Member = mongoose.model('Member', memberSchema);

export { Member };
