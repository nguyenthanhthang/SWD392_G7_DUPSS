import { Request, Response } from "express";
import Feedback from "../models/Feedback";
import Account from "../models/Account";
import Appointment from "../models/Appointment";
import Service from "../models/Service";

export const createFeedback = async (req: Request, res: Response) => {
    try {
        const { appointment_id } = req.body;

        const existingFeedback = await Feedback.findOne({ appointment_id });
        if (existingFeedback) {
            return res.status(409).json({ message: "Bạn đã đánh giá cho lịch hẹn này rồi." });
        }

        const feedback = new Feedback(req.body);
        const account = await Account.findById(feedback.account_id);
        if (!account) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản" });
        }
        const appointment = await Appointment.findById(feedback.appointment_id);
        if (!appointment) {
            return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
        }
        if (appointment.status !== "completed") {
            return res.status(400).json({ message: "Lịch hẹn phải được hoàn thành trước khi đánh giá." });
        }

        const completionDate = appointment.dateBooking;
        const feedbackDeadline = new Date(completionDate.getTime());
        feedbackDeadline.setDate(feedbackDeadline.getDate() + 7);

        if (new Date() > feedbackDeadline) {
            return res.status(400).json({ message: "Đã quá 7 ngày, bạn không thể đánh giá lịch hẹn này nữa." });
        }

        if (feedback.rating < 1 || feedback.rating > 5) {
            return res.status(400).json({ message: "Đánh giá phải từ 1 đến 5 sao." });
        }
        
        const saved = await feedback.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: "Tạo feedback thất bại", error });
    }
}

export const getFeedbackByAccountId = async (req: Request, res: Response) => {
    try {
        const account = await Account.findById(req.params.accountId);
        if (!account) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản" });
        }
        const feedbacks = await Feedback.find({ account_id: account._id }).populate('account_id', 'fullName username');
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(400).json({ message: "Lấy feedback thất bại", error });
    }
}

export const getFeedbackByAppointmentId = async (req: Request, res: Response) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
        }
        if (appointment.status !== "completed") {
            return res.status(400).json({ message: "Lịch hẹn chưa hoàn thành" });
        }
        const feedbacks = await Feedback.find({ appointment_id: appointment._id }).populate('account_id', 'fullName username');
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(400).json({ message: "Lấy feedback thất bại", error });
    }
}

export const getFeedbackByServiceId = async (req: Request, res: Response) => {
    try {
        const service = await Service.findById(req.params.serviceId);
        if (!service) {
            return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
        }
        const feedbacks = await Feedback.find({ service_id: service._id }).populate('account_id', 'fullName username');
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(400).json({ message: "Lấy feedback thất bại", error });
    }
}

export const getFeedbackById = async (req: Request, res: Response) => {
    try {
        const feedback = await Feedback.findById(req.params.id).populate('account_id', 'fullName username');
        if (!feedback) {
            return res.status(404).json({ message: "Không tìm thấy feedback" });
        }
        res.status(200).json(feedback);
    } catch (error) {
        res.status(400).json({ message: "Lấy feedback thất bại", error });
    }
}