import express from "express";
import { createFeedback, getFeedbackByAccountId, getFeedbackByAppointmentId, getFeedbackById, getFeedbackByServiceId } from "../controllers/feedbackController";
const router = express.Router();
router.post("/", createFeedback);
router.get("/account/:accountId", getFeedbackByAccountId);
router.get("/appointment/:appointmentId", getFeedbackByAppointmentId);
router.get("/service/:serviceId", getFeedbackByServiceId);
router.get("/:id", getFeedbackById);
export default router;