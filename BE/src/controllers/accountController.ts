import { Request, Response } from "express";
import Account, { IAccount } from "../models/Account";
import Consultant from "../models/Consultant";

// [POST] /api/accounts – Tạo tài khoản
export const createAccount = async (
  req: Request<{}, {}, IAccount>,
  res: Response
): Promise<void> => {
  try {
    const account = new Account(req.body);
    const saved = await account.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Tạo tài khoản thất bại", error });
  }
};

// [GET] /api/accounts – Lấy tất cả tài khoản
export const getAllAccounts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const accounts = await Account.find();
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách tài khoản", error });
  }
};

// [GET] /api/accounts/:id – Lấy 1 tài khoản
export const getAccountById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      res.status(404).json({ message: "Không tìm thấy tài khoản" });
      return;
    }
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tìm tài khoản", error });
  }
};

// [PUT] /api/accounts/:id – Cập nhật
export const updateAccount = async (
  req: Request<{ id: string }, {}, Partial<IAccount>>,
  res: Response
): Promise<void> => {
  try {
    const updated = await Account.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy tài khoản để cập nhật" });
      return;
    }

    // Kiểm tra nếu role được cập nhật thành consultant
    if (req.body.role === "consultant") {
      // Kiểm tra xem đã có consultant cho account này chưa
      const existingConsultant = await Consultant.findOne({ accountId: updated._id });
      
      if (!existingConsultant) {
        // Tạo consultant mới nếu chưa tồn tại
        const newConsultant = new Consultant({
          accountId: updated._id,
          status: "active",
          // Thêm các thông tin mặc định khác nếu cần
        });
        await newConsultant.save();
      }
    }
    // neu dang la consultant ma chuyen thanh custome thi status = inactive
    if (updated.role === "consultant" && req.body.role === "customer") {
      const consultant = await Consultant.findOne({ accountId: updated._id });
      if (consultant) {
        consultant.status = "inactive";
        await consultant.save();
      }
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi cập nhật", error });
  }
};

// [DELETE] /api/accounts/:id – Xóa
export const deleteAccount = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const deleted = await Account.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy tài khoản để xoá" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi xoá", error });
  }
};
