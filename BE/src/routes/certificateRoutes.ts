import { Router } from "express";
import { createCertificate, getAllCertificates, getCertificateById, updateCertificate, deleteCertificate, getCertificatesByConsultantId } from "../controllers/certificateController";

const router = Router();


router.post("/", createCertificate);
router.get("/", getAllCertificates);
router.get("/consultant/:consultantId", getCertificatesByConsultantId);
router.get("/:id", getCertificateById);
router.put("/:id", updateCertificate);
router.delete("/:id", deleteCertificate);


router.get("/consultant/:consultantId", getCertificatesByConsultantId);

export default router;  