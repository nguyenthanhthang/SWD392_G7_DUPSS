import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getAllConsultantsApi, getAllServicesApi, getAllSlotTimeApi, getAvailableConsultantsByDayApi, createAppointmentApi } from '../api';
import { ChevronLeft, ChevronRight, Check, User, Sparkles, Calendar, Banknote } from 'lucide-react';
import { addDays, startOfWeek } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import './ServicePage.css'; // Import the CSS file
import { useAuth } from '../contexts/AuthContext';

const steps = [
  { title: 'Chọn dịch vụ', desc: 'Chọn gói dịch vụ phù hợp' },
  { title: 'Chọn thời gian', desc: 'Chọn lịch khám có sẵn' },
  { title: 'Chọn chuyên gia', desc: 'Chọn chuyên gia tư vấn' },
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
  status?: 'active' | 'inactive';
}

interface SlotTime {
  _id: string;
  consultant_id: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface AvailableConsultant {
  _id: string;
  fullName: string;
  photoUrl?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  introduction?: string;
  experience?: number;
  contact?: string;
}

interface Bill {
  slotTime_id: string;
  user_id: string;
  consultant_id: string;
  service_id: string;
  dateBooking: string;
  reason: string;
  note: string;
  service?: Service;
  consultant?: Consultant;
  slot?: { day: string; time: string };
  dateStr?: string;
  price?: number;
  fullName?: string;
  phone?: string;
  gender?: string;
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
    paymentMethod: 'card',
    note: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    phone: '',
    reason: '',
  });
  const [timeFilter, setTimeFilter] = useState<'morning' | 'afternoon'>('morning');
  const [showConsultantDrawer, setShowConsultantDrawer] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<{ day: string; time: string } | null>(null);
  const [pendingConsultant, setPendingConsultant] = useState('');
  const MAX_VISIBLE_CONSULTANTS = 6;
  const [expandConsultants, setExpandConsultants] = useState(false);
  const MAX_VISIBLE_SERVICES = 5;
  const [expandServices, setExpandServices] = useState(false);
  const [allSlotTimes, setAllSlotTimes] = useState<SlotTime[]>([]);
  const [availableConsultants, setAvailableConsultants] = useState<AvailableConsultant[]>([]);
  const [bill, setBill] = useState<Bill | null>(null);
  const [showError, setShowError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consultantsData, servicesData] = await Promise.all([
          getAllConsultantsApi(),
          getAllServicesApi()
        ]);
        setConsultants(consultantsData);
        
        // Lọc chỉ hiển thị dịch vụ có trạng thái "active"
        const activeServices = servicesData.filter((service: Service) => service.status === 'active');
        setServices(activeServices);
        
        const slotTimes = await getAllSlotTimeApi();
        console.log('Slot times from API:', slotTimes);
        setAllSlotTimes(slotTimes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (currentStep === 3 && user) {
      setForm(prev => ({
        ...prev,
        name: user.fullName || '',
        phone: user.phoneNumber || '',
        gender: user.gender || 'male',
      }));
    }
    // eslint-disable-next-line
  }, [currentStep, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Validate on change
    validateField(name, value);
  };
  
  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Họ và tên không được để trống';
        } else if (value.trim().length < 2) {
          error = 'Họ và tên phải có ít nhất 2 ký tự';
        } else if (!/^[a-zA-ZÀÁÂÃÈÉÊẾÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêếìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/.test(value)) {
          error = 'Họ và tên chỉ được chứa chữ cái và khoảng trắng';
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          error = 'Số điện thoại không được để trống';
        } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(value.replace(/\s/g, ''))) {
          error = 'Số điện thoại không hợp lệ (VD: 0912345678)';
        }
        break;
        
      case 'reason':
        if (!value.trim()) {
          error = 'Lý do tư vấn không được để trống';
        } else if (value.trim().length < 10) {
          error = 'Lý do tư vấn phải có ít nhất 10 ký tự';
        } else if (value.trim().length > 500) {
          error = 'Lý do tư vấn không được vượt quá 500 ký tự';
        }
        break;
        
      default:
        break;
    }
    
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };
  
  const validateForm = () => {
    const nameError = validateField('name', form.name);
    const phoneError = validateField('phone', form.phone);
    const reasonError = validateField('reason', form.reason);
    
    return !nameError && !phoneError && !reasonError;
  };

  const handleNext = () => {
    // Validate form if on the personal information step
    if (currentStep === 3) {
      if (validateForm()) {
        setCurrentStep(currentStep + 1);
      }
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setShowError('Vui lòng điền đầy đủ và chính xác thông tin cá nhân!');
      return;
    }
    
    const userInfo = localStorage.getItem('userInfo');
    const user = userInfo ? JSON.parse(userInfo) : null;
    if (!user || !selectedConsultant || !selectedSlot || !form.serviceId) {
      setShowError('Thiếu thông tin đặt lịch!');
      return;
    }
    const today = new Date();
    const weekStart = startOfWeek(addDays(today, currentWeek * 7), { weekStartsOn: 1 });
    const dayIdx = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].indexOf(selectedSlot.day);
    const slotDate = addDays(weekStart, dayIdx);
    const slotDateStr = formatInTimeZone(slotDate, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
    const slotHour = selectedSlot.time;
    const slotTimeObj = allSlotTimes.find(st => {
      if (st.status !== 'available') return false;
      const stDateStr = formatInTimeZone(st.start_time, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
      const stHour = formatInTimeZone(st.start_time, 'Asia/Ho_Chi_Minh', 'HH:00');
      return stDateStr === slotDateStr && stHour === slotHour && st.consultant_id === selectedConsultant;
    });
    if (!slotTimeObj) {
      setShowError('Không tìm thấy slot time phù hợp!');
      return;
    }
    try {
      const payload = {
        slotTime_id: slotTimeObj._id,
        user_id: user._id,
        consultant_id: selectedConsultant,
        service_id: form.serviceId,
        dateBooking: slotTimeObj.start_time,
        reason: form.reason,
        note: form.note,
      };
      await createAppointmentApi(payload);
      setBill({
        ...payload,
        service: services.find(s => s._id === form.serviceId),
        consultant: consultants.find(c => c._id === selectedConsultant),
        slot: selectedSlot,
        dateStr: getSelectedSlotDateStr(),
        price: services.find(s => s._id === form.serviceId)?.price,
        fullName: form.name,
        phone: form.phone,
        gender: form.gender,
      });
      setCurrentStep(5); // Hiển thị bill
    } catch {
      setShowError('Đặt lịch thất bại! Vui lòng thử lại hoặc liên hệ hỗ trợ.');
    }
  };

  const handleOpenConsultantDrawer = async (slotDay: string, slotTime: string) => {
    setPendingSlot({ day: slotDay, time: slotTime });
    setSelectedSlot({ day: slotDay, time: slotTime });
    
    const today = new Date();
    const weekStart = startOfWeek(addDays(today, currentWeek * 7), { weekStartsOn: 1 });
    const dayIdx = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].indexOf(slotDay);
    const slotDate = addDays(weekStart, dayIdx);
    const slotDateStr = formatInTimeZone(slotDate, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
    
    try {
      const res = await getAvailableConsultantsByDayApi(slotDateStr);
      const slot = res.slots.find((s: { time: string }) => s.time === slotTime);
      setAvailableConsultants(slot?.availableConsultants || []);
      
      // Automatically go to next step after selecting time
      handleNext();
    } catch (error) {
      console.error("Error fetching consultants:", error);
      setAvailableConsultants([]);
      setShowError('Không thể tải danh sách chuyên gia. Vui lòng thử lại sau.');
    }
  };

  // Helper để lấy ngày yyyy-MM-dd từ slot đang chọn
  const getSelectedSlotDateStr = () => {
    if (!selectedSlot) return '';
    const today = new Date();
    const weekStart = startOfWeek(addDays(today, currentWeek * 7), { weekStartsOn: 1 });
    const dayIdx = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].indexOf(selectedSlot.day);
    const slotDate = addDays(weekStart, dayIdx);
    return formatInTimeZone(slotDate, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy');
  };

  return (
    <div className="bg-gradient-to-b from-sky-50 to-[#f0f7fa] min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 w-full px-4 py-8 flex justify-center items-start">
        <div className="flex flex-row gap-8 max-w-6xl w-full mx-auto min-h-[600px] pb-8">
          {/* Stepper dọc */}
          <div className="w-[90px] flex flex-col items-center pt-8">
            <div className="flex flex-col gap-0">
              {steps.map((step, idx) => (
                <div key={step.title} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all ${
                      currentStep === idx
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-500 scale-110 shadow-lg'
                        : currentStep > idx
                          ? 'bg-cyan-100 text-cyan-600 border-cyan-400 cursor-pointer hover:scale-105'
                          : 'bg-white text-gray-400 border-gray-300'
                    }`}
                    onClick={() => {
                      // Chỉ cho phép quay lại các bước đã hoàn thành
                      if (currentStep > idx) {
                        setCurrentStep(idx);
                      }
                    }}
                  >
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-1 h-16 ${
                      currentStep > idx 
                        ? 'bg-gradient-to-b from-cyan-400 to-blue-400' 
                        : idx === currentStep
                          ? 'bg-gradient-to-b from-cyan-400 to-gray-200'
                          : 'bg-gray-200'
                    } rounded-full`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Nội dung các bước */}
          <div className="flex-1 flex flex-col items-center">
            {/* Step 1: Chọn dịch vụ */}
            {currentStep === 0 && (
              <div className="w-full animate-fadeIn">
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-cyan-100 shadow-[0_10px_40px_rgba(14,165,233,0.08)]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-sky-200 rounded-2xl flex items-center justify-center shadow-sm">
                      <Sparkles className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Dịch vụ tư vấn</h3>
                      <p className="text-sm text-gray-500">Chọn gói phù hợp với nhu cầu</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    {(expandServices ? services : services.slice(0, MAX_VISIBLE_SERVICES)).map(service => (
                                            <div
                          key={service._id}
                          className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                            form.serviceId === service._id 
                              ? 'bg-gradient-to-r from-sky-50 to-cyan-50 border-sky-200 shadow-md' 
                              : 'bg-white/90 border-gray-100 hover:border-sky-200 hover:shadow-sm'
                          }`}
                          onClick={() => setForm(f => ({ ...f, serviceId: service._id }))}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                              {service.image ? (
                                <img 
                                  src={service.image} 
                                  alt={service.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className={`w-full h-full flex items-center justify-center ${
                                  service.category === 'vip' 
                                    ? 'bg-gradient-to-br from-amber-100 to-orange-100' 
                                    : service.category === 'premium'
                                      ? 'bg-gradient-to-br from-sky-100 to-cyan-100'
                                      : 'bg-gradient-to-br from-gray-100 to-blue-50'
                                }`}>
                                  <Sparkles className={`w-8 h-8 ${
                                    service.category === 'vip' 
                                      ? 'text-amber-500' 
                                      : service.category === 'premium'
                                        ? 'text-sky-500'
                                        : 'text-blue-400'
                                  }`} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <span className="font-medium text-gray-800 truncate max-w-[180px]">{service.name}</span>
                                {service.category === 'vip' && (
                                  <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs rounded-full font-medium shadow-sm">VIP</span>
                                )}
                                {service.category === 'premium' && (
                                  <span className="px-2 py-0.5 bg-gradient-to-r from-sky-400 to-cyan-500 text-white text-xs rounded-full font-medium shadow-sm">Premium</span>
                                )}
                              </div>
                              {service.description && (
                                <div className="text-sm text-gray-500 mb-2 line-clamp-2">{service.description}</div>
                              )}
                              <div className="text-cyan-600 font-semibold text-lg">{service.price?.toLocaleString('vi-VN')}đ</div>
                            </div>
                          </div>
                        </div>
                    ))}
                    {!expandServices && services.length > MAX_VISIBLE_SERVICES && (
                      <div className="h-12 rounded-2xl border border-dashed border-sky-200 bg-white/80 flex items-center justify-center text-sky-500 text-2xl font-bold cursor-pointer hover:bg-sky-50 transition-all select-none"
                        onClick={() => setExpandServices(true)}
                      >
                        + Xem thêm dịch vụ
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      className="bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white px-10 py-4 rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                      disabled={!form.serviceId}
                      onClick={handleNext}
                    >
                      Tiếp tục
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Step 2: Chọn thời gian */}
            {currentStep === 1 && (
              <div className="w-full animate-fadeIn">
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-cyan-100 shadow-[0_10px_40px_rgba(14,165,233,0.08)]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-sky-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-sm">
                      <Calendar className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Chọn thời gian</h3>
                      <p className="text-sm text-gray-500">Lịch khám có sẵn cho bạn</p>
                    </div>
                  </div>
                  
                  {/* Calendar Navigation */}
                  <div className="flex items-center justify-between mb-8">
                    <button
                      className="w-14 h-14 rounded-2xl bg-white border border-sky-100 flex items-center justify-center text-sky-500 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50 transition-all disabled:opacity-30"
                      disabled={Number(currentWeek) === 0}
                      onClick={() => setCurrentWeek(0)}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                      <div className="text-2xl font-medium text-gray-800 mb-1">
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
                      className="w-14 h-14 rounded-2xl bg-white border border-sky-100 flex items-center justify-center text-sky-500 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50 transition-all disabled:opacity-30"
                      disabled={Number(currentWeek) === 1}
                      onClick={() => setCurrentWeek(1)}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {/* Time Filter */}
                  <div className="flex justify-center mb-8">
                    <div className="bg-sky-50/80 rounded-2xl p-1.5 inline-flex shadow-sm">
                      <button
                        className={`px-8 py-2.5 rounded-xl font-medium transition-all text-base ${
                          timeFilter === 'morning' 
                            ? 'bg-white text-sky-700 shadow-md' 
                            : 'text-gray-600 hover:text-sky-700'
                        }`}
                        onClick={() => setTimeFilter('morning')}
                      >
                        Buổi sáng
                      </button>
                      <button
                        className={`px-8 py-2.5 rounded-xl font-medium transition-all text-base ${
                          timeFilter === 'afternoon' 
                            ? 'bg-white text-sky-700 shadow-md' 
                            : 'text-gray-600 hover:text-sky-700'
                        }`}
                        onClick={() => setTimeFilter('afternoon')}
                      >
                        Buổi chiều
                      </button>
                    </div>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-sky-50">
                    {/* Header */}
                    <div className="grid grid-cols-8 gap-3 mb-6">
                      <div className="text-center text-sm font-medium text-gray-500">Giờ</div>
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, dayIdx) => (
                        <div key={day} className={`text-center text-sm font-semibold py-2 ${
                          dayIdx === 6 ? 'text-red-500' : 'text-sky-700'
                        }`}>
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Time Slots */}
                    <div className="space-y-4">
                      {(timeFilter === 'morning' ? ['08:00', '09:00', '10:00', '11:00'] : ['13:00', '14:00', '15:00', '16:00', '17:00']).map(slot => (
                        <div key={slot} className="grid grid-cols-8 gap-3 items-center">
                          {/* Time Label */}
                          <div className="text-center text-sm font-medium text-gray-600 py-3">
                            {slot}
                          </div>
                          {/* Day Buttons */}
                          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, dayIdx) => {
                            const isSelected = selectedSlot?.day === day && selectedSlot?.time === slot;
                            const today = new Date();
                            const weekStart = startOfWeek(addDays(today, currentWeek * 7), { weekStartsOn: 1 });
                            const slotDate = addDays(weekStart, dayIdx);
                            const slotDateStr = formatInTimeZone(slotDate, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
                            const slotHour = slot;
                            const isAvailable = allSlotTimes.some(st => {
                              if (st.status !== 'available') return false;
                              const stDateStr = formatInTimeZone(st.start_time, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
                              const stHour = formatInTimeZone(st.start_time, 'Asia/Ho_Chi_Minh', 'HH:00');
                              return stDateStr === slotDateStr && stHour === slotHour;
                            });
                            return (
                              <button
                                key={day + slot}
                                className={`h-14 w-full rounded-xl border transition-all duration-200 ${
                                  isAvailable
                                    ? (isSelected 
                                        ? 'bg-gradient-to-r from-sky-500 to-cyan-500 border-sky-500 text-white shadow-lg transform scale-105' 
                                        : 'bg-white border-sky-100 hover:border-sky-300 hover:bg-sky-50 text-gray-600 hover:shadow-sm')
                                    : 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                }`}
                                onClick={isAvailable ? () => handleOpenConsultantDrawer(day, slot) : undefined}
                                disabled={!isAvailable}
                                title={isAvailable ? '' : 'Không có tư vấn viên'}
                              >
                                {isSelected && <Check className="w-5 h-5 mx-auto" />}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Summary & Navigation */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-2xl border border-sky-100 shadow-md">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        {form.serviceId && (
                          <div className="text-base text-gray-700">
                            <span className="font-medium">{services.find(s => s._id === form.serviceId)?.name}</span> • {services.find(s => s._id === form.serviceId)?.duration || ''}
                          </div>
                        )}
                        {selectedSlot && (
                          <div className="text-base text-gray-700">
                            {selectedSlot.day}, {getSelectedSlotDateStr()}, {selectedSlot.time}
                            {selectedConsultant && (
                              <>
                                <span className="mx-2">|</span>
                                <span>Chuyên viên: <span className="font-semibold">{consultants.find(c => c._id === selectedConsultant)?.accountId?.fullName || "Không xác định"}</span></span>
                              </>
                            )}
                          </div>
                        )}
                        {form.serviceId && (
                          <div className="text-xl font-semibold text-sky-700">
                            {services.find(s => s._id === form.serviceId)?.price?.toLocaleString('vi-VN')}đ
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4">
                        <button
                          className="bg-gray-100 text-gray-700 py-3 px-8 rounded-xl font-semibold hover:bg-gray-200 transition-colors shadow-sm text-base border border-gray-200"
                          onClick={handleBack}
                        >
                          Quay lại
                        </button>
                        <button
                          className="bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white py-3 px-10 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-base"
                          onClick={handleNext}
                          disabled={!form.serviceId}
                        >
                          Tiếp tục
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Chọn chuyên gia tư vấn */}
            {currentStep === 2 && (
              <div className="w-full animate-fadeIn">
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-cyan-100 shadow-[0_10px_40px_rgba(14,165,233,0.08)]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-sky-100 to-indigo-200 rounded-2xl flex items-center justify-center shadow-sm">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Chọn chuyên gia tư vấn</h3>
                      <p className="text-sm text-gray-500">Chọn chuyên gia phù hợp với nhu cầu của bạn</p>
                    </div>
                  </div>
                  
                  {selectedSlot ? (
                    <>
                      <div className="mb-6 p-4 bg-sky-50/80 rounded-xl border border-sky-100">
                        <div className="flex items-center gap-3 text-gray-700">
                          <Calendar className="w-5 h-5 text-sky-600" />
                          <span>Thời gian đã chọn: <span className="font-medium">{selectedSlot.day}, {getSelectedSlotDateStr()}, {selectedSlot.time}</span></span>
                        </div>
                      </div>
                      
                      <div className="mb-8">
                        <h4 className="text-lg font-medium text-gray-700 mb-4">Chuyên gia có sẵn:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableConsultants.length > 0 ? (
                            availableConsultants.map(consultant => (
                              <div
                                key={consultant._id}
                                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                                  selectedConsultant === consultant._id 
                                    ? 'bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-200 shadow-md' 
                                    : 'bg-white border-gray-100 hover:border-sky-200 hover:shadow-sm'
                                }`}
                                onClick={() => setSelectedConsultant(consultant._id)}
                              >
                                <div className="flex items-center gap-4">
                                  {consultant.photoUrl ? (
                                    <img
                                      src={consultant.photoUrl}
                                      alt={consultant.fullName}
                                      className="w-16 h-16 rounded-full object-cover object-center border border-gray-200 shadow"
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "/avarta.png";
                                      }}
                                    />
                                  ) : (
                                    <User className="w-7 h-7 text-gray-400" />
                                  )}
                                  <div>
                                    <div className="font-medium text-gray-800 text-lg">{consultant.fullName}</div>
                                    {consultant.experience && (
                                      <div className="text-sm text-gray-600">Kinh nghiệm: {consultant.experience} năm</div>
                                    )}
                                    {consultant.introduction && (
                                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">{consultant.introduction}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 p-8 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-gray-100">
                              Không có chuyên gia nào khả dụng cho khung giờ này. Vui lòng chọn thời gian khác.
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-8 p-6 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl border border-sky-100 shadow-md">
                        <div className="flex justify-between items-center">
                          <div className="space-y-2">
                            {form.serviceId && (
                              <div className="text-base text-gray-700">
                                <span className="font-medium">{services.find(s => s._id === form.serviceId)?.name}</span>
                              </div>
                            )}
                            <div className="text-base text-gray-700">
                              {selectedSlot.day}, {getSelectedSlotDateStr()}, {selectedSlot.time}
                            </div>
                            {selectedConsultant && (
                              <div className="text-base text-gray-700">
                                Chuyên viên: <span className="font-semibold">{availableConsultants.find(c => c._id === selectedConsultant)?.fullName || "Không xác định"}</span>
                              </div>
                            )}
                            {form.serviceId && (
                              <div className="text-xl font-semibold text-sky-700">
                                {services.find(s => s._id === form.serviceId)?.price?.toLocaleString('vi-VN')}đ
                              </div>
                            )}
                          </div>
                          <div className="flex gap-4">
                            <button
                              className="bg-gray-100 text-gray-700 py-3 px-8 rounded-xl font-semibold hover:bg-gray-200 transition-colors shadow-sm text-base border border-gray-200"
                              onClick={handleBack}
                            >
                              Quay lại
                            </button>
                            <button
                              className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white py-3 px-10 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-base"
                              onClick={handleNext}
                              disabled={!selectedConsultant}
                            >
                              Tiếp tục
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-10 text-center">
                      <div className="text-gray-500 mb-4">Vui lòng chọn thời gian trước khi chọn chuyên gia</div>
                      <button
                        className="bg-gray-100 text-gray-700 py-3 px-8 rounded-xl font-semibold hover:bg-gray-200 transition-colors shadow-sm text-base border border-gray-200"
                        onClick={handleBack}
                      >
                        Quay lại chọn thời gian
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Step 4: Điền thông tin cá nhân */}
            {currentStep === 3 && (
              <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg p-10 border border-cyan-100 flex flex-col gap-8 animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                    <span className="text-sm font-medium text-sky-600 tracking-wide uppercase">Bước 4</span>
                    <div className="w-8 h-px bg-gradient-to-r from-sky-500 to-transparent"></div>
                  </div>
                  <h2 className="text-3xl font-semibold text-gray-800 mb-2 tracking-tight">Điền thông tin cá nhân</h2>
                  <p className="text-gray-600 text-lg">Vui lòng nhập thông tin liên hệ để xác nhận đặt lịch</p>
                </div>
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-gray-700 mb-2 text-base font-medium">Họ và tên</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Nhập họ và tên"
                      className={`w-full border ${formErrors.name ? 'border-red-300' : 'border-sky-100'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${formErrors.name ? 'focus:ring-red-500' : 'focus:ring-sky-500'} shadow-sm hover:border-sky-300 text-base`}
                      value={form.name}
                      onChange={handleChange}
                      onBlur={(e) => validateField('name', e.target.value)}
                    />
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 text-base font-medium">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="Nhập số điện thoại"
                      className={`w-full border ${formErrors.phone ? 'border-red-300' : 'border-sky-100'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${formErrors.phone ? 'focus:ring-red-500' : 'focus:ring-sky-500'} shadow-sm hover:border-sky-300 text-base`}
                      value={form.phone}
                      onChange={handleChange}
                      onBlur={(e) => validateField('phone', e.target.value)}
                    />
                    {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 text-base font-medium">Giới tính</label>
                    <select
                      name="gender"
                      className="w-full border border-sky-100 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm hover:border-sky-300 text-base"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 text-base font-medium">Lý do cần tư vấn</label>
                    <textarea
                      name="reason"
                      required
                      placeholder="Mô tả ngắn gọn lý do bạn cần tư vấn"
                      className={`w-full border ${formErrors.reason ? 'border-red-300' : 'border-sky-100'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${formErrors.reason ? 'focus:ring-red-500' : 'focus:ring-sky-500'} shadow-sm hover:border-sky-300 text-base resize-none`}
                      rows={3}
                      value={form.reason}
                      onChange={handleChange}
                      onBlur={(e) => validateField('reason', e.target.value)}
                    />
                    {formErrors.reason && <p className="text-red-500 text-sm mt-1">{formErrors.reason}</p>}
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Tối thiểu 10 ký tự</span>
                      <span>{form.reason.length}/500</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 text-base font-medium">Ghi chú (tuỳ chọn)</label>
                    <textarea
                      name="note"
                      placeholder="Ghi chú cho chuyên viên (nếu có)"
                      className="w-full border border-sky-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm hover:border-sky-300 text-base resize-none"
                      rows={3}
                      value={form.note}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-4 mt-4">
                  <button
                    type="button"
                    className="bg-gray-100 text-gray-700 py-3 px-8 rounded-xl font-semibold hover:bg-gray-200 transition-colors shadow-sm text-base border border-gray-200"
                    onClick={handleBack}
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    className="bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white py-3 px-10 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-base"
                    onClick={handleNext}
                    disabled={!form.name || !form.phone || !form.reason || !!formErrors.name || !!formErrors.phone || !!formErrors.reason}
                  >
                    Tiếp tục
                  </button>
                </div>
              </form>
            )}
            {/* Step 5: Thanh toán */}
            {currentStep === 4 && (
              <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg p-10 border border-cyan-100 flex flex-col gap-8 animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                    <span className="text-sm font-medium text-sky-600 tracking-wide uppercase">Bước 5</span>
                    <div className="w-8 h-px bg-gradient-to-r from-sky-500 to-transparent"></div>
                  </div>
                  <h2 className="text-3xl font-semibold text-gray-800 mb-2 tracking-tight">Thanh toán & xác nhận</h2>
                  <p className="text-gray-600 text-lg">Kiểm tra lại thông tin và chọn phương thức thanh toán</p>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex justify-between items-center bg-sky-50/80 rounded-xl px-6 py-4 shadow-sm">
                    <span className="text-gray-600">Dịch vụ:</span>
                    <span className="font-medium text-gray-800">
                      {form.serviceId ? services.find(s => s._id === form.serviceId)?.name : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-sky-50/80 rounded-xl px-6 py-4 shadow-sm">
                    <span className="text-gray-600">Giá:</span>
                    <span className="font-medium text-sky-700">
                      {form.serviceId ? services.find(s => s._id === form.serviceId)?.price?.toLocaleString('vi-VN') + 'đ' : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-sky-50/80 rounded-xl px-6 py-4 shadow-sm">
                    <span className="text-gray-600">Tư vấn viên:</span>
                    <span className="font-medium text-gray-800">
                      {selectedConsultant ? (consultants.find(c => c._id === selectedConsultant)?.accountId?.fullName || "Không xác định") : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-sky-50/80 rounded-xl px-6 py-4 shadow-sm">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium text-gray-800">
                      {selectedSlot ? `${selectedSlot.day}, ${getSelectedSlotDateStr()}, ${selectedSlot.time}` : '--'}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mb-2">
                    <div className="flex justify-between font-semibold text-xl">
                      <span>Tổng cộng:</span>
                      <span className="text-sky-700">
                        {form.serviceId ? services.find(s => s._id === form.serviceId)?.price?.toLocaleString('vi-VN') + 'đ' : '0đ'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-3 text-base font-medium">Phương thức thanh toán</label>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border border-sky-100 rounded-xl cursor-pointer hover:bg-sky-50/30 transition-all text-base hover:border-sky-300">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={form.paymentMethod === 'card'}
                          onChange={handleChange}
                          className="mr-3 w-5 h-5 text-sky-600"
                        />
                        <span>Thẻ tín dụng / Ghi nợ <span className="text-gray-500">(Visa, Mastercard, JCB)</span></span>
                      </label>
                      <label className="flex items-center p-4 border border-sky-100 rounded-xl cursor-pointer hover:bg-sky-50/30 transition-all text-base hover:border-sky-300">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="transfer"
                          checked={form.paymentMethod === 'transfer'}
                          onChange={handleChange}
                          className="mr-3 w-5 h-5 text-sky-600"
                        />
                        <span>Chuyển khoản ngân hàng <span className="text-gray-500">(trực tiếp)</span></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between gap-4 mt-4">
                  <button
                    type="button"
                    className="bg-gray-100 text-gray-700 py-3 px-8 rounded-xl font-semibold hover:bg-gray-200 transition-colors shadow-sm text-base border border-gray-200"
                    onClick={handleBack}
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white py-3 px-10 rounded-xl font-semibold transition-colors shadow-md text-base"
                  >
                    Xác nhận đặt lịch
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Bằng cách nhấn nút xác nhận, bạn đồng ý với các điều khoản và điều kiện của chúng tôi
                </p>
              </form>
            )}
            {/* Step 6: Bill */}
            {currentStep === 5 && bill && (
              <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-10 border border-cyan-100 flex flex-col gap-8 animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-emerald-600 tracking-wide uppercase">Đặt lịch thành công</span>
                    <div className="w-8 h-px bg-gradient-to-r from-emerald-500 to-transparent"></div>
                  </div>
                  <h2 className="text-3xl font-bold text-emerald-700 mb-2 tracking-tight">Hóa đơn đặt lịch</h2>
                  <p className="text-gray-600 text-lg">Cảm ơn bạn đã tin tưởng sử dụng dịch vụ!</p>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 rounded-2xl border border-emerald-100 shadow-md">
                  <div className="flex flex-col gap-4 text-base text-gray-700">
                    <div className="flex justify-between border-b border-emerald-100 pb-3">
                      <span className="text-gray-600">Dịch vụ:</span>
                      <span className="font-semibold text-gray-800">{bill.service?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-100 pb-3">
                      <span className="text-gray-600">Chuyên viên:</span>
                      <span className="font-semibold text-gray-800">{bill.consultant?.accountId?.fullName || "Không xác định"}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-100 pb-3">
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="font-medium">{bill.slot ? `${bill.slot.day}, ${bill.dateStr}, ${bill.slot.time}` : '--'}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-100 pb-3">
                      <span className="text-gray-600">Khách hàng:</span>
                      <span className="font-medium">{bill.fullName}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-100 pb-3">
                      <span className="text-gray-600">SĐT:</span>
                      <span className="font-medium">{bill.phone}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-100 pb-3">
                      <span className="text-gray-600">Giới tính:</span>
                      <span className="font-medium">{bill.gender === 'male' ? 'Nam' : 'Nữ'}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-100 pb-3">
                      <span className="text-gray-600">Lý do tư vấn:</span>
                      <span className="font-medium">{bill.reason}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-emerald-700">{bill.price?.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-10 py-4 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105" onClick={() => window.location.reload()}>Đặt lịch mới</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      {/* Drawer chọn chuyên viên tư vấn */}
      {showConsultantDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setShowConsultantDrawer(false)}></div>
          <div className="relative h-full w-1/4 min-w-[350px] bg-white/95 shadow-2xl flex flex-col animate-slideInRight border-l border-sky-100">
            <div className="flex items-center justify-between px-8 py-6 border-b border-sky-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-cyan-200 rounded-xl flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Chọn chuyên gia tư vấn</h3>
              </div>
              <button className="text-gray-400 hover:text-sky-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-sky-50 transition-all" onClick={() => setShowConsultantDrawer(false)}>&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {(expandConsultants ? availableConsultants : availableConsultants.slice(0, MAX_VISIBLE_CONSULTANTS)).map(consultant => (
                <div
                  key={consultant._id}
                  className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    pendingConsultant === consultant._id 
                      ? 'bg-gradient-to-r from-sky-50 to-cyan-50 border-sky-200 shadow-md' 
                      : 'bg-white border-gray-100 hover:border-sky-200 hover:shadow-sm'
                  }`}
                  onClick={() => {
                    setPendingConsultant(consultant._id);
                    setSelectedConsultant(consultant._id);
                    setSelectedSlot(pendingSlot);
                    setShowConsultantDrawer(false);
                    setExpandConsultants(false);
                  }}
                >
                  <div className="flex items-center gap-4">
                    {consultant.photoUrl ? (
                      <img
                        src={consultant.photoUrl}
                        alt={consultant.fullName}
                        className="w-16 h-16 rounded-full object-cover object-center border border-gray-200 shadow"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/avarta.png";
                        }}
                      />
                    ) : (
                      <User className="w-7 h-7 text-gray-400" />
                    )}
                    <div>
                      <div className="font-medium text-gray-800 text-lg">{consultant.fullName}</div>
                      {consultant.experience && (
                        <div className="text-sm text-gray-600">Kinh nghiệm: {consultant.experience} năm</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {!expandConsultants && availableConsultants.length > MAX_VISIBLE_CONSULTANTS && (
                <div className="h-12 rounded-2xl border border-dashed border-sky-200 bg-white/80 flex items-center justify-center text-sky-500 text-base font-medium cursor-pointer hover:bg-sky-50 transition-all select-none p-4"
                  onClick={() => setExpandConsultants(true)}
                >
                  + Xem thêm chuyên viên tư vấn
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal/cửa sổ thông báo lỗi */}
      {showError && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white/95 rounded-3xl shadow-xl p-8 max-w-md w-full flex flex-col items-center animate-fadeIn border border-red-100">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <div className="text-3xl text-red-500">&#9888;</div>
            </div>
            <div className="text-xl font-semibold text-red-700 mb-4 text-center">{showError}</div>
            <button className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold hover:from-red-700 hover:to-red-600 transition-all shadow-md" onClick={() => setShowError(null)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
