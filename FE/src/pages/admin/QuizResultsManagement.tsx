import React, { useEffect, useState } from "react";
import { getAllQuizzesApi } from "../../api";
import api from "../../api";

interface QuizResult {
  _id: string;
  quizId: { _id: string; title: string } | string;
  userId: { _id: string; fullName: string; email: string } | string;
  takenAt: string;
  totalScore: number;
  riskLevel: string;
  suggestedAction: string;
}

interface Pagination {
  current: number;
  limit: number;
  total: number;
  pages: number;
}

const riskLevels = [
  { value: "", label: "Tất cả" },
  { value: "low", label: "Thấp" },
  { value: "moderate", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "critical", label: "Nguy kịch" },
];

const QuizResultsManagement: React.FC = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [quizzes, setQuizzes] = useState<{ _id: string; title: string }[]>([]);
  const [quizId, setQuizId] = useState("");
  const [user, setUser] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllQuizzesApi().then((res) => {
      setQuizzes(res.data || []);
    });
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (quizId) params.quizId = quizId;
      if (user) params.userId = user;
      if (riskLevel) params.riskLevel = riskLevel;
      if (from) params.from = from;
      if (to) params.to = to;
      // Sử dụng instance api đã cấu hình baseURL
      const res = await api.get("/quizzes/quiz-results/all", { params });
      setResults(res.data.data.results);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error("Lỗi khi lấy kết quả quiz:", err);
      setResults([]);
      setPagination({ current: 1, limit: 20, total: 0, pages: 1 });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line
  }, [quizId, user, riskLevel, from, to, page]);

  return (
    <div className="p-6 bg-sky-50">
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Quản lý kết quả trắc nghiệm</h1>
        {/* Filter */}
        <div className="bg-white p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end shadow-sm">
          <div>
            <label className="block font-semibold mb-1">Bộ câu hỏi</label>
            <select
              className="border rounded px-2 py-1"
              value={quizId}
              onChange={(e) => {
                setQuizId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả</option>
              {quizzes.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Người dùng (ID hoặc email)
            </label>
            <input
              className="border rounded px-2 py-1"
              value={user}
              onChange={(e) => {
                setUser(e.target.value);
                setPage(1);
              }}
              placeholder="Nhập ID hoặc email"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Risk Level</label>
            <select
              className="border rounded px-2 py-1"
              value={riskLevel}
              onChange={(e) => {
                setRiskLevel(e.target.value);
                setPage(1);
              }}
            >
              {riskLevels.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Từ ngày</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Đến ngày</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-full">
            <thead className="bg-sky-50">
              <tr>
                <th className="px-3 py-2 text-left">Bộ câu hỏi</th>
                <th className="px-3 py-2 text-left">Người dùng</th>
                <th className="px-3 py-2 text-center">Ngày làm</th>
                <th className="px-3 py-2 text-center">Điểm</th>
                <th className="px-3 py-2 text-center">Risk Level</th>
                <th className="px-3 py-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    Đang tải...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Không có kết quả nào.
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {typeof r.quizId === "object"
                        ? r.quizId.title
                        : quizzes.find((q) => q._id === r.quizId)?.title ||
                          r.quizId}
                    </td>
                    <td className="px-3 py-2">
                      {typeof r.userId === "object"
                        ? `${r.userId.fullName || ""} (${
                            r.userId.email || r.userId._id
                          })`
                        : r.userId}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {new Date(r.takenAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-3 py-2 text-center">{r.totalScore}</td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          r.riskLevel === "critical"
                            ? "bg-red-200 text-red-700"
                            : r.riskLevel === "high"
                            ? "bg-orange-200 text-orange-700"
                            : r.riskLevel === "moderate"
                            ? "bg-yellow-100 text-yellow-700"
                            : r.riskLevel === "low"
                            ? "bg-green-100 text-green-700"
                            : ""
                        }`}
                      >
                        {riskLevels.find((l) => l.value === r.riskLevel)?.label ||
                          r.riskLevel}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {/* Có thể thêm nút xem chi tiết nếu muốn */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex justify-end items-center gap-2 py-3 px-3">
            <button
              className="px-2 py-1 rounded border disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              &lt;
            </button>
            <span className="text-sm">
              Trang {pagination.current} / {pagination.pages || 1}
            </span>
            <button
              className="px-2 py-1 rounded border disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages || pagination.pages === 0}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsManagement;
