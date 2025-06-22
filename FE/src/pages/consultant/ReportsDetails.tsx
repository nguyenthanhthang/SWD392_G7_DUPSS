import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Phone, Mail, MapPin, Clipboard, ArrowLeft, Save, User, FileDown } from 'lucide-react';
import { getAccountByIdApi, getAppointmentByUserIdApi } from '../../api';

// Interfaces
interface ApiAppointment {
  _id: string;
  dateBooking: string;
  status: string;
  user_id: string;
  consultant_id: string;
  service_id: string;
  reason: string;
  note?: string;
}

interface RecordOfAppointment {
  _id: string;
  appointmentId: string;
  customer_Id: string;
  nameOfPatient: string;
  ageOfPatient: number;
  condition: string;
  status: string;
  consultation_notes: string;
  recommendations: string;
  dateOfAppointment: string;
  timeOfAppointment: string;
}

interface PatientInfo {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  yearOfBirth?: number;
  address?: string;
  photoUrl?: string;
  maritalStatus?: string;
  occupation?: string;
  emergencyContact?: string;
}

const ReportsDetails = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<RecordOfAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [newRecord, setNewRecord] = useState({
    appointmentId: '',
    condition: '',
    status: 'completed',
    consultation_notes: '',
    recommendations: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const patientData = await getAccountByIdApi(patientId);
        const appointmentData = await getAppointmentByUserIdApi(patientId);
        
        setPatient(patientData);
        setAppointments(appointmentData);

        // Map appointment data to detailed record format for display
        const records = appointmentData
          .filter((app: ApiAppointment) => app.status === 'completed') // Chỉ hiển thị các buổi đã hoàn thành
          .map((app: ApiAppointment) => ({
            _id: app._id,
            appointmentId: app._id,
            customer_Id: app.user_id,
            nameOfPatient: patientData.fullName,
            ageOfPatient: calculateAge(patientData.yearOfBirth),
            condition: app.reason,
            status: app.status,
            consultation_notes: app.note || 'Bệnh nhân không cung cấp ghi chú ban đầu.',
            recommendations: 'Chưa có khuyến nghị chính thức.',
            dateOfAppointment: app.dateBooking,
            timeOfAppointment: new Date(app.dateBooking).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit'}),
          }));
        setFilteredRecords(records.reverse()); // Show latest first

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu chi tiết báo cáo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.appointmentId) {
      alert("Vui lòng chọn một buổi tư vấn.");
      return;
    }
    // Logic để gửi dữ liệu đi (gọi API)
    console.log("Submitting new record:", {
      ...newRecord,
      customer_Id: patientId,
      nameOfPatient: patient?.fullName,
      ageOfPatient: patient ? calculateAge(patient.yearOfBirth) : 0,
    });
    // Reset form sau khi submit
    setNewRecord({
      appointmentId: '',
      condition: '',
      status: 'completed',
      consultation_notes: '',
      recommendations: '',
    });
    alert("Đã tạo ghi nhận thành công!");
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const calculateAge = (yearOfBirth?: number) => {
    if (!yearOfBirth) return 0;
    return new Date().getFullYear() - yearOfBirth;
  };
  const getStatusColor = (status: string) => status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  const getStatusText = (status: string) => status === 'completed' ? 'Đã hoàn thành' : 'Trạng thái khác';

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!patient) return <div className="p-6">Không tìm thấy bệnh nhân.</div>;

  const ageDisplay = patient.yearOfBirth ? `${calculateAge(patient.yearOfBirth)} tuổi` : "Chưa rõ tuổi";

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8 text-sm">
          <button onClick={() => navigate(-1)} className="flex items-center text-[#283593] hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </button>
          <span className="mx-2">/</span>
          <span className="font-medium">{patient.fullName}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-1 space-y-8 flex flex-col">
            {/* Patient Info Card (Compacted) */}
            <div className="bg-white rounded-2xl shadow border border-[#DBE8FA] overflow-hidden">
              <div className="p-4 flex items-center gap-4 border-b border-[#DBE8FA]">
                <User className="w-6 h-6 text-[#283593]" />
                <h2 className="text-lg font-semibold text-[#283593]">Thông tin bệnh nhân</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <img src={patient.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.fullName)}`} alt={patient.fullName} className="w-20 h-20 rounded-full object-cover" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{patient.fullName}</h3>
                    <p className="text-gray-500">{ageDisplay}, {patient.gender || 'Chưa rõ'}</p>
                  </div>
                </div>
                <div className="text-sm space-y-2">
                  {patient.email && <div className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 text-[#283593] flex-shrink-0" /><span className="text-gray-700">{patient.email}</span></div>}
                  {patient.phoneNumber && <div className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 text-[#283593] flex-shrink-0" /><span className="text-gray-700">{patient.phoneNumber}</span></div>}
                  {patient.address && <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-[#283593] flex-shrink-0" /><span className="text-gray-700">{patient.address}</span></div>}
                </div>
              </div>
            </div>
            {/* --- Lịch sử tư vấn (Redesigned & Compacted) --- */}
            <div className="bg-white rounded-2xl shadow border border-[#DBE8FA] overflow-hidden">
              <div className="p-4 border-b border-[#DBE8FA]">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <h2 className="text-lg font-semibold text-[#283593] pt-1">Lịch sử buổi tư vấn</h2>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#E3EAFD] text-[#283593] font-semibold border border-[#DBE8FA] hover:bg-[#d1e0fa]">
                        <FileDown className="w-3 h-3" />
                        <span>Xuất báo cáo</span>
                    </button>
                </div>
                 {/* Tabs */}
                <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 w-fit">
                    <button className="px-4 py-1 rounded-md text-sm font-medium text-white bg-[#283593]">Tất cả</button>
                    <button className="px-4 py-1 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">Sắp tới</button>
                    <button className="px-4 py-1 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">Đã qua</button>
                </div>
              </div>
              {/* Search and Filters */}
              <div className="p-4 border-b border-[#DBE8FA]">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-grow min-w-[150px]">
                      <input type="text" placeholder="Tìm kiếm..." className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Lọc:</span>
                      <select className="p-2 border border-gray-300 rounded-md text-sm">
                          <option value="">Tất cả</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="in-progress">Đang xử lý</option>
                      </select>
                    </div>
                </div>
              </div>
              {/* Record List */}
              <div className="p-4">
                {filteredRecords.length > 0 ? (
                  <div className="space-y-4">
                    {filteredRecords.map((record) => (
                      <div key={record._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-[#283593]" />
                            <span className="font-medium text-gray-800">{formatDate(record.dateOfAppointment)}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">{record.timeOfAppointment}</span>
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getStatusColor(record.status)}`}>{getStatusText(record.status)}</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <h4 className="font-semibold text-gray-700">Tình trạng:</h4>
                            <p className="text-gray-600 pl-2">{record.condition}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-700">Ghi chú:</h4>
                            <p className="text-gray-600 pl-2 whitespace-pre-line">{record.consultation_notes}</p>
                          </div>
                           <div>
                            <h4 className="font-semibold text-gray-700">Khuyến nghị:</h4>
                            <p className="text-gray-600 pl-2 whitespace-pre-line">{record.recommendations}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Chưa có ghi nhận nào cho bệnh nhân này.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="lg:col-span-2 flex flex-col">
            {/* --- Tạo Ghi Nhận Mới (Form) --- */}
            <div className="bg-white rounded-2xl shadow border border-[#DBE8FA] overflow-hidden">
              <div className="p-4 flex items-center gap-4 border-b border-[#DBE8FA]">
                <Clipboard className="w-6 h-6 text-[#283593]" />
                <h2 className="text-lg font-semibold text-[#283593]">Tạo Ghi Nhận Mới</h2>
              </div>
              <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
                <div>
                  <label htmlFor="appointmentId" className="block text-sm font-medium text-gray-700 mb-1">Buổi tư vấn</label>
                  <select id="appointmentId" name="appointmentId" value={newRecord.appointmentId} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md text-sm">
                    <option value="">-- Chọn buổi tư vấn --</option>
                    {appointments.filter(a => a.status === 'scheduled' || a.status === 'completed').map(app => (
                      <option key={app._id} value={app._id}>
                        {formatDate(app.dateBooking)} - {app.reason}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">Tình trạng / Chủ đề</label>
                  <input type="text" id="condition" name="condition" value={newRecord.condition} onChange={handleInputChange} placeholder="VD: Stress, Lo âu..." className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label htmlFor="consultation_notes" className="block text-sm font-medium text-gray-700 mb-1">Ghi chú buổi tư vấn</label>
                  <textarea id="consultation_notes" name="consultation_notes" value={newRecord.consultation_notes} onChange={handleInputChange} rows={4} placeholder="Chi tiết về buổi tư vấn..." className="w-full p-2 border border-gray-300 rounded-md text-sm"></textarea>
                </div>
                <div>
                  <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700 mb-1">Khuyến nghị</label>
                  <textarea id="recommendations" name="recommendations" value={newRecord.recommendations} onChange={handleInputChange} rows={3} placeholder="Các bước tiếp theo cho bệnh nhân..." className="w-full p-2 border border-gray-300 rounded-md text-sm"></textarea>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái ghi nhận</label>
                  <select id="status" name="status" value={newRecord.status} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md text-sm">
                    <option value="completed">Đã hoàn thành</option>
                    <option value="in-progress">Đang xử lý</option>
                  </select>
                </div>
                <button type="submit" className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-[#283593] text-white font-semibold hover:bg-[#3a4bb3]">
                  <Save className="w-4 h-4" />
                  Lưu Ghi Nhận
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDetails;
