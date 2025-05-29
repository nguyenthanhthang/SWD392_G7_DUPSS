import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import accountRoutes from "./routes/accountRoutes";

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

// Routes
app.use("/api/accounts", accountRoutes);

// Route kiểm tra
app.get("/", (_req, res) => {
  res.send(" DUPSS backend is running");
});

// Start server
app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
});
