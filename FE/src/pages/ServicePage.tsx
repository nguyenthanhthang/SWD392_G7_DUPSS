import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getAllConsultantsApi, getAllServicesApi } from '../api';
import { ChevronLeft, ChevronRight, Check, User, Sparkles, Calendar } from 'lucide-react';

const steps = [
  { title: 'Chọn lịch & dịch vụ', desc: 'Chọn thời gian, tư vấn viên, dịch vụ' },
  { title: 'Thông tin cá nhân', desc: 'Điền thông tin liên hệ' },
  { title: 'Thanh toán', desc: 'Xác nhận & thanh toán' },
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
  specialty?: string;
}

interface Service {
  _id: string;
  name: string;
  price: number;
  description: string;
  category?: string;
  image?: string;
  duration?: string;
}

export default function ServicePage() {
  const [currentStep, setCurrentStep] = useState(0);
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
  const [timeFilter, setTimeFilter] = useState<'morning' | 'afternoon'>('morning');
  const [showConsultantDrawer, setShowConsultantDrawer] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<{ day: string; time: string } | null>(null);
  const [pendingConsultant, setPendingConsultant] = useState('');
  const MAX_VISIBLE_CONSULTANTS = 6;
  const [expandConsultants, setExpandConsultants] = useState(false);
  const MAX_VISIBLE_SERVICES = 5;
  const [expandServices, setExpandServices] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Đã gửi yêu cầu đặt lịch thành công!\nNgày giờ: ${selectedSlot?.day || ''} - ${selectedSlot?.time || ''}\nDịch vụ: ${services.find(s => s._id === form.serviceId)?.name || ''}\nTư vấn viên: ${consultants.find(c => c._id === selectedConsultant)?.accountId?.fullName || ''}\nHọ tên: ${form.name}\nSĐT: ${form.phone}\nGiới tính: ${form.gender === 'male' ? 'Nam' : 'Nữ'}\nLý do: ${form.reason}\nPhương thức thanh toán: ${form.paymentMethod === 'card' ? 'Thẻ tín dụng' : 'Chuyển khoản'}`);
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-[#f6f8fb] min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 w-full px-2 py-4 flex justify-center items-start">
        <div className="flex flex-row gap-6 max-w-5xl w-full mx-auto min-h-[600px] pb-8">
          {/* Stepper dọc */}
          <div className="w-[80px] flex flex-col items-center pt-8">
            <div className="flex flex-col gap-8">
              {steps.map((step, idx) => (
                <div key={step.title} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all ${
                    currentStep === idx
                      ? 'bg-blue-600 text-white border-blue-600 scale-110 shadow-lg'
                      : currentStep > idx
                        ? 'bg-blue-100 text-blue-600 border-blue-400'
                        : 'bg-white text-gray-400 border-gray-300'
                  }`}>
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-1 h-10 ${currentStep > idx ? 'bg-blue-400' : 'bg-gray-200'} rounded-full`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Nội dung các bước */}
          <div className="flex-1 flex flex-col items-center">
            {/* Step 1: 2 card ngang */}
            {currentStep === 0 && (
              <div className="grid grid-cols-12 gap-8 w-full max-w-7xl">
                {/* Left Panel - Consultant & Service */}
                <div className="col-span-4 space-y-8">
                  {/* Service Selection */}
                  <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Dịch vụ tư vấn</h3>
                        <p className="text-sm text-gray-500 font-light">Chọn gói phù hợp</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {(expandServices ? services : services.slice(0, MAX_VISIBLE_SERVICES)).map(service => (
                        <div
                          key={service._id}
                          className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                            form.serviceId === service._id 
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm' 
                              : 'bg-white/80 border-gray-100 hover:border-gray-200 hover:shadow-sm'
                          }`}
                          onClick={() => setForm(f => ({ ...f, serviceId: service._id }))}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate max-w-[180px]">{service.name}</span>
                            {service.category === 'vip' && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs rounded-full font-medium">VIP</span>
                            )}
                            {service.category === 'premium' && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs rounded-full font-medium">Premium</span>
                            )}
                          </div>
                          <div className="text-blue-700 font-semibold text-base truncate max-w-[120px]">{service.price?.toLocaleString('vi-VN')}đ</div>
                        </div>
                      ))}
                      {!expandServices && services.length > MAX_VISIBLE_SERVICES && (
                        <div className="h-10 p-5 rounded-2xl border border-dashed border-blue-200 bg-white/80 flex items-center justify-center text-blue-500 text-3xl font-bold cursor-pointer hover:bg-blue-50 transition-all select-none"
                          onClick={() => setExpandServices(true)}
                        >
                          +
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Right Panel - Calendar */}
                <div className="col-span-8">
                  <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-200 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Chọn thời gian</h3>
                        <p className="text-sm text-gray-500 font-light">Lịch khám có sẵn</p>
                      </div>
                    </div>
                    {/* Calendar Navigation */}
                    <div className="flex items-center justify-between mb-8">
                      <button
                        className="w-12 h-12 rounded-2xl bg-white/80 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-200 transition-all disabled:opacity-30"
                        disabled={Number(currentWeek) === 0}
                        onClick={() => setCurrentWeek(0)}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="text-center">
                        <div className="text-xl font-light text-gray-900 mb-1">
                          {/* Tuần {weekDates.start} - {weekDates.end} */}
                          {(() => {
                            const today = new Date();
                            const currentDate = new Date(today);
                            currentDate.setDate(today.getDate() + (currentWeek * 7));
                            const monday = new Date(currentDate);
                            const dayOfWeek = currentDate.getDay();
                            const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                            monday.setDate(diff);
                            const sunday = new Date(monday);
                            sunday.setDate(monday.getDate() + 6);
                            return `Tuần ${monday.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${sunday.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
                          })()}
                        </div>
                        <div className="text-sm text-gray-500">Tháng {new Date().getMonth() + 1}, {new Date().getFullYear()}</div>
                      </div>
                      <button
                        className="w-12 h-12 rounded-2xl bg-white/80 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-200 transition-all disabled:opacity-30"
                        disabled={Number(currentWeek) === 1}
                        onClick={() => setCurrentWeek(1)}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Time Filter */}
                    <div className="flex justify-center mb-8">
                      <div className="bg-gray-50/80 rounded-2xl p-1 inline-flex">
                        <button
                          className={`px-6 py-2 rounded-xl font-medium transition-all text-sm ${
                            timeFilter === 'morning' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={() => setTimeFilter('morning')}
                        >
                          Buổi sáng
                        </button>
                        <button
                          className={`px-6 py-2 rounded-xl font-medium transition-all text-sm ${
                            timeFilter === 'afternoon' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={() => setTimeFilter('afternoon')}
                        >
                          Buổi chiều
                        </button>
                      </div>
                    </div>
                    {/* Calendar Grid */}
                    <div className="bg-white/50 rounded-2xl p-6">
                      {/* Header */}
                      <div className="grid grid-cols-8 gap-3 mb-6">
                        <div className="text-center text-sm font-medium text-gray-400">Giờ</div>
                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => (
                          <div key={day} className={`text-center text-sm font-medium py-2 ${
                            idx === 6 ? 'text-red-400' : 'text-gray-600'
                          }`}>
                            {day}
                          </div>
                        ))}
                      </div>
                      {/* Time Slots */}
                      <div className="space-y-3">
                        {(timeFilter === 'morning' ? ['08:00', '09:00', '10:00', '11:00'] : ['13:00', '14:00', '15:00', '16:00', '17:00']).map(slot => (
                          <div key={slot} className="grid grid-cols-8 gap-3 items-center">
                            {/* Time Label */}
                            <div className="text-center text-sm font-medium text-gray-500 py-3">
                              {slot}
                            </div>
                            {/* Day Buttons */}
                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => {
                              const isSelected = selectedSlot?.day === day && selectedSlot?.time === slot;
                              return (
                                <button
                                  key={day + slot}
                                  className={`h-12 w-full rounded-xl border transition-all duration-200 ${
                                    isSelected 
                                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-500 text-white shadow-lg transform scale-105' 
                                      : 'bg-white/80 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 text-gray-600'
                                  }`}
                                  onClick={() => {
                                    setPendingSlot({ day, time: slot });
                                    setShowConsultantDrawer(true);
                                    setPendingConsultant(selectedConsultant || (consultants[0]?._id || ''));
                                  }}
                                >
                                  {isSelected && <Check className="w-4 h-4 mx-auto" />}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Summary & Continue */}
                    {(form.serviceId || selectedSlot) && (
                      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-100/50">
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            {form.serviceId && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">{services.find(s => s._id === form.serviceId)?.name}</span> • {services.find(s => s._id === form.serviceId)?.duration || ''}
                              </div>
                            )}
                            {selectedSlot && (
                              <div className="text-sm text-gray-600">
                                {selectedSlot.day}, {selectedSlot.time}
                                {selectedConsultant && (
                                  <>
                                    <span className="mx-2">|</span>
                                    <span>Chuyên viên: <span className="font-semibold">{consultants.find(c => c._id === selectedConsultant)?.accountId?.fullName}</span></span>
                                  </>
                                )}
                              </div>
                            )}
                            {form.serviceId && (
                              <div className="text-lg font-semibold text-gray-900">
                                {services.find(s => s._id === form.serviceId)?.price?.toLocaleString('vi-VN')}đ
                              </div>
                            )}
                          </div>
                          <button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                            disabled={!selectedSlot || !form.serviceId}
                            onClick={handleNext}
                          >
                            Tiếp tục
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Step 2: Điền thông tin cá nhân */}
            {currentStep === 1 && (
              <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white/60 backdrop-blur-xl rounded-3xl shadow p-10 border border-white/50 flex flex-col gap-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-500 tracking-wide uppercase">Bước 2</span>
                    <div className="w-8 h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
                  </div>
                  <h2 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Điền thông tin cá nhân</h2>
                  <p className="text-gray-600 font-light text-lg">Vui lòng nhập thông tin liên hệ để xác nhận đặt lịch</p>
                </div>
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-gray-700 mb-1 text-base font-medium">Họ và tên</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Nhập họ và tên"
                      className="w-full border border-blue-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:border-blue-300 text-base"
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
                      className="w-full border border-blue-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:border-blue-300 text-base"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 text-base font-medium">Giới tính</label>
                    <select
                      name="gender"
                      className="w-full border border-blue-100 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:border-blue-300 text-base"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 text-base font-medium">Lý do cần tư vấn</label>
                    <textarea
                      name="reason"
                      required
                      placeholder="Mô tả ngắn gọn lý do bạn cần tư vấn"
                      className="w-full border border-blue-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:border-blue-300 text-base resize-none"
                      rows={2}
                      value={form.reason}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-2 mt-4">
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 py-2 px-8 rounded-lg font-semibold hover:bg-gray-300 transition-colors shadow-md text-base"
                    onClick={handleBack}
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-10 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md text-base"
                    onClick={handleNext}
                    disabled={!form.name || !form.phone || !form.reason}
                  >
                    Tiếp tục
                  </button>
                </div>
              </form>
            )}
            {/* Step 3: Thanh toán */}
            {currentStep === 2 && (
              <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white/60 backdrop-blur-xl rounded-3xl shadow p-10 border border-white/50 flex flex-col gap-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-500 tracking-wide uppercase">Bước 3</span>
                    <div className="w-8 h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
                  </div>
                  <h2 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Thanh toán & xác nhận</h2>
                  <p className="text-gray-600 font-light text-lg">Kiểm tra lại thông tin và chọn phương thức thanh toán</p>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex justify-between items-center bg-blue-50/60 rounded-xl px-6 py-4">
                    <span className="text-gray-600">Dịch vụ:</span>
                    <span className="font-medium">
                      {form.serviceId ? services.find(s => s._id === form.serviceId)?.name : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50/60 rounded-xl px-6 py-4">
                    <span className="text-gray-600">Giá:</span>
                    <span className="font-medium">
                      {form.serviceId ? services.find(s => s._id === form.serviceId)?.price?.toLocaleString('vi-VN') + 'đ' : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50/60 rounded-xl px-6 py-4">
                    <span className="text-gray-600">Tư vấn viên:</span>
                    <span className="font-medium">
                      {selectedConsultant ? consultants.find(c => c._id === selectedConsultant)?.accountId?.fullName : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50/60 rounded-xl px-6 py-4">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium">
                      {selectedSlot ? `${selectedSlot.day}, ${selectedSlot.time}` : '--'}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mb-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-700">
                        {form.serviceId ? services.find(s => s._id === form.serviceId)?.price?.toLocaleString('vi-VN') + 'đ' : '0đ'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 text-base font-medium">Phương thức thanh toán</label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-50 transition-all text-base">
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
                      <label className="flex items-center p-3 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-50 transition-all text-base">
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
                </div>
                <div className="flex justify-between gap-2 mt-4">
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 py-2 px-8 rounded-lg font-semibold hover:bg-gray-300 transition-colors shadow-md text-base"
                    onClick={handleBack}
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-10 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md text-base"
                  >
                    Xác nhận đặt lịch
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Bằng cách nhấn nút xác nhận, bạn đồng ý với các điều khoản và điều kiện của chúng tôi
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
      {/* Drawer chọn chuyên viên tư vấn */}
      {showConsultantDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30 transition-opacity" onClick={() => setShowConsultantDrawer(false)}></div>
          <div className="relative h-full w-1/4 min-w-[320px] bg-white shadow-2xl flex flex-col animate-slideInRight">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800">Chọn chuyên gia tư vấn</h3>
              <button className="text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => setShowConsultantDrawer(false)}>&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(expandConsultants ? consultants : consultants.slice(0, MAX_VISIBLE_CONSULTANTS)).map(consultant => (
                <div
                  key={consultant._id}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    pendingConsultant === consultant._id 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm' 
                      : 'bg-white/80 border-gray-100 hover:border-gray-200'
                  }`}
                  onClick={() => {
                    setPendingConsultant(consultant._id);
                    setSelectedConsultant(consultant._id);
                    setSelectedSlot(pendingSlot);
                    setShowConsultantDrawer(false);
                    setExpandConsultants(false);
                  }}
                >
                  <div className="font-medium text-gray-900 truncate max-w-[180px]">{consultant.accountId?.fullName}</div>
                </div>
              ))}
              {!expandConsultants && consultants.length > MAX_VISIBLE_CONSULTANTS && (
                <div className="h-10 p-4 rounded-2xl border border-dashed border-blue-200 bg-white/80 flex items-center justify-center text-blue-500 text-2xl font-bold cursor-pointer hover:bg-blue-50 transition-all select-none"
                  onClick={() => setExpandConsultants(true)}
                >
                  +
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
