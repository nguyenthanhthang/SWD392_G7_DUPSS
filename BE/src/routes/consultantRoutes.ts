import { Router } from "express";
import { createConsultant, getAllConsultants, getConsultantById, updateConsultant, deleteConsultant, getConsultantByAccountId } from "../controllers/consultantController";

const router = Router();

router.post("/", createConsultant);
router.get("/", getAllConsultants);
router.get("/:id", getConsultantById);
router.put("/:id", updateConsultant);
router.delete("/:id", deleteConsultant);
router.get("/account/:accountId", getConsultantByAccountId);

export default router;      