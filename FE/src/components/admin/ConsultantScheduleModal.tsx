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
  }, [consultantId, open]);

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
        await updateStatusSlotTimeApi(selectedSlot.slot._id, status);
        toast.success('Cập nhật ca làm việc thành công!');
      } else {
        await createSlotTimeApi({
          consultant_id: consultantId,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          status,
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
        toast.error(error.response.data.message);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-xl relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 text-2xl" onClick={onClose}>&times;</button>
        <h4 className="text-xl font-bold text-blue-700 mb-4">Quản lý lịch làm việc</h4>
        <div className="mb-4 flex justify-between items-center">
          <button
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => setCurrentWeek(w => w - 1)}
            disabled={currentWeek === 0}
          >
            &larr; Tuần trước
          </button>
          <span className="font-semibold text-blue-600">
            {format(weekStart, 'dd/MM/yyyy')} - {format(weekEnd, 'dd/MM/yyyy')}
          </span>
          <button
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => setCurrentWeek(w => w + 1)}
          >
            Tuần sau &rarr;
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8">
              <div></div>
              {weekDays.map(day => (
                <div key={day} className="text-center font-bold text-gray-600 py-2 bg-gray-50 border-t border-gray-100">
                  {day}
                </div>
              ))}
            </div>
            {timeSlots.map(slot => (
              <div key={slot} className="grid grid-cols-8">
                <div className="text-right pr-2 font-semibold text-gray-400 py-2 border-t border-gray-100 text-sm bg-white flex items-center justify-end">
                  {slot}
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
                  return (
                    <button
                      key={day + slot}
                      className={`h-14 w-full flex items-center justify-center border-t border-gray-100 transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 ${isBooked ? 'bg-red-200 text-red-700 cursor-not-allowed' : slotObj ? 'bg-blue-100 text-blue-700' : 'bg-white hover:bg-blue-50'}`}
                      onClick={() => handleSlotClick(day, slot)}
                      type="button"
                    >
                      {isBooked ? 'Đã đặt' : slotObj ? 'Đã tạo' : ''}
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
              <button className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 text-2xl" onClick={() => setSelectedSlot(null)}>&times;</button>
              <h5 className="text-lg font-bold mb-2">{editMode ? 'Chỉnh sửa' : 'Tạo'} ca làm việc</h5>
              <div className="mb-2 text-gray-500 text-sm">{selectedSlot.day} - {selectedSlot.time}</div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border rounded px-2 py-1">
                  <option value="available">Có thể đặt</option>
                  <option value="booked">Đã đặt</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                {editMode && <button onClick={handleDelete} className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200">Xóa</button>}
                <button onClick={handleSave} className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantScheduleModal; 