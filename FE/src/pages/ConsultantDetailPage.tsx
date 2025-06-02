import { useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

// Mock data cho consultant (có thể lấy từ ConsultingPage hoặc API thực tế)
const consultantData = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    specialty: 'Tư vấn tâm lý',
    imgSrc: 'https://randomuser.me/api/portraits/men/32.jpg',
    description: 'Chuyên gia tư vấn tâm lý với hơn 10 năm kinh nghiệm hỗ trợ cộng đồng.',
    experience: 10,
    rating: 4.8,
    email: 'vana@example.com',
    phone: '0901234567',
    address: 'Hà Nội',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    specialty: 'Tư vấn xã hội',
    imgSrc: 'https://randomuser.me/api/portraits/women/44.jpg',
    description: 'Tư vấn xã hội, hỗ trợ các trường hợp khó khăn, nguy cơ nghiện.',
    experience: 8,
    rating: 4.6,
    email: 'thib@example.com',
    phone: '0902345678',
    address: 'TP.HCM',
  },
  // ...
];

// Mock data lịch dạng tuần: bookedSlots[day][hour] = { title, color, ... }
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
];

import { useState } from 'react';

function ConsultantDetailPage() {
  const { id } = useParams();
  const consultant = consultantData.find(c => c.id === Number(id));

  // State cho modal booking
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', reason: '' });

  const handleOpenModal = (day: string, time: string) => {
    setSelectedSlot({ day, time });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ name: '', phone: '', reason: '' });
    setSelectedSlot(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý gửi booking ở đây
    alert(`Đã gửi yêu cầu đặt lịch cho ${consultant?.name} vào ${selectedSlot?.day} lúc ${selectedSlot?.time}\nHọ tên: ${form.name}\nSĐT: ${form.phone}\nLý do: ${form.reason}`);
    handleCloseModal();
  };

  if (!consultant) return <div className="text-center py-20 text-xl">Không tìm thấy chuyên gia.</div>;

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Thông tin bên trái */}
          <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-8">
            <img src={consultant.imgSrc} alt={consultant.name} className="w-36 h-36 rounded-full object-cover border-4 border-blue-200 mb-6" />
            <h2 className="text-2xl font-bold text-blue-700 mb-1 text-center">{consultant.name}</h2>
            <div className="text-blue-600 font-semibold mb-2 text-center">{consultant.specialty}</div>
            <div className="text-gray-600 mb-3 text-center">{consultant.description}</div>
            <div className="flex flex-col gap-1 text-gray-500 text-sm w-full items-center">
              <span>⭐ {consultant.rating} &nbsp;|&nbsp; {consultant.experience} năm kinh nghiệm</span>
              <span>Email: {consultant.email}</span>
              <span>SĐT: {consultant.phone}</span>
              <span>Địa chỉ: {consultant.address}</span>
            </div>
          </div>
          {/* Đường chia dọc */}
          <div className="hidden md:block w-px bg-gray-200 mx-0" style={{ minHeight: '100%' }}></div>
          {/* Lịch bên phải */}
          <div className="w-full md:w-2/3 p-4 md:p-8 overflow-x-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-blue-700">Lịch tư vấn trong tuần</h3>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-8 min-w-[700px]">
                {/* Header: slot giờ + ngày */}
                <div className="bg-white"></div>
                {weekDays.map(day => (
                  <div key={day} className="text-center font-bold text-gray-600 py-2 bg-gray-50">{day}</div>
                ))}
                {/* Body: slot giờ + slot từng ngày */}
                {timeSlots.map(slot => (
                  <>
                    <div key={slot} className="text-right pr-2 font-semibold text-gray-400 py-2 border-t border-gray-100 text-sm bg-white">
                      {slot}
                    </div>
                    {weekDays.map(day => (
                      <button
                        key={day + slot}
                        className="h-14 w-full flex items-center justify-center border-t border-gray-100 transition-all bg-white hover:bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onClick={() => handleOpenModal(day, slot)}
                        type="button"
                      >
                      </button>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal booking */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 text-2xl" onClick={handleCloseModal}>&times;</button>
            <h4 className="text-xl font-bold text-blue-700 mb-4">Đặt lịch khám với {consultant.name}</h4>
            <div className="mb-2 text-gray-500 text-sm">{selectedSlot?.day} - {selectedSlot?.time}</div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                name="name"
                required
                placeholder="Họ và tên"
                className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.name}
                onChange={handleChange}
              />
              <input
                type="tel"
                name="phone"
                required
                placeholder="Số điện thoại"
                className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.phone}
                onChange={handleChange}
              />
              <textarea
                name="reason"
                required
                placeholder="Lý do khám"
                className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                value={form.reason}
                onChange={handleChange}
                rows={3}
              />
              <div className="flex gap-4 justify-end mt-2">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">Đóng</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default ConsultantDetailPage; 