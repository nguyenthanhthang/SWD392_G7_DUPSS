import { Request, Response } from "express";
import Event, { IEvent } from "../models/Event";
import Account from "../models/Account";
import mongoose, { Document } from "mongoose";
import { generateEventQRCode, verifyQRCode } from "../utils/qrCodeUtils";

// [POST] /api/events - Tạo sự kiện mới
export const createEvent = async (
  req: Request<{}, {}, IEvent>,
  res: Response
): Promise<void> => {
  try {
    // Kiểm tra consultant có tồn tại
    const consultant = await Account.findById(req.body.consultantId);
    if (!consultant || consultant.role !== "consultant") {
      res.status(400).json({ message: "Tư vấn viên không hợp lệ" });
      return;
    }

    // Kiểm tra thời gian
    if (new Date(req.body.startDate) >= new Date(req.body.endDate)) {
      res
        .status(400)
        .json({ message: "Thời gian bắt đầu phải trước thời gian kết thúc" });
      return;
    }

    const event = new Event(req.body);
    const saved = await event.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Tạo sự kiện thất bại", error });
  }
};

// [GET] /api/events - Lấy danh sách sự kiện
export const getAllEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, consultantId } = req.query;
    let query = {};

    if (status) {
      query = { ...query, status };
    }
    if (consultantId) {
      query = { ...query, consultantId };
    }

    const events = await Event.find(query)
      .populate("consultantId", "fullName email")
      .sort({ startDate: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách sự kiện", error });
  }
};

// [GET] /api/events/:id - Lấy chi tiết sự kiện
export const getEventById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("consultantId", "fullName email")
      .populate("registeredUsers", "fullName email");

    if (!event) {
      res.status(404).json({ message: "Không tìm thấy sự kiện" });
      return;
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tìm sự kiện", error });
  }
};

// [PUT] /api/events/:id - Cập nhật sự kiện
export const updateEvent = async (
  req: Request<{ id: string }, {}, Partial<IEvent>>,
  res: Response
): Promise<void> => {
  try {
    // Kiểm tra sự kiện tồn tại
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ message: "Không tìm thấy sự kiện" });
      return;
    }

    // Không cho phép cập nhật nếu sự kiện đã kết thúc
    if (event.status === "completed") {
      res
        .status(400)
        .json({ message: "Không thể cập nhật sự kiện đã kết thúc" });
      return;
    }

    // Kiểm tra thời gian nếu có cập nhật
    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.startDate) >= new Date(req.body.endDate)) {
        res
          .status(400)
          .json({ message: "Thời gian bắt đầu phải trước thời gian kết thúc" });
        return;
      }
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("consultantId", "fullName email");

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
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ message: "Không tìm thấy sự kiện" });
      return;
    }

    // Không cho phép xóa sự kiện đang diễn ra hoặc đã kết thúc
    if (event.status === "ongoing" || event.status === "completed") {
      res.status(400).json({
        message: "Không thể xóa sự kiện đang diễn ra hoặc đã kết thúc",
      });
      return;
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(204).send();
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
    if (event.registeredUsers.length >= event.capacity) {
      res.status(400).json({ message: "Sự kiện đã đủ số lượng đăng ký" });
      return;
    }

    // Kiểm tra người dùng đã đăng ký chưa
    const userObjectId = new mongoose.Types.ObjectId(req.body.userId);
    if (event.registeredUsers.includes(userObjectId)) {
      res.status(400).json({ message: "Bạn đã đăng ký sự kiện này" });
      return;
    }

    event.registeredUsers.push(userObjectId);
    await event.save();

    res.status(200).json({ message: "Đăng ký sự kiện thành công" });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi đăng ký sự kiện", error });
  }
};

// [POST] /api/events/:id/unregister - Hủy đăng ký tham gia sự kiện
export const unregisterEvent = async (
  req: Request<{ id: string }, {}, { userId: string }>,
  res: Response
): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ message: "Không tìm thấy sự kiện" });
      return;
    }

    // Kiểm tra trạng thái sự kiện
    if (event.status !== "upcoming") {
      res
        .status(400)
        .json({ message: "Chỉ có thể hủy đăng ký sự kiện sắp diễn ra" });
      return;
    }

    // Kiểm tra người dùng đã đăng ký chưa
    const userObjectId = new mongoose.Types.ObjectId(req.body.userId);
    const userIndex = event.registeredUsers.findIndex((id) =>
      id.equals(userObjectId)
    );
    if (userIndex === -1) {
      res.status(400).json({ message: "Bạn chưa đăng ký sự kiện này" });
      return;
    }

    event.registeredUsers.splice(userIndex, 1);
    await event.save();

    res.status(200).json({ message: "Hủy đăng ký sự kiện thành công" });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi hủy đăng ký sự kiện", error });
  }
};

// [GET] /api/events/:id/qr - Lấy QR code cho sự kiện
export const getEventQRCode = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: "Không tìm thấy sự kiện" });
      return;
    }

    // Kiểm tra trạng thái sự kiện
    if (event.status !== "ongoing") {
      res.status(400).json({
        message: "Chỉ có thể tạo QR code cho sự kiện đang diễn ra",
      });
      return;
    }

    // Tạo QR code
    const qrCodeUrl = await generateEventQRCode(eventId, event.qrCodeSecret);
    res.status(200).json({ qrCodeUrl });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo QR code", error });
  }
};

// [POST] /api/events/check-in - Check-in vào sự kiện bằng QR code
export const checkInEvent = async (
  req: Request<{ id: string }, {}, { qrData: string; userId: string }>,
  res: Response
): Promise<void> => {
  try {
    // Xác thực người dùng
    const user = await Account.findById(req.body.userId).exec();
    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    // Xác thực QR code và lấy eventId
    const event = await Event.findById(req.params.id).exec();
    if (!event) {
      res.status(404).json({ message: "Không tìm thấy sự kiện" });
      return;
    }

    const verifyResult = verifyQRCode(req.body.qrData, event.qrCodeSecret);
    if (!verifyResult.isValid) {
      res.status(400).json({ message: verifyResult.error });
      return;
    }

    // Kiểm tra sự kiện có đang diễn ra không
    if (event.status !== "ongoing") {
      res.status(400).json({
        message: "Chỉ có thể check-in cho sự kiện đang diễn ra",
      });
      return;
    }

    // Kiểm tra người dùng đã đăng ký sự kiện chưa
    const isRegistered = event.registeredUsers.some((id) =>
      id.equals(new mongoose.Types.ObjectId(req.body.userId))
    );
    if (!isRegistered) {
      res.status(400).json({ message: "Bạn chưa đăng ký sự kiện này" });
      return;
    }

    // Kiểm tra người dùng đã check-in chưa
    const isCheckedIn = event.checkedInUsers.some((check) =>
      check.userId.equals(new mongoose.Types.ObjectId(req.body.userId))
    );
    if (isCheckedIn) {
      res.status(400).json({ message: "Bạn đã check-in sự kiện này" });
      return;
    }

    // Thực hiện check-in
    event.checkedInUsers.push({
      userId: new mongoose.Types.ObjectId(req.body.userId),
      checkedInAt: new Date(),
    });
    await event.save();

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
    const event = await Event.findById(req.params.id)
      .populate("registeredUsers", "fullName email")
      .populate("checkedInUsers.userId", "fullName email");

    if (!event) {
      res.status(404).json({ message: "Không tìm thấy sự kiện" });
      return;
    }

    // Tạo danh sách điểm danh
    const attendance = event.registeredUsers.map((user) => ({
      user,
      checkedIn:
        event.checkedInUsers.find((check) => check.userId.equals(user._id))
          ?.checkedInAt || null,
    }));

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách điểm danh", error });
  }
};
