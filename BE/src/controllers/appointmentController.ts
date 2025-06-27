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
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: "Missing status" });
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });
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

export const deleteAppointment = async (req: Request, res: Response) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        if (appointment.status !== "pending") {
            return res.status(400).json({ message: "Chỉ được xóa lịch hẹn ở trạng thái chờ xác nhận (pending)" });
        }
        // Trả slotTime về trạng thái 'available' nếu appointment đang giữ slot
        if (appointment.slotTime_id) {
            await SlotTime.findByIdAndUpdate(appointment.slotTime_id, { status: "available" });
        }
        await Appointment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

export const rescheduleAppointment = async (req: Request, res: Response) => {
    try {
        const appointmentId = req.params.id;
        const { newSlotTimeId, newConsultantId } = req.body;

        // Kiểm tra appointment tồn tại
        const currentAppointment = await Appointment.findById(appointmentId).populate("slotTime_id");
        if (!currentAppointment) {
            return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
        }

        // Chỉ cho phép đổi lịch khi trạng thái là "confirmed"
        if (currentAppointment.status !== "confirmed") {
            return res.status(400).json({ 
                message: "Chỉ có thể đổi lịch hẹn ở trạng thái đã xác nhận (confirmed)" 
            });
        }

        // Kiểm tra chỉ cho đổi lịch 1 lần - appointment gốc phải có isRescheduled = false hoặc undefined
        if (currentAppointment.isRescheduled === true) {
            return res.status(400).json({ 
                message: "Lịch hẹn này đã được đổi từ trước, chỉ được đổi lịch 1 lần" 
            });
        }

        // Kiểm tra thời gian - phải trước 3 tiếng
        const currentTime = new Date();
        const appointmentTime = new Date(currentAppointment.dateBooking);
        const timeDifference = appointmentTime.getTime() - currentTime.getTime();
        const hoursDifference = timeDifference / (1000 * 60 * 60);

        if (hoursDifference < 3) {
            return res.status(400).json({ 
                message: "Chỉ có thể đổi lịch hẹn trước 3 tiếng" 
            });
        }

        // Kiểm tra slot time mới tồn tại và available
        const newSlotTime = await SlotTime.findById(newSlotTimeId);
        if (!newSlotTime) {
            return res.status(404).json({ message: "Không tìm thấy slot thời gian mới" });
        }
        if (newSlotTime.status !== "available") {
            return res.status(400).json({ message: "Slot thời gian mới không còn trống" });
        }

        // Kiểm tra consultant_id khớp với slot
        if (newConsultantId && newSlotTime.consultant_id.toString() !== newConsultantId) {
            return res.status(400).json({ 
                message: "Slot thời gian không thuộc về chuyên gia được chọn" 
            });
        }

        // 1. Cập nhật appointment cũ thành "rescheduled" và set isRescheduled = true
        await Appointment.findByIdAndUpdate(appointmentId, { 
            status: "rescheduled",
            isRescheduled: true 
        });

        // 2. Trả slot cũ về "available"
        await SlotTime.findByIdAndUpdate(currentAppointment.slotTime_id, { status: "available" });

        // 3. Cập nhật slot mới thành "booked"
        await SlotTime.findByIdAndUpdate(newSlotTimeId, { status: "booked" });

        // 4. Tạo appointment mới với isRescheduled = true (không cho đổi lịch nữa)
        const newAppointment = new Appointment({
            slotTime_id: newSlotTimeId,
            user_id: currentAppointment.user_id,
            consultant_id: newConsultantId || newSlotTime.consultant_id,
            service_id: currentAppointment.service_id, // Giữ nguyên service vì đã thanh toán
            dateBooking: newSlotTime.start_time,
            reason: currentAppointment.reason,
            note: currentAppointment.note,
            status: "confirmed", // Appointment mới có status confirmed luôn
            isRescheduled: true, // QUAN TRỌNG: Đánh dấu appointment mới cũng đã được reschedule để không cho đổi lịch nữa
            paymentDetails: currentAppointment.paymentDetails // Copy payment info
        });

        const savedNewAppointment = await newAppointment.save();

        // Populate để trả về đầy đủ thông tin
        const populatedAppointment = await Appointment.findById(savedNewAppointment._id)
            .populate("user_id")
            .populate({
                path: "consultant_id",
                populate: {
                    path: "accountId"
                }
            })
            .populate("slotTime_id")
            .populate("service_id");

        res.status(200).json({
            message: "Đổi lịch hẹn thành công",
            appointment: populatedAppointment,
           
        });

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}
