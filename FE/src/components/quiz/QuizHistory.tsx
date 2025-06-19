import { useState, useEffect } from "react";
import { getUserQuizHistoryApi } from "../../api/index";
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

export default function QuizHistory({ userId, onClose }: QuizHistoryProps) {
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
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
    } catch (error) {
      setError("Đã xảy ra lỗi khi tải lịch sử");
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-bold text-gray-800">Lịch sử làm quiz</h2>
          <button
            onClick={onClose}
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

        {error ? (
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
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
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
