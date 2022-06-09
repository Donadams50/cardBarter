import mongoose from "mongoose";
var Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    userDetails: {
      type: Schema.Types.ObjectId,
      ref: 'profile' 
    },
    message: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean
    },
  },
  {
    timestamps: true,
  }
);

const Notifications = mongoose.model(
  "notification",
  notificationSchema
);

export { Notifications };
