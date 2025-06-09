import React, { useEffect, useState } from 'react';
import { getSlotTimeByConsultantIdApi, createSlotTimeApi, updateSlotTimeApi, updateStatusSlotTimeApi, deleteSlotTimeApi } from '../../api';
import { addDays, startOfWeek, endOfWeek, format, isWithinInterval, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
];

const weekDayNames = {
  'Mon': 'Thứ Hai',
  'Tue': 'Thứ Ba',
  'Wed': 'Thứ Tư',
  'Thu': 'Thứ Năm',
  'Fri': 'Thứ Sáu',
  'Sat': 'Thứ Bảy',
  'Sun': 'Chủ Nhật'
};

interface SlotTime {
  _id: string;
  consultant_id: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface ConsultantScheduleModalProps {
  consultantId: string;
  open: boolean;
  onClose: () => void;
}

const ConsultantScheduleModal: React.FC<ConsultantScheduleModalProps> = ({ consultantId, open, onClose }) => {
  const [slotTimes, setSlotTimes] = useState<SlotTime[]>([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string; slot?: SlotTime } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState('available');

  const today = new Date();
  const weekStart = startOfWeek(addDays(today, currentWeek * 7), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(addDays(today, currentWeek * 7), { weekStartsOn: 1 });

  useEffect(() => {
    if (open) fetchSlotTimes();
    // eslint-disable-next-line
  }, [consultantId, open, currentWeek]);

  const fetchSlotTimes = async () => {
    setLoading(true);
    try {
      const data = await getSlotTimeByConsultantIdApi(consultantId);
      setSlotTimes(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setSlotTimes([]);
      setError('Không thể tải lịch làm việc.');
      toast.error('Không thể tải lịch làm việc!');
    } finally {
      setLoading(false);
    }
  };

  const slotTimesOfWeek = slotTimes.filter(st => {
    const d = parseISO(st.start_time);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });

  const handleSlotClick = (day: string, time: string) => {
    // Kiểm tra slot đã có chưa
    const slotObj = slotTimesOfWeek.find(st => {
      let dayOfWeek, hour;
      try {
        dayOfWeek = format(parseISO(st.start_time), 'EEE');
        hour = format(parseISO(st.start_time), 'HH:00');
      } catch {
        const d = new Date(st.start_time);
        dayOfWeek = format(d, 'EEE');
        hour = format(d, 'HH:00');
      }
      return dayOfWeek === day && hour === time;
    });
    
    // Nếu là slot đã được đặt thì không cho phép sửa
    if (slotObj && slotObj.status === 'booked') {
      toast.info('Không thể chỉnh sửa ca làm việc đã được đặt!');
      return;
    }
    
    if (slotObj) {
      setSelectedSlot({ day, time, slot: slotObj });
      setEditMode(true);
      setStatus(slotObj.status);
    } else {
      setSelectedSlot({ day, time });
      setEditMode(false);
      setStatus('available');
    }
  };

  const handleSave = async () => {
    if (!selectedSlot) return;
    const dayIdx = weekDays.indexOf(selectedSlot.day);
    const slotHour = parseInt(selectedSlot.time.split(':')[0], 10);
    const start = addDays(weekStart, dayIdx);
    start.setHours(slotHour, 0, 0, 0);
    const end = addDays(weekStart, dayIdx);
    end.setHours(slotHour + 1, 0, 0, 0);
    try {
      if (editMode && selectedSlot.slot) {
        await updateSlotTimeApi(selectedSlot.slot._id, {
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        });
        // Mặc định status vẫn giữ nguyên giá trị cũ
        toast.success('Cập nhật ca làm việc thành công!');
      } else {
        await createSlotTimeApi({
          consultant_id: consultantId,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          status: 'available', // Mặc định trạng thái là có sẵn
        });
        toast.success('Tạo ca làm việc thành công!');
      }
      await fetchSlotTimes();
      setSelectedSlot(null);
    } catch {
      toast.error('Có lỗi khi lưu ca làm việc!');
    }
  };

  const handleDelete = async () => {
    if (editMode && selectedSlot?.slot) {
      try {
        await deleteSlotTimeApi(selectedSlot.slot._id);
        await fetchSlotTimes();
        setSelectedSlot(null);
        toast.success('Xóa ca làm việc thành công!');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Không thể xóa ca làm việc này');
      }
    }
  };

  // Thêm nhiều slot cùng lúc
  const handleBulkCreate = async () => {
    try {
      // Tạo các slot thời gian cho cả tuần hiện tại
      const bulkSlots = [];
      for (let dayIdx = 0; dayIdx < weekDays.length; dayIdx++) {
        // Chỉ tạo slot cho ngày thường (Thứ 2 đến Thứ 6)
        if (dayIdx < 5) {
          for (let timeIdx = 0; timeIdx < timeSlots.length; timeIdx++) {
            // Chỉ tạo slot trong giờ làm việc (8h-12h, 13h-17h)
            const hour = parseInt(timeSlots[timeIdx].split(':')[0], 10);
            if ((hour >= 8 && hour < 12) || (hour >= 13 && hour < 17)) {
              const start = addDays(weekStart, dayIdx);
              start.setHours(hour, 0, 0, 0);
              const end = new Date(start);
              end.setHours(hour + 1, 0, 0, 0);
              
              // Kiểm tra xem slot này đã tồn tại chưa
              const slotExists = slotTimesOfWeek.some(st => {
                try {
                  const slotDay = format(parseISO(st.start_time), 'EEE');
                  const slotHour = format(parseISO(st.start_time), 'HH:00');
                  return slotDay === weekDays[dayIdx] && slotHour === timeSlots[timeIdx];
                } catch {
                  return false;
                }
              });
              
              // Chỉ thêm vào danh sách nếu slot chưa tồn tại
              if (!slotExists) {
                bulkSlots.push({
                  consultant_id: consultantId,
                  start_time: start.toISOString(),
                  end_time: end.toISOString(),
                  status: 'available',
                });
              }
            }
          }
        }
      }

      // Tạo nhiều slot cùng lúc
      const promises = bulkSlots.map(slot => createSlotTimeApi(slot));
      await Promise.all(promises);
      
      toast.success('Đã tạo lịch làm việc cho tuần này!');
      await fetchSlotTimes();
    } catch (error) {
      console.error('Error creating bulk slots:', error);
      toast.error('Có lỗi khi tạo lịch làm việc hàng loạt!');
    }
  };

  const handleClearWeek = async () => {
    try {
      const confirmClear = window.confirm('Bạn có chắc muốn xóa tất cả lịch làm việc trong tuần này không?');
      if (!confirmClear) return;

      const deletePromises = slotTimesOfWeek
        .filter(slot => slot.status !== 'booked') // Không xóa các slot đã được đặt
        .map(slot => deleteSlotTimeApi(slot._id));
      
      await Promise.all(deletePromises);
      toast.success('Đã xóa lịch làm việc tuần này!');
      await fetchSlotTimes();
    } catch (error) {
      console.error('Error clearing week slots:', error);
      toast.error('Có lỗi khi xóa lịch làm việc!');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-5xl shadow-xl relative max-h-[90vh] overflow-auto">
        <button 
          className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 text-2xl" 
          onClick={onClose}
        >
          &times;
        </button>
        <h4 className="text-xl font-bold text-blue-700 mb-4">Quản lý lịch làm việc</h4>
        
        <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => setCurrentWeek(w => w - 1)}
            >
              &larr; Tuần trước
            </button>
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={() => setCurrentWeek(0)}
            >
              Tuần hiện tại
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => setCurrentWeek(w => w + 1)}
            >
              Tuần sau &rarr;
            </button>
          </div>
          
          <span className="font-semibold text-blue-600">
            {format(weekStart, 'dd/MM/yyyy')} - {format(weekEnd, 'dd/MM/yyyy')}
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
              onClick={handleBulkCreate}
            >
              Tạo lịch làm việc
            </button>
            <button
              className="px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              onClick={handleClearWeek}
            >
              Xóa tuần này
            </button>
          </div>
        </div>

        <div className="bg-blue-50 p-2 rounded-lg mb-4 text-sm text-blue-700">
          <p>
            <span className="font-semibold">Hướng dẫn:</span> Nhấp vào ô trống để tạo ca làm việc mới, nhấp vào ca đã tạo để chỉnh sửa.
            Ca màu đỏ đã được đặt và không thể xóa.
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Đang tải lịch làm việc...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8 bg-red-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <div className="grid grid-cols-8 border-b">
              <div className="py-3 px-2 bg-gray-50 font-medium text-gray-500 text-center"></div>
              {weekDays.map(day => (
                <div key={day} className="py-3 px-2 bg-gray-50 font-medium text-gray-700 text-center">
                  <div>{weekDayNames[day as keyof typeof weekDayNames]}</div>
                  <div className="text-xs text-gray-500">
                    {format(addDays(weekStart, weekDays.indexOf(day)), 'dd/MM')}
                  </div>
                </div>
              ))}
            </div>
            {timeSlots.map(slot => (
              <div key={slot} className="grid grid-cols-8 border-b last:border-b-0">
                <div className="py-3 px-2 bg-gray-50 font-medium text-gray-500 text-center flex items-center justify-center">
                  {slot} - {parseInt(slot) + 1}:00
                </div>
                {weekDays.map(day => {
                  const slotObj = slotTimesOfWeek.find(st => {
                    let dayOfWeek, hour;
                    try {
                      dayOfWeek = format(parseISO(st.start_time), 'EEE');
                      hour = format(parseISO(st.start_time), 'HH:00');
                    } catch {
                      const d = new Date(st.start_time);
                      dayOfWeek = format(d, 'EEE');
                      hour = format(d, 'HH:00');
                    }
                    return dayOfWeek === day && hour === slot;
                  });
                  const isBooked = slotObj?.status === 'booked';
                  const isAvailable = slotObj?.status === 'available';
                  
                  return (
                    <button
                      key={day + slot}
                      className={`h-14 w-full flex items-center justify-center transition-all focus:outline-none
                        ${isBooked 
                          ? 'bg-red-100 text-red-700 cursor-not-allowed' 
                          : isAvailable
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-white hover:bg-blue-50 hover:text-blue-600'
                        }
                      `}
                      onClick={() => handleSlotClick(day, slot)}
                      disabled={isBooked}
                    >
                      {isBooked ? (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Đã đặt
                        </span>
                      ) : isAvailable ? (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Có sẵn
                        </span>
                      ) : (
                        <span className="text-gray-400">+</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
        
        {/* Modal chỉnh sửa slot */}
        {selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-xs shadow-xl relative">
              <button 
                className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 text-2xl" 
                onClick={() => setSelectedSlot(null)}
              >
                &times;
              </button>
              <h5 className="text-lg font-bold mb-2">
                {editMode ? 'Chỉnh sửa' : 'Tạo'} ca làm việc
              </h5>
              <div className="mb-4 text-gray-700">
                <div className="font-medium">
                  {weekDayNames[selectedSlot.day as keyof typeof weekDayNames]}
                </div>
                <div className="text-blue-600 font-medium text-lg">
                  {selectedSlot.time} - {parseInt(selectedSlot.time) + 1}:00
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {format(
                    addDays(weekStart, weekDays.indexOf(selectedSlot.day)),
                    'dd/MM/yyyy'
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {editMode && (
                  <button 
                    onClick={handleDelete} 
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  >
                    Xóa
                  </button>
                )}
                <button 
                  onClick={handleSave} 
                  className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantScheduleModal; 