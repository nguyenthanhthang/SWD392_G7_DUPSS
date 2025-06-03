import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import accountRoutes from "./routes/accountRoutes";
import authRoutes from "./routes/authRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import consultantRoutes from "./routes/consultantRoutes";

// Load biến môi trường
dotenv.config();

// Khởi tạo app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối DB
connectDB();
console.log("🧪 MONGO_URI =", process.env.MONGO_URI);

// Routes
app.use("/api/accounts", accountRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/consultants", consultantRoutes);  

// Route kiểm tra
app.get("/", (_req, res) => {
  res.send(" DUPSS backend is running");
});

// Start server
app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
});
