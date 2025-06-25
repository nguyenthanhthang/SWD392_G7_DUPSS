import { Request, Response } from "express";
import Event, { IEvent } from "../models/Event";
import Account from "../models/Account";
import mongoose, { Document, Types } from "mongoose";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import EventRegistration from "../models/EventRegistration";

interface CheckInUser {
  userId: Types.ObjectId;
  checkedInAt: Date;
}

interface RegisteredUser {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// [POST] /api/events - Tạo sự kiện mới
export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      registrationStartDate,
      registrationEndDate,
      location, 
      capacity 
    } = req.body;

    // Validation
    if (!title || !description || !startDate || !endDate || !registrationStartDate || !registrationEndDate || !location || !capacity) {
      res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const regStart = new Date(registrationStartDate);
    const regEnd = new Date(registrationEndDate);

    // Validate dates logic
    if (regEnd > regStart && regStart < start && regEnd <= start && end > start) {
      // Valid: regStart < regEnd <= eventStart < eventEnd
    } else {
      res.status(400).json({ 
        message: "Thời gian không hợp lệ. Đăng ký phải kết thúc trước khi sự kiện bắt đầu." 
      });
      return;
    }

    const event = new Event({
      title,
      description,
      startDate: start,
      endDate: end,
      registrationStartDate: regStart,
      registrationEndDate: regEnd,
      location,
      capacity,
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi tạo sự kiện", error });
  }
};

// [GET] /api/events - Lấy danh sách sự kiện
export const getAllEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi lấy danh sách sự kiện", error });
  }
};

// [GET] /api/events/:id - Lấy chi tiết sự kiện
export const getEventById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ message: "Không tìm thấy sự kiện" });
      return;
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi lấy thông tin sự kiện", error });
  }
};

// [PUT] /api/events/:id - Cập nhật sự kiện
export const updateEvent = async (
  req: Request<{ id: string }, {}, Partial<IEvent>>,
  res: Response
): Promise<void> => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy sự kiện để cập nhật" });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi cập nhật sự kiện", error });
  }
};

// [DELETE] /api/events/:id - Xóa sự kiện
export const deleteEvent = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy sự kiện để xóa" });
      return;
    }
    // Xóa tất cả đăng ký liên quan
    await EventRegistration.deleteMany({ eventId: req.params.id });
    res.status(200).json({ message: "Xóa sự kiện thành công" });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi xóa sự kiện", error });
  }
};

// [POST] /api/events/:id/register - Đăng ký tham gia sự kiện
export const registerEvent = async (
  req: Request<{ id: string }, {}, { userId: string }>,
  res: Response
): Promise<void> => {
  try {
    // Kiểm tra account tồn tại
    const account = await Account.findById(req.body.userId);
    if (!account) {
      res.status(404).json({ message: "Không tìm thấy tài khoản" });
      return;
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ message: "Không tìm thấy sự kiện" });
      return;
    }

    // Kiểm tra trạng thái sự kiện
    if (event.status !== "upcoming") {
      res
        .status(400)
        .json({ message: "Chỉ có thể đăng ký sự kiện sắp diễn ra" });
      return;
    }

    // Kiểm tra số lượng đăng ký
    const registrationCount = await EventRegistration.countDocuments({
      eventId: event._id,
    });
    if (registrationCount >= event.capacity) {
      res.status(400).json({ message: "Sự kiện đã đủ số lượng đăng ký" });
      return;
    }

    // Kiểm tra người dùng đã đăng ký chưa
    const existingRegistration = await EventRegistration.findOne({
      userId: req.body.userId,
      eventId: event._id,
    });

    if (existingRegistration) {
      res.status(400).json({ message: "Bạn đã đăng ký sự kiện này" });
      return;
    }

    // Tạo JWT token chứa thông tin đăng ký
    const token = jwt.sign(
      {
        userId: req.body.userId,
        eventId: event._id,
        timestamp: new Date().toISOString(),
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Tạo QR code từ token
    const qrString = await QRCode.toDataURL(token);

    // Lưu thông tin đăng ký
    const registration = new EventRegistration({
      userId: req.body.userId,
      eventId: event._id,
      token,
      qrString,
    });

    await registration.save();

    res.status(200).json({
      message: "Đăng ký sự kiện thành công",
      data: {
        userName: account.fullName,
        eventName: event.title,
        eventDate: event.startDate,
        qrCode: qrString,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi đăng ký sự kiện", error });
  }
};

// [POST] /api/events/:id/unregister - Hủy đăng ký sự kiện
export const unregisterEvent = async (
  req: Request<{ id: string }, {}, { userId: string }>,
  res: Response
): Promise<void> => {
  try {
    const deleted = await EventRegistration.findOneAndDelete({
      eventId: req.params.id,
      userId: req.body.userId,
    });

    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy đăng ký để hủy" });
      return;
    }

    res.status(200).json({ message: "Hủy đăng ký thành công" });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi hủy đăng ký", error });
  }
};

// [GET] /api/events/:id/qr - Lấy QR code cho sự kiện
export const getEventQRCode = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const eventId: string = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: "Không tìm thấy sự kiện" });
      return;
    }

    // Kiểm tra trạng thái sự kiện
    if (event.status !== "ongoing") {
      res.status(400).json({
        message: "Chỉ có thể lấy QR code cho sự kiện đang diễn ra",
      });
      return;
    }

    // Lấy QR code từ registration
    const registration = await EventRegistration.findOne({ eventId });
    if (!registration) {
      res.status(404).json({ message: "Không tìm thấy thông tin đăng ký" });
      return;
    }

    res.status(200).json({ qrCodeUrl: registration.qrString });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy QR code", error });
  }
};

// [POST] /api/events/:id/check-in - Check-in sự kiện
export const checkInEvent = async (
  req: Request<{ id: string }, {}, { qrData: string }>,
  res: Response
): Promise<void> => {
  try {
    // Giải mã token từ QR code
    let decoded;
    try {
      decoded = jwt.verify(req.body.qrData, JWT_SECRET) as {
        userId: string;
        eventId: string;
        timestamp: string;
      };
    } catch (err) {
      res.status(400).json({ message: "Mã QR không hợp lệ" });
      return;
    }

    // Kiểm tra event ID có khớp không
    if (decoded.eventId !== req.params.id) {
      res.status(400).json({ message: "Mã QR không khớp với sự kiện" });
      return;
    }

    // Tìm thông tin đăng ký
    const registration = await EventRegistration.findOne({
      userId: decoded.userId,
      eventId: decoded.eventId,
      token: req.body.qrData,
    });

    if (!registration) {
      res.status(400).json({ message: "Không tìm thấy thông tin đăng ký" });
      return;
    }

    // Kiểm tra đã check-in chưa
    if (registration.checkedInAt) {
      res.status(400).json({
        message: "Đã check-in trước đó",
        checkedInAt: registration.checkedInAt,
      });
      return;
    }

    // Cập nhật thời gian check-in
    registration.checkedInAt = new Date();
    await registration.save();

    res.status(200).json({ message: "Check-in thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi check-in", error });
  }
};

// [GET] /api/events/:id/attendance - Lấy danh sách điểm danh
export const getEventAttendance = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const registrations = await EventRegistration.find({
      eventId: req.params.id,
    }).populate("userId", "fullName email");

    const attendance = registrations.map((reg) => ({
      userId: reg.userId,
      checkedInAt: reg.checkedInAt,
    }));

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách điểm danh", error });
  }
};

// [GET] /api/events/registered/:userId - Lấy danh sách sự kiện đã đăng ký
export const getRegisteredEvents = async (
  req: Request<{ userId: string }>,
  res: Response
): Promise<void> => {
  try {
    const registrations = await EventRegistration.find({
      userId: req.params.userId,
    }).populate("eventId");

    const events = registrations.map((reg) => reg.eventId);
    res.status(200).json(events);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách sự kiện đã đăng ký", error });
  }
};
