import mongoose, { Document, Schema } from "mongoose";

export interface IEventRegistration extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  token: string;
  qrString: string;
  checkedInAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const eventRegistrationSchema = new Schema<IEventRegistration>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    qrString: {
      type: String,
      required: true,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Tạo compound index để đảm bảo mỗi user chỉ đăng ký một lần cho mỗi event
eventRegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model<IEventRegistration>(
  "EventRegistration",
  eventRegistrationSchema
);
