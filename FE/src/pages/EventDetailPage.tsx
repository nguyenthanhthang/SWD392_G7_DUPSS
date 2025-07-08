import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

interface Sponsor {
  logo?: string;
  name: string;
  tier: string;
  donation: string;
}

interface EventDetail {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  image?: string;
  sponsors?: Sponsor[];
  registeredCount?: number;
}

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEventDetail();
    // eslint-disable-next-line
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error("Không tìm thấy sự kiện");
      const data = await res.json();
      setEvent(data);
    } catch (err: any) {
      setError(err.message || "Lỗi khi tải chi tiết sự kiện");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-[#f6f8fb]">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    useEffect(() => {
      const timeout = setTimeout(() => {
        navigate('/events');
      }, 1500);
      return () => clearTimeout(timeout);
    }, []);
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-[#f6f8fb]">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-red-500 text-xl">{error || "Không tìm thấy sự kiện"}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-[#f6f8fb]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/events")}
          className="mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
        >
          ← Quay lại danh sách sự kiện
        </button>
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 w-full md:w-1/2">
            <img
              src={event.image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"}
              alt={event.title}
              className="w-full h-80 object-cover rounded-xl mb-4"
            />
            <div className="flex gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                event.status === "upcoming"
                  ? "bg-sky-600 text-white"
                  : event.status === "ongoing"
                  ? "bg-green-500 text-white"
                  : event.status === "completed"
                  ? "bg-gray-400 text-white"
                  : "bg-red-500 text-white"
              }`}>
                {event.status === "upcoming"
                  ? "Sắp diễn ra"
                  : event.status === "ongoing"
                  ? "Đang diễn ra"
                  : event.status === "completed"
                  ? "Đã kết thúc"
                  : "Đã hủy"}
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                {event.registeredCount || 0}/{event.capacity} người tham gia
              </span>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{event.title}</h2>
            <div className="mb-4 text-gray-600 whitespace-pre-line">{event.description}</div>
            <div className="mb-4 flex flex-col gap-2 text-gray-700">
              <div>
                <span className="font-semibold">Thời gian bắt đầu:</span> {format(new Date(event.startDate), "dd/MM/yyyy HH:mm")}
              </div>
              <div>
                <span className="font-semibold">Thời gian kết thúc:</span> {format(new Date(event.endDate), "dd/MM/yyyy HH:mm")}
              </div>
              <div>
                <span className="font-semibold">Địa điểm:</span> {event.location}
              </div>
            </div>
            {/* Danh sách nhà tài trợ */}
            {event.sponsors && event.sponsors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Nhà tài trợ</h3>
                <div className="flex flex-wrap gap-4">
                  {event.sponsors.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border">
                      {s.logo && <img src={s.logo} alt={s.name} className="w-10 h-10 rounded-full object-cover" />}
                      <div>
                        <div className="font-semibold text-gray-800">{s.name}</div>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                          s.tier === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                          s.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                          s.tier === 'Silver' ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {s.tier}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{s.donation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 