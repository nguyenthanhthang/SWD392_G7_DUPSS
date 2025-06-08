import express from "express";
import {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  changePassword,
} from "../controllers/accountController";

const router = express.Router();

router.post("/", createAccount);
router.get("/", getAllAccounts);
router.get("/:id", getAccountById);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);
router.post("/change-password", changePassword);

// Thêm route kiểm tra số điện thoại
router.get("/check-phone/:phone", async (req, res) => {
  const { phone } = req.params;
  const { excludeId } = req.query;
  try {
    const query: any = { phoneNumber: phone };
    if (excludeId) query._id = { $ne: excludeId };
    const existed = await require("../models/Account").default.findOne(query);
    res.json({ existed: !!existed });
  } catch (err) {
    res.status(500).json({ message: "Lỗi kiểm tra số điện thoại" });
  }
});

export default router;
