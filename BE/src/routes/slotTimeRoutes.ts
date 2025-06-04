import { Router } from "express";
import { getAllSlotTime, getSlotTimeByConsultantId, createSlotTime, updateSlotTime, updateStatusSlotTime, getSlotTimeById } from "../controllers/slotTimeController";

const router = Router();

router.get("/", getAllSlotTime);
router.get("/:id", getSlotTimeById);
router.get("/consultant/:consultant_id", getSlotTimeByConsultantId);
router.post("/", createSlotTime);
router.put("/:id", updateSlotTime);
router.put("/status/:id", updateStatusSlotTime);

export default router;