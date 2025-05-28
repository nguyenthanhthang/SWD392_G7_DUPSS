import mongoose, { Schema, Document } from "mongoose";

// Interface TypeScript cho Account
export interface IAccount extends Document {
  username: string;
  email: string;
  password: string;
  photoUrl?: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  gender: string;
  isDisabled: boolean;
}

// Schema Mongoose
const AccountSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    photoUrl: { type: String },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    role: { type: String, required: true }, // e.g., "customer", "consultant", "admin"
    gender: { type: String, required: true },
    isDisabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IAccount>("Account", AccountSchema);
