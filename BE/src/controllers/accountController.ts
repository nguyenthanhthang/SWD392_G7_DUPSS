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

    // If creating a consultant account, also create consultant profile
    if (saved.role === "consultant") {
      const newConsultant = new Consultant({
        accountId: saved._id,
        status: "active",
      });
      await newConsultant.save();
    }

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Tạo tài khoản thất bại", error });
  }
};

// [GET] /api/accounts – Lấy danh sách tài khoản
export const getAllAccounts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const accounts = await Account.find();
    res.status(200).json(accounts);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Lấy danh sách tài khoản thất bại", error });
  }
};

// [GET] /api/accounts/:id – Lấy chi tiết tài khoản
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
    res
      .status(400)
      .json({ message: "Lấy thông tin tài khoản thất bại", error });
  }
};

// [PUT] /api/accounts/:id – Cập nhật
export const updateAccount = async (
  req: Request<{ id: string }, {}, Partial<IAccount>>,
  res: Response
): Promise<void> => {
  try {
    // Lấy account hiện tại trước khi cập nhật
    const currentAccount = await Account.findById(req.params.id);
    if (!currentAccount) {
      res.status(404).json({ message: "Không tìm thấy tài khoản để cập nhật" });
      return;
    }

    // Kiểm tra nếu đang cố chuyển từ consultant sang customer
    if (currentAccount.role === "consultant" && req.body.role === "customer") {
      res
        .status(400)
        .json({ message: "Không thể chuyển từ tư vấn viên sang khách hàng" });
      return;
    }

    // Nếu hợp lệ, tiến hành cập nhật
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
      const existingConsultant = await Consultant.findOne({
        accountId: updated._id,
      });

      if (!existingConsultant) {
        // Tạo consultant mới nếu chưa tồn tại
        const newConsultant = new Consultant({
          accountId: updated._id,
          status: "active",
        });
        await newConsultant.save();
      } else {
        existingConsultant.status = "active";
        await existingConsultant.save();
      }
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi cập nhật", error });
  }
};

// [DELETE] /api/accounts/:id – Xóa tài khoản
export const deleteAccount = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const deleted = await Account.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy tài khoản để xóa" });
      return;
    }

    // If deleting a consultant account, also update consultant status
    if (deleted.role === "consultant") {
      await Consultant.findOneAndUpdate(
        { accountId: deleted._id },
        { status: "isDeleted" }
      );
    }

    res.status(200).json({ message: "Xóa tài khoản thành công" });
  } catch (error) {
    res.status(400).json({ message: "Xóa tài khoản thất bại", error });
  }
};
