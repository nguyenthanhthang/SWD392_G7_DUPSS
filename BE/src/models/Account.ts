import mongoose, { Schema, Document } from "mongoose";

// Interface TypeScript cho Account
export interface IAccount extends Document {
  fullName: string;
  email: string;
  password: string;
  username: string;
  role: "consultant" | "customer";
  isVerified: boolean;
  isDisabled: boolean;
  photoUrl?: string;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema Mongoose
const accountSchema = new Schema<IAccount>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["consultant", "customer"],
      default: "customer",
    },
    isVerified: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    photoUrl: { type: String },
    verificationToken: { type: String },
    verificationTokenExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IAccount>("Account", accountSchema);
