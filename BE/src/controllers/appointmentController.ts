import { Request, Response } from "express";
import Appointment from "../models/Appointment";
import SlotTime from "../models/SlotTime";
import Feedback from "../models/Feedback";

export const createAppointment = async (req: Request, res: Response) => {
    try {
        const newAppointment = new Appointment(req.body);
        const slotTime = await SlotTime.findById(req.body.slotTime_id);
        if (!slotTime) {
            return res.status(404).json({ message: "Slot time not found" });
        }
        if (slotTime.status !== "available") {
            return res.status(400).json({ message: "Slot time is not available" });
        }

        const savedAppointment = await newAppointment.save();
        await SlotTime.findByIdAndUpdate(req.body.slotTime_id, { status: "booked" });
        res.status(201).json(savedAppointment);
    } catch (err: any) { 
        res.status(400).json({ message: err.message });
    }
}   

export const getAllAppointments = async (req: Request, res: Response) => {
    try {
        const appointments = await Appointment.find()
            .populate("user_id")
            .populate({
                path: "consultant_id",
                populate: {
                    path: "accountId"
                }
            })
            .populate("service_id");
        res.status(200).json(appointments);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

export const getAppointmentById = async (req: Request, res: Response) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate("user_id")
            .populate({
                path: "consultant_id",
                populate: {
                    path: "accountId"
                }
            })
            .populate("slotTime_id")
            .populate("service_id");
        res.status(200).json(appointment);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

export const updateStatusAppointment = async (req: Request, res: Response) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(appointment);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

export const getAppointmentByUserId = async (req: Request, res: Response) => {
    try {
        const appointments = await Appointment.find({ user_id: req.params.id })
            .populate("user_id")
            .populate({
                path: "consultant_id",
                populate: {
                    path: "accountId"
                }
            })
            .populate("service_id")
            .lean();

        const appointmentIds = appointments.map(a => a._id);
        const feedbacks = await Feedback.find({ appointment_id: { $in: appointmentIds } });
        const feedbackAppointmentIds = new Set(feedbacks.map(f => f.appointment_id.toString()));

        const appointmentsWithFeedback = appointments.map(appointment => ({
            ...appointment,
            hasFeedback: feedbackAppointmentIds.has(appointment._id.toString())
        }));

        res.status(200).json(appointmentsWithFeedback);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

export const getAppointmentByConsultantId = async (req: Request, res: Response) => {
    try {
        const appointment = await Appointment.find({ consultant_id: req.params.id })
            .populate("user_id")
            .populate({
                path: "consultant_id",
                populate: {
                    path: "accountId"
                }
            })
            .populate("slotTime_id")
            .populate("service_id");
        res.status(200).json(appointment);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

export const getAppointmentBySlotTimeId = async (req: Request, res: Response) => {
    try {
        const appointment = await Appointment.find({ slotTime_id: req.params.id })
            .populate("slotTime_id")
            .populate("user_id")
            .populate({
                path: "consultant_id",
                populate: {
                    path: "accountId"
                }
            })
            .populate("service_id");
        res.status(200).json(appointment);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}
