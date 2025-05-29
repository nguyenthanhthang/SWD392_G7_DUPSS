import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Account from "../models/Account"; // Đảm bảo đúng đường dẫn model Account
import { signToken } from "../utils/index"; // Đảm bảo đúng đường dẫn hàm signToken
import { ValidationError } from "../errors/ValidationError"; // Đảm bảo đúng đường dẫn
import { Types } from "mongoose";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    const formatUsername = username.trim().toLowerCase();
    const formatEmail = email.trim().toLowerCase();
    const formatPassword = password.trim();
    const formatConfirmPassword = confirmPassword.trim();

    const errors: any = {};

    if (
      !formatUsername ||
      !formatEmail ||
      !formatPassword ||
      !formatConfirmPassword
    ) {
      errors.message = "Vui lòng điền đầy đủ các trường!";
      throw new ValidationError(errors);
    }

    // Check username format
    if (formatUsername.length < 8 || formatUsername.length > 30) {
      errors.username = "Tên tài khoản phải có độ dài từ 8 đến 30 ký tự!";
      throw new ValidationError(errors);
    }
    if (!/^(?:[a-zA-Z0-9_]{8,30})$/.test(formatUsername)) {
      errors.username = "Tên tài khoản chỉ được chứa chữ, số, dấu gạch dưới!";
      throw new ValidationError(errors);
    }

    // Check email format
    if (
      !/^[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}$/.test(formatEmail)
    ) {
      errors.email = "Email không hợp lệ!";
      throw new ValidationError(errors);
    }

    const existingUser = await Account.findOne({
      $or: [{ username: formatUsername }, { email: formatEmail }],
    });

    if (existingUser) {
      if (existingUser.username === formatUsername) {
        errors.username = "Tên tài khoản này đã được sử dụng!";
      }
      if (existingUser.email === formatEmail) {
        errors.email = "Email này đã được sử dụng!";
      }
      throw new ValidationError(errors);
    }

    // Check password strength
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,30}$/.test(
        formatPassword
      )
    ) {
      errors.password =
        "Mật khẩu phải chứa chữ thường, in hoa, số, ký tự đặc biệt và từ 6 đến 30 ký tự!";
      throw new ValidationError(errors);
    }

    if (formatPassword !== formatConfirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp!";
      throw new ValidationError(errors);
    }

    // Create new user
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(formatPassword, salt);

    const newUser = await Account.create({
      username: formatUsername,
      email: formatEmail,
      password: hashedPass,
    });

    // Generate token
    const token = await signToken({
      _id: newUser._id as Types.ObjectId,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });

    return res.status(201).json({
      message: "Đăng ký thành công!",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isVerified: false,
        token,
      },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error.errors);
    }
    res.status(500).json({ message: "Đã xảy ra lỗi server" });
  }
};
