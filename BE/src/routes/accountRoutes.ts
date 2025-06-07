import express from "express";
import {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
} from "../controllers/accountController";

const router = express.Router();

// Filter accounts by role if role query parameter is provided
router.get("/", async (req, res, next) => {
  if (req.query.role) {
    try {
      const accounts = await require("../models/Account").default.find({ 
        role: req.query.role,
        isDisabled: false
      });
      return res.status(200).json(accounts);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi khi lọc tài khoản theo role", error });
    }
  }
  next();
});

router.post("/", createAccount);
router.get("/", getAllAccounts);
router.get("/:id", getAccountById);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);

export default router;
