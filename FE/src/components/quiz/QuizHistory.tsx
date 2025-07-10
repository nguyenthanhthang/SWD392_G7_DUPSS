import { useState, useEffect } from "react";
import { getUserQuizHistoryApi, getQuizResultByIdApi } from "../../api/index";
import { motion } from "framer-motion";

interface QuizHistoryProps {
  userId: string;
  onClose: () => void;
}

interface QuizHistoryItem {
  _id: string;
  quizId: {
    _id: string;
    title: string;
    description: string;
  };
  takenAt: string;
  totalScore: number;
  riskLevel: string;
  suggestedAction: string;
}

// Thêm type cho chi tiết kết quả quiz
interface QuizResultDetail {
  _id: string;
  quizId: { _id: string; title: string; maxScore: number };
  answers: Array<{
    questionId: {
      _id: string;
      text: string;
      options: { text: string; score: number }[];
    };
    selectedOption: number;
    score: number;
  }>;
  totalScore: number;
  riskLevel: string;
  suggestedAction: string;
  takenAt: string;
}

export default function QuizHistory({ userId, onClose }: QuizHistoryProps) {
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<QuizResultDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await getUserQuizHistoryApi(userId);
      if (response.success) {
        setHistory(response.data);
      } else {
        setError("Không thể tải lịch sử làm quiz");
      }
    } catch {
      setError("Đã xảy ra lỗi khi tải lịch sử");
    } finally {
      setLoading(false);
    }
  };

  // Khi click vào 1 bài quiz trong lịch sử
  const handleShowDetail = async (resultId: string) => {
    setLoadingDetail(true);
    try {
      const res = await getQuizResultByIdApi(resultId);
      if (res.success) setDetail(res.data);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    const colorMap: Record<string, string> = {
      low: "text-green-600 bg-green-100",
      moderate: "text-yellow-600 bg-yellow-100",
      high: "text-orange-600 bg-orange-100",
      critical: "text-red-600 bg-red-100",
    };
    return colorMap[riskLevel] || "text-gray-600 bg-gray-100";
  };

  const getRiskLevelText = (riskLevel: string) => {
    const textMap: Record<string, string> = {
      low: "Thấp",
      moderate: "Trung bình",
      high: "Cao",
      critical: "Nguy hiểm",
    };
    return textMap[riskLevel] || riskLevel;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl shadow-2xl p-6 m-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {detail ? `Chi tiết kết quả quiz` : `Lịch sử làm quiz`}
          </h2>
          <button
            onClick={detail ? () => setDetail(null) : onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {detail ? (
          loadingDetail ? (
            <div className="text-center py-8">Đang tải chi tiết...</div>
          ) : (
            <div>
              <div className="mb-4">
                <div className="font-bold text-lg mb-1">
                  {detail.quizId.title}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(detail.takenAt).toLocaleString("vi-VN")}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Điểm số: </span>
                  {detail.quizId.maxScore
                    ? Math.floor(
                        (detail.totalScore / detail.quizId.maxScore) * 100
                      )
                    : detail.totalScore}
                  %
                </div>
                <div className="mb-2">
                  <span className="font-medium">Đề xuất: </span>
                  {detail.suggestedAction}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Mức rủi ro: </span>
                  {detail.riskLevel}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow">
                  <thead>
                    <tr>
                      <th className="px-3 py-2">STT</th>
                      <th className="px-3 py-2">Câu hỏi</th>
                      <th className="px-3 py-2">Đáp án đã chọn</th>
                      <th className="px-3 py-2">Điểm</th>
                      <th className="px-3 py-2">Mức ảnh hưởng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.answers.map((ans, idx) => {
                      const selectedOpt =
                        ans.questionId.options[ans.selectedOption];
                      let impactColor = "";
                      let impactText = "";
                      if (selectedOpt?.score === 0) {
                        impactColor = "text-green-600";
                        impactText = "Thấp";
                      } else if (selectedOpt?.score === 2) {
                        impactColor = "text-yellow-600";
                        impactText = "Trung bình";
                      } else if (selectedOpt?.score === 4) {
                        impactColor = "text-red-600";
                        impactText = "Cao";
                      }
                      return (
                        <tr key={ans.questionId._id}>
                          <td className="px-3 py-2 text-center">{idx + 1}</td>
                          <td className="px-3 py-2">{ans.questionId.text}</td>
                          <td className="px-3 py-2">{selectedOpt?.text}</td>
                          <td className="px-3 py-2 text-center">
                            {selectedOpt?.score}
                          </td>
                          <td
                            className={`px-3 py-2 text-center font-bold ${impactColor}`}
                          >
                            {impactText}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : history.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            Bạn chưa có lịch sử làm quiz nào
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleShowDetail(item._id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-800 mb-1">
                      {item.quizId.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(item.takenAt).toLocaleString("vi-VN")}
                    </div>
                    <div className="mt-2">
                      <span className="font-medium">Điểm số: </span>
                      {item.totalScore}
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(
                          item.riskLevel
                        )}`}
                      >
                        {getRiskLevelText(item.riskLevel)}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 max-w-[60%] text-right">
                    <span className="font-medium">Đề xuất: </span>
                    {item.suggestedAction}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
