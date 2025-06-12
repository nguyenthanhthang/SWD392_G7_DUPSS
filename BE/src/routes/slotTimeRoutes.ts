import { Router } from "express";
import { getAllSlotTime, getSlotTimeByConsultantId, createSlotTime, updateSlotTime, updateStatusSlotTime, getSlotTimeById, deleteSlotTime, getAvailableConsultantsByDay } from "../controllers/slotTimeController";

const router = Router();

router.get("/", getAllSlotTime);
router.get("/:id", getSlotTimeById);
router.get("/consultant/:consultant_id", getSlotTimeByConsultantId);
router.post("/", createSlotTime);
router.put("/:id", updateSlotTime);
router.put("/status/:id", updateStatusSlotTime);
router.delete("/:id", deleteSlotTime);
router.get("/available-by-day/:date", getAvailableConsultantsByDay);

export default router;