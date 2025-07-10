import { Router } from "express";
import { createConsultant, getAllConsultants, getConsultantById, updateConsultant, deleteConsultant, getConsultantByAccountId } from "../controllers/consultantController";
import { authMiddleware, roleMiddleware } from "../middleware";

const router = Router();

// Route này chỉ cho ADMIN và CONSULTANT truy cập
router.get("/", authMiddleware, roleMiddleware(["admin", "consultant"]), getAllConsultants);
router.get("/account/:accountId", getConsultantByAccountId);
router.get("/:id", getConsultantById);
router.put("/:id", updateConsultant);
router.delete("/:id", deleteConsultant);
router.post("/", createConsultant);

export default router;      