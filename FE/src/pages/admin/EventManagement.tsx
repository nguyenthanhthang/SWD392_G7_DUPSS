import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { checkInEventApi, getAllEventsApi } from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QrReader } from "react-qr-reader";

// Thêm type definitions cho BarcodeDetector API
declare global {
  interface Window {
    BarcodeDetector: {
      new (options?: { formats: string[] }): BarcodeDetector;
    };
  }
}

interface BarcodeDetector {
  detect(image: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: "upcoming" | "ongoing" | "completed";
  image: string;
  participants: number;
}

// Add interface for check-in history
interface CheckInRecord {
  userName: string;
  eventName: string;
  timestamp: Date;
  status: "success" | "error";
}

const EventManagement = () => {
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [processedCodes] = useState(new Set<string>());
  const { user } = useAuth();
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getAllEventsApi();
      if (Array.isArray(data)) {
        setEvents(data);
        toast.success("Đã tải danh sách sự kiện thành công");
      } else {
        console.error("Invalid response format:", data);
        toast.error("Dữ liệu không đúng định dạng");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setShowQRScanner(true);
    // Reset states
    setScanning(false);
    setIsCheckingIn(false);
    setCheckInHistory([]); // Reset history when selecting new event
  };

  const startChecking = () => {
    setScanning(true);
    setIsCheckingIn(true);
    setIsProcessing(false);
    processedCodes.clear();
    setLastScannedCode(null);
  };

  const stopChecking = () => {
    setScanning(false);
    setIsCheckingIn(false);
    setIsProcessing(false);
    setLastScannedCode(null);
    processedCodes.clear();
  };

  const handleScan = async (data: string | null) => {
    // Nếu đang xử lý hoặc không đủ điều kiện, bỏ qua
    if (
      !data ||
      !selectedEvent ||
      !user?._id ||
      !scanning ||
      !isCheckingIn ||
      isProcessing
    )
      return;

    // Nếu mã này đã được xử lý trong phiên này, bỏ qua
    if (processedCodes.has(data)) return;

    // Nếu đây là mã vừa quét gần đây, bỏ qua
    if (data === lastScannedCode) return;

    // Bắt đầu xử lý - khóa quét
    setIsProcessing(true);
    setLastScannedCode(data);

    try {
      // Tiến hành check-in
      await checkInEventApi(selectedEvent._id, user._id, data);

      // Đánh dấu mã này đã được xử lý
      processedCodes.add(data);

      // Thêm vào lịch sử
      const newRecord: CheckInRecord = {
        userName: user.fullName,
        eventName: selectedEvent.title,
        timestamp: new Date(),
        status: "success",
      };

      setCheckInHistory((prev) => [newRecord, ...prev].slice(0, 10));
      toast.success(`Check-in thành công: ${user.fullName}`);

      // Refresh event list to update participant count
      fetchEvents();
    } catch (error) {
      console.error("Check-in error:", error);
      let errorMessage = "Check-in thất bại. ";

      if (axios.isAxiosError(error)) {
        switch (error.response?.status) {
          case 400:
            errorMessage += "Mã QR không hợp lệ hoặc đã được sử dụng.";
            break;
          case 401:
            errorMessage += "Phiên đăng nhập đã hết hạn.";
            break;
          case 404:
            errorMessage += "Không tìm thấy thông tin người dùng hoặc sự kiện.";
            break;
          case 409:
            errorMessage += "Người dùng đã check-in cho sự kiện này.";
            break;
          default:
            errorMessage += "Vui lòng thử lại sau.";
        }
      } else if (error instanceof Error) {
        errorMessage += error.message;
      }

      // Không thêm vào lịch sử khi có lỗi
      toast.error(errorMessage);
    } finally {
      // Sau 1 giây mới cho phép quét tiếp
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
  };

  const handleError = (error: Error) => {
    // Prevent showing camera permission errors repeatedly
    if (error.name === "NotAllowedError" || error.name === "NotFoundError") {
      stopChecking(); // Stop checking if there's a camera permission issue
      let errorMessage = "Lỗi khi quét mã QR: ";

      if (error.name === "NotAllowedError") {
        errorMessage +=
          "Không có quyền truy cập camera. Vui lòng cấp quyền và thử lại.";
      } else if (error.name === "NotFoundError") {
        errorMessage +=
          "Không tìm thấy camera. Vui lòng kiểm tra thiết bị của bạn.";
      }

      toast.error(errorMessage);
    }
    // Ignore other non-critical camera errors to prevent message spam
  };

  const canStartCheckin = (event: Event) => {
    return event.status === "ongoing";
  };

  const QRScannerModal = () => {
    if (!showQRScanner || !selectedEvent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl flex gap-6">
          {/* QR Scanner Section */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedEvent.status === "completed"
                  ? "Lịch sử Check-in"
                  : selectedEvent.status === "upcoming"
                  ? "Sự kiện chưa bắt đầu"
                  : "Quét mã QR Check-in"}
              </h2>
              <button
                onClick={() => {
                  stopChecking();
                  setShowQRScanner(false);
                }}
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
            <div className="text-center mb-4">
              <p className="text-gray-600">Sự kiện: {selectedEvent.title}</p>
              <div className="mt-4 space-x-4">
                {canStartCheckin(selectedEvent) ? (
                  !isCheckingIn ? (
                    <button
                      onClick={startChecking}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Bắt đầu Check-in
                    </button>
                  ) : (
                    <button
                      onClick={stopChecking}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Dừng Check-in
                    </button>
                  )
                ) : (
                  <div className="text-sm text-gray-500">
                    {selectedEvent.status === "completed"
                      ? "Sự kiện đã kết thúc, không thể check-in"
                      : "Sự kiện chưa bắt đầu, không thể check-in"}
                  </div>
                )}
              </div>
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              {canStartCheckin(selectedEvent) && isCheckingIn && scanning ? (
                <>
                  <QrReader
                    constraints={{
                      facingMode: "environment",
                    }}
                    onResult={(result, error) => {
                      if (result) {
                        handleScan(result.getText());
                      }
                      if (error) {
                        handleError(error);
                      }
                    }}
                    className="w-full h-full"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <p>Đang xử lý...</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  {selectedEvent.status === "completed"
                    ? "Sự kiện đã kết thúc"
                    : selectedEvent.status === "upcoming"
                    ? "Sự kiện chưa bắt đầu"
                    : 'Nhấn "Bắt đầu Check-in" để kích hoạt máy quét'}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              {canStartCheckin(selectedEvent)
                ? isCheckingIn
                  ? isProcessing
                    ? "Đang xử lý..."
                    : "Đưa mã QR vào khung hình để quét"
                  : "Camera đang tắt"
                : selectedEvent.status === "completed"
                ? "Xem lịch sử check-in bên cạnh"
                : "Vui lòng đợi đến khi sự kiện bắt đầu"}
            </p>
          </div>

          {/* Check-in History Section */}
          <div className="w-96 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Lịch sử check-in</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {checkInHistory.map((record, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    record.status === "success"
                      ? "bg-green-50 border border-green-100"
                      : "bg-red-50 border border-red-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        record.status === "success"
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {record.userName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {record.eventName}
                  </p>
                </div>
              ))}
              {checkInHistory.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  {selectedEvent.status === "completed"
                    ? "Không có dữ liệu check-in"
                    : "Chưa có lịch sử check-in"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Sắp diễn ra";
      case "ongoing":
        return "Đang diễn ra";
      case "completed":
        return "Đã kết thúc";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sự kiện</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý và theo dõi các sự kiện của tổ chức
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Thêm sự kiện mới
        </button>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg ${
              filter === "all"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 rounded-lg ${
              filter === "upcoming"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Sắp diễn ra
          </button>
          <button
            onClick={() => setFilter("ongoing")}
            className={`px-4 py-2 rounded-lg ${
              filter === "ongoing"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Đang diễn ra
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg ${
              filter === "completed"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Đã kết thúc
          </button>
        </div>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Chưa có sự kiện nào
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Bắt đầu bằng việc tạo một sự kiện mới.
            </p>
          </div>
        ) : (
          events
            .filter((event) => filter === "all" || event.status === filter)
            .map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
              >
                {/* Event Image */}
                <div className="aspect-video relative">
                  <img
                    src={
                      event.image ||
                      `https://placehold.co/600x400/e9ecef/495057?text=${encodeURIComponent(
                        event.title
                      )}`
                    }
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {getStatusText(event.status)}
                    </span>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <svg
                        className="w-5 h-5 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-gray-600">
                        {formatDate(event.startDate)} -{" "}
                        {formatDate(event.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <svg
                        className="w-5 h-5 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-gray-600">{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <svg
                        className="w-5 h-5 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-gray-600">
                        {event.participants || 0} người tham gia
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex space-x-3">
                    <button
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                        event.status === "completed"
                          ? "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          : event.status === "upcoming"
                          ? "bg-blue-50 text-blue-600 opacity-50 cursor-not-allowed"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                      onClick={() => handleEventSelect(event)}
                    >
                      {event.status === "completed"
                        ? "Xem lịch sử"
                        : event.status === "upcoming"
                        ? "Chưa bắt đầu"
                        : "Check-in"}
                    </button>
                    <button className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      <QRScannerModal />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default EventManagement;
