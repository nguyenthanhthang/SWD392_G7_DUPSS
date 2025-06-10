import { Request, Response } from "express";
import SlotTime from "../models/SlotTime";
import Appointment from "../models/Appointment";
import Consultant from "../models/Consultant";
import Account from "../models/Account";

export const getAllSlotTime = async (req: Request, res: Response) => {
    try {
        const slotTime = await SlotTime.find();
        res.status(200).json(slotTime);
    } catch (error) {
        res.status(500).json({ message: "Xảy ra lỗi khi lấy tất cả slot time",error });
    }
}
export const getSlotTimeById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const slotTime = await SlotTime.findById(id);
        res.status(200).json(slotTime);
    } catch (error) {
        res.status(500).json({ message: "Xảy ra lỗi khi lấy slot time theo id",error });
    }
}

export const getSlotTimeByConsultantId = async (req: Request, res: Response) => {
    try {
        const { consultant_id } = req.params;
        const slotTime = await SlotTime.find({ consultant_id });
        res.status(200).json(slotTime);
    } catch (error) {
        res.status(500).json({ message: "Xảy ra lỗi khi lấy slot time theo consultant_id",error });
    }
}
export const createSlotTime = async (req: Request, res: Response) => {
    try {
        const { consultant_id, start_time, end_time } = req.body;
        // chua check thuoc consultant_id co ton tai khong, lcih nay da ton tai chua
        const slotTime = await SlotTime.create({ consultant_id, start_time, end_time });
        res.status(201).json(slotTime);
    } catch (error) {
        res.status(500).json({ message: "Xảy ra lỗi khi tạo slot time",error });
    }
}
export const updateSlotTime = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { start_time, end_time } = req.body;
        const slotTime = await SlotTime.findByIdAndUpdate(id, { start_time, end_time }, { new: true });
        res.status(200).json({ message: "Slot time updated successfully",data:slotTime });
    } catch (error) {
        res.status(500).json({ message: "Xảy ra lỗi khi cập nhật slot time",error });
    }
}   
export const updateStatusSlotTime = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;  
        const { status } = req.body;
        const slotTime = await SlotTime.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({ message: "Cập nhật trạng thái slot time thành công",data:slotTime });
    } catch (error) {
        res.status(500).json({ message: "Xảy ra lỗi khi cập nhật trạng thái slot time",error });
    }
}   

export const deleteSlotTime = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const slotTime = await SlotTime.findById(id);
        const appointment = await Appointment.find({ slot_time_id: id });
        if (appointment.length > 0) {
            return res.status(400).json({ message: "Không thể xóa slot time đã được đặt",data:slotTime });
        }
        if(slotTime?.status === "booked"){
            return res.status(400).json({ message: "Không thể xóa slot time đã được đặt",data:slotTime });
        }
        await SlotTime.findByIdAndDelete(id);
        res.status(200).json({ message: "Xóa slot time thành công",data:slotTime });
    } catch (error) {
        res.status(500).json({ message: "Xảy ra lỗi khi xóa slot time",error });
    }
}

// API lấy danh sách tư vấn viên rảnh cho từng khung giờ trong một ngày
export const getAvailableConsultantsByDay = async (req: Request, res: Response) => {
    try {
        const { date } = req.params; // yyyy-MM-dd
        if (!date) return res.status(400).json({ message: "Thiếu tham số ngày" });

        // Tính khoảng thời gian theo giờ Việt Nam (GMT+7)
        const startOfDayVN = new Date(date + 'T00:00:00+07:00');
        const endOfDayVN = new Date(date + 'T23:59:59.999+07:00');

        console.log('startOfDayVN:', startOfDayVN);
        console.log('endOfDayVN:', endOfDayVN);

        // Lấy tất cả slot available trong ngày, KHÔNG loại trùng lặp
        const slots = await SlotTime.find({
            start_time: { $gte: startOfDayVN, $lte: endOfDayVN },
            status: "available"
        }).populate({
            path: "consultant_id",
            populate: { path: "accountId", model: "Account" }
        });

        console.log('Filtered slots:', slots);

        // Group lại theo khung giờ chuẩn (08:00, 09:00,...)
        const timeSlots = [
            "08:00", "09:00", "10:00", "11:00",
            "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
        ];

        const result = timeSlots.map(slot => {
            // Tìm tất cả slot có start_time đúng giờ này (theo giờ Việt Nam GMT+7)
            const availableSlots = slots.filter(st => {
                const d = new Date(st.start_time);
                const hourVN = d.getHours();
                const hourStr = hourVN.toString().padStart(2, '0') + ":00";
                return hourStr === slot;
            });

            const availableConsultants = availableSlots.map(st => {
                const consultant = st.consultant_id as any;
                if (!consultant || !consultant.accountId) return null;
                const acc = consultant.accountId as any;
                return {
                    _id: consultant._id,
                    fullName: acc.fullName,
                    photoUrl: acc.photoUrl,
                    email: acc.email,
                    phoneNumber: acc.phoneNumber,
                    gender: acc.gender,
                    introduction: consultant.introduction,
                    experience: consultant.experience,
                    contact: consultant.contact
                };
            }).filter(Boolean);

            return {
                time: slot,
                status: availableConsultants.length > 0 ? "available" : "none",
                availableConsultants
            };
        });

        res.status(200).json({ date, slots: result });
    } catch (error) {
        res.status(500).json({ message: "Xảy ra lỗi khi lấy danh sách tư vấn viên rảnh theo ngày", error });
    }
}