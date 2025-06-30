import { Router } from "express";
import { createAppointment, getAllAppointments, getAppointmentById, updateStatusAppointment, getAppointmentByUserId, getAppointmentByConsultantId, getAppointmentBySlotTimeId, deleteAppointment, rescheduleAppointment, capNhatLinkMeet } from "../controllers/appointmentController";

const router = Router();

router.post("/", createAppointment);
router.get("/", getAllAppointments);
router.get("/:id", getAppointmentById);
router.put("/status/:id", updateStatusAppointment);
router.put("/reschedule/:id", rescheduleAppointment);
router.put("/meet-link/:id", capNhatLinkMeet);
router.get("/user/:id", getAppointmentByUserId);
router.get("/consultant/:id", getAppointmentByConsultantId);
router.get("/slotTime/:id", getAppointmentBySlotTimeId);
router.delete("/:id", deleteAppointment);

export default router;