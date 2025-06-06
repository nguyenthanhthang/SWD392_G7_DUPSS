import { Router } from "express";
import { createAppointment, getAllAppointments, getAppointmentById, updateStatusAppointment, getAppointmentByUserId, getAppointmentByConsultantId } from "../controllers/appointmentController";

const router = Router();

router.post("/", createAppointment);
router.get("/", getAllAppointments);
router.get("/:id", getAppointmentById);
router.put("/:id", updateStatusAppointment);
router.get("/user/:id", getAppointmentByUserId);
router.get("/consultant/:id", getAppointmentByConsultantId);

export default router;