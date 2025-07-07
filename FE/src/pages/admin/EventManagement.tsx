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

interface Sponsor {
  _id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'isDeleted';
  logo?: string;
}

interface EventSponsor {
  sponsorId: string;
  donation: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
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
  sponsors?: EventSponsor[];
  createdAt?: string;
  updatedAt?: string;
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
  sponsors: EventSponsor[];
}

// Event Card Component
const EventCard = ({ event, onSelect, onEdit, onDelete, onCancel }: { 
  event: Event; 
  onSelect: (e: Event) => void;
  onEdit: (e: Event) => void;
  onDelete: (e: Event) => void;
  onCancel: (e: Event) => void;
}) => {
  return (
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
      </div>
    </div>
    <div className="p-5 flex flex-col flex-1">
      <h3 className="text-lg font-bold mb-1 text-gray-800 line-clamp-1">{event.title}</h3>
      <p className="text-gray-500 text-sm mb-2 line-clamp-2">{event.description}</p>
      <div className="flex items-center text-gray-400 text-xs mb-1">
        <FiCalendar className="mr-1" />
        {new Date(event.startDate).toLocaleString("vi-VN", {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })}
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
        <span className={event.registeredCount && event.registeredCount >= event.capacity ? "text-red-500 font-semibold" : ""}>
          {event.registeredCount ?? 0}/{event.capacity} người đã đăng ký
        </span>
        {event.registeredCount && event.registeredCount >= event.capacity && (
          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
            Đã đầy
          </span>
        )}
      </div>
      {/* Progress bar cho mức độ đăng ký */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            event.registeredCount && event.registeredCount >= event.capacity 
              ? 'bg-red-500' 
              : event.registeredCount && event.registeredCount >= event.capacity * 0.8
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ 
            width: `${Math.min(((event.registeredCount ?? 0) / event.capacity) * 100, 100)}%` 
          }}
        ></div>
      </div>
      <div className="flex-1"></div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onSelect(event)}
          className="flex-1 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-all text-sm"
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
};

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
    image: "",
    sponsors: []
  });

  // Sponsor management states
  const [availableSponsors, setAvailableSponsors] = useState<Sponsor[]>([]);
  const [showNewSponsorForm, setShowNewSponsorForm] = useState(false);
  const [newSponsor, setNewSponsor] = useState({
    name: "",
    email: "",
    logo: ""
  });
  const [selectedSponsorId, setSelectedSponsorId] = useState("");
  const [sponsorDonation, setSponsorDonation] = useState("");
  const [sponsorTier, setSponsorTier] = useState<"Platinum" | "Gold" | "Silver" | "Bronze">("Bronze");

  // Fetch available sponsors
  const fetchSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors');
      const data = await response.json();
      setAvailableSponsors(data);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    }
  };

  // Create new sponsor
  const handleCreateSponsor = async () => {
    if (!newSponsor.name || !newSponsor.email) {
      toast.error('Vui lòng điền đầy đủ thông tin nhà tài trợ');
      return;
    }

    try {
      console.log('Sending sponsor data:', newSponsor); // Debug log
      const response = await fetch('/api/sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSponsor),
      });
      
      if (response.ok) {
        const createdSponsor = await response.json();
        setAvailableSponsors(prev => [...prev, createdSponsor]);
        setNewSponsor({ name: "", email: "", logo: "" });
        setShowNewSponsorForm(false);
        toast.success('Tạo nhà tài trợ thành công!');
      } else {
        // Lấy lỗi message từ BE
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || 'Không thể tạo nhà tài trợ';
        toast.error(errorMessage);
        console.error('BE Error:', errorData); // Debug log
      }
    } catch (error) {
      console.error('FE Error:', error); // Debug log
      toast.error('Lỗi khi tạo nhà tài trợ');
    }
  };

  // Add sponsor to event
  const handleAddSponsor = () => {
    if (!selectedSponsorId || !sponsorDonation.trim()) {
      toast.error('Vui lòng chọn nhà tài trợ và nhập nội dung tài trợ');
      return;
    }
    // Không kiểm tra là số nữa
    const existingSponsor = formData.sponsors.find(s => s.sponsorId === selectedSponsorId);
    if (existingSponsor) {
      toast.error('Nhà tài trợ này đã được thêm vào sự kiện');
      return;
    }
    const newEventSponsor: EventSponsor = {
      sponsorId: selectedSponsorId,
      donation: sponsorDonation.trim(),
      tier: sponsorTier
    };
    setFormData(prev => ({
      ...prev,
      sponsors: [...prev.sponsors, newEventSponsor]
    }));
    setSelectedSponsorId("");
    setSponsorDonation("");
    setSponsorTier("Bronze");
  };

  // Remove sponsor from event
  const handleRemoveSponsor = (sponsorId: string) => {
    setFormData(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter(s => s.sponsorId !== sponsorId)
    }));
  };

  useEffect(() => {
    if (open) {
      fetchSponsors();
    }
  }, [open]);

  useEffect(() => {
    if (event && isEditing) {
      setFormData({
        title: event.title,
        description: event.description,
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        registrationStartDate: event.registrationStartDate ? new Date(event.registrationStartDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        registrationEndDate: event.registrationEndDate ? new Date(event.registrationEndDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        location: event.location,
        capacity: event.capacity,
        image: event.image || "",
        sponsors: event.sponsors || []
      });
    } else {
      // Set default times for new events
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setFormData({
        title: "",
        description: "",
        startDate: tomorrow.toISOString().slice(0, 16),
        endDate: tomorrow.toISOString().slice(0, 16),
        registrationStartDate: now.toISOString().slice(0, 16),
        registrationEndDate: tomorrow.toISOString().slice(0, 16),
        location: "",
        capacity: 50,
        image: "",
        sponsors: []
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
    
    if (formData.title.trim().length < 5) {
      toast.error("Tiêu đề phải có ít nhất 5 ký tự");
      return;
    }
    
    if (formData.title.trim().length > 100) {
      toast.error("Tiêu đề không được vượt quá 100 ký tự");
      return;
    }
    
    if (formData.description.trim().length < 10) {
      toast.error("Mô tả phải có ít nhất 10 ký tự");
      return;
    }
    
    if (formData.description.trim().length > 1000) {
      toast.error("Mô tả không được vượt quá 1000 ký tự");
      return;
    }
    
    if (formData.location.trim().length < 3) {
      toast.error("Địa điểm phải có ít nhất 3 ký tự");
      return;
    }
    
    if (formData.capacity <= 0) {
      toast.error("Sức chứa phải lớn hơn 0");
      return;
    }
    
    if (formData.capacity > 10000) {
      toast.error("Sức chứa không được vượt quá 10,000 người");
      return;
    }
    
    // Kiểm tra sức chứa khi cập nhật event
    if (isEditing && event) {
      const currentRegisteredCount = event.registeredCount || 0;
      if (formData.capacity < currentRegisteredCount) {
        toast.error(`Không thể giảm sức chứa xuống ${formData.capacity} vì đã có ${currentRegisteredCount} người đăng ký`);
        return;
      }
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
    
    // Validate URL hình ảnh nếu có
    if (formData.image && formData.image.trim()) {
      try {
        new URL(formData.image);
      } catch {
        toast.error("URL hình ảnh không hợp lệ");
        return;
      }
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
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Nhập tiêu đề sự kiện"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 h-24"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian kết thúc đăng ký *</label>
              <input
                type="datetime-local"
                value={formData.registrationEndDate}
                onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian kết thúc sự kiện *</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Số lượng người tham gia tối đa"
              required
            />
            {isEditing && event && event.registeredCount && (
              <div className="mt-2 text-sm">
                <span className="text-gray-600">
                  Hiện tại đã có <span className="font-semibold">{event.registeredCount}</span> người đăng ký
                </span>
                {event.registeredCount >= event.capacity && (
                  <div className="mt-1 text-red-600 font-medium">
                    ⚠️ Sự kiện đã đầy! Không thể giảm sức chứa.
                  </div>
                )}
                {event.registeredCount >= event.capacity * 0.8 && event.registeredCount < event.capacity && (
                  <div className="mt-1 text-yellow-600 font-medium">
                    ⚠️ Sự kiện gần đầy! ({Math.round((event.registeredCount / event.capacity) * 100)}% đã đăng ký)
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Sponsor Management Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Nhà tài trợ</h4>
            
            {/* Add Sponsor Form */}
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <div className="flex flex-col md:flex-row gap-3 mb-3 items-end">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn nhà tài trợ</label>
                  <select
                    value={selectedSponsorId}
                    onChange={(e) => setSelectedSponsorId(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="">-- Chọn nhà tài trợ --</option>
                    {availableSponsors.map((sponsor) => (
                      <option key={sponsor._id} value={sponsor._id}>
                        {sponsor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tài trợ (tiền, sản phẩm, dịch vụ...)</label>
                  <input
                    type="text"
                    value={sponsorDonation}
                    onChange={(e) => setSponsorDonation(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="10.000.000 VNĐ, 100 áo thun, ..."
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cấp độ</label>
                  <select
                    value={sponsorTier}
                    onChange={(e) => setSponsorTier(e.target.value as 'Platinum' | 'Gold' | 'Silver' | 'Bronze')}
                    className="w-full h-11 px-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleAddSponsor}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm"
                >
                  Thêm nhà tài trợ
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewSponsorForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Tạo nhà tài trợ mới
                </button>
              </div>
            </div>

            {/* Selected Sponsors List */}
            {formData.sponsors.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-gray-700">Danh sách nhà tài trợ:</h5>
                {formData.sponsors.map((eventSponsor, index) => {
                  const sponsor = availableSponsors.find(s => s._id === eventSponsor.sponsorId);
                  return (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        {sponsor?.logo && (
                          <img src={sponsor.logo} alt={sponsor.name} className="w-8 h-8 rounded-full object-cover" />
                        )}
                        <div>
                          <div className="font-medium">{sponsor?.name || 'Unknown Sponsor'}</div>
                          <div className="text-sm text-gray-500">{sponsor?.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">{eventSponsor.donation}</div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            eventSponsor.tier === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                            eventSponsor.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                            eventSponsor.tier === 'Silver' ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {eventSponsor.tier}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSponsor(eventSponsor.sponsorId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              className="flex-1 py-3 px-4 rounded-xl bg-sky-600 text-white font-medium hover:bg-sky-700 transition-all"
            >
              {isEditing ? "Cập nhật" : "Tạo sự kiện"}
            </button>
          </div>
        </form>

        {/* New Sponsor Modal */}
        {showNewSponsorForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Tạo nhà tài trợ mới</h4>
                <button 
                  onClick={() => setShowNewSponsorForm(false)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhà tài trợ *</label>
                  <input
                    type="text"
                    value={newSponsor.name}
                    onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Nhập tên nhà tài trợ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newSponsor.email}
                    onChange={(e) => setNewSponsor({ ...newSponsor, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="sponsor@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo nhà tài trợ</label>
                  <div className="flex items-center gap-3">
                    {newSponsor.logo && (
                      <img src={newSponsor.logo} alt="Logo preview" className="w-24 h-24 object-cover border rounded-lg" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const form = new FormData();
                        form.append('image', file);
                        try {
                          const res = await fetch('/api/uploads/upload', {
                            method: 'POST',
                            body: form,
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                          });
                          if (!res.ok) throw new Error('Upload thất bại');
                          const data = await res.json();
                          setNewSponsor(prev => ({ ...prev, logo: data.imageUrl }));
                          toast.success('Tải logo lên thành công!');
                        } catch (error) {
                          toast.error('Tải logo lên thất bại!');
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewSponsorForm(false)}
                    className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateSponsor}
                    className="flex-1 py-2 px-4 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all"
                  >
                    Tạo nhà tài trợ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
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
        <p className="text-gray-500 text-center mb-4">Sự kiện: <span className="font-semibold text-sky-600">{eventTitle}</span></p>
        <div className="rounded-xl overflow-hidden border border-gray-200 mb-4">
          <QrReader
            constraints={{ facingMode: "environment" }}
            onResult={(result, error) => {
              if (result) onScan(result.getText());
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
  const [sortBy, setSortBy] = useState("newest");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellingEvent, setCancellingEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getAllEventsApi();
      
      // Sắp xếp sự kiện theo thời gian mới nhất (createdAt hoặc startDate)
      const sortedEvents = (Array.isArray(data) ? data : []).sort((a: Event, b: Event) => {
        // Ưu tiên sắp xếp theo ngày tạo mới nhất
        const dateA = new Date(a.createdAt || a.startDate);
        const dateB = new Date(b.createdAt || b.startDate);
        return dateB.getTime() - dateA.getTime();
      });
      
      setEvents(sortedEvents);
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
    } catch (error: unknown) {
      console.error("Create event error:", error);
      console.error("Error response:", error instanceof Response ? await error.json() : error);
      const errorMessage = error instanceof Response ? await error.json()?.message || error.statusText : error instanceof Error ? error.message : "Không thể tạo sự kiện";
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
      
      // Refresh events để cập nhật số liệu
      await fetchEvents();
    } catch (error) {
      setCheckInHistory((prev) => [
        { userName: "(QR)", eventName: selectedEvent.title, timestamp: new Date(), status: "error" as const },
        ...prev
      ].slice(0, 10));
      toast.error("Check-in thất bại!");
    }
  };

  // Filter + search + sort
  const filteredEvents = events.filter(event => {
    if (filter !== "all" && event.status !== filter) return false;
    if (search && !event.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Sắp xếp sự kiện
  const sortedEvents = [...filteredEvents].sort((a: Event, b: Event) => {
    switch (sortBy) {
      case "newest": {
        const dateA = new Date(a.createdAt || a.startDate);
        const dateB = new Date(b.createdAt || b.startDate);
        return dateB.getTime() - dateA.getTime();
      }
      case "oldest": {
        const dateAOld = new Date(a.createdAt || a.startDate);
        const dateBOld = new Date(b.createdAt || b.startDate);
        return dateAOld.getTime() - dateBOld.getTime();
      }
      case "startDate":
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case "startDateDesc":
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case "capacity":
        return b.capacity - a.capacity;
      case "registered":
        return (b.registeredCount || 0) - (a.registeredCount || 0);
      case "status":
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedEvents.length / rowsPerPage);
  const paginatedFilteredEvents = sortedEvents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-[#f6f8fb] pb-10">
      <ToastContainer position="top-right" autoClose={2000} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý sự kiện</h1>
            {events.length > 0 && (
              <div className="flex gap-4 text-sm text-gray-600">
                <span>📊 Tổng cộng: {events.length} sự kiện</span>
                <span>👥 Đã đăng ký: {events.reduce((sum, event) => sum + (event.registeredCount || 0), 0)} người</span>
                <span className="text-red-600 font-medium">
                  ⚠️ Đầy: {events.filter(event => event.registeredCount && event.registeredCount >= event.capacity).length} sự kiện
                </span>
                <span className="text-sky-600 font-medium">
                 
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setEditingEvent(null);
              setShowEventForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-all font-medium"
          >
            <FiPlus /> Tạo sự kiện mới
          </button>
        </div>

        {/* Filter & Search & Sort */}
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
                  filter === cat.id ? "bg-sky-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-sky-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3 items-center">
            {/* Dropdown sắp xếp */}
            <div className="relative">
              
            </div>
            
            {/* Search */}
            <div className="w-full md:w-80 relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500"></div>
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
