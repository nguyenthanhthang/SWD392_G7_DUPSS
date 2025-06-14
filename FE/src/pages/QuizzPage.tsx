import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getAllQuizzesApi,
  getQuizQuestionsApi,
  submitQuizResultApi,
} from "../api";
import { motion } from "framer-motion";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import BubbleBackground from "../components/BubbleBackground";

// Types for Quiz System
interface Quiz {
  _id: string;
  title: string;
  description: string;
  ageGroups: string[];
  tags: string[];
  maxScore: number;
  questionCount: number;
}

interface QuestionOption {
  text: string;
  score: number;
}

interface Question {
  _id: string;
  quizId: string;
  text: string;
  options: QuestionOption[];
  type: string;
  ageGroup: string;
  topic: string;
  difficulty: string;
}

interface Answer {
  questionId: string;
  selectedOption: number;
}

interface QuizResult {
  resultId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  riskLevel: string;
  riskLevelDescription: string;
  suggestedAction: string;
  shouldSeeConsultant: boolean;
  takenAt: string;
}

export default function QuizzPage() {
  const { user } = useAuth();

  // States for quiz flow
  const [step, setStep] = useState<
    "selection" | "ageGroup" | "quiz" | "result"
  >("selection");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available quizzes
  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const response = await getAllQuizzesApi();
      if (response.success) {
        setQuizzes(response.data);
      } else {
        setError("Không thể tải danh sách quiz");
      }
    } catch (error) {
      setError("Lỗi kết nối server");
      console.error("Error loading quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    if (quiz.ageGroups.length === 1) {
      // Auto-select if only one age group
      setSelectedAgeGroup(quiz.ageGroups[0]);
      loadQuestions(quiz._id, quiz.ageGroups[0]);
    } else {
      setStep("ageGroup");
    }
  };

  const handleAgeGroupSelect = (ageGroup: string) => {
    setSelectedAgeGroup(ageGroup);
    if (selectedQuiz) {
      loadQuestions(selectedQuiz._id, ageGroup);
    }
  };

  const loadQuestions = async (quizId: string, ageGroup: string) => {
    try {
      setLoading(true);
      const response = await getQuizQuestionsApi(quizId, ageGroup, 20);
      if (response.success) {
        setQuestions(response.data.questions);
        setAnswers(
          response.data.questions.map((q: Question) => ({
            questionId: q._id,
            selectedOption: -1,
          }))
        );
        setCurrentQuestionIndex(0);
        setStep("quiz");
      } else {
        setError("Không thể tải câu hỏi");
      }
    } catch (error) {
      setError("Lỗi kết nối server");
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex].selectedOption = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      setLoading(true);

      const validAnswers = answers.filter(
        (answer) => answer.selectedOption !== -1
      );

      if (validAnswers.length === 0) {
        setError("Vui lòng trả lời ít nhất một câu hỏi");
        return;
      }

      const submitData = {
        quizId: selectedQuiz._id,
        userId: user?._id,
        sessionId: user ? undefined : `session_${Date.now()}`,
        answers: validAnswers,
      };

      const response = await submitQuizResultApi(submitData);
      if (response.success) {
        setQuizResult(response.data);
        setStep("result");
      } else {
        setError("Không thể gửi kết quả");
      }
    } catch (error) {
      setError("Lỗi kết nối server");
      console.error("Error submitting quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setStep("selection");
    setSelectedQuiz(null);
    setSelectedAgeGroup("");
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizResult(null);
    setError(null);
  };

  const getAgeGroupDisplay = (ageGroup: string) => {
    const ageGroupMap: Record<string, string> = {
      teen: "Thanh thiếu niên (13-17 tuổi)",
      student: "Sinh viên (18-25 tuổi)",
      adult: "Người lớn (25+ tuổi)",
      parent: "Phụ huynh",
    };
    return ageGroupMap[ageGroup] || ageGroup;
  };

  const getRiskLevelColor = (riskLevel: string) => {
    const colorMap: Record<string, string> = {
      low: "text-green-600 bg-green-100 border-green-200",
      moderate: "text-yellow-600 bg-yellow-100 border-yellow-200",
      high: "text-orange-600 bg-orange-100 border-orange-200",
      critical: "text-red-600 bg-red-100 border-red-200",
    };
    return colorMap[riskLevel] || "text-gray-600 bg-gray-100 border-gray-200";
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    const iconMap: Record<string, string> = {
      low: "🟢",
      moderate: "🟡",
      high: "🟠",
      critical: "🔴",
    };
    return iconMap[riskLevel] || "⚪";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <BubbleBackground />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl"
          >
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 animate-pulse"></div>
            </div>
            <p className="mt-6 text-xl font-semibold text-gray-700">
              Đang tải...
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Vui lòng chợ trong giây lát
            </p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <BubbleBackground />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <div className="max-w-6xl mx-auto px-4 py-12">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-2xl mb-8 shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <span className="font-semibold">{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 text-2xl font-bold transition-colors duration-200"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}

          {/* Quiz Selection Step */}
          {step === "selection" && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-12"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-block"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg mb-6">
                    🧠 ĐÁNH GIÁ RỦI RO
                  </div>
                </motion.div>
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                  Khám phá bản thân
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Chọn bài đánh giá phù hợp để hiểu rõ hơn về tình trạng của
                  bạn. Mỗi bài kiểm tra được thiết kế khoa học để đưa ra đánh
                  giá chính xác nhất.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {quizzes.map((quiz, index) => (
                  <motion.div
                    key={quiz._id}
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{
                      scale: 1.03,
                      y: -8,
                      boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 cursor-pointer border-2 border-transparent hover:border-blue-300 transition-all duration-300 shadow-xl hover:shadow-2xl"
                    onClick={() => handleQuizSelect(quiz)}
                  >
                    <div className="relative">
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                        📋
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                        {quiz.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {quiz.description}
                      </p>

                      <div className="flex flex-wrap gap-3 mb-6">
                        {quiz.ageGroups.map((ageGroup) => (
                          <span
                            key={ageGroup}
                            className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-semibold border border-blue-200"
                          >
                            {getAgeGroupDisplay(ageGroup)}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center">
                          <span className="mr-2">📝</span>
                          <span className="font-semibold">
                            {quiz.questionCount} câu hỏi
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">🎯</span>
                          <span className="font-semibold">
                            Tối đa: {quiz.maxScore} điểm
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-blue-600 font-semibold">
                          Nhấn để bắt đầu →
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Age Group Selection Step */}
          {step === "ageGroup" && selectedQuiz && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-12"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl mb-8"
                >
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    {selectedQuiz.title}
                  </h2>
                  <p className="text-xl text-gray-600 mb-6">
                    Chọn nhóm tuổi phù hợp với bạn để có kết quả chính xác nhất
                  </p>
                </motion.div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {selectedQuiz.ageGroups.map((ageGroup, index) => (
                  <motion.button
                    key={ageGroup}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{
                      scale: 1.05,
                      y: -8,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="group p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-transparent hover:border-blue-300 transition-all duration-300"
                    onClick={() => handleAgeGroupSelect(ageGroup)}
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {ageGroup === "teen"
                        ? "👦"
                        : ageGroup === "student"
                        ? "🎓"
                        : ageGroup === "adult"
                        ? "👨‍💼"
                        : ageGroup === "parent"
                        ? "👨‍👩‍👧‍👦"
                        : "👤"}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {getAgeGroupDisplay(ageGroup)}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={() => setStep("selection")}
                  className="inline-flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-full transition-all duration-300 backdrop-blur-sm"
                >
                  <span className="mr-2">←</span>
                  Quay lại chọn quiz khác
                </button>
              </div>
            </motion.div>
          )}

          {/* Quiz Taking Step */}
          {step === "quiz" && questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Enhanced Progress Bar */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-gray-800">
                      Câu {currentQuestionIndex + 1} / {questions.length}
                    </span>
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-semibold">
                      {Math.round(
                        ((currentQuestionIndex + 1) / questions.length) * 100
                      )}
                      % hoàn thành
                    </span>
                  </div>
                  <div className="text-2xl">
                    {currentQuestionIndex === questions.length - 1
                      ? "🏁"
                      : "📝"}
                  </div>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full shadow-inner"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        ((currentQuestionIndex + 1) / questions.length) * 100
                      }%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </motion.div>

              {/* Enhanced Question Card */}
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20"
              >
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      Q
                    </div>
                    <div className="ml-4 text-sm text-gray-500">
                      <div>Chủ đề: {questions[currentQuestionIndex].topic}</div>
                      <div>
                        Độ khó: {questions[currentQuestionIndex].difficulty}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 leading-relaxed">
                    {questions[currentQuestionIndex].text}
                  </h3>
                </div>

                <div className="space-y-4">
                  {questions[currentQuestionIndex].options.map(
                    (option, optionIndex) => {
                      const isSelected =
                        answers[currentQuestionIndex]?.selectedOption ===
                        optionIndex;
                      const optionLabels = ["A", "B", "C", "D", "E"];

                      return (
                        <motion.div
                          key={optionIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: optionIndex * 0.1 }}
                          whileHover={{ scale: 1.02, x: 8 }}
                          whileTap={{ scale: 0.98 }}
                          className={`group relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? "border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg"
                              : "border-gray-200 hover:border-blue-300 bg-white hover:shadow-md"
                          }`}
                          onClick={() =>
                            handleAnswerSelect(
                              currentQuestionIndex,
                              optionIndex
                            )
                          }
                        >
                          <div className="flex items-center">
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                isSelected
                                  ? "border-blue-500 bg-blue-500 text-white shadow-lg"
                                  : "border-gray-300 text-gray-500 group-hover:border-blue-400 group-hover:text-blue-400"
                              }`}
                            >
                              {optionLabels[optionIndex]}
                            </div>
                            <span
                              className={`text-lg transition-colors duration-300 ${
                                isSelected
                                  ? "text-blue-700 font-semibold"
                                  : "text-gray-700 group-hover:text-gray-900"
                              }`}
                            >
                              {option.text}
                            </span>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm"
                            >
                              ✓
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    }
                  )}
                </div>
              </motion.div>

              {/* Enhanced Navigation */}
              <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                <motion.button
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-8 py-4 text-gray-600 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
                >
                  ← Câu trước
                </motion.button>

                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">
                    Đã trả lời:{" "}
                    {answers.filter((a) => a.selectedOption !== -1).length}/
                    {questions.length}
                  </div>
                  <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto">
                    <div
                      className="h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (answers.filter((a) => a.selectedOption !== -1)
                            .length /
                            questions.length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {currentQuestionIndex === questions.length - 1 ? (
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmitQuiz}
                    disabled={
                      answers.filter((a) => a.selectedOption !== -1).length ===
                      0
                    }
                    className="px-10 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg transition-all duration-300"
                  >
                    🎯 Nộp bài
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextQuestion}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 font-semibold shadow-lg transition-all duration-300"
                  >
                    Câu tiếp →
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* Enhanced Results Step */}
          {step === "result" && quizResult && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="text-8xl mb-6"
                >
                  🎉
                </motion.div>
                <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Kết quả đánh giá
                </h2>
                <p className="text-xl text-gray-600">
                  Cảm ơn bạn đã hoàn thành bài đánh giá!
                </p>
              </div>

              {/* Enhanced Score Summary */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border border-white/20"
              >
                <div className="mb-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", duration: 1 }}
                    className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
                  >
                    {quizResult.percentage}%
                  </motion.div>
                  <div className="text-2xl text-gray-600 font-semibold">
                    {quizResult.totalScore} / {quizResult.maxScore} điểm
                  </div>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${quizResult.percentage}%` }}
                      transition={{
                        delay: 0.8,
                        duration: 1.5,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>

                {/* Enhanced Risk Level */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mb-10"
                >
                  <div className="text-center">
                    <span
                      className={`inline-flex items-center px-8 py-4 rounded-2xl text-xl font-bold border-2 ${getRiskLevelColor(
                        quizResult.riskLevel
                      )} shadow-lg`}
                    >
                      <span className="text-3xl mr-3">
                        {getRiskLevelIcon(quizResult.riskLevel)}
                      </span>
                      {quizResult.riskLevelDescription}
                    </span>
                  </div>
                </motion.div>

                {/* Enhanced Suggested Action */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 mb-8 border border-gray-200"
                >
                  <h4 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                    <span className="text-3xl mr-3">💡</span>
                    Khuyến nghị cho bạn
                  </h4>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {quizResult.suggestedAction}
                  </p>
                </motion.div>

                {/* Enhanced Consultant Suggestion */}
                {quizResult.shouldSeeConsultant && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg"
                  >
                    <h4 className="flex items-center text-2xl font-bold text-blue-900 mb-4">
                      <span className="text-3xl mr-3">🩺</span>
                      Tư vấn chuyên môn
                    </h4>
                    <p className="text-lg text-blue-800 mb-6 leading-relaxed">
                      Dựa trên kết quả đánh giá, chúng tôi khuyến nghị bạn nên
                      gặp chuyên viên tư vấn để được hỗ trợ tốt hơn.
                    </p>
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => (window.location.href = "/consulting")}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-lg"
                    >
                      🔍 Tìm chuyên viên tư vấn
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>

              {/* Enhanced Actions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="text-center space-x-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetQuiz}
                  className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 font-semibold shadow-lg transition-all duration-300"
                >
                  📝 Làm bài khác
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => (window.location.href = "/")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg transition-all duration-300"
                >
                  🏠 Về trang chủ
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}
