import mongoose from "mongoose";

export interface ISlotTime extends Document {
    consultant_id: mongoose.Types.ObjectId;
    start_time: Date;
    end_time: Date;  
    status: "available" | "booked" | "cancelled" | "deleted";
}

const SlotTimeSchema = new mongoose.Schema({
    consultant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Consultant", required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    status: { type: String, required: true ,enum: ["available", "booked", "cancelled","deleted"],default: "available"},
});
const SlotTime = mongoose.model<ISlotTime>("SlotTime", SlotTimeSchema);

export default SlotTime;