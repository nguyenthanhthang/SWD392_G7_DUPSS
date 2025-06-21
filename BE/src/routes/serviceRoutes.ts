import { Router } from "express";
import { createService, deleteService, getAllServices, getServiceById, getServiceByStatus, updateService, getServiceRating, updateServiceRating } from "../controllers/serviceController";

const router = Router();

router.post("/", createService);
router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.put("/:id", updateService);
router.delete("/:id", deleteService);
router.get("/status", getServiceByStatus);

// Các route mới cho rating
router.get("/:id/rating", getServiceRating);
router.post("/:id/update-rating", updateServiceRating);

export default router;  