import { Request, Response } from "express";
import Service from "../models/Service";
export const createService = async(req:Request,res:Response)=>{
    try {
        const {name,description,price,image} = req.body;
        const service = new Service({name,description,price,image});
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
        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({message:"Lỗi khi cập nhật dịch vụ",error});
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