import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { checkInEventApi, getAllEventsApi, createEventApi, updateEventApi, deleteEventApi } from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QrReader } from "react-qr-reader";
import { motion } from "framer-motion";
import { FiSearch, FiUsers, FiMapPin, FiCalendar, FiCheckCircle, FiXCircle, FiChevronLeft, FiChevronRight, FiPlus, FiEdit, FiTrash2, FiX } from "react-icons/fi";

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
  registrationStartDate?: string;
  registrationEndDate?: string;
  location: string;
  capacity: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  image?: string;
  participants?: number;
  registeredCount?: number;
}

// Add interface for check-in history
interface CheckInRecord {
  userName: string;
  eventName: string;
  timestamp: Date;
  status: "success" | "error";
}

interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  location: string;
  capacity: number;
  image?: string;
}

// Event Card Component
const EventCard = ({ event, onSelect, onEdit, onDelete, onCancel }: { 
  event: Event; 
  onSelect: (e: Event) => void;
  onEdit: (e: Event) => void;
  onDelete: (e: Event) => void;
  onCancel: (e: Event) => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full min-h-[380px] border border-gray-100"
  >
    <div className="relative h-40">
      <img
        src={event.image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80"}
        alt={event.title}
        className="w-full h-full object-cover"
      />
      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
        event.status === "upcoming"
          ? "bg-blue-600 text-white"
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
      </div>
    </div>
    <div className="p-5 flex flex-col flex-1">
      <h3 className="text-lg font-bold mb-1 text-gray-800 line-clamp-1">{event.title}</h3>
      <p className="text-gray-500 text-sm mb-2 line-clamp-2">{event.description}</p>
      <div className="flex items-center text-gray-400 text-xs mb-1">
        <FiCalendar className="mr-1" />
        {new Date(event.startDate).toLocaleString("vi-VN")}
      </div>
      <div className="flex items-center text-gray-400 text-xs mb-1">
        <FiMapPin className="mr-1" />
        {event.location}
      </div>
      <div className="flex items-center text-gray-400 text-xs mb-1">
        <FiUsers className="mr-1" />
        Sức chứa: {event.capacity} người
      </div>
      <div className="flex items-center text-gray-400 text-xs mb-2">
        <FiUsers className="mr-1" />
        {event.registeredCount ?? 0}/{event.capacity} người đã đăng ký
      </div>
      <div className="flex-1"></div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onSelect(event)}
          className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all text-sm"
          disabled={event.status !== "ongoing"}
        >
          Quét QR
        </button>
        <button
          onClick={() => onEdit(event)}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
        >
          <FiEdit className="text-gray-600" />
        </button>
        {event.status === "cancelled" ? (
          <button
            onClick={() => onDelete(event)}
            className="p-2 rounded-xl bg-red-100 hover:bg-red-200 transition-all"
          >
            <FiTrash2 className="text-red-600" />
          </button>
        ) : (
          <button
            onClick={() => onCancel(event)}
            className="p-2 rounded-xl bg-orange-100 hover:bg-orange-200 transition-all"
            title="Hủy sự kiện"
          >
            <FiXCircle className="text-orange-600" />
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

// Event Form Modal
const EventFormModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  event, 
  isEditing 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (data: EventFormData) => void; 
  event?: Event | null; 
  isEditing: boolean; 
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    registrationStartDate: "",
    registrationEndDate: "",
    location: "",
    capacity: 50,
    image: ""
  });

  useEffect(() => {
    if (event && isEditing) {
      setFormData({
        title: event.title,
        description: event.description,
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        registrationStartDate: event.registrationStartDate ? new Date(event.registrationStartDate).toISOString().slice(0, 16) : "",
        registrationEndDate: event.registrationEndDate ? new Date(event.registrationEndDate).toISOString().slice(0, 16) : "",
        location: event.location,
        capacity: event.capacity,
        image: event.image || ""
      });
    } else {
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        registrationStartDate: "",
        registrationEndDate: "",
        location: "",
        capacity: 50,
        image: ""
      });
    }
  }, [event, isEditing, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.startDate || !formData.endDate || !formData.registrationStartDate || !formData.registrationEndDate || !formData.location.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    
    if (formData.capacity <= 0) {
      toast.error("Sức chứa phải lớn hơn 0");
      return;
    }
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const regStartDate = new Date(formData.registrationStartDate);
    const regEndDate = new Date(formData.registrationEndDate);
    
    if (endDate <= startDate) {
      toast.error("Thời gian kết thúc sự kiện phải sau thời gian bắt đầu");
      return;
    }
    
    if (regEndDate <= regStartDate) {
      toast.error("Thời gian kết thúc đăng ký phải sau thời gian bắt đầu đăng ký");
      return;
    }
    
    if (regEndDate > startDate) {
      toast.error("Thời gian kết thúc đăng ký phải trước khi sự kiện bắt đầu");
      return;
    }
    
    if (regStartDate < new Date()) {
      toast.error("Thời gian bắt đầu đăng ký phải trong tương lai");
      return;
    }
    
    console.log("Form validation passed, submitting:", formData);
    onSubmit(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {isEditing ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tiêu đề sự kiện"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Nhập mô tả sự kiện"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian bắt đầu đăng ký *</label>
              <input
                type="datetime-local"
                value={formData.registrationStartDate}
                onChange={(e) => setFormData({ ...formData, registrationStartDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian kết thúc đăng ký *</label>
              <input
                type="datetime-local"
                value={formData.registrationEndDate}
                onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian bắt đầu sự kiện *</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian kết thúc sự kiện *</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập địa điểm tổ chức"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sức chứa *</label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Số lượng người tham gia tối đa"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all"
            >
              {isEditing ? "Cập nhật" : "Tạo sự kiện"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  eventTitle 
}: { 
  open: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  eventTitle: string; 
}) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">Xác nhận xóa sự kiện</h3>
        <p className="text-gray-600 mb-6">
          Bạn có chắc chắn muốn xóa sự kiện <span className="font-semibold">"{eventTitle}"</span>?
          <br />
          <span className="text-red-500 text-sm">Hành động này không thể hoàn tác.</span>
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all"
          >
            Xóa
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Cancel Confirmation Modal
const CancelConfirmModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  eventTitle 
}: { 
  open: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  eventTitle: string; 
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="text-center">
          <div className="text-orange-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Xác nhận hủy sự kiện
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn có chắc chắn muốn hủy sự kiện <strong>"{eventTitle}"</strong> không?
            <br />
            <span className="text-sm text-orange-600">
              Sự kiện sẽ được chuyển sang trạng thái "Đã hủy" và không thể hoàn tác.
            </span>
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
            >
              Xác nhận hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (p: number) => void }) => (
  <div className="flex justify-center items-center gap-2 mt-8">
    <button
      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      <FiChevronLeft />
    </button>
    <span className="font-semibold text-gray-700">
      Trang {currentPage} / {totalPages}
    </span>
    <button
      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      <FiChevronRight />
    </button>
  </div>
);

// Check-in History Component
const CheckInHistory = ({ history }: { history: CheckInRecord[] }) => (
  <div className="mt-6 bg-white rounded-xl shadow p-4 max-w-lg mx-auto">
    <h4 className="font-bold text-gray-700 mb-2 text-center">Lịch sử check-in gần đây</h4>
    <ul className="divide-y divide-gray-100">
      {history.length === 0 && <li className="text-gray-400 text-center py-2">Chưa có check-in nào</li>}
      {history.map((rec, idx) => (
        <li key={idx} className="flex items-center py-2 text-sm">
          {rec.status === "success" ? (
            <FiCheckCircle className="text-green-500 mr-2" />
          ) : (
            <FiXCircle className="text-red-500 mr-2" />
          )}
          <span className="font-medium text-gray-700 mr-2">{rec.userName}</span>
          <span className="text-gray-500">- {rec.eventName}</span>
          <span className="ml-auto text-gray-400">{rec.timestamp.toLocaleTimeString("vi-VN")}</span>
        </li>
      ))}
    </ul>
  </div>
);

// QR Scanner Modal
const QRScannerModal = ({ open, onClose, onScan, eventTitle }: { open: boolean; onClose: () => void; onScan: (data: string | null) => void; eventTitle: string }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
          <FiXCircle size={24} />
        </button>
        <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Quét mã QR check-in</h3>
        <p className="text-gray-500 text-center mb-4">Sự kiện: <span className="font-semibold text-blue-600">{eventTitle}</span></p>
        <div className="rounded-xl overflow-hidden border border-gray-200 mb-4">
          <QrReader
            constraints={{ facingMode: "environment" }}
            onResult={(result, error) => {
              if (!!result) onScan(result.getText());
            }}
          />
        </div>
        <p className="text-xs text-gray-400 text-center">Đưa mã QR của người tham gia vào khung camera để check-in</p>
      </motion.div>
    </div>
  );
};

// Main Admin Event Management Page
const AdminEventManagement = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellingEvent, setCancellingEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getAllEventsApi();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (formData: EventFormData) => {
    try {
      console.log("Creating event with data:", formData);
      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        registrationStartDate: new Date(formData.registrationStartDate),
        registrationEndDate: new Date(formData.registrationEndDate),
        location: formData.location,
        capacity: formData.capacity
      };
      console.log("API payload:", payload);
      
      await createEventApi(payload);
      toast.success("Tạo sự kiện thành công!");
      setShowEventForm(false);
      fetchEvents();
    } catch (error: any) {
      console.error("Create event error:", error);
      console.error("Error response:", error?.response?.data);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tạo sự kiện";
      toast.error(errorMessage);
    }
  };

  const handleUpdateEvent = async (formData: EventFormData) => {
    if (!editingEvent) return;
    try {
      await updateEventApi(editingEvent._id, {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        registrationStartDate: new Date(formData.registrationStartDate),
        registrationEndDate: new Date(formData.registrationEndDate),
        location: formData.location,
        capacity: formData.capacity
      });
      toast.success("Cập nhật sự kiện thành công!");
      setShowEventForm(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      toast.error("Không thể cập nhật sự kiện");
    }
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;
    try {
      await deleteEventApi(deletingEvent._id);
      toast.success("Xóa sự kiện thành công!");
      setShowDeleteConfirm(false);
      setDeletingEvent(null);
      fetchEvents();
    } catch (error) {
      toast.error("Không thể xóa sự kiện");
    }
  };

  const handleCancelEvent = async (event: Event) => {
    setCancellingEvent(event);
    setShowCancelConfirm(true);
  };

  const confirmCancelEvent = async () => {
    if (!cancellingEvent) return;
    try {
      await updateEventApi(cancellingEvent._id, { status: "cancelled" });
      toast.success("Hủy sự kiện thành công!");
      setShowCancelConfirm(false);
      setCancellingEvent(null);
      fetchEvents();
    } catch (error) {
      toast.error("Không thể hủy sự kiện");
      setShowCancelConfirm(false);
      setCancellingEvent(null);
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setShowQRScanner(true);
    setCheckInHistory([]);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteClick = (event: Event) => {
    setDeletingEvent(event);
    setShowDeleteConfirm(true);
  };

  const handleScan = async (data: string | null) => {
    if (!data || !selectedEvent) return;
    try {
      await checkInEventApi(selectedEvent._id, "", data);
      setCheckInHistory((prev) => [
        { userName: "(QR)", eventName: selectedEvent.title, timestamp: new Date(), status: "success" as const },
        ...prev
      ].slice(0, 10));
      toast.success("Check-in thành công!");
    } catch (error) {
      setCheckInHistory((prev) => [
        { userName: "(QR)", eventName: selectedEvent.title, timestamp: new Date(), status: "error" as const },
        ...prev
      ].slice(0, 10));
      toast.error("Check-in thất bại!");
    }
  };

  // Filter + search
  const filteredEvents = events.filter(event => {
    if (filter !== "all" && event.status !== filter) return false;
    if (search && !event.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const totalPages = Math.ceil(filteredEvents.length / rowsPerPage);
  const paginatedFilteredEvents = filteredEvents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-[#f6f8fb] pb-10">
      <ToastContainer position="top-right" autoClose={2000} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Quản lý sự kiện</h1>
          <button
            onClick={() => {
              setEditingEvent(null);
              setShowEventForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
          >
            <FiPlus /> Tạo sự kiện mới
          </button>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "all", name: "Tất cả" },
              { id: "upcoming", name: "Sắp diễn ra" },
              { id: "ongoing", name: "Đang diễn ra" },
              { id: "completed", name: "Đã kết thúc" },
              { id: "cancelled", name: "Đã hủy" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filter === cat.id ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-blue-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="w-full md:w-80 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedFilteredEvents.map(event => (
                <EventCard 
                  key={event._id} 
                  event={event} 
                  onSelect={handleEventSelect}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteClick}
                  onCancel={handleCancelEvent}
                />
              ))}
            </div>
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không có sự kiện nào phù hợp</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </motion.div>

      {/* Modals */}
      <EventFormModal
        open={showEventForm}
        onClose={() => {
          setShowEventForm(false);
          setEditingEvent(null);
        }}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
        event={editingEvent}
        isEditing={!!editingEvent}
      />

      <DeleteConfirmModal
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingEvent(null);
        }}
        onConfirm={handleDeleteEvent}
        eventTitle={deletingEvent?.title || ""}
      />

      <CancelConfirmModal
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancelEvent}
        eventTitle={cancellingEvent?.title || ""}
      />

      <QRScannerModal 
        open={showQRScanner} 
        onClose={() => setShowQRScanner(false)} 
        onScan={handleScan} 
        eventTitle={selectedEvent?.title || ""} 
      />

      {/* Check-in History */}
      {showQRScanner && <CheckInHistory history={checkInHistory} />}
    </div>
  );
};

export default AdminEventManagement;
