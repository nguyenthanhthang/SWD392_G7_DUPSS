import mongoose, { Schema, model } from "mongoose";

export interface IAppointment {
    _id:string;
    slotTime_id:mongoose.Types.ObjectId;
    user_id:mongoose.Types.ObjectId;
    consultant_id:mongoose.Types.ObjectId;
    service_id:mongoose.Types.ObjectId;
    dateBooking:Date;
    reason:string;
    note:string;
    status:"pending" | "confirmed" | "cancelled" | "completed";
    
}
export const AppointmentSchema: Schema = new Schema ({
    slotTime_id: { type: Schema.Types.ObjectId, ref: "SlotTime", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    consultant_id: { type: Schema.Types.ObjectId, ref: "Consultant", required: true },
    service_id: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    dateBooking: { type: Date, required: true },
    reason: { type: String, required: false },
    note: { type: String, required: false },
    status: { type: String, required: true, default: "pending", enum: ["pending", "confirmed", "cancelled", "completed"] },
  
})

const Appointment = model <IAppointment>("Appointment", AppointmentSchema);

export default Appointment;