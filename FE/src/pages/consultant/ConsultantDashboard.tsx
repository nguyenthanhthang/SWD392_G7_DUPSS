import React, { useState } from 'react';
import { Calendar, Clock, Users, Activity, FileText, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConsultantDashboard = () => {
  // Dữ liệu mẫu cho lịch hẹn hôm nay
  const [todayAppointments, setTodayAppointments] = useState([
    {
      id: 1,
      time: "09:00 - 10:00",
      patientName: "Nguyễn Văn A",
      patientAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
      serviceType: "Tư vấn tâm lý cá nhân",
      status: "upcoming" // upcoming, ongoing, completed
    },
    {
      id: 2,
      time: "11:30 - 12:30",
      patientName: "Trần Thị B",
      patientAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
      serviceType: "Tư vấn gia đình",
      status: "upcoming"
    },
    {
      id: 3,
      time: "14:00 - 15:00",
      patientName: "Lê Văn C",
      patientAvatar: "https://randomuser.me/api/portraits/men/67.jpg",
      serviceType: "Tư vấn học đường",
      status: "upcoming"
    }
  ]);

  // Dữ liệu mẫu cho thống kê
  const stats = {
    todayAppointments: todayAppointments.length,
    totalPatients: 28,
    weeklyAppointments: 12,
    completedSessions: 45
  };

  // Hàm xử lý bắt đầu buổi tư vấn
  const handleStartSession = (appointmentId: number) => {
    // Trong thực tế, đây sẽ là API call để cập nhật trạng thái buổi tư vấn
    setTodayAppointments(prev => 
      prev.map(app => 
        app.id === appointmentId ? {...app, status: "ongoing"} : app
      )
    );
    // Sau đó có thể chuyển hướng đến trang tư vấn hoặc mở Google Meet
  };

  // Hàm lấy màu dựa trên trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ongoing':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'completed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Xin chào, Bác sĩ!</h1>
          <p className="text-gray-600 mt-2">Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Lịch hẹn hôm nay</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.todayAppointments}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng số bệnh nhân</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalPatients}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Lịch hẹn tuần này</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.weeklyAppointments}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Buổi tư vấn đã hoàn thành</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.completedSessions}</h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Lịch hẹn hôm nay</h2>
                <Link to="/consultants/schedule" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                  Xem tất cả lịch
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="p-6">
                {todayAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {todayAppointments.map((appointment) => (
                      <div 
                        key={appointment.id} 
                        className={`border rounded-lg p-4 ${getStatusColor(appointment.status)}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="bg-blue-100 rounded-full p-2">
                              <Clock className="w-5 h-5 text-blue-700" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{appointment.time}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <img 
                              src={appointment.patientAvatar} 
                              alt={appointment.patientName} 
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{appointment.patientName}</p>
                              <p className="text-sm text-gray-600">{appointment.serviceType}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleStartSession(appointment.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                              appointment.status === 'ongoing' 
                                ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                            disabled={appointment.status === 'ongoing'}
                          >
                            {getButtonText(appointment.status)}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không có lịch hẹn nào hôm nay</h3>
                    <p className="text-gray-600 mb-4">
                      Bạn không có lịch hẹn nào hôm nay. Bạn có thể kiểm tra lịch trong tuần tại 
                      <Link to="/consultants/schedule" className="text-blue-600 hover:text-blue-800 font-medium mx-1">
                        Calendar
                      </Link>.
                    </p>
                    <Link 
                      to="/consultants/schedule" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
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
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-800">Thao tác nhanh</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <Link 
                  to="/consultants/schedule"
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Quản lý lịch</h3>
                    <p className="text-sm text-gray-600">Xem và cập nhật lịch tư vấn</p>
                  </div>
                </Link>

                <Link 
                  to="/consultants/patients"
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
                >
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Quản lý bệnh nhân</h3>
                    <p className="text-sm text-gray-600">Xem danh sách và hồ sơ bệnh nhân</p>
                  </div>
                </Link>

                <Link 
                  to="/consultants/reports"
                  className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                >
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Báo cáo & cập nhật</h3>
                    <p className="text-sm text-gray-600">Xem báo cáo hoạt động</p>
                  </div>
                </Link>
              </div>

              {/* Upcoming week preview */}
              <div className="border-t border-gray-200 px-6 py-4">
                <h3 className="text-base font-medium text-gray-800 mb-3">Lịch tuần tới</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Thứ Hai</span>
                    <span className="font-medium text-gray-900">3 lịch hẹn</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Thứ Ba</span>
                    <span className="font-medium text-gray-900">2 lịch hẹn</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Thứ Tư</span>
                    <span className="font-medium text-gray-900">4 lịch hẹn</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Thứ Năm</span>
                    <span className="font-medium text-gray-900">1 lịch hẹn</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Thứ Sáu</span>
                    <span className="font-medium text-gray-900">2 lịch hẹn</span>
                  </div>
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
