import { Request, Response } from "express";
import SlotTime from "../models/SlotTime";

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