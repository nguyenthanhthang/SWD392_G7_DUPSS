import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerEvent,
  unregisterEvent,
  getEventQRCode,
  checkInEvent,
  getEventAttendance,
} from "../controllers/eventController";

const router = express.Router();

// CRUD routes
router.post("/", createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

// Registration routes
router.post("/:id/register", registerEvent);
router.post("/:id/unregister", unregisterEvent);

// QR code và check-in routes
router.get("/:id/qr", getEventQRCode);
router.post("/:id/check-in", checkInEvent);
router.get("/:id/attendance", getEventAttendance);

export default router;
