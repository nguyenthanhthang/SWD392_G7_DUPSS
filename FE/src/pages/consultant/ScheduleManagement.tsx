import React, { useState } from "react";
import { Clock, ChevronLeft, ChevronRight, MoreHorizontal, Plus } from 'lucide-react';

// Dữ liệu mẫu cho bệnh nhân
const patientData = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    appointmentType: "Khám định kỳ",
    time: "09:00 - 09:30",
    status: "đang tiến hành",
    room: "Phòng 101"
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    appointmentType: "Khám trực tuyến",
    time: "10:00 - 10:30",
    status: "chờ khám",
    room: "Trực tuyến"
  },
  {
    id: 3,
    name: "Lê Văn C",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    appointmentType: "Khám khẩn cấp",
    time: "11:00 - 11:30",
    status: "hoàn thành",
    room: "Phòng 102"
  },
  {
    id: 4,
    name: "Phạm Thị D",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    appointmentType: "Theo dõi sức khỏe",
    time: "13:00 - 13:30",
    status: "chờ khám",
    room: "Phòng 103"
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    appointmentType: "Chẩn đoán xét nghiệm",
    time: "14:00 - 14:30",
    status: "chờ khám",
    room: "Phòng xét nghiệm"
  },
  {
    id: 6,
    name: "Ngô Thị F",
    avatar: "https://randomuser.me/api/portraits/women/70.jpg",
    appointmentType: "Khám trực tuyến",
    time: "15:00 - 15:30",
    status: "chờ khám",
    room: "Trực tuyến"
  }
];

// Tạo dữ liệu cho các ngày trong tuần
const daysOfWeek = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
const currentDate = new Date();

// Tạo dữ liệu cho 4 tuần (2 tuần hiện tại và 2 tuần kế tiếp)
const generateWeekData = (startOffset = 0) => {
  const result = [];
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() + startOffset * 7);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() - startDate.getDay() + i + 1);
    
    // Phân bố ngẫu nhiên các cuộc hẹn cho mỗi ngày
    const appointments = patientData
      .filter(() => Math.random() > 0.5) // Chọn ngẫu nhiên các bệnh nhân
      .map(patient => ({
        ...patient,
        id: `${patient.id}-${date.getDate()}`
      }));
    
    result.push({
      dayName: daysOfWeek[i],
      date: date,
      dateString: `${date.getDate()}/${date.getMonth() + 1}`,
      appointments
    });
  }
  
  return result;
};

const weekData = [
  { weekName: "Tuần này", days: generateWeekData(0) },
  { weekName: "Tuần sau", days: generateWeekData(1) },
  { weekName: "Tuần sau nữa", days: generateWeekData(2) },
  { weekName: "Tuần sau nữa", days: generateWeekData(3) }
];

function getHourFromTimeString(timeStr: string) {
  // timeStr dạng "09:00 - 09:30"
  const match = timeStr.match(/^(\d{2}):(\d{2})/);
  if (!match) return 0;
  return parseInt(match[1], 10);
}

const shiftOptions = [
  { label: 'Ca sáng', value: 'morning' },
  { label: 'Ca chiều', value: 'afternoon' }
];

// Component chính
export default function ScheduleManagement() {
  const [weekIndex, setWeekIndex] = useState(0);
  const [shift, setShift] = useState<'morning' | 'afternoon'>('morning');
  const statusOptions = ['Tất cả', 'đang tiến hành', 'chờ khám', 'hoàn thành'];
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');

  return (
    <div className="min-h-screen bg-[#F7F9FB] px-0 md:px-8 py-0 md:py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-0">
        <div className="flex items-center justify-between pt-8 pb-2">
          <div>
            <h1 className="text-3xl font-bold text-[#283593] mb-1">Lịch khám bệnh nhân</h1>
            <p className="text-base text-gray-500">Xem và quản lý lịch hẹn khám bệnh</p>
          </div>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-xl font-medium flex items-center gap-2 shadow hover:bg-blue-700 transition-all duration-200">
            <Plus size={18} /> Thêm ca làm
          </button>
        </div>
        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap items-center gap-4 mb-6">
          <select className="px-4 py-2 rounded-lg border border-gray-200 text-[#283593] bg-white" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            {statusOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="flex-1"></div>
          <div className="flex gap-1">
            {shiftOptions.map(opt => (
              <button
                key={opt.value}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-150
                  ${shift === opt.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-[#283593]'}
                  focus:outline-none`}
                onClick={() => setShift(opt.value as 'morning' | 'afternoon')}
              >
                {opt.label}
              </button>
            ))}
          </div>

        </div>
        {/* Schedule Grid */}
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <div className="flex items-center px-6 pt-6 pb-2 justify-between">
            <div>
              <span className="font-semibold text-[#283593]">{weekData[weekIndex].weekName}</span>
              <span className="ml-2 text-gray-400 text-sm">({weekData[weekIndex].days[0].dateString} - {weekData[weekIndex].days[6].dateString})</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setWeekIndex(weekIndex === 0 ? 1 : 0)} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft size={22} className="text-[#283593]" />
              </button>
              <button onClick={() => setWeekIndex(weekIndex === 1 ? 0 : 1)} className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight size={22} className="text-[#283593]" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-t border-gray-100">
            {weekData[weekIndex].days.map((day, idx) => (
              <div key={idx} className="min-h-[120px] border-r border-gray-100 last:border-r-0 px-2 py-2">
                <div className="text-center mb-2">
                  <div className="font-medium text-[#283593]">{day.dayName}</div>
                  <div className="text-xs text-gray-400">{day.dateString}</div>
                </div>
                <div className="flex flex-col gap-3">
                  {(() => {
                    // Lọc theo ca sáng/chiều và status
                    const filtered = day.appointments.filter(app => {
                      const hour = getHourFromTimeString(app.time);
                      if (shift === 'morning' && !(hour >= 8 && hour < 12)) return false;
                      if (shift === 'afternoon' && !(hour >= 13 && hour < 17)) return false;
                      if (selectedStatus !== 'Tất cả' && app.status !== selectedStatus) return false;
                      return true;
                    });
                    if (filtered.length === 0) {
                      return <div className="text-gray-300 text-center text-sm min-h-[80px] flex items-center justify-center">Không có lịch hẹn</div>;
                    }
                    return filtered.map((appointment) => (
                      <div key={appointment.id} className={`rounded-xl p-3 shadow-sm border border-gray-100 bg-${
                        appointment.appointmentType === "Khám khẩn cấp" ? "red-50" :
                        appointment.appointmentType === "Khám trực tuyến" ? "blue-50" :
                        appointment.status === "đang tiến hành" ? "yellow-50" :
                        appointment.status === "hoàn thành" ? "green-50" : "yellow-50"
                      } flex flex-col gap-2 relative`}> 
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1 text-[#283593] text-sm font-medium">
                            <Clock size={16} className="mr-1 text-gray-400" />
                            <span>{appointment.time}</span>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                        <div className="flex items-center mb-1">
                          <img src={appointment.avatar} alt={appointment.name} className="w-8 h-8 rounded-full mr-2 border-2 border-white" />
                          <div className="min-w-0">
                            <div className="font-medium text-[#283593] truncate max-w-[120px]">{appointment.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[100px]">{appointment.room}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 truncate max-w-[90px] whitespace-nowrap overflow-hidden`}>
                            {appointment.appointmentType}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 truncate max-w-[90px] whitespace-nowrap overflow-hidden`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
