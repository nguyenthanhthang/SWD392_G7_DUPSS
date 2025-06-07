import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getAllConsultantsApi, getAllServicesApi } from '../api';
import { addDays, startOfWeek, endOfWeek, format } from 'date-fns';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
];

interface User {
  _id: string;
  fullName: string;
  photoUrl: string;
  email: string;
  phoneNumber: string;
}

interface Consultant {
  _id: string;
  userId: string;
  introduction: string;
  contactLink: string;
  licenseNumber: string;
  startDate: string;
  googleMeetLink: string;
  accountId: User;
  experience?: number;
}

interface Service {
  _id: string;
  name: string;
  price: number;
  description: string;
  category?: string;
  image?: string;
}

// Hàm chọn icon phù hợp cho từng loại dịch vụ
function getServiceIcon(name: string) {
  if (name.includes('nghiện')) return '💊';
  if (name.includes('tâm thần')) return '🧠';
  if (name.includes('phòng ngừa')) return '🛡️';
  if (name.includes('phục hồi')) return '🌱';
  return '🗂️';
}

export default function ServicePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    gender: 'male',
    reason: '',
    serviceId: '',
    paymentMethod: 'card'
  });

  const today = new Date();
  const weekStart = startOfWeek(addDays(today, currentWeek * 7), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(addDays(today, currentWeek * 7), { weekStartsOn: 1 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consultantsData, servicesData] = await Promise.all([
          getAllConsultantsApi(),
          getAllServicesApi()
        ]);
        setConsultants(consultantsData);
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service._id === selectedCategory);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectSlot = (day: string, time: string) => {
    setSelectedSlot({ day, time });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Đã gửi yêu cầu đặt lịch thành công!\nNgày giờ: ${selectedSlot?.day || ''} - ${selectedSlot?.time || ''}\nDịch vụ: ${services.find(s => s._id === form.serviceId)?.name || ''}\nTư vấn viên: ${consultants.find(c => c._id === selectedConsultant)?.accountId?.fullName || ''}\nHọ tên: ${form.name}\nSĐT: ${form.phone}\nGiới tính: ${form.gender === 'male' ? 'Nam' : 'Nữ'}\nLý do: ${form.reason}\nPhương thức thanh toán: ${form.paymentMethod === 'card' ? 'Thẻ tín dụng' : 'Chuyển khoản'}`);
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-[#f6f8fb] min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 w-full px-2 py-4">
        <div className="flex flex-row gap-4 min-h-[600px] pb-8">
          {/* Cột trái: filter dọc, cao bằng lịch + đặt lịch */}
          <div className="w-[320px] flex-shrink-0 flex flex-col h-full">
            <div className="bg-white rounded-2xl shadow p-4 border border-blue-100 flex flex-col gap-3 text-base h-full sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
                <span role="img" aria-label="filter">🔎</span> Tìm kiếm dịch vụ
              </h2>
              <div className="flex flex-col gap-1">
                <div 
                  className={`px-3 py-2 rounded-xl text-base font-medium transition-all ${
                    selectedCategory === 'all' 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50'
                  } cursor-pointer flex items-center justify-between`}
                  onClick={() => setSelectedCategory('all')}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">📋</span>
                    <span>Tất cả dịch vụ</span>
                  </div>
                </div>
                {services.map(service => (
                  <div 
                    key={service._id}
                    onClick={() => setSelectedCategory(service._id)}
                    className={`px-3 py-2 rounded-xl text-base font-medium transition-all ${
                      selectedCategory === service._id 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    } cursor-pointer flex items-center justify-between`}
                  >
                    <div className="flex items-center truncate">
                      {service.image
                        ? <img src={service.image} alt={service.name} className="w-6 h-6 rounded-full mr-2" />
                        : <span className="text-lg mr-2">{getServiceIcon(service.name.toLowerCase())}</span>
                      }
                      <span className="truncate max-w-[180px]">{service.name}</span>
                    </div>
                    <span className="text-blue-600 font-semibold whitespace-nowrap">{service.price?.toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <label className="block text-gray-700 text-base font-medium mb-1 flex items-center gap-2"><span role="img" aria-label="consultant">👨‍⚕️</span> Tư vấn viên</label>
                <select
                  className="w-full border border-blue-100 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:border-blue-300 text-base"
                  value={selectedConsultant}
                  onChange={(e) => setSelectedConsultant(e.target.value)}
                >
                  <option value="">Tất cả tư vấn viên</option>
                  {consultants.map(consultant => (
                    <option key={consultant._id} value={consultant._id}>
                      {consultant.accountId?.fullName || 'Chuyên gia'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {/* Cột giữa: lịch */}
          <div className="flex-[3] min-w-[800px] flex flex-col justify-center">
            <div className="bg-white rounded-2xl shadow p-4 border border-blue-100 flex flex-col text-base h-full">
              <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2"><span role="img" aria-label="calendar">📅</span> Lịch tư vấn</h2>
              <div className="mb-2 text-center">
                <div className="text-lg font-semibold text-blue-700">
                  {format(weekStart, 'dd/MM/yyyy')} - {format(weekEnd, 'dd/MM/yyyy')}
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-9 text-base">
                  <div className="flex items-center justify-center bg-gray-50">
                    <button
                      className="text-gray-500 hover:text-blue-600 disabled:opacity-30 focus:outline-none p-2 rounded-full border border-blue-100 bg-white shadow hover:shadow-md"
                      disabled={currentWeek === 0}
                      onClick={() => setCurrentWeek(0)}
                      aria-label="Tuần này"
                    >
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                  {weekDays.map((day) => (
                    <div key={day} className="text-center font-bold text-gray-600 py-2 bg-gray-50 border-t border-gray-100 text-base">
                      {day}
                    </div>
                  ))}
                  <div className="flex items-center justify-center bg-gray-50">
                    <button
                      className="text-gray-500 hover:text-blue-600 disabled:opacity-30 focus:outline-none p-2 rounded-full border border-blue-100 bg-white shadow hover:shadow-md"
                      disabled={currentWeek === 1}
                      onClick={() => setCurrentWeek(1)}
                      aria-label="Tuần sau"
                    >
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>
                {timeSlots.map(slot => (
                  <div key={slot} className="grid grid-cols-9">
                    <div className="text-right pr-2 font-semibold text-gray-400 py-2 border-t border-gray-100 text-base bg-white flex items-center justify-end">
                      {slot}
                    </div>
                    {weekDays.map(day => {
                      const isSelected = selectedSlot?.day === day && selectedSlot?.time === slot;
                      return (
                        <button
                          key={day + slot}
                          className={`h-14 w-full flex items-center justify-center border-t border-gray-100 transition-all rounded-lg focus:outline-none font-semibold text-base ${
                            isSelected 
                              ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 scale-105' 
                              : 'bg-white hover:bg-blue-50 hover:scale-105'
                          }`}
                          style={{ transition: 'all 0.15s' }}
                          onClick={() => handleSelectSlot(day, slot)}
                          type="button"
                        >
                          {isSelected && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                    <div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Cột phải: đặt lịch */}
          <div className="w-full md:w-[400px] flex flex-col gap-4 text-[15px]">
            <div className="bg-white rounded-2xl shadow p-6 border border-blue-100 flex flex-col gap-3 text-base h-full">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><span role="img" aria-label="form">📝</span> Đặt lịch</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-gray-700 mb-1 text-base font-medium">Họ và tên</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Nhập họ và tên"
                    className="w-full border border-blue-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:border-blue-300 text-base"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 text-base font-medium">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Nhập số điện thoại"
                    className="w-full border border-blue-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:border-blue-300 text-base"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 text-base font-medium">Giới tính</label>
                  <select
                    name="gender"
                    className="w-full border border-blue-100 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:border-blue-300 text-base"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 text-base font-medium">Dịch vụ</label>
                  <select
                    name="serviceId"
                    required
                    className="w-full border border-blue-100 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:border-blue-300 text-base"
                    value={form.serviceId}
                    onChange={handleChange}
                  >
                    <option value="">Chọn dịch vụ</option>
                    {filteredServices.map(service => (
                      <option key={service._id} value={service._id}>
                        {service.name} - {service.price?.toLocaleString('vi-VN')}đ
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 text-base font-medium">Lý do cần tư vấn</label>
                  <textarea
                    name="reason"
                    required
                    placeholder="Mô tả ngắn gọn lý do bạn cần tư vấn"
                    className="w-full border border-blue-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:border-blue-300 text-base resize-none"
                    rows={2}
                    value={form.reason}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 text-base font-medium">Thời gian đã chọn</label>
                  {selectedSlot ? (
                    <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded font-medium text-base flex flex-col gap-1">
                      <div>
                        <span>{selectedSlot.day}, {selectedSlot.time}</span>
                        <span className="mx-2">|</span>
                        <span>
                          Dịch vụ: <span className="font-semibold">{form.serviceId ? services.find(s => s._id === form.serviceId)?.name : '--'}</span>
                          <span className="mx-2">-</span>
                          <span className="text-blue-700 font-semibold">{form.serviceId ? services.find(s => s._id === form.serviceId)?.price?.toLocaleString('vi-VN') + 'đ' : '--'}</span>
                        </span>
                        {selectedConsultant && (
                          <>
                            <span className="mx-2">|</span>
                            <span>Tư vấn viên: <span className="font-semibold">{consultants.find(c => c._id === selectedConsultant)?.accountId?.fullName}</span></span>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded text-base">
                      Vui lòng chọn thời gian tư vấn
                    </div>
                  )}
                </div>
                {/* Payment section */}
                <div className="bg-white rounded-xl border border-blue-100 p-4 mt-2 text-base">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><span role="img" aria-label="payment">💳</span> Thanh toán</h3>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Dịch vụ:</span>
                    <span className="font-medium">
                      {form.serviceId ? services.find(s => s._id === form.serviceId)?.name : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Giá:</span>
                    <span className="font-medium">
                      {form.serviceId ? services.find(s => s._id === form.serviceId)?.price?.toLocaleString('vi-VN') + 'đ' : '--'}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mb-2">
                    <div className="flex justify-between font-semibold">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-700">
                        {form.serviceId ? services.find(s => s._id === form.serviceId)?.price?.toLocaleString('vi-VN') + 'đ' : '0đ'}
                      </span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="block text-gray-700 mb-1 text-base font-medium">Phương thức thanh toán</label>
                    <div className="space-y-1">
                      <label className="flex items-center p-2 border border-blue-100 rounded cursor-pointer hover:bg-blue-50 transition-all text-base">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={form.paymentMethod === 'card'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>Thẻ tín dụng / Ghi nợ <span className="text-gray-400">(Visa, Mastercard, JCB)</span></span>
                      </label>
                      <label className="flex items-center p-2 border border-blue-100 rounded cursor-pointer hover:bg-blue-50 transition-all text-base">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="transfer"
                          checked={form.paymentMethod === 'transfer'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>Chuyển khoản ngân hàng <span className="text-gray-400">(trực tiếp)</span></span>
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!selectedSlot || !form.serviceId}
                    className="w-full bg-blue-600 text-white py-3 px-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md text-base"
                  >
                    Xác nhận đặt lịch
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Bằng cách nhấn nút xác nhận, bạn đồng ý với các điều khoản và điều kiện của chúng tôi
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
