import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  content: string;
  author: string;
  image?: string;
  thumbnail?: string;
  topics?: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: String },
    thumbnail: { type: String },
    topics: [{ type: String }],
    published: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model<IBlog>('Blog', BlogSchema); 