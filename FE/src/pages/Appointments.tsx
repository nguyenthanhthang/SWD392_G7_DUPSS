import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Search, Eye, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppointmentsPage = () => {
  const navigate = useNavigate();
  type Appointment = { 
    id: number; 
    consultant: string;
    specialty: string;
    date: string;
    time: string;
    duration: string;
    status: 'confirmed' | 'completed' | 'cancelled';
    type: string;
    location: string;
    avatar: string;
    notes: string;
  };
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Mock data
  const appointments: Appointment[] = [
    {
      id: 1,
      consultant: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: '2025-06-08',
      time: '09:00',
      duration: '30 min',
      status: 'confirmed',
      type: 'Video Call',
      location: 'Online',
      avatar: '👩‍⚕️',
      notes: 'Regular checkup for heart condition'
    },
    {
      id: 2,
      consultant: 'Dr. Michael Chen',
      specialty: 'Dermatology',
      date: '2025-06-10',
      time: '14:30',
      duration: '45 min',
      status: 'completed',
      type: 'In-person',
      location: 'Room 205, Medical Center',
      avatar: '👨‍⚕️',
      notes: 'Skin examination and treatment consultation'
    },
    {
      id: 3,
      consultant: 'Dr. Emily Rodriguez',
      specialty: 'Psychology',
      date: '2025-06-05',
      time: '11:00',
      duration: '60 min',
      status: 'completed',
      type: 'Video Call',
      location: 'Online',
      avatar: '👩‍⚕️',
      notes: 'Therapy session - anxiety management'
    },
    {
      id: 4,
      consultant: 'Dr. James Wilson',
      specialty: 'Orthopedics',
      date: '2025-06-12',
      time: '16:00',
      duration: '30 min',
      status: 'cancelled',
      type: 'In-person',
      location: 'Room 301, Medical Center',
      avatar: '👨‍⚕️',
      notes: 'Follow-up for knee injury'
    }
  ];

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesSearch = apt.consultant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: 'confirmed' | 'completed' | 'cancelled') => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: 'confirmed' | 'completed' | 'cancelled') => {
    switch(status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gray-50 w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600 mt-1">Manage your medical consultations</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Book New Appointment
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <button
            type="button"
            onClick={() => setFilterStatus('confirmed')}
            className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center transition-all focus:outline-none ${filterStatus === 'confirmed' ? 'ring-2 ring-green-400 border-green-300' : ''}`}
          >
            <div className="p-2 bg-green-100 rounded-lg mb-1 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-base text-gray-600 mb-0.5">Confirmed</p>
            <p className="text-2xl font-bold text-gray-900">8</p>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('completed')}
            className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center transition-all focus:outline-none ${filterStatus === 'completed' ? 'ring-2 ring-blue-400 border-blue-300' : ''}`}
          >
            <div className="p-2 bg-blue-100 rounded-lg mb-1 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-base text-gray-600 mb-0.5">Completed</p>
            <p className="text-2xl font-bold text-gray-900">2</p>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('cancelled')}
            className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center transition-all focus:outline-none ${filterStatus === 'cancelled' ? 'ring-2 ring-red-400 border-red-300' : ''}`}
          >
            <div className="p-2 bg-red-100 rounded-lg mb-1 flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-base text-gray-600 mb-0.5">Cancelled</p>
            <p className="text-2xl font-bold text-gray-900">1</p>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by doctor or specialty..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Filter */}
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="upcoming">Upcoming</option>
            </select>

        
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Appointments ({filteredAppointments.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/appointments/${appointment.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                      {appointment.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.consultant}</h3>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="flex items-center text-gray-900 font-medium">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(appointment.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <Clock className="w-4 h-4 mr-2" />
                        {appointment.time} ({appointment.duration})
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        {appointment.type}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 max-w-32 truncate">
                        {appointment.location}
                      </p>
                    </div>

                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1.5 capitalize">{appointment.status}</span>
                      {appointment.status === 'confirmed' && (
                        <button
                          className="ml-3 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold border border-red-200 hover:bg-red-200 transition-colors"
                          onClick={e => {
                            e.stopPropagation();
                            setShowCancelModal(true);
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-3 ml-16">
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <strong>Notes:</strong> {appointment.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Book Your First Appointment
            </button>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Appointment Actions</h3>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center">
                <Eye className="w-5 h-5 mr-3 text-gray-400" />
                View Details
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                Reschedule
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg flex items-center text-red-600">
                <X className="w-5 h-5 mr-3" />
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận hủy lịch hẹn */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Xác nhận hủy lịch hẹn</h3>
            <p className="mb-6 text-gray-700">Bạn có chắc chắn muốn hủy lịch hẹn này không?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
                onClick={() => setShowCancelModal(false)}
              >
                Đóng
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
                onClick={() => {
                  setShowCancelModal(false);
                  setShowSuccessModal(true);
                  setTimeout(() => setShowSuccessModal(false), 1500);
                }}
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thông báo đã hủy thành công */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
            <svg className="w-12 h-12 text-green-500 mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Đã hủy lịch hẹn thành công!</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
