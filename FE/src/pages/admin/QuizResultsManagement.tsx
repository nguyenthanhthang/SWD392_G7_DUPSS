import React, { useEffect, useState } from "react";
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

interface Quiz {
  _id: string;
  title: string;
}

export default function QuizResultsManagement() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizId, setQuizId] = useState("");
  const [user, setUser] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy danh sách quiz
  useEffect(() => {
    api.get("/quizzes").then((res) => {
      if (Array.isArray(res.data)) setQuizzes(res.data);
      else if (Array.isArray(res.data?.data)) setQuizzes(res.data.data);
      else setQuizzes([]);
    });
  }, []);

  // Lấy toàn bộ kết quả quiz
  const fetchResults = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (quizId) params.quizId = quizId;
      if (user) params.userId = user;
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get("/quizzes/quiz-results/all", { params });
      setResults(res.data.data.results || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line
  }, [quizId, user, from, to]);

  // Nhóm kết quả theo quiz title
  const grouped = results.reduce((acc: Record<string, QuizResult[]>, r) => {
    const title = typeof r.quizId === "object" ? r.quizId.title : r.quizId;
    if (!acc[title]) acc[title] = [];
    acc[title].push(r);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý kết quả trắc nghiệm</h1>
      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block font-semibold mb-1">Bài đánh giá</label>
          <select
            className="border rounded px-2 py-1"
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
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
            Người dùng (ID/email)
          </label>
          <input
            className="border rounded px-2 py-1"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Nhập ID hoặc email"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Từ ngày</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Đến ngày</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>
      {/* Danh sách kết quả nhóm theo tiêu đề quiz */}
      {loading ? (
        <div>Đang tải...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div>Không có kết quả nào.</div>
      ) : (
        Object.entries(grouped).map(([title, items]) => (
          <div key={title} className="mb-8">
            <h2 className="text-xl font-bold mb-2 text-blue-700">{title}</h2>
            <div className="overflow-x-auto rounded shadow bg-white">
              <table className="min-w-full">
                <thead className="bg-sky-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Người dùng</th>
                    <th className="px-3 py-2 text-center">Ngày làm</th>
                    <th className="px-3 py-2 text-center">Điểm</th>
                    <th className="px-3 py-2 text-center">Mức rủi ro</th>
                    <th className="px-3 py-2 text-left">Đề xuất</th>
                    <th className="px-3 py-2 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        {typeof r.userId === "object"
                          ? `${r.userId.fullName} (${r.userId.email})`
                          : r.userId}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {new Date(r.takenAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-3 py-2 text-center">{r.totalScore}</td>
                      <td className="px-3 py-2 text-center">{r.riskLevel}</td>
                      <td className="px-3 py-2">{r.suggestedAction}</td>
                      <td className="px-3 py-2 text-center">
                        <button className="text-blue-600 hover:underline text-xs">
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
