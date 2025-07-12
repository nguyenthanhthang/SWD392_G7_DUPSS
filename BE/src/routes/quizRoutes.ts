import express from "express";
import {
  getAllQuizzes,
  getQuizQuestions,
  submitQuizResult,
  getUserQuizResults,
  getQuizResultById,
  getUserQuizHistory,
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getAllQuizResults,
} from "../controllers/quizController";
import { authMiddleware, roleMiddleware } from "../middleware";

const router = express.Router();

// GET /api/quizzes - Lấy danh sách các bài quiz
router.get("/", getAllQuizzes);

// GET /api/quizzes/:quizId/questions - Lấy câu hỏi theo quiz và age group
router.get("/:quizId/questions", getQuizQuestions);

// POST /api/quiz-results - Submit kết quả làm bài
router.post("/quiz-results", submitQuizResult);

// GET /api/quiz-results/:userId - Lịch sử kết quả làm bài của user
router.get("/quiz-results/:userId", getUserQuizResults);

// GET /api/quiz-results/result/:resultId - Lấy chi tiết một kết quả
router.get("/quiz-results/result/:resultId", getQuizResultById);

// GET /api/quizzes/history/:userId - Lịch sử làm bài của user
router.get("/history/:userId", getUserQuizHistory);

// Route lấy toàn bộ kết quả quiz (admin)
router.get("/quiz-results/all", getAllQuizResults);

// CRUD Quiz
// POST /api/quizzes - Tạo mới quiz
router.post("/",authMiddleware,roleMiddleware(["admin"]), createQuiz);
// GET /api/quizzes/:id - Lấy chi tiết quiz
router.get("/:id", getQuizById);
// PUT /api/quizzes/:id - Cập nhật quiz
router.put("/:id",authMiddleware,roleMiddleware(["admin"]), updateQuiz);
// DELETE /api/quizzes/:id - Xóa quiz
router.delete("/:id",authMiddleware,roleMiddleware(["admin"]), deleteQuiz);

export default router;
