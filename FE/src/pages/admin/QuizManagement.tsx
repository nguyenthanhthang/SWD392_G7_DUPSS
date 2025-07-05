import React, { useState, useEffect } from "react";
import {
  getAllQuizzesApi,
  updateQuizApi,
  deleteQuizApi,
  createQuestionApi,
  updateQuestionApi,
  deleteQuestionApi,
  getQuestionsByQuizApi,
  createQuizApi,
} from "../../api/index";
import type { Quiz, Question, QuestionOption } from "../../types/global";
import { useNavigate } from "react-router-dom";

const ageGroupOptions = [
  { value: "teen", label: "Thanh thiếu niên" },
  { value: "parent", label: "Phụ huynh" },
  { value: "adult", label: "Người lớn" },
];
const ageGroupLabel = (value: string) => {
  switch (value) {
    case "teen":
      return "Thanh thiếu niên";
    case "parent":
      return "Phụ huynh";
    case "adult":
      return "Người lớn";
    default:
      return value;
  }
};
const statusLabel = (active: boolean | undefined) =>
  active ? "Hoạt động" : "Ẩn";

const tagLabel = (tag: string) => {
  switch (tag) {
    case "risk":
      return "Rủi ro";
    case "substance":
      return "Chất gây nghiện";
    case "screening":
      return "Sàng lọc";
    case "behavior":
      return "Hành vi";
    case "youth":
      return "Thanh thiếu niên";
    case "awareness":
      return "Nhận thức";
    case "parenting":
      return "Nuôi dạy con";
    case "education":
      return "Giáo dục";
    case "teacher":
      return "Giáo viên";
    default:
      return tag;
  }
};

const QuizManagement: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filtered, setFiltered] = useState<Quiz[]>([]);
  const [search, setSearch] = useState("");
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [viewQuiz, setViewQuiz] = useState<Quiz | null>(null);
  const [viewQuestions, setViewQuestions] = useState<Question[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [editQuiz, setEditQuiz] = useState<Quiz | null>(null);
  const [editQuizForm, setEditQuizForm] = useState<Partial<Quiz>>({});
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] = useState<
    Omit<Question, "_id" | "quizId" | "createdAt" | "updatedAt">
  >({
    text: "",
    options: [
      { text: "", score: 0 },
      { text: "", score: 0 },
    ],
    type: "single-choice",
    ageGroup: "teen",
    topic: "",
    difficulty: "easy",
    isActive: true,
  });
  const [editQuestionForm, setEditQuestionForm] = useState<
    Omit<Question, "_id" | "quizId" | "createdAt" | "updatedAt">
  >({
    text: "",
    options: [
      { text: "", score: 0 },
      { text: "", score: 0 },
    ],
    type: "single-choice",
    ageGroup: "teen",
    topic: "",
    difficulty: "easy",
    isActive: true,
  });
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [addQuizForm, setAddQuizForm] = useState<Partial<Quiz>>({
    _id: "",
    title: "",
    description: "",
    ageGroups: [],
    tags: [],
    maxScore: 1,
    isActive: true,
  });

  const navigate = useNavigate();

  // Lấy lại danh sách quiz
  const reloadQuizzes = async () => {
    const data = await getAllQuizzesApi();
    const arr: Quiz[] = Array.isArray(data) ? data : data.data || [];
    setQuizzes(arr);
    setFiltered(arr);
    // Lấy tất cả tag duy nhất
    const tagSet = new Set<string>();
    arr.forEach((q: Quiz) => q.tags?.forEach((t: string) => tagSet.add(t)));
    setAllTags(Array.from(tagSet));
  };

  useEffect(() => {
    reloadQuizzes();
  }, []);

  useEffect(() => {
    let result = quizzes;
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(s) ||
          q.description.toLowerCase().includes(s) ||
          (q.tags && q.tags.some((t: string) => t.toLowerCase().includes(s)))
      );
    }
    if (ageGroups.length) {
      result = result.filter(
        (q) => q.ageGroups && ageGroups.some((ag) => q.ageGroups.includes(ag))
      );
    }
    if (status) {
      result = result.filter((q) =>
        status === "active" ? q.isActive : !q.isActive
      );
    }
    if (tags.length) {
      result = result.filter(
        (q) => q.tags && tags.some((t) => q.tags.includes(t))
      );
    }
    setFiltered(result);
    setPage(1);
  }, [search, ageGroups, status, tags, quizzes]);

  // Pagination
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Xem quiz: mở modal và load câu hỏi
  const handleViewQuiz = async (quiz: Quiz) => {
    setViewQuiz(quiz);
    setViewLoading(true);
    try {
      const res = await getQuestionsByQuizApi(quiz._id);
      setViewQuestions(res.data || []);
    } catch {
      setViewQuestions([]);
    }
    setViewLoading(false);
  };

  // Sửa quiz
  const handleEditQuiz = (quiz: Quiz) => {
    setEditQuiz(quiz);
    setEditQuizForm({ ...quiz });
  };
  const handleEditQuizSave = async () => {
    if (!editQuiz?._id) return;
    try {
      await updateQuizApi(editQuiz._id, editQuizForm);
      alert("Cập nhật quiz thành công!");
      setEditQuiz(null);
      reloadQuizzes();
    } catch {
      alert("Cập nhật quiz thất bại!");
    }
  };

  // Xóa quiz
  const handleDeleteQuiz = async (quiz: Quiz) => {
    if (!window.confirm("Bạn có chắc muốn xóa quiz này?")) return;
    try {
      await deleteQuizApi(quiz._id);
      alert("Đã xóa quiz thành công!");
      reloadQuizzes();
    } catch {
      alert("Xóa quiz thất bại!");
    }
  };

  // Thêm câu hỏi
  const handleAddQuestion = () => {
    setQuestionForm({
      text: "",
      options: [
        { text: "", score: 0 },
        { text: "", score: 0 },
      ],
      type: "single-choice",
      ageGroup: "teen",
      topic: "",
      difficulty: "easy",
      isActive: true,
    });
    setShowAddQuestion(true);
  };
  const handleAddQuestionSave = async () => {
    if (!viewQuiz?._id) return;
    try {
      await createQuestionApi({ ...questionForm, quizId: viewQuiz._id });
      alert("Thêm câu hỏi thành công!");
      setShowAddQuestion(false);
      handleViewQuiz(viewQuiz);
    } catch {
      alert("Thêm câu hỏi thất bại!");
    }
  };

  // Sửa câu hỏi
  const handleEditQuestion = (q: Question) => {
    setEditQuestion(q);
    setEditQuestionForm({
      text: q.text,
      options: q.options.map((opt) => ({ ...opt })),
      type: q.type,
      ageGroup: q.ageGroup,
      topic: q.topic,
      difficulty: q.difficulty,
      isActive: q.isActive ?? true,
    });
  };
  const handleEditQuestionSave = async () => {
    if (!editQuestion?._id) return;
    try {
      await updateQuestionApi(editQuestion._id, editQuestionForm);
      alert("Cập nhật câu hỏi thành công!");
      setEditQuestion(null);
      if (viewQuiz) handleViewQuiz(viewQuiz);
    } catch {
      alert("Cập nhật câu hỏi thất bại!");
    }
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = async (q: Question) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    try {
      await deleteQuestionApi(q._id);
      alert("Đã xóa câu hỏi thành công!");
      if (viewQuiz) handleViewQuiz(viewQuiz);
    } catch {
      alert("Xóa câu hỏi thất bại!");
    }
  };

  return (
    <div className="p-6 bg-sky-50">
      <div className="p-4 bg-white rounded-lg shadow-sm">
        {/* Thêm nút ở đầu trang */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản lý trắc nghiệm</h1>
          <button
            className="bg-sky-600 text-white px-5 py-2 rounded hover:bg-sky-700 shadow font-semibold"
            onClick={() => navigate("/admin/quiz-results")}
          >
            Kết quả trắc nghiệm
          </button>
        </div>
        {/* Filter Bar */}
        <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Search */}
            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, mô tả, nhãn..."
                className="w-full border rounded px-3 py-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Nhóm tuổi */}
            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Nhóm tuổi
              </label>
              <div className="flex flex-wrap gap-3">
                {ageGroupOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={ageGroups.includes(opt.value)}
                      onChange={(e) => {
                        setAgeGroups(
                          e.target.checked
                            ? [...ageGroups, opt.value]
                            : ageGroups.filter((a) => a !== opt.value)
                        );
                      }}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Trạng thái */}
            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Trạng thái
              </label>
              <select
                className="w-full border rounded px-2 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Ẩn</option>
              </select>
            </div>
            {/* Tag */}
            <div className="md:col-span-2">
              <label className="block font-semibold mb-1 text-gray-700">
                Nhãn
              </label>
              <div className="flex flex-wrap gap-3">
                {allTags.map((tag) => (
                  <label key={tag} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={tags.includes(tag)}
                      onChange={(e) => {
                        setTags(
                          e.target.checked
                            ? [...tags, tag]
                            : tags.filter((t) => t !== tag)
                        );
                      }}
                    />
                    <span>{tagLabel(tag)}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Xuất CSV */}
            <div className="flex flex-col gap-2 md:items-end justify-end">
              <button
                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 w-full md:w-auto"
                onClick={() => setShowAddQuiz(true)}
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-full">
            <thead className="bg-sky-50">
              <tr>
                <th className="px-3 py-2 text-left">Tiêu đề</th>
                <th className="px-3 py-2 text-left">Mô tả</th>
                <th className="px-3 py-2 text-left">Nhóm tuổi</th>
                <th className="px-3 py-2 text-left">Nhãn</th>
                <th className="px-3 py-2 text-center">Số câu hỏi</th>
                <th className="px-3 py-2 text-center">Trạng thái</th>
                <th className="px-3 py-2 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((quiz) => (
                <tr key={quiz._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-semibold">{quiz.title}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 max-w-xs truncate">
                    {quiz.description}
                  </td>
                  <td className="px-3 py-2">
                    {quiz.ageGroups?.map((a: string) => (
                      <span
                        key={a}
                        className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs mr-1 mb-1"
                      >
                        {ageGroupLabel(a)}
                      </span>
                    ))}
                  </td>
                  <td className="px-3 py-2">
                    {quiz.tags?.map((t: string) => (
                      <span
                        key={t}
                        className="inline-block bg-green-100 text-green-700 rounded px-2 py-0.5 text-xs mr-1 mb-1"
                      >
                        {tagLabel(t)}
                      </span>
                    ))}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {quiz.questionCount ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        quiz.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {statusLabel(!!quiz.isActive)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      className="text-blue-600 hover:underline text-xs mr-2"
                      onClick={() => handleViewQuiz(quiz)}
                    >
                      Xem
                    </button>
                    <button
                      className="text-yellow-600 hover:underline text-xs mr-2"
                      onClick={() => handleEditQuiz(quiz)}
                    >
                      Sửa
                    </button>
                    <button
                      className="text-red-600 hover:underline text-xs"
                      onClick={() => handleDeleteQuiz(quiz)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Không có trắc nghiệm nào phù hợp.
                  </td>
                </tr>
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
              Trang {page} / {totalPages || 1}
            </span>
            <button
              className="px-2 py-1 rounded border disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Modal Xem Quiz */}
      {viewQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              onClick={() => setViewQuiz(null)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2">Chi tiết trắc nghiệm</h2>
            <div className="mb-4">
              <div className="mb-1">
                <span className="font-semibold">Tiêu đề:</span> {viewQuiz.title}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Mô tả:</span>{" "}
                {viewQuiz.description}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Nhóm tuổi:</span>{" "}
                {viewQuiz.ageGroups.map(ageGroupLabel).join(", ")}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Nhãn:</span>{" "}
                {viewQuiz.tags.map(tagLabel).join(", ")}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Số câu hỏi:</span>{" "}
                {viewQuiz.questionCount ?? "-"}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Trạng thái:</span>{" "}
                {statusLabel(!!viewQuiz.isActive)}
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                onClick={() => handleEditQuiz(viewQuiz)}
              >
                Sửa trắc nghiệm
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleAddQuestion}
              >
                Thêm câu hỏi
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-2">Danh sách câu hỏi</h3>
            {viewLoading ? (
              <div className="text-center py-6">Đang tải câu hỏi...</div>
            ) : viewQuestions.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                Chưa có câu hỏi nào.
              </div>
            ) : (
              <div className="space-y-4">
                {viewQuestions.map((q, idx) => (
                  <div key={q._id || idx} className="border rounded p-3">
                    <div className="font-semibold mb-1">
                      Câu {idx + 1}: {q.text}
                    </div>
                    <div className="mb-1 text-sm text-gray-600">
                      Loại: {q.type}, Nhóm tuổi: {ageGroupLabel(q.ageGroup)},
                      Chủ đề: {q.topic}, Độ khó: {q.difficulty}
                    </div>
                    <div className="mb-1 text-sm">
                      Trạng thái: {statusLabel(!!q.isActive)}
                    </div>
                    <div className="text-sm">
                      Lựa chọn:
                      <ul className="list-disc ml-6">
                        {q.options.map((opt: QuestionOption, i: number) => (
                          <li key={i}>
                            {opt.text}{" "}
                            <span className="text-xs text-gray-500">
                              (Điểm: {opt.score})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="text-yellow-600 hover:underline text-xs"
                        onClick={() => handleEditQuestion(q)}
                      >
                        Sửa
                      </button>
                      <button
                        className="text-red-600 hover:underline text-xs"
                        onClick={() => handleDeleteQuestion(q)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modal Sửa quiz */}
      {editQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              onClick={() => setEditQuiz(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Sửa trắc nghiệm</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditQuizSave();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block font-semibold mb-1">Tiêu đề</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={(editQuizForm.title as string) || ""}
                  onChange={(e) =>
                    setEditQuizForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Mô tả</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={(editQuizForm.description as string) || ""}
                  onChange={(e) =>
                    setEditQuizForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              {/* ... các trường khác ... */}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200"
                  onClick={() => setEditQuiz(null)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Thêm câu hỏi */}
      {showAddQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              onClick={() => setShowAddQuestion(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Thêm câu hỏi mới</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Validate
                if (
                  !questionForm.text.trim() ||
                  questionForm.options.length < 2 ||
                  questionForm.options.some((opt) => !opt.text.trim())
                ) {
                  alert("Vui lòng nhập đầy đủ nội dung và ít nhất 2 đáp án!");
                  return;
                }
                handleAddQuestionSave();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block font-semibold mb-1">
                  Nội dung câu hỏi
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={questionForm.text}
                  onChange={(e) =>
                    setQuestionForm((f) => ({ ...f, text: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Đáp án</label>
                {questionForm.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input
                      className="border rounded px-2 py-1 flex-1"
                      value={opt.text}
                      onChange={(e) =>
                        setQuestionForm((f) => {
                          const options = [...f.options];
                          options[idx] = {
                            ...options[idx],
                            text: e.target.value,
                          };
                          return { ...f, options };
                        })
                      }
                      placeholder={`Đáp án ${idx + 1}`}
                      required
                    />
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-20"
                      value={opt.score}
                      onChange={(e) =>
                        setQuestionForm((f) => {
                          const options = [...f.options];
                          options[idx] = {
                            ...options[idx],
                            score: Number(e.target.value),
                          };
                          return { ...f, options };
                        })
                      }
                      placeholder="Điểm"
                      required
                      min={0}
                    />
                    <button
                      type="button"
                      className="text-red-500 text-lg px-2"
                      onClick={() =>
                        setQuestionForm((f) => ({
                          ...f,
                          options:
                            f.options.length > 2
                              ? f.options.filter((_, i) => i !== idx)
                              : f.options,
                        }))
                      }
                      disabled={questionForm.options.length <= 2}
                      title="Xóa đáp án"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-2 px-3 py-1 bg-blue-100 rounded text-blue-700 text-sm"
                  onClick={() =>
                    setQuestionForm((f) => ({
                      ...f,
                      options: [...f.options, { text: "", score: 0 }],
                    }))
                  }
                  disabled={questionForm.options.length >= 6}
                >
                  Thêm đáp án
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Loại</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={questionForm.type}
                    onChange={(e) =>
                      setQuestionForm((f) => ({
                        ...f,
                        type: e.target.value as Question["type"],
                      }))
                    }
                  >
                    <option value="single-choice">Chọn 1 đáp án</option>
                    <option value="multiple-choice">Chọn nhiều đáp án</option>
                    <option value="rating-scale">Thang điểm</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Nhóm tuổi</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={questionForm.ageGroup}
                    onChange={(e) =>
                      setQuestionForm((f) => ({
                        ...f,
                        ageGroup: e.target.value as Question["ageGroup"],
                      }))
                    }
                  >
                    <option value="teen">Thanh thiếu niên</option>
                    <option value="parent">Phụ huynh</option>
                    <option value="adult">Người lớn</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Chủ đề</label>
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={questionForm.topic}
                    onChange={(e) =>
                      setQuestionForm((f) => ({ ...f, topic: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Độ khó</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={questionForm.difficulty}
                    onChange={(e) =>
                      setQuestionForm((f) => ({
                        ...f,
                        difficulty: e.target.value as Question["difficulty"],
                      }))
                    }
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={questionForm.isActive}
                    onChange={(e) =>
                      setQuestionForm((f) => ({
                        ...f,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  <span>Hoạt động</span>
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200"
                  onClick={() => setShowAddQuestion(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Thêm quiz */}
      {showAddQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              onClick={() => setShowAddQuiz(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Thêm bộ câu hỏi mới</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await createQuizApi(addQuizForm as Quiz);
                  alert("Tạo quiz thành công!");
                  setShowAddQuiz(false);
                  reloadQuizzes();
                } catch {
                  alert("Tạo quiz thất bại!");
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block font-semibold mb-1">Mã quiz (ID)</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={addQuizForm._id}
                  onChange={(e) =>
                    setAddQuizForm((f) => ({ ...f, _id: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Tiêu đề</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={addQuizForm.title}
                  onChange={(e) =>
                    setAddQuizForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Mô tả</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={addQuizForm.description}
                  onChange={(e) =>
                    setAddQuizForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Nhóm tuổi</label>
                <div className="flex gap-3 flex-wrap">
                  {ageGroupOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-1 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={
                          addQuizForm.ageGroups?.includes(opt.value) || false
                        }
                        onChange={(e) =>
                          setAddQuizForm((f) => ({
                            ...f,
                            ageGroups: e.target.checked
                              ? [...(f.ageGroups || []), opt.value]
                              : (f.ageGroups || []).filter(
                                  (a) => a !== opt.value
                                ),
                          }))
                        }
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Nhãn</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={addQuizForm.tags?.join(",") || ""}
                  onChange={(e) =>
                    setAddQuizForm((f) => ({
                      ...f,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    }))
                  }
                  placeholder="Cách nhau bởi dấu phẩy"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Điểm tối đa</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={addQuizForm.maxScore}
                  onChange={(e) =>
                    setAddQuizForm((f) => ({
                      ...f,
                      maxScore: Number(e.target.value),
                    }))
                  }
                  min={1}
                  required
                />
              </div>
              <div>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addQuizForm.isActive}
                    onChange={(e) =>
                      setAddQuizForm((f) => ({
                        ...f,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  <span>Hoạt động</span>
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200"
                  onClick={() => setShowAddQuiz(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Sửa câu hỏi */}
      {editQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              onClick={() => setEditQuestion(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Sửa câu hỏi</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditQuestionSave();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block font-semibold mb-1">
                  Nội dung câu hỏi
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={editQuestionForm.text}
                  onChange={(e) =>
                    setEditQuestionForm((f) => ({ ...f, text: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Đáp án</label>
                {editQuestionForm.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input
                      className="border rounded px-2 py-1 flex-1"
                      value={opt.text}
                      onChange={(e) =>
                        setEditQuestionForm((f) => {
                          const options = [...f.options];
                          options[idx] = {
                            ...options[idx],
                            text: e.target.value,
                          };
                          return { ...f, options };
                        })
                      }
                      placeholder={`Đáp án ${idx + 1}`}
                      required
                    />
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-20"
                      value={opt.score}
                      onChange={(e) =>
                        setEditQuestionForm((f) => {
                          const options = [...f.options];
                          options[idx] = {
                            ...options[idx],
                            score: Number(e.target.value),
                          };
                          return { ...f, options };
                        })
                      }
                      placeholder="Điểm"
                      required
                      min={0}
                    />
                    <button
                      type="button"
                      className="text-red-500 text-lg px-2"
                      onClick={() =>
                        setEditQuestionForm((f) => ({
                          ...f,
                          options:
                            f.options.length > 2
                              ? f.options.filter((_, i) => i !== idx)
                              : f.options,
                        }))
                      }
                      disabled={editQuestionForm.options.length <= 2}
                      title="Xóa đáp án"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-2 px-3 py-1 bg-blue-100 rounded text-blue-700 text-sm"
                  onClick={() =>
                    setEditQuestionForm((f) => ({
                      ...f,
                      options: [...f.options, { text: "", score: 0 }],
                    }))
                  }
                  disabled={editQuestionForm.options.length >= 6}
                >
                  Thêm đáp án
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Loại</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={editQuestionForm.type}
                    onChange={(e) =>
                      setEditQuestionForm((f) => ({
                        ...f,
                        type: e.target.value as Question["type"],
                      }))
                    }
                  >
                    <option value="single-choice">Chọn 1 đáp án</option>
                    <option value="multiple-choice">Chọn nhiều đáp án</option>
                    <option value="rating-scale">Thang điểm</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Nhóm tuổi</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={editQuestionForm.ageGroup}
                    onChange={(e) =>
                      setEditQuestionForm((f) => ({
                        ...f,
                        ageGroup: e.target.value as Question["ageGroup"],
                      }))
                    }
                  >
                    <option value="teen">Thanh thiếu niên</option>
                    <option value="parent">Phụ huynh</option>
                    <option value="adult">Người lớn</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Chủ đề</label>
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={editQuestionForm.topic}
                    onChange={(e) =>
                      setEditQuestionForm((f) => ({
                        ...f,
                        topic: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Độ khó</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={editQuestionForm.difficulty}
                    onChange={(e) =>
                      setEditQuestionForm((f) => ({
                        ...f,
                        difficulty: e.target.value as Question["difficulty"],
                      }))
                    }
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editQuestionForm.isActive}
                    onChange={(e) =>
                      setEditQuestionForm((f) => ({
                        ...f,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  <span>Hoạt động</span>
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200"
                  onClick={() => setEditQuestion(null)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;
