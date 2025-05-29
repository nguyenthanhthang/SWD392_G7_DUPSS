import mongoose, { Schema, Document } from "mongoose";

// Interface TypeScript cho Account
export interface IAccount extends Document {
  username: string;
  email: string;
  password: string;
  photoUrl?: string;
  fullName: string;
  phoneNumber: string;
  role: "customer" | "consultant" | "admin";
  gender?: "nam" | "nữ";
  isDisabled: boolean;
}

// Schema Mongoose
const AccountSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    photoUrl: { type: String, default: "" },
    fullName: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    role: {
      type: String,
      enum: ["customer", "consultant", "admin"],
      default: "customer",
    }, 
    gender: {
      type: String,
      enum: ["nam", "nữ"],
    },
    isDisabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IAccount>("Account", AccountSchema);
