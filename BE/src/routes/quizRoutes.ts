import express from "express";
import {
  getAllQuizzes,
  getQuizQuestions,
  submitQuizResult,
  getUserQuizResults,
  getQuizResultById,
} from "../controllers/quizController";

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

export default router;
