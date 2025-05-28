import { useState } from "react";

const mockQuestions = [
  {
    id: 1,
    content: "Bạn đã từng sử dụng chất kích thích trong 3 tháng gần đây?",
    options: ["Chưa bao giờ", "Có", "Không nhớ", "Từ chối trả lời"],
    correctIndex: 0,
  },
  {
    id: 2,
    content: "Bạn có từng được người khác rủ rê sử dụng ma túy?",
    options: ["Không", "1 lần", "Nhiều lần", "Không rõ"],
    correctIndex: 0,
  },
];

export default function QuizzPage() {
  const [answers, setAnswers] = useState<number[]>(
    Array(mockQuestions.length).fill(-1)
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIndex: number, optionIndex: number) => {
    const newAns = [...answers];
    newAns[qIndex] = optionIndex;
    setAnswers(newAns);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">📝 Trắc nghiệm đánh giá</h2>
      {mockQuestions.map((q, qIndex) => (
        <div key={q.id} className="bg-white p-4 rounded shadow">
          <p className="font-medium">
            {qIndex + 1}. {q.content}
          </p>
          <div className="mt-2 space-y-2">
            {q.options.map((option, oIndex) => {
              const isSelected = answers[qIndex] === oIndex;
              const isCorrect = oIndex === q.correctIndex;
              const isWrong = isSelected && oIndex !== q.correctIndex;

              return (
                <div
                  key={oIndex}
                  onClick={() => handleSelect(qIndex, oIndex)}
                  className={`p-2 border rounded cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-blue-100"
                      : "hover:bg-gray-50"
                  } ${
                    submitted && isCorrect
                      ? "bg-green-100 border-green-500"
                      : ""
                  } ${submitted && isWrong ? "bg-red-100 border-red-500" : ""}`}
                >
                  {option}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Nộp bài
      </button>
    </div>
  );
}
