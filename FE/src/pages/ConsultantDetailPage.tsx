import { useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useEffect, useState } from 'react';
import { getConsultantByIdApi, getAllServicesApi, getAllCertificatesApi, getSlotTimeByConsultantIdApi } from '../api';
import { addDays, startOfWeek, endOfWeek, format, isWithinInterval, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

// Mock data lịch dạng tuần: bookedSlots[day][hour] = { title, color, ... }
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
}

interface Certificate {
  _id: string;
  consultant_id: string | { _id: string };
  title: string;
  type: string;
  issuedBy: number;
  issueDate: string;
  expireDate?: string;
  description?: string;
  fileUrl: string;
}

interface SlotTime {
  _id: string;
  consultant_id: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  status: 'available' | 'booked';
}

function ConsultantDetailPage() {
  const { id } = useParams();
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho modal booking
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', reason: '', serviceId: '' });
  const [services, setServices] = useState<Service[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [slotTimes, setSlotTimes] = useState<SlotTime[]>([]);
  const [slotTimeError, setSlotTimeError] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(0); // 0: tuần này, 1: tuần sau

  // Tính ngày đầu và cuối tuần dựa trên currentWeek
  const today = new Date();
  const weekStart = startOfWeek(addDays(today, currentWeek * 7), { weekStartsOn: 1 }); // Thứ 2
  const weekEnd = endOfWeek(addDays(today, currentWeek * 7), { weekStartsOn: 1 }); // Chủ nhật

  // DEBUG: Log weekStart, weekEnd và từng slot để kiểm tra lệch múi giờ
  console.log('weekStart:', weekStart.toISOString(), 'local:', weekStart);
  console.log('weekEnd:', weekEnd.toISOString(), 'local:', weekEnd);
  slotTimes.forEach(st => {
    const d = parseISO(st.start_time);
    console.log('slot:', st.start_time, '->', d.toISOString(), 'local:', d,
      'isWithinInterval:', isWithinInterval(d, { start: weekStart, end: weekEnd }));
  });
  // Lọc slot time thuộc tuần đang xem
  const slotTimesOfWeek = slotTimes.filter(st => {
    const d = parseISO(st.start_time);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });

  // DEBUG: Log dữ liệu slotTimes và slotTimesOfWeek
  console.log('slotTimes:', slotTimes);
  console.log('slotTimesOfWeek:', slotTimesOfWeek);

  useEffect(() => {
    const fetchConsultant = async () => {
      try {
        setLoading(true);
        const data = await getConsultantByIdApi(id as string);
        setConsultant(data);
        setError(null);
        // Sau khi có consultant, lấy certificates
        const allCertificates = await getAllCertificatesApi();
        const filtered = allCertificates.filter((c: Certificate) => {
          if (typeof c.consultant_id === 'string') return c.consultant_id === data._id;
          return c.consultant_id?._id === data._id;
        });
        // Sắp xếp theo issueDate tăng dần
        filtered.sort((a: Certificate, b: Certificate) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
        setCertificates(filtered);
        // Lấy slot time của consultant
        try {
          const slotList = await getSlotTimeByConsultantIdApi(data._id);
          setSlotTimes(Array.isArray(slotList) ? slotList : []);
          setSlotTimeError(null);
        } catch {
          setSlotTimes([]);
          setSlotTimeError('Không thể tải lịch tư vấn của chuyên gia này.');
        }
      } catch (error) {
        setError('Không thể tải thông tin chuyên gia.');
        setConsultant(null);
        setCertificates([]);
        setSlotTimes([]);
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchConsultant();
  }, [id]);

  // Lấy danh sách dịch vụ khi mở modal
  useEffect(() => {
    if (showModal) {
      getAllServicesApi().then(setServices).catch(() => setServices([]));
    }
  }, [showModal]);

  const handleOpenModal = (day: string, time: string) => {
    setSelectedSlot({ day, time });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ name: '', phone: '', reason: '', serviceId: '' });
    setSelectedSlot(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Đã gửi yêu cầu đặt lịch cho ${consultant?.accountId?.fullName || ''} vào ${selectedSlot?.day} lúc ${selectedSlot?.time}\nHọ tên: ${form.name}\nSĐT: ${form.phone}\nLý do: ${form.reason}`);
    handleCloseModal();
  };

  if (loading) return <div className="text-center py-20 text-xl">Đang tải dữ liệu...</div>;
  if (error || !consultant) return <div className="text-center py-20 text-xl text-red-600">{error || 'Không tìm thấy chuyên gia.'}</div>;

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Thông tin bên trái */}
          <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-8">
            <img src={consultant.accountId?.photoUrl || 'https://via.placeholder.com/150'} alt={consultant.accountId?.fullName || 'Chuyên gia'} className="w-36 h-36 rounded-full object-cover border-4 border-blue-200 mb-4" />
            <h2 className="text-2xl font-bold text-blue-700 mb-1 text-center">{consultant.accountId?.fullName || 'Chuyên gia'}</h2>
            <div className="text-blue-600 font-semibold mb-2 text-center">Chuyên gia tư vấn</div>
            <div className="text-gray-600 mb-3 text-center">{consultant.introduction}</div>
            <div className="flex flex-col gap-1 text-gray-500 text-sm w-full items-center mb-4">
              <span>Email: {consultant.accountId?.email || 'Không có email'}</span>
              <span>SĐT: {consultant.accountId?.phoneNumber || 'Không có số điện thoại'}</span>
              <span>Kinh nghiệm: {typeof consultant.experience === 'number' ? consultant.experience + ' năm' : 'Chưa cập nhật'}</span>
            </div>
            {/* Certificates */}
            <div className="w-full mt-2">
              <h4 className="text-base font-semibold text-blue-700 mb-2 text-center">Chứng chỉ & Bằng cấp</h4>
              {certificates.length === 0 ? (
                <div className="text-gray-400 text-center">Chưa có chứng chỉ nào.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {Object.entries(certificates.reduce((acc, cert) => {
                    const year = new Date(cert.issueDate).getFullYear();
                    if (!acc[year]) acc[year] = [];
                    acc[year].push(cert);
                    return acc;
                  }, {} as Record<string, Certificate[]>)).sort((a, b) => Number(a[0]) - Number(b[0])).map(([year, certs], idx) => (
                    <div key={year}>
                      <div className={`font-light text-base mb-0.5 ${idx === 0 ? 'text-gray-700' : 'text-gray-500'}`}>{year}</div>
                      <div className={`w-full h-px ${idx === 0 ? 'bg-gray-300' : 'bg-gray-300'} mb-2`}></div>
                      <div className="flex flex-col">
                        {certs.map(cert => (
                          <div key={cert._id} className="flex items-center gap-3 px-1 py-1 rounded-md transition-colors hover:bg-purple-50 group cursor-pointer">
                            <img src={cert.fileUrl} alt={cert.title} className="w-10 h-10 object-cover rounded bg-black border border-gray-200 flex-shrink-0" />
                            <div className="font-medium text-sm text-black truncate max-w-[260px] group-hover:text-purple-700" title={cert.title}>{cert.title}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Đường chia dọc */}
          <div className="hidden md:block w-px bg-gray-200 mx-0" style={{ minHeight: '100%' }}></div>
          {/* Lịch bên phải */}
          <div className="w-full md:w-[900px] p-4 md:p-8">
            <div className="mb-4 text-xl font-bold text-blue-700 text-center w-full">
              Lịch tư vấn tuần: {format(weekStart, 'dd/MM/yyyy')} - {format(weekEnd, 'dd/MM/yyyy')}
            </div>
            <div className="overflow-x-auto">
              {slotTimeError ? (
                <div className="text-center text-red-600 py-8">{slotTimeError}</div>
              ) : (
                <div>
                  {/* Header: slot giờ + ngày + nút mũi tên */}
                  <div className="grid grid-cols-9">
                    {/* Nút mũi tên trái */}
                    <div className="flex items-center justify-center bg-gray-50">
                      <button
                        className="text-gray-500 hover:text-blue-600 disabled:opacity-30 focus:outline-none"
                        disabled={currentWeek === 0}
                        onClick={() => setCurrentWeek(0)}
                        aria-label="Tuần trước"
                      >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                    {weekDays.map((day) => (
                      <div key={day} className="text-center font-bold text-gray-600 py-2 bg-gray-50 border-t border-gray-100">
                        {day}
                      </div>
                    ))}
                    {/* Nút mũi tên phải */}
                    <div className="flex items-center justify-center bg-gray-50">
                      <button
                        className="text-gray-500 hover:text-blue-600 disabled:opacity-30 focus:outline-none"
                        disabled={currentWeek === 1}
                        onClick={() => setCurrentWeek(1)}
                        aria-label="Tuần sau"
                      >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  </div>
                  {/* Body: slot giờ + slot từng ngày */}
                  {timeSlots.map(slot => (
                    <div key={slot} className="grid grid-cols-9">
                      {/* Giờ */}
                      <div className="text-right pr-2 font-semibold text-gray-400 py-2 border-t border-gray-100 text-sm bg-white flex items-center justify-end">
                        {slot}
                      </div>
                      {/* Slot từng ngày */}
                      {weekDays.map(day => {
                        // DEBUG: Log từng slotObj
                        const slotObj = slotTimesOfWeek.find(st => {
                          let dayOfWeek, hour;
                          try {
                            dayOfWeek = formatInTimeZone(st.start_time, 'Asia/Ho_Chi_Minh', 'E').substring(0, 3);
                            hour = formatInTimeZone(st.start_time, 'Asia/Ho_Chi_Minh', 'HH:00');
                          } catch {
                            const d = new Date(st.start_time);
                            dayOfWeek = format(d, 'E').substring(0, 3);
                            hour = format(d, 'HH:00');
                          }
                          return dayOfWeek === day && hour === slot;
                        });
                        
                        const isBooked = slotObj?.status === 'booked';
                        const isAvailable = slotObj?.status === 'available';
                        return (
                          <button
                            key={day + slot}
                            className={`h-14 w-full flex items-center justify-center border-t border-l border-gray-200 transition-all focus:outline-none
                              ${isBooked ? 'bg-red-200 text-red-700 cursor-not-allowed' :
                                isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer' :
                                'bg-gray-100 text-gray-400 cursor-not-allowed'}
                            `}
                            style={{ borderRadius: 0 }}
                            onClick={() => isAvailable && handleOpenModal(day, slot)}
                            type="button"
                            disabled={!isAvailable}
                          >
                            {isBooked ? 'Đã đặt' : isAvailable ? 'Có sẵn' : ''}
                          </button>
                        );
                      })}
                      {/* Cột 9 trống cho cân layout */}
                      <div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal booking */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 text-2xl" onClick={handleCloseModal}>&times;</button>
            <h4 className="text-xl font-bold text-blue-700 mb-4">Đặt lịch khám với {consultant.accountId?.fullName || 'Chuyên gia'}</h4>
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
              <select
                name="serviceId"
                required
                className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.serviceId}
                onChange={handleChange}
              >
                <option value="">Chọn dịch vụ</option>
                {services.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
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