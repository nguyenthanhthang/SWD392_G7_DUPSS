import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Activity, FileText, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getAccountByIdApi, getAppointmentByConsultantIdApi, getConsultantByAccountIdApi, getSlotTimeByConsultantIdApi } from '../../api';

interface ApiAppointment {
  _id: string;
  slotTime_id: string;
  user_id: {
    _id: string;
    fullName: string;
    photoUrl?: string;
  };
  service_id: {
    name: string;
  } | null;
  dateBooking: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'noshow';
}

interface SlotTime {
  _id: string;
  consultant_id: string;
  start_time: string;
  end_time: string;
  status: "available" | "booked" | "cancelled" | "deleted";
}

interface TodayAppointment {
  id: string;
  time: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  serviceType: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'noshow';
}

const ConsultantDashboard = () => {
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [slotTimes, setSlotTimes] = useState<SlotTime[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    weeklyAppointments: 0,
    completedSessions: 0
  });
  const [nextWeekSchedule, setNextWeekSchedule] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Dữ liệu mẫu cho thống kê
  const [user, setUser] = useState<{ photoUrl?: string, _id?: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConsultantData = async () => {
      setLoading(true);
      const accountId = localStorage.getItem('userId');
      if (accountId) {
        try {
          const account = await getAccountByIdApi(accountId);
          setUser(account);

          const consultantRes = await getConsultantByAccountIdApi(accountId);
          if (consultantRes?._id) {
            const appointmentData = await getAppointmentByConsultantIdApi(consultantRes._id);
            setAppointments(appointmentData);
            const slotTimeData = await getSlotTimeByConsultantIdApi(consultantRes._id);
            setSlotTimes(slotTimeData);
          }
        } catch {
          setAppointments([]); // Reset on error
          setSlotTimes([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchConsultantData();
  }, []);

  useEffect(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todays = appointments.filter(app => {
      const appDate = new Date(app.dateBooking);
      const isToday = appDate >= todayStart && appDate <= todayEnd;
      const isValidStatus = app.status === 'confirmed' || app.status === 'completed';
      return isToday && isValidStatus;
    });

    const formattedTodayAppointments = todays.map(app => {
      const startTime = new Date(app.dateBooking);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

      return {
        id: app._id,
        patientId: app.user_id._id,
        time: `${startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
        patientName: app.user_id.fullName,
        patientAvatar: app.user_id.photoUrl || `https://ui-avatars.com/api/?name=${app.user_id.fullName}`,
        serviceType: app.service_id ? app.service_id.name : 'Dịch vụ không xác định',
        status: (app.status === 'confirmed' ? 'upcoming' : app.status) as TodayAppointment['status'],
      };
    });
    setTodayAppointments(formattedTodayAppointments);

    // Calculate stats
    const todayCount = todays.length;

    const dayOfWeek = now.getDay();
    const firstDayOfWeek = new Date(now);
    firstDayOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    firstDayOfWeek.setHours(0, 0, 0, 0);

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);

    const weeklySlotCount = slotTimes.filter(slot => {
      const slotDate = new Date(slot.start_time);
      return slotDate >= firstDayOfWeek && slotDate <= lastDayOfWeek;
    }).length;

    // Chỉ tính những bệnh nhân có appointments với status hợp lệ
    const validAppointments = appointments.filter(app => 
      app.status === 'confirmed' || app.status === 'completed'
    );
    const patientIds = new Set(validAppointments.map(app => app.user_id._id));
    const totalPatientsCount = patientIds.size;

    const completedCount = appointments.filter(app => app.status === 'completed').length;

    setStats({
      todayAppointments: todayCount,
      totalPatients: totalPatientsCount,
      weeklyAppointments: weeklySlotCount,
      completedSessions: completedCount,
    });

    // Calculate next week's schedule
    const today = new Date();
    const currentDay = today.getDay(); // 0=Sun, 1=Mon...
    const daysToAddForNextMonday = currentDay === 0 ? 1 : 8 - currentDay;
    const nextMonday = new Date(today.getTime());
    nextMonday.setDate(today.getDate() + daysToAddForNextMonday);
    nextMonday.setHours(0, 0, 0, 0);

    const nextSunday = new Date(nextMonday.getTime());
    nextSunday.setDate(nextMonday.getDate() + 6);
    nextSunday.setHours(23, 59, 59, 999);

    const nextWeekAppointments = appointments.filter(app => {
      const appDate = new Date(app.dateBooking);
      const isNextWeek = appDate >= nextMonday && appDate <= nextSunday;
      const isValidStatus = app.status === 'confirmed' || app.status === 'completed';
      return isNextWeek && isValidStatus;
    });

    const weekDays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const initialCounts: Record<string, number> = {
      "Thứ Hai": 0,
      "Thứ Ba": 0,
      "Thứ Tư": 0,
      "Thứ Năm": 0,
      "Thứ Sáu": 0,
      "Thứ Bảy": 0,
      "Chủ Nhật": 0,
    };

    const nextWeekCounts = nextWeekAppointments.reduce((acc, app) => {
      const dayName = weekDays[new Date(app.dateBooking).getDay()];
      if (dayName in acc) {
        acc[dayName]++;
      }
      return acc;
    }, initialCounts);

    setNextWeekSchedule(nextWeekCounts);

  }, [appointments, slotTimes]);

  // Hàm xử lý bắt đầu buổi tư vấn
  const handleStartSession = (appointmentId: string) => {
    navigate(`/consultants/reports/${appointmentId}`);
  };

  // Hàm lấy màu dựa trên trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-[#E3EAFD] text-[#283593] border-[#DBE8FA]';
      case 'ongoing':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-[#E3EAFD] text-[#283593] border-[#DBE8FA]';
    }
  };

  // Hàm lấy text nút dựa trên trạng thái
  const getButtonText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Bắt đầu buổi tư vấn';
      case 'ongoing':
        return 'Đang diễn ra';
      case 'completed':
        return 'Xem chi tiết';
      default:
        return 'Bắt đầu buổi tư vấn';
    }
  };

  const weekDayOrder = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold text-[#283593]">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Sidebar/Menu dọc trái (nếu có) */}
        <div className="fixed left-0 top-0 h-full flex flex-col items-center py-6 px-2 bg-gradient-to-b from-[#e3eafd] to-[#dbe8fa] z-20">
          {/* Các nút menu ở đây ... */}
          {/* Avatar ở cuối menu */}
          <div className="mt-auto mb-2">
            <img
              src={user?.photoUrl || 'https://i.pravatar.cc/150?img=3'}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
          </div>
        </div>

        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#283593]">Xin chào, Bác sĩ!</h1>
          <p className="text-gray-600 mt-2">Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow border border-[#DBE8FA]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Lịch hẹn hôm nay</p>
                <h3 className="text-2xl font-bold text-[#283593]">{stats.todayAppointments}</h3>
              </div>
              <div className="bg-[#DBE8FA] p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-[#283593]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow border border-[#DBE8FA]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng số bệnh nhân</p>
                <h3 className="text-2xl font-bold text-[#283593]">{stats.totalPatients}</h3>
              </div>
              <div className="bg-[#DBE8FA] p-3 rounded-lg">
                <Users className="w-6 h-6 text-[#283593]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow border border-[#DBE8FA]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Lịch làm tuần này</p>
                <h3 className="text-2xl font-bold text-[#283593]">{stats.weeklyAppointments}</h3>
              </div>
              <div className="bg-[#DBE8FA] p-3 rounded-lg">
                <Activity className="w-6 h-6 text-[#283593]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow border border-[#DBE8FA]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Buổi tư vấn đã hoàn thành</p>
                <h3 className="text-2xl font-bold text-[#283593]">{stats.completedSessions}</h3>
              </div>
              <div className="bg-[#DBE8FA] p-3 rounded-lg">
                <FileText className="w-6 h-6 text-[#283593]" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow border border-[#DBE8FA] overflow-hidden">
              <div className="border-b border-[#DBE8FA] px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#283593]">Lịch hẹn hôm nay</h2>
                <Link to="/consultants/schedule" className="text-[#283593] hover:underline text-sm font-medium flex items-center">
                  Xem tất cả lịch
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="p-6">
                {todayAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {todayAppointments.map(appointment => (
                      <div 
                        key={appointment.id} 
                        className={`border rounded-lg p-4 ${getStatusColor(appointment.status)} shadow-sm`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                          {/* -- Section 1: Time -- */}
                          <div className="flex items-center gap-4 w-full sm:w-40 flex-shrink-0">
                            <div className="bg-[#DBE8FA] rounded-full p-2">
                              <Clock className="w-5 h-5 text-[#283593]" />
                            </div>
                            <div>
                              <p className="font-medium text-[#283593]">{appointment.time}</p>
                            </div>
                          </div>

                          {/* -- Section 2: Patient Info -- */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <img 
                              src={appointment.patientAvatar} 
                              alt={appointment.patientName} 
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-[#283593] truncate">{appointment.patientName}</p>
                              <p className="text-sm text-gray-500 truncate">{appointment.serviceType}</p>
                            </div>
                          </div>
                          
                          {/* -- Section 3: Action Button -- */}
                          <div className="w-full sm:w-auto">
                            <button
                              onClick={() => handleStartSession(appointment.id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full sm:w-auto whitespace-nowrap ${
                                appointment.status === 'ongoing' 
                                  ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                                  : 'bg-[#283593] text-white hover:bg-[#3a4bb3]'
                              }`}
                              disabled={appointment.status === 'ongoing'}
                            >
                              {getButtonText(appointment.status)}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="mx-auto w-16 h-16 bg-[#DBE8FA] rounded-full flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 text-[#283593]" />
                    </div>
                    <h3 className="text-lg font-medium text-[#283593] mb-2">Không có lịch hẹn nào hôm nay</h3>
                    <p className="text-gray-500 mb-4">
                      Bạn không có lịch hẹn nào hôm nay. Bạn có thể kiểm tra lịch trong tuần tại 
                      <Link to="/consultants/schedule" className="text-[#283593] hover:underline font-medium mx-1">
                        Calendar
                      </Link>.
                    </p>
                    <Link 
                      to="/consultants/schedule" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#283593] hover:bg-[#3a4bb3]"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Xem lịch tuần
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Reminders */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow border border-[#DBE8FA] overflow-hidden">
              <div className="border-b border-[#DBE8FA] px-6 py-4">
                <h2 className="text-xl font-semibold text-[#283593]">Thao tác nhanh</h2>
              </div>
              <div className="p-6 space-y-4">
                <Link 
                  to="/consultants/schedule"
                  className="flex items-center p-4 bg-[#DBE8FA] rounded-lg hover:bg-[#E3EAFD] transition"
                >
                  <div className="bg-white p-3 rounded-lg mr-4 border border-[#DBE8FA]">
                    <Calendar className="w-6 h-6 text-[#283593]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#283593]">Quản lý lịch</h3>
                    <p className="text-sm text-gray-500">Xem và cập nhật lịch tư vấn</p>
                  </div>
                </Link>

                <Link 
                  to="/consultants/reports"
                  className="flex items-center p-4 bg-[#DBE8FA] rounded-lg hover:bg-[#E3EAFD] transition"
                >
                  <div className="bg-white p-3 rounded-lg mr-4 border border-[#DBE8FA]">
                    <FileText className="w-6 h-6 text-[#283593]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#283593]">Báo cáo & cập nhật</h3>
                    <p className="text-sm text-gray-500">Xem báo cáo hoạt động</p>
                  </div>
                </Link>
              </div>

              {/* Upcoming week preview */}
              <div className="border-t border-gray-200 px-6 py-4">
                <h3 className="text-base font-medium text-gray-800 mb-3">Lịch tuần tới</h3>
                <div className="space-y-2">
                  {weekDayOrder.map(day => (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{day}</span>
                      <span className="font-medium text-gray-900">{nextWeekSchedule[day] || 0} lịch hẹn</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantDashboard;
