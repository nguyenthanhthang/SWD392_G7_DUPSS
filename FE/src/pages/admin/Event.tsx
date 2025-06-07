import React, { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

// Interface cho dữ liệu sự kiện
interface IEvent {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  registeredUsers: any[];
  consultantId: any;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  checkedInUsers: {
    userId: any;
    checkedInAt: string;
  }[];
  qrCodeSecret: string;
  createdAt: string;
  updatedAt: string;
}

// Component Tooltip
interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
        {text}
      </div>
    </div>
  );
};

const Event: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const { user } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    capacity: 1,
    consultantId: '',
    status: 'upcoming' as "upcoming" | "ongoing" | "completed" | "cancelled"
  });

  useEffect(() => {
    fetchEvents();
    fetchConsultants();
  }, []);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data);
      setError(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi tải danh sách sự kiện');
      toast.error('Không thể tải danh sách sự kiện');
    } finally {
      setLoading(false);
    }
  };

  // Fetch consultants from API
  const fetchConsultants = async () => {
    try {
      // Lấy danh sách tài khoản có role là consultant
      const response = await api.get('/accounts?role=consultant');
      setConsultants(response.data);
    } catch (err) {
      console.error('Error fetching consultants:', err);
      toast.error('Không thể tải danh sách tư vấn viên');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['capacity'].includes(name) ? Number(value) : value
    }));
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Định dạng ngày giờ cho input datetime-local
    const formatDatetimeLocal = (date: Date) => {
      return date.toISOString().slice(0, 16);
    };
    
    setFormData({
      title: '',
      description: '',
      startDate: formatDatetimeLocal(now),
      endDate: formatDatetimeLocal(tomorrow),
      location: '',
      capacity: 10,
      consultantId: '',
      status: 'upcoming'
    });
    setIsCreateModalOpen(true);
  };

  // Close create modal
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // Handle create event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.location || 
        !formData.startDate || !formData.endDate || !formData.consultantId) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (formData.capacity < 1) {
      toast.error('Sức chứa phải lớn hơn 0!');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('Thời gian bắt đầu phải trước thời gian kết thúc!');
      return;
    }

    try {
      const response = await api.post('/events', formData);
      setEvents(prev => [...prev, response.data]);
      handleCloseCreateModal();
      toast.success('Tạo sự kiện thành công!');
    } catch (error: any) {
      toast.error(`Có lỗi xảy ra khi tạo sự kiện: ${error.response?.data?.message || 'Lỗi không xác định'}`);
    }
  };

  // Open update modal
  const handleOpenUpdateModal = (event: IEvent) => {
    setSelectedEvent(event);
    
    // Định dạng ngày giờ cho input datetime-local
    const formatDatetimeLocal = (dateString: string) => {
      return new Date(dateString).toISOString().slice(0, 16);
    };
    
    setFormData({
      title: event.title,
      description: event.description,
      startDate: formatDatetimeLocal(event.startDate),
      endDate: formatDatetimeLocal(event.endDate),
      location: event.location,
      capacity: event.capacity,
      consultantId: typeof event.consultantId === 'object' && event.consultantId._id 
        ? event.consultantId._id 
        : event.consultantId,
      status: event.status
    });
    setIsUpdateModalOpen(true);
  };

  // Close update modal
  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedEvent(null);
  };

  // Handle update event
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    // Validate form
    if (!formData.title || !formData.description || !formData.location || 
        !formData.startDate || !formData.endDate || !formData.consultantId) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (formData.capacity < 1) {
      toast.error('Sức chứa phải lớn hơn 0!');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('Thời gian bắt đầu phải trước thời gian kết thúc!');
      return;
    }

    try {
      const response = await api.put(`/events/${selectedEvent._id}`, formData);
      setEvents(prev =>
        prev.map(event =>
          event._id === selectedEvent._id ? response.data : event
        )
      );
      handleCloseUpdateModal();
      toast.success('Cập nhật sự kiện thành công!');
    } catch (error: any) {
      toast.error(`Có lỗi xảy ra khi cập nhật sự kiện: ${error.response?.data?.message || 'Lỗi không xác định'}`);
    }
  };

  // Open delete modal
  const handleOpenDeleteModal = (event: IEvent) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  // Close delete modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedEvent(null);
  };

  // Handle delete event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      await api.delete(`/events/${selectedEvent._id}`);
      setEvents(prev =>
        prev.filter(event => event._id !== selectedEvent._id)
      );
      handleCloseDeleteModal();
      toast.success('Xóa sự kiện thành công!');
    } catch (error: any) {
      toast.error(`Có lỗi xảy ra khi xóa sự kiện: ${error.response?.data?.message || 'Lỗi không xác định'}`);
    }
  };

  // Open attendance modal
  const handleOpenAttendanceModal = async (event: IEvent) => {
    setSelectedEvent(event);
    try {
      const response = await api.get(`/events/${event._id}/attendance`);
      setAttendanceData(response.data);
      setIsAttendanceModalOpen(true);
    } catch (error) {
      toast.error('Không thể tải danh sách điểm danh');
    }
  };

  // Close attendance modal
  const handleCloseAttendanceModal = () => {
    setIsAttendanceModalOpen(false);
    setSelectedEvent(null);
    setAttendanceData([]);
  };

  // Generate QR code for event
  const handleGenerateQRCode = async (eventId: string) => {
    try {
      const response = await api.get(`/events/${eventId}/qr`);
      // Hiển thị QR code hoặc redirect đến trang QR code
      window.open(response.data.qrCodeUrl, '_blank');
    } catch (error: any) {
      toast.error(`Không thể tạo mã QR: ${error.response?.data?.message || 'Lỗi không xác định'}`);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Sắp diễn ra';
      case 'ongoing':
        return 'Đang diễn ra';
      case 'completed':
        return 'Đã kết thúc';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg mt-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Tiêu đề và nút thêm mới */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-indigo-500">Quản lý sự kiện</h1>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tạo sự kiện
        </button>
      </div>

      {/* Bảng sự kiện */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-purple-50 text-gray-600 text-left text-sm font-semibold uppercase tracking-wider">
              <th className="px-4 py-3 rounded-tl-lg">Tiêu đề</th>
              <th className="px-4 py-3">Mô tả</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Địa điểm</th>
              <th className="px-4 py-3">Sức chứa</th>
              <th className="px-4 py-3">Đã đăng ký</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 rounded-tr-lg">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {events.map((event) => (
              <tr key={event._id} className="border-b border-gray-200 hover:bg-purple-50">
                <td className="px-4 py-3 font-medium">{event.title}</td>
                <td className="px-4 py-3 max-w-xs truncate">{event.description}</td>
                <td className="px-4 py-3">
                  <div>Bắt đầu: {formatDate(event.startDate)}</div>
                  <div>Kết thúc: {formatDate(event.endDate)}</div>
                </td>
                <td className="px-4 py-3">{event.location}</td>
                <td className="px-4 py-3">{event.capacity}</td>
                <td className="px-4 py-3">{event.registeredUsers.length}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}
                  >
                    {getStatusText(event.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    {event.status === 'ongoing' && (
                      <Tooltip text="Tạo mã QR">
                        <button
                          onClick={() => handleGenerateQRCode(event._id)}
                          className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                            />
                          </svg>
                        </button>
                      </Tooltip>
                    )}
                    
                    <Tooltip text="Xem điểm danh">
                      <button
                        onClick={() => handleOpenAttendanceModal(event)}
                        className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                      </button>
                    </Tooltip>
                    
                    <Tooltip text="Cập nhật">
                      <button
                        onClick={() => handleOpenUpdateModal(event)}
                        className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        disabled={event.status === 'completed'}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    </Tooltip>

                    <Tooltip text="Xóa">
                      <button
                        onClick={() => handleOpenDeleteModal(event)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        disabled={event.status === 'ongoing' || event.status === 'completed'}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tạo sự kiện mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Tạo sự kiện mới</h2>
              <button
                onClick={handleCloseCreateModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tiêu đề sự kiện</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thời gian bắt đầu</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Thời gian kết thúc</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Địa điểm</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sức chứa</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tư vấn viên phụ trách</label>
                <select
                  name="consultantId"
                  value={formData.consultantId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Chọn tư vấn viên --</option>
                  {consultants.map(consultant => (
                    <option key={consultant._id} value={consultant._id}>
                      {consultant.fullName || consultant.username || 'Không có tên'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Tạo sự kiện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cập nhật sự kiện */}
      {isUpdateModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Cập nhật sự kiện</h2>
              <button
                onClick={handleCloseUpdateModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tiêu đề sự kiện</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thời gian bắt đầu</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Thời gian kết thúc</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Địa điểm</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sức chứa</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tư vấn viên phụ trách</label>
                <select
                  name="consultantId"
                  value={formData.consultantId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Chọn tư vấn viên --</option>
                  {consultants.map(consultant => (
                    <option key={consultant._id} value={consultant._id}>
                      {consultant.fullName || consultant.username || 'Không có tên'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="ongoing">Đang diễn ra</option>
                  <option value="completed">Đã kết thúc</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseUpdateModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xóa sự kiện */}
      {isDeleteModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Xác nhận xóa</h2>
              <button
                onClick={handleCloseDeleteModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <p className="text-gray-700 mb-4">
              Bạn có chắc chắn muốn xóa sự kiện "{selectedEvent.title}" không?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteEvent}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Xóa sự kiện
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem danh sách điểm danh */}
      {isAttendanceModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Danh sách điểm danh: {selectedEvent.title}</h2>
              <button
                onClick={handleCloseAttendanceModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-indigo-50 text-gray-600 text-left text-sm font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3 rounded-tl-lg">Người dùng</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 rounded-tr-lg">Thời gian check-in</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {attendanceData.length > 0 ? (
                    attendanceData.map((attendance, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-purple-50">
                        <td className="px-4 py-3 font-medium">
                          {attendance.user?.fullName || 'Không có tên'}
                        </td>
                        <td className="px-4 py-3">
                          {attendance.user?.email || 'Không có email'}
                        </td>
                        <td className="px-4 py-3">
                          {attendance.checkedIn ? formatDate(attendance.checkedIn) : 'Chưa check-in'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                        Không có dữ liệu điểm danh
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseAttendanceModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Event; 