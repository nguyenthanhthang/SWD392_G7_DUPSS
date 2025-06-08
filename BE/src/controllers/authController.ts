import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Account from "../models/Account"; // Đảm bảo đúng đường dẫn model Account
import { randomText, signToken } from "../utils/index"; // Đảm bảo đúng đường dẫn hàm signToken
import { ValidationError } from "../errors/ValidationError"; // Đảm bảo đúng đường dẫn
import { Types } from "mongoose";
import { sendVerificationEmail } from "../services/email";

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
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const newUser = await Account.create({
      username: formatUsername,
      email: formatEmail,
      password: hashedPass,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Generate token
    const token = await signToken({
      _id: newUser._id as Types.ObjectId,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });

    await sendVerificationEmail(
      newUser.email,
      newUser.username,
      verificationToken
    );

    return res.status(201).json({
      message: "Đăng ký thành công!",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isVerified: false,
        token,
        verificationToken: newUser.verificationToken,
        verificationTokenExpiresAt: newUser.verificationTokenExpiresAt,
      },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error.errors);
    }
    res.status(500).json({ message: "Đã xảy ra lỗi server" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors: any = {};

    const { login, password } = req.body;

    // Kiểm tra login và password có tồn tại và là string không
    const formatLogin =
      typeof login === "string" ? login.trim().toLowerCase() : "";
    const trimmedPassword = typeof password === "string" ? password.trim() : "";

    if (!formatLogin || !trimmedPassword) {
      errors.message = "Vui lòng điền đầy đủ các trường!";
      throw new ValidationError(errors);
    }

    const user = await Account.findOne({
      $or: [{ email: formatLogin }, { username: formatLogin }],
    });

    if (!user) {
      errors.message = "Tài khoản không tồn tại!";
      errors.login = "Vui lòng kiểm tra lại!";
      throw new ValidationError(errors);
    }

    if (user.isDisabled) {
      errors.message =
        "Tài khoản của bạn đã bị khóa! Vui lòng liên hệ quản trị viên để được hỗ trợ";
      throw new ValidationError(errors);
    }

    if (!user) {
      errors.message = "Tài khoản không tồn tại!";
      errors.login = "Vui lòng kiểm tra lại!";
      throw new ValidationError(errors);
    }

    const comparePassword = await bcrypt.compare(
      trimmedPassword,
      user.password
    );

    if (!comparePassword) {
      errors.message = "Mật khẩu không đúng, vui lòng thử lại!";
      errors.login = "Vui lòng kiểm tra lại!";
      errors.password = "Vui lòng kiểm tra lại!";
      throw new ValidationError(errors);
    }

    const token = await signToken({
      _id: user._id as Types.ObjectId,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      message: "Đăng nhập thành công!",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token,
      },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error.errors);
    }
    res.status(500).json({
      message: error.message,
    });
  }
};

export const loginWithGoogle = async (req: Request, res: Response) => {
  try {
    const { email, username, photoUrl } = req.body;

    const formatEmail = email.trim().toLowerCase();
    const formatUserName = username + "-" + randomText(5);

    let user = await Account.findOne({ email: formatEmail });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(randomText(12), salt);
      user = await Account.create({
        username: formatUserName,
        email: formatEmail,
        password: hashedPass,
        isVerified: true,
        photoUrl,
      });
    } else {
      if (user.isDisabled) {
        return res.status(403).json({
          message:
            "Tài khoản của bạn đã bị khóa! Vui lòng liên hệ quản trị viên để được hỗ trợ",
        });
      }

      if (user.photoUrl === "") {
        user.photoUrl = photoUrl;
        await user.save();
      }

      user.isVerified = true;

      await user.save();
    }

    const token = await signToken({
      _id: user._id as Types.ObjectId,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      message: "Đăng nhập thành công!",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi xử lý đăng nhập Google",
    });
  }
};

export const sendNewVerifyEmail = async (req: Request, res: Response) => {
  const { email, username } = req.body;
  try {
    const user = await Account.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // For testing
    // const verificationToken = "123456";

    const verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = verificationTokenExpiresAt as any;

    await user.save();

    await sendVerificationEmail(email, username, verificationToken);

    return res
      .status(200)
      .json({ message: "Mã OTP đã được gửi đến email của bạn" });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const checkOTP = async (req: Request, res: Response) => {
  const { verifyCode } = req.body;
  try {
    const user = await Account.findOne({
      verificationToken: verifyCode,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Mã không hợp lệ hoặc hết hạn" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    return res.status(200).json({ message: "Xác nhận tài khoản thành công" });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
