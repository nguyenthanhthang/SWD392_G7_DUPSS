import { Request, Response } from "express";
import Service from "../models/Service";

export const createService = async(req:Request,res:Response)=>{
    try {
        const {name,description,price,image, status} = req.body;
        // Validation thủ công
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({message: "Tên dịch vụ không hợp lệ!"});
        }
        if (!description || typeof description !== 'string' || !description.trim()) {
            return res.status(400).json({message: "Mô tả dịch vụ không hợp lệ!"});
        }
        if (typeof price !== 'number') {
            return res.status(400).json({message: "Giá dịch vụ phải là số!"});
        }
        if (!image || typeof image !== 'string' || !image.trim()) {
            return res.status(400).json({message: "Hình ảnh dịch vụ không hợp lệ!"});
        }
        // Status hợp lệ
        const validStatus = ["active", "inactive", "deleted"];
        const serviceStatus = status && validStatus.includes(status) ? status : "active";
        const service = new Service({name,description,price,image, status: serviceStatus});
        await service.save();
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({message:"Lỗi khi tạo dịch vụ",error});
    }
}

export const getAllServices = async(req:Request,res:Response)=>{
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({message:"Lỗi khi lấy danh sách dịch vụ",error});
    }
}

export const getServiceById = async(req:Request,res:Response)=>{
    try {
        const service = await Service.findById(req.params.id);
        if(!service){
            return res.status(404).json({message:"Dịch vụ không tồn tại"});
        }
        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({message:"Lỗi khi lấy dịch vụ",error});
    }
}

export const updateService = async(req:Request,res:Response)=>{
    try {
        const service = await Service.findByIdAndUpdate(req.params.id,req.body,{new:true});
        if(!service){
            return res.status(404).json({message:"Dịch vụ không tồn tại"});
        }
        res.status(200).json({
            message: "Cập nhật dịch vụ thành công",
            data: service
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật dịch vụ:", error);
        res.status(500).json({
            message: "Lỗi khi cập nhật dịch vụ",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export const deleteService = async(req:Request,res:Response)=>{
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if(!service){
            return res.status(404).json({message:"Dịch vụ không tồn tại"});
        }
        res.status(200).json({message:"Dịch vụ đã được xóa"});
    } catch (error) {
        res.status(500).json({message:"Lỗi khi xóa dịch vụ",error});
    }
}

export const getServiceByStatus = async(req:Request,res:Response)=>{
    try {
        const {status} = req.query;
        const services = await Service.find({status});
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({message:"Lỗi khi lấy dịch vụ theo trạng thái",error});
    }
}