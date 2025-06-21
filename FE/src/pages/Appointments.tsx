import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Search, Eye, X, CheckCircle, ChevronRight, Star, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAppointmentByUserIdApi, getFeedbackByAppointmentIdApi, getFeedbackByServiceIdApi } from '../api';
import { formatInTimeZone } from 'date-fns-tz';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackDisplay from '../components/FeedbackDisplay';

const AppointmentsPage = () => {
  const navigate = useNavigate();
  interface Appointment {
    _id: string;
    consultant_id?: { 
      _id?: string;
      accountId?: {
        fullName?: string;
        photoUrl?: string;
        email?: string;
      };
      introduction?: string;
    };
    service_id?: { _id?: string; name?: string; price?: number };
    slotTime_id?: { start_time?: string; end_time?: string };
    dateBooking?: string;
    type?: string;
    location?: string;
    status?: string;
    reason?: string;
    note?: string;
    hasFeedback?: boolean;
  }

  interface Feedback {
    _id: string;
    rating: number;
    comment: string;
    feedback_date: string;
    account_id: {
      fullName?: string;
      username?: string;
    };
  }

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setAppointments([]);
        setLoading(false);
        return;
      }
      try {
        const data = await getAppointmentByUserIdApi(userId);
        console.log('Appointments data:', data);
        if (data && data.length > 0) {
          console.log('First appointment consultant_id:', data[0].consultant_id);
        }
        setAppointments(data || []);
      } catch {
        setAppointments([]);
      }
      setLoading(false);
    };
    fetchAppointments();
  }, []);

  const fetchFeedbacks = async (appointmentId: string, serviceId: string) => {
    setLoadingFeedbacks(true);
    try {
      // Thử lấy feedback theo appointment trước, nếu không có thì lấy theo service
      const appointmentFeedbacks = await getFeedbackByAppointmentIdApi(appointmentId);
      if (appointmentFeedbacks && appointmentFeedbacks.length > 0) {
        setFeedbacks(appointmentFeedbacks);
      } else {
        const serviceFeedbacks = await getFeedbackByServiceIdApi(serviceId);
        setFeedbacks(serviceFeedbacks || []);
      }
    } catch {
      setFeedbacks([]);
    }
    setLoadingFeedbacks(false);
  };

  const handleAppointmentClick = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
    
    // Load feedbacks nếu là lịch hẹn đã hoàn thành
    if (appointment.status === 'completed' && appointment.service_id?._id) {
      await fetchFeedbacks(appointment._id, appointment.service_id._id);
    }
  };

  const handleFeedbackSuccess = async () => {
    if (selectedAppointment) {
      const updatedAppointment = { ...selectedAppointment, hasFeedback: true };

      // Cập nhật trạng thái cho cả danh sách và lịch hẹn đang được chọn trong modal
      setAppointments(prev => 
        prev.map(app => 
          app._id === selectedAppointment._id 
            ? updatedAppointment 
            : app
        )
      );
      setSelectedAppointment(updatedAppointment);

      // Tải lại danh sách feedback trong modal để hiển thị đánh giá mới
      if (selectedAppointment.service_id?._id) {
        await fetchFeedbacks(selectedAppointment._id, selectedAppointment.service_id._id);
      }
    }
  };

  const filteredAppointments = appointments.filter((apt: Appointment) => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const consultantName = apt.consultant_id?.accountId?.fullName || 
                          (typeof apt.consultant_id === 'object' && 'fullName' in apt.consultant_id 
                            ? (apt.consultant_id as { fullName?: string }).fullName 
                            : '');
    const serviceName = apt.service_id?.name || '';
    const matchesSearch = (consultantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Format date from ISO string to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return formatInTimeZone(new Date(dateString), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  const getEndTime = (startTime: string): string => {
    if (!startTime) return '';
    const [hourStr, minuteStr] = startTime.split(':');
    const hour = parseInt(hourStr, 10);
    const endHour = hour + 1;
    return `${String(endHour).padStart(2, '0')}:${minuteStr}`;
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const startTime = formatInTimeZone(new Date(dateString), 'Asia/Ho_Chi_Minh', 'HH:mm');
      const endTime = getEndTime(startTime);
      return `${startTime} - ${endTime}`;
    } catch (error) {
      return 'Invalid Time';
    }
  };

  // Get status display information (text, color, bg)
  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return { text: 'Đã xác nhận', color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' };
      case 'completed':
        return { text: 'Đã hoàn thành', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'cancelled':
        return { text: 'Đã hủy', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
      case 'pending':
      default:
        return { text: 'Chờ xác nhận', color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' };
    }
  };

  // Get gradient background for cards based on status
  const getCardGradient = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'from-sky-50 via-cyan-50 to-white hover:from-sky-100';
      case 'completed':
        return 'from-blue-50 via-sky-50 to-white hover:from-blue-100';
      case 'cancelled':
        return 'from-red-50 via-pink-50 to-white hover:from-red-100';
      case 'pending':
      default:
        return 'from-sky-50 via-cyan-50 to-white hover:from-sky-100';
    }
  };

  // Get title based on current filter
  const getStatusTitle = () => {
    switch (filterStatus) {
      case 'confirmed':
        return 'Lịch hẹn đã xác nhận';
      case 'completed':
        return 'Lịch hẹn đã hoàn thành';
      case 'cancelled':
        return 'Lịch hẹn đã hủy';
      case 'pending':
        return 'Lịch hẹn chờ xác nhận';
      default:
        return 'Tất cả lịch hẹn';
    }
  };

  return (
    <div className="p-7">
      <div className="font-semibold text-gray-700 mb-4 text-lg">Lịch hẹn của bạn</div>
      
      {/* Filter và Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <select 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)} 
          className="rounded-lg border border-sky-100 px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên chuyên gia hoặc dịch vụ..."
          className="rounded-lg border border-sky-100 px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 w-full md:w-64"
        />
        
        <div className="ml-auto">
          <button
            onClick={() => navigate('/service')}
            className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Đặt lịch mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Pending */}
        <div
          className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${filterStatus === 'pending' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'}`}
          onClick={() => setFilterStatus('pending')}
        >
          <div className="p-2.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-full mb-2 flex items-center justify-center">
            <Clock className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Chờ xác nhận</p>
          <p className="text-xl font-bold text-gray-900">{appointments.filter(a => a.status === 'pending').length}</p>
        </div>
        
        {/* Confirmed */}
        <div
          className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${filterStatus === 'confirmed' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'}`}
          onClick={() => setFilterStatus('confirmed')}
        >
          <div className="p-2.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-full mb-2 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Đã xác nhận</p>
          <p className="text-xl font-bold text-gray-900">{appointments.filter(a => a.status === 'confirmed').length}</p>
        </div>
        
        {/* Completed */}
        <div
          className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${filterStatus === 'completed' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'}`}
          onClick={() => setFilterStatus('completed')}
        >
          <div className="p-2.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-full mb-2 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Đã hoàn thành</p>
          <p className="text-xl font-bold text-gray-900">{appointments.filter(a => a.status === 'completed').length}</p>
        </div>
        
        {/* Cancelled */}
        <div
          className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${filterStatus === 'cancelled' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'}`}
          onClick={() => setFilterStatus('cancelled')}
        >
          <div className="p-2.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-full mb-2 flex items-center justify-center">
            <X className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Đã hủy</p>
          <p className="text-xl font-bold text-gray-900">{appointments.filter(a => a.status === 'cancelled').length}</p>
        </div>
      </div>

      {/* Danh sách lịch hẹn */}
      <div>
        <div className={`font-semibold mb-2 text-sky-700`}>
          {getStatusTitle()}
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-gray-500 italic">Không tìm thấy lịch hẹn nào.</div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map(appointment => {
              const isCompleted = appointment.status === 'completed';
              const hasFeedback = appointment.hasFeedback;
              const completionDate = appointment.dateBooking ? new Date(appointment.dateBooking) : new Date();
              const feedbackDeadline = new Date(completionDate);
              feedbackDeadline.setDate(completionDate.getDate() + 7);
              const isWithin7Days = new Date() < feedbackDeadline;
              const canReview = isCompleted && !hasFeedback && isWithin7Days;

              return (
                <div
                  key={appointment._id}
                  className={`bg-gradient-to-r ${getCardGradient(appointment.status)} transition rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm border border-sky-100`}
                >
                  <div className="flex-grow cursor-pointer" onClick={() => handleAppointmentClick(appointment)}>
                    <div className="font-medium text-base text-gray-800">
                      {appointment.service_id?.name || 'Dịch vụ không xác định'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Chuyên gia: {
                        appointment.consultant_id?.accountId?.fullName ||
                        (typeof appointment.consultant_id === 'object' && 'fullName' in appointment.consultant_id
                          ? (appointment.consultant_id as { fullName?: string }).fullName 
                          : 'Không xác định')
                      }
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-sky-500" />
                      {formatDate(appointment.dateBooking)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-500" />
                      {formatTime(appointment.dateBooking)}
                    </div>
                    <div className={`text-xs ${getStatusInfo(appointment.status).color} font-medium mt-1 inline-block px-2 py-0.5 rounded-full ${getStatusInfo(appointment.status).bg} ${getStatusInfo(appointment.status).border}`}>
                      {getStatusInfo(appointment.status).text}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-center gap-2 flex-shrink-0">
                    <div className="text-lg font-semibold text-sky-700">
                      {appointment.service_id?.price?.toLocaleString('vi-VN')}đ
                    </div>
                    
                    {canReview && (
                      <button
                        onClick={() => { setShowFeedbackForm(true); setSelectedAppointment(appointment); }}
                        className="px-3 py-1 bg-sky-500 text-white rounded-md text-sm font-medium hover:bg-sky-600 transition-colors flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Đánh giá
                      </button>
                    )}

                    {isCompleted && hasFeedback && (
                      <div className="px-3 py-1 bg-gray-100 text-gray-500 rounded-md text-sm font-medium">
                        Đã đánh giá
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal xem chi tiết lịch hẹn */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto relative p-6">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl font-bold text-gray-800 mb-4">Chi tiết lịch hẹn</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Dịch vụ</div>
                <div className="font-medium">{selectedAppointment.service_id?.name || 'Không xác định'}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Chuyên gia</div>
                <div className="flex items-center gap-3">
                  {selectedAppointment.consultant_id ? (
                    <>
                      <img 
                        src={
                          selectedAppointment.consultant_id.accountId?.photoUrl || 
                          (typeof selectedAppointment.consultant_id === 'object' && 'photoUrl' in selectedAppointment.consultant_id 
                            ? (selectedAppointment.consultant_id as { photoUrl?: string }).photoUrl 
                            : "/avarta.png")
                        } 
                        alt="avatar" 
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/avarta.png";
                        }}
                      />
                      <div className="font-medium">
                        <span className="font-medium text-gray-800">{selectedAppointment.consultant_id?.accountId?.fullName || 'Không xác định'}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500">?</span>
                      </div>
                      <div className="font-medium">Không xác định</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Time */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Thời gian:</span>
                <span className="font-medium text-gray-800">{`${formatDate(selectedAppointment.dateBooking)}, ${formatTime(selectedAppointment.dateBooking)}`}</span>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Trạng thái</div>
                <div className={`inline-block px-3 py-1 rounded-full ${getStatusInfo(selectedAppointment.status).bg} ${getStatusInfo(selectedAppointment.status).border}`}>
                  <span className={`font-medium ${getStatusInfo(selectedAppointment.status).color}`}>
                    {getStatusInfo(selectedAppointment.status).text}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Giá dịch vụ</div>
                <div className="font-medium text-lg text-sky-600">
                  {selectedAppointment.service_id?.price?.toLocaleString('vi-VN')}đ
                </div>
              </div>
              
              {selectedAppointment.reason && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Lý do tư vấn</div>
                  <div className="bg-sky-50 p-3 rounded-lg text-gray-700">{selectedAppointment.reason}</div>
                </div>
              )}
              
              {selectedAppointment.note && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Ghi chú</div>
                  <div className="bg-sky-50 p-3 rounded-lg text-gray-700">{selectedAppointment.note}</div>
                </div>
              )}

              {/* Feedback Section cho lịch hẹn đã hoàn thành */}
              {selectedAppointment.status === 'completed' && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-sky-600" />
                      Đánh giá dịch vụ
                    </h4>
                    {(() => {
                        const isCompleted = selectedAppointment.status === 'completed';
                        const hasFeedback = selectedAppointment.hasFeedback;
                        const completionDate = selectedAppointment.dateBooking ? new Date(selectedAppointment.dateBooking) : new Date();
                        const feedbackDeadline = new Date(completionDate);
                        feedbackDeadline.setDate(completionDate.getDate() + 7);
                        const isWithin7Days = new Date() < feedbackDeadline;
                        const canReview = isCompleted && !hasFeedback && isWithin7Days;

                        if (canReview) {
                          return (
                            <button
                              onClick={() => setShowFeedbackForm(true)}
                              className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-sky-600 hover:to-blue-600 transition-colors flex items-center gap-1"
                            >
                              <Star className="w-4 h-4" />
                              Đánh giá
                            </button>
                          );
                        }
                        return null;
                    })()}
                  </div>
                  
                  {loadingFeedbacks ? (
                    <div className="text-center py-4 text-gray-500">Đang tải đánh giá...</div>
                  ) : (
                    <FeedbackDisplay feedbacks={feedbacks} />
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Feedback Form */}
      {showFeedbackForm && selectedAppointment && (
        <FeedbackForm
          appointmentId={selectedAppointment._id}
          serviceId={selectedAppointment.service_id?._id || ''}
          accountId={localStorage.getItem('userId') || ''}
          serviceName={selectedAppointment.service_id?.name || 'Dịch vụ không xác định'}
          consultantName={
            selectedAppointment.consultant_id?.accountId?.fullName ||
            (typeof selectedAppointment.consultant_id === 'object' && 'fullName' in selectedAppointment.consultant_id
              ? (selectedAppointment.consultant_id as { fullName?: string }).fullName || ''
              : 'Chuyên gia không xác định')
          }
          onClose={() => setShowFeedbackForm(false)}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
