import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  registrationStartDate: Date;
  registrationEndDate: Date;
  location: string;
  capacity: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationStartDate: { type: Date, required: true },
    registrationEndDate: { type: Date, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);



// Middleware
eventSchema.pre("save", function (next) {
  const now = new Date();
  if (this.startDate > now) {
    this.status = "upcoming";
  } else if (this.endDate < now) {
    this.status = "completed";
  } else {
    this.status = "ongoing";
  }
  next();
});

const Event = mongoose.model<IEvent>("Event", eventSchema);
export default Event;
