import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  getAllEventsApi,
  registerEventApi,
  getRegisteredEventsApi,
  unregisterEventApi,
} from "../api";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

interface RegisteredUser {
  _id: string;
  fullName: string;
  email: string;
}

interface RegistrationConfirmation {
  userName: string;
  eventName: string;
  eventDate: string;
  qrCode: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  registeredUsers: RegisteredUser[];
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  image?: string;
  registeredCount?: number;
  isCancelled?: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [cancelledEvents, setCancelledEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRegisteredModal, setShowRegisteredModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [registrationConfirmation, setRegistrationConfirmation] =
    useState<RegistrationConfirmation | null>(null);
  const [showUnregisterSuccess, setShowUnregisterSuccess] = useState(false);
  const [showUnregisterConfirm, setShowUnregisterConfirm] = useState(false);
  const [eventToUnregister, setEventToUnregister] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = [
    { id: "all", name: "Tất cả sự kiện", icon: "📅" },
    { id: "upcoming", name: "Sắp diễn ra", icon: "🎓" },
    { id: "ongoing", name: "Đang diễn ra", icon: "🎤" },
    { id: "completed", name: "Đã kết thúc", icon: "📚" },
    
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log("Fetching events...");
      const data = await getAllEventsApi();
      console.log("Events data:", data);
      setEvents(data);
      setFilteredEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = events;

    if (selectedCategory === "my_cancelled") {
      filtered = cancelledEvents;
    } else if (selectedCategory !== "all") {
      filtered = filtered.filter((event) => event.status === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [selectedCategory, searchTerm, events, cancelledEvents]);

  const fetchRegisteredEvents = async () => {
    setRegisteredEvents([]);
    if (!user) return;
    try {
      const data = await getRegisteredEventsApi(user._id);
      setRegisteredEvents(data);
    } catch (err) {
      console.error("Error fetching registered events:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRegisteredEvents();
    }
  }, [user]);

  const handleRegister = async (eventId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const response = await registerEventApi(eventId, user._id);
      setRegistrationConfirmation(response.data);
      setShowConfirmationModal(true);
      fetchEvents(); // Refresh events after registration
      fetchRegisteredEvents(); // Refresh registered events
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  const handleUnregister = async (eventId: string) => {
    setEventToUnregister(eventId);
    setShowUnregisterConfirm(true);
  };

  const confirmUnregister = async () => {
    if (!user || !eventToUnregister) return;
    try {
      await unregisterEventApi(eventToUnregister, user._id);
      
      // Find the event that was cancelled
      const cancelledEvent = registeredEvents.find(event => event._id === eventToUnregister);
      if (cancelledEvent) {
        // Add to cancelled events
        setCancelledEvents(prev => [...prev, cancelledEvent]);
        // Remove from registered events
        setRegisteredEvents(prev => prev.filter(event => event._id !== eventToUnregister));
      }
      
      fetchEvents(); // Refresh events after unregistration
      setShowUnregisterSuccess(true);
      setShowUnregisterConfirm(false);
      setEventToUnregister(null);
    } catch (err) {
      console.error("Unregistration failed:", err);
      setShowUnregisterConfirm(false);
      setEventToUnregister(null);
    }
  };

  useEffect(() => {
    const cancelled = localStorage.getItem('cancelledEvents');
    if (cancelled) {
      setCancelledEvents(JSON.parse(cancelled));
    } else {
      setCancelledEvents([]);
    }
  }, [user]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-[#f6f8fb]">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  const RegistrationConfirmationModal = () => {
    if (!showConfirmationModal || !registrationConfirmation) return null;

    const handleDownloadQR = () => {
      const link = document.createElement("a");
      link.href = registrationConfirmation.qrCode;
      link.download = `qr-code-${registrationConfirmation.eventName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Xác nhận đăng ký
            </h2>
            <button
              onClick={() => setShowConfirmationModal(false)}
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
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-green-600 text-lg font-medium mb-2">
                ✅ Đăng ký thành công!
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Họ tên:</span>{" "}
                {registrationConfirmation.userName}
              </p>
              <p>
                <span className="font-medium">Sự kiện:</span>{" "}
                {registrationConfirmation.eventName}
              </p>
              <p>
                <span className="font-medium">Thời gian:</span>{" "}
                {format(
                  new Date(registrationConfirmation.eventDate),
                  "dd/MM/yyyy HH:mm"
                )}
              </p>
            </div>
            <div className="flex flex-col items-center mt-4">
              <p className="text-sm text-gray-600 mb-2">Mã QR Code của bạn:</p>
              <img
                src={registrationConfirmation.qrCode}
                alt="QR Code"
                className="w-48 h-48 mb-4"
              />
              <button
                onClick={handleDownloadQR}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Tải xuống mã QR
              </button>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Vui lòng mang theo mã QR này đến sự kiện để được check-in
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UnregisterSuccessModal = () => {
    if (!showUnregisterSuccess) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Hủy đăng ký thành công!
            </h2>
            <p className="text-gray-600 mb-6">
              Sự kiện đã được chuyển vào danh mục "Đã hủy đăng ký" và không thể đăng ký lại.
            </p>
            <button
              onClick={() => setShowUnregisterSuccess(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  const UnregisterConfirmModal = () => {
    if (!showUnregisterConfirm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Xác nhận hủy đăng ký
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn hủy đăng ký sự kiện này không?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setShowUnregisterConfirm(false);
                  setEventToUnregister(null);
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmUnregister}
                className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-[#f6f8fb]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Sự kiện sắp tới
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tham gia các sự kiện của chúng tôi để học hỏi, chia sẻ và kết nối
            với cộng đồng
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-96">
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
              
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full min-h-[420px]"
            >
              <div className="relative h-48">
                <img
                  src={
                    event.image ||
                    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  }
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  {event.status === "upcoming"
                    ? "Sắp diễn ra"
                    : event.status === "ongoing"
                    ? "Đang diễn ra"
                    : event.status === "completed"
                    ? "Đã kết thúc"
                    : "Đã hủy"}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2 min-h-[48px]">
                  {event.description}
                </p>
                <div className="flex items-center text-gray-500 mb-4">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {format(new Date(event.startDate), "dd/MM/yyyy HH:mm")}
                </div>
                <div className="flex items-center text-gray-500 mb-4">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {event.location}
                </div>
                <div className="flex-1"></div>
                <div className="flex items-end justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    {event.registeredCount || 0}/{event.capacity} người tham gia
                  </div>
                  <button
                    onClick={() => handleRegister(event._id)}
                    disabled={
                      (event.registeredCount || 0) >= event.capacity ||
                      event.status !== "upcoming" ||
                      registeredEvents.some(regEvent => regEvent._id === event._id)
                    }
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all min-w-[120px] text-center
                      ${
                        (event.registeredCount || 0) >= event.capacity ||
                        event.status !== "upcoming"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : registeredEvents.some(regEvent => regEvent._id === event._id && regEvent.isCancelled === true)
                          ? "bg-red-600 text-white cursor-not-allowed"
                          : registeredEvents.some(regEvent => regEvent._id === event._id && regEvent.isCancelled !== true)
                          ? "bg-green-600 text-white cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                  >
                    {(event.registeredCount || 0) >= event.capacity
                      ? "Đã đầy"
                      : event.status !== "upcoming"
                      ? "Không thể đăng ký"
                      : registeredEvents.some(regEvent => regEvent._id === event._id && regEvent.isCancelled === true)
                      ? "Đã hủy"
                      : registeredEvents.some(regEvent => regEvent._id === event._id && regEvent.isCancelled !== true)
                      ? "Đã đăng ký"
                      : "Đăng ký"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Không tìm thấy sự kiện nào phù hợp
            </p>
          </div>
        )}

        <RegistrationConfirmationModal />
        <UnregisterSuccessModal />
        <UnregisterConfirmModal />
      </div>
      <Footer />
    </div>
  );
}
