import { Router } from "express";
import { createService, deleteService, getAllServices, getServiceById, getServiceByStatus, updateService } from "../controllers/serviceController";

const router = Router();

router.post("/", createService);
router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.put("/:id", updateService);
router.delete("/:id", deleteService);
router.get("/status", getServiceByStatus);

export default router;  