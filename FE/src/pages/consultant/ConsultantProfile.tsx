import { useState, useEffect } from 'react';
import whaleLogo from '../../assets/whale.png';
import { PlusCircle, Trash2, Edit, FileText, Eye, EyeOff } from 'lucide-react';
import { getAccountByIdApi, updateAccountApi, changePasswordApi, sendResetPasswordEmailApi, getConsultantByIdApi, updateConsultantApi } from '../../api';
import type { AxiosError } from 'axios';

// Interfaces
interface User {
  _id?: string;
  username?: string;
  email?: string;
  password?: string;
  photoUrl?: string;
  fullName?: string;
  phoneNumber?: string;
  role?: "consultant" | "customer";
  gender?: "nam" | "nữ";
  isVerified?: boolean;
  isDisabled?: boolean;
}

interface ICertificate {
    _id?: string;
    name: string;
    issuer: string;
    issueDate: string;
    fileUrl: string;
}

interface IConsultant {
    _id?: string;
    accountId?: string;
    introduction?: string;
    contact?: string;
    startDateofWork?: string;
    certificates?: ICertificate[];
}

// Mock data
const mockConsultant: IConsultant = {
  _id: 'c1',
  accountId: '1',
  introduction: 'Tôi là chuyên gia tâm lý với hơn 10 năm kinh nghiệm.',
  contact: 'https://linkedin.com/in/consultant01',
  startDateofWork: '2014-05-01',
  certificates: [
    {
      _id: 'cert1',
      name: 'Chứng chỉ Tâm lý học',
      issuer: 'Đại học Quốc gia',
      issueDate: '2014-06-01',
      fileUrl: 'https://example.com/cert1.pdf',
    },
    {
      _id: 'cert2',
      name: 'Chứng chỉ Tham vấn',
      issuer: 'Bộ Y tế',
      issueDate: '2016-09-15',
      fileUrl: 'https://example.com/cert2.pdf',
    },
  ],
};

export default function ConsultantProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<User>({});
  const [editMode, setEditMode] = useState(false);
  const [consultant, setConsultant] = useState<IConsultant>(mockConsultant);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [fieldError, setFieldError] = useState<{ fullName?: string; phoneNumber?: string }>({});
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdStep, setPwdStep] = useState<'email'|'otp'|'newpass'>('email');
  const [pwdEmail, setPwdEmail] = useState('');
  const [pwdOtp, setPwdOtp] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  const [modalCertificate, setModalCertificate] = useState(false);
  const [chungChiDangSua, setChungChiDangSua] = useState<ICertificate | null>(null);
  const [initialCertificateData, setInitialCertificateData] = useState<ICertificate>({ name: '', issuer: '', issueDate: '', fileUrl: ''});
  const [editConsultant, setEditConsultant] = useState(false);
  const [consultantEditData, setConsultantEditData] = useState<IConsultant>(mockConsultant);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      try {
        const data = await getAccountByIdApi(userId);
        setUser(data);
        setEditData(data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchConsultant = async () => {
      if (!user?._id) return;
      try {
        const consultantData = await getConsultantByIdApi(user._id);
        setConsultant(consultantData);
      } catch {
        // Optionally log error or show toast
      }
    };
    if (user?._id) fetchConsultant();
  }, [user?._id]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2000);
  };

  const validateProfile = async () => {
    if (!user?._id) return false;
    if (!editData.fullName) {
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!user?._id) return;
    if (!(await validateProfile())) return;
    try {
      await updateAccountApi(user._id, {
        fullName: editData.fullName,
        phoneNumber: editData.phoneNumber,
      });
      const updated = await getAccountByIdApi(user._id);
      setUser(updated);
      setEditData(updated);
      setEditMode(false);
      showToast('success', 'Cập nhật thành công!');
    } catch {
      showToast('error', 'Cập nhật thất bại!');
    }
  };

  const handleBlurField = async (field: 'fullName' | 'phoneNumber', value: string) => {
    if (!user?._id) return;
    try {
      await updateAccountApi(user._id, { [field]: value });
      setFieldError((prev) => ({ ...prev, [field]: undefined }));
      showToast('success', 'Cập nhật thành công!');
      const updated = await getAccountByIdApi(user._id);
      setUser(updated);
      setEditData(updated);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr?.response?.data?.message) {
        setFieldError((prev) => ({ ...prev, [field]: axiosErr.response!.data.message! }));
      }
    }
  };

  // Password change handlers (API)
  const handleSendOtp = async () => {
    setPwdError('');
    setPwdLoading(true);
    try {
      await sendResetPasswordEmailApi(pwdEmail);
      setPwdStep('otp');
    } catch {
      setPwdError('Không gửi được OTP, kiểm tra email!');
    }
    setPwdLoading(false);
  };

  const handleVerifyOtp = async () => {
    setPwdError('');
    setPwdLoading(true);
    try {
      await fetch('/api/auth/check-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ verifyCode: pwdOtp }) });
      setPwdStep('newpass');
    } catch {
      setPwdError('OTP không đúng hoặc đã hết hạn!');
    }
    setPwdLoading(false);
  };

  const handleChangePassword = async () => {
    setPwdError('');
    setPwdLoading(true);
    try {
      if (!user?.email) throw new Error('No user email');
      await changePasswordApi(user.email, pwdNew, pwdConfirm);
      setShowPwdModal(false);
      setPwdStep('email');
      setPwdEmail(''); setPwdOtp(''); setPwdNew(''); setPwdConfirm('');
      showToast('success', 'Đổi mật khẩu thành công!');
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setPwdError(axiosErr?.response?.data?.message || 'Đổi mật khẩu thất bại!');
    }
    setPwdLoading(false);
  };

  // Certificate handlers (mock)
  const handleCertificateSubmit = async (data: ICertificate) => {
    if (chungChiDangSua) {
      // Update
      setConsultant(prev => ({
        ...prev,
        certificates: prev.certificates?.map(c => c._id === chungChiDangSua._id ? data : c)
      }));
      showToast('success', 'Cập nhật chứng chỉ thành công!');
    } else {
      // Add
      const newCert = { ...data, _id: Math.random().toString(36).slice(2) };
      setConsultant(prev => ({
        ...prev,
        certificates: [...(prev.certificates || []), newCert]
      }));
      showToast('success', 'Thêm chứng chỉ thành công!');
    }
    setModalCertificate(false);
    setChungChiDangSua(null);
  };
  const handleDeleteCertificate = async (certificateId?: string) => {
    setConsultant(prev => ({
      ...prev,
      certificates: prev.certificates?.filter(c => c._id !== certificateId)
    }));
    showToast('success', 'Xóa chứng chỉ thành công!');
  };

  const handleConsultantEdit = () => {
    setConsultantEditData(consultant);
    setEditConsultant(true);
  };

  const handleConsultantCancel = () => {
    setEditConsultant(false);
  };

  const handleConsultantSave = async () => {
    if (!consultant?._id) return;
    try {
      await updateConsultantApi(consultant._id, {
        introduction: consultantEditData.introduction,
        startDateofWork: consultantEditData.startDateofWork,
      });
      const updated = await getConsultantByIdApi(consultant._id);
      setConsultant(updated);
      setEditConsultant(false);
      showToast('success', 'Cập nhật thông tin chuyên gia thành công!');
    } catch {
      showToast('error', 'Cập nhật thông tin chuyên gia thất bại!');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] flex flex-col items-center py-4 px-2 relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 left-[-80px] w-60 h-60 bg-cyan-200 rounded-full opacity-40 blur-2xl z-0"></div>
      <div className="absolute top-1/3 left-[-100px] w-72 h-72 bg-pink-200 rounded-full opacity-35 blur-2xl z-0"></div>
      <div className="absolute bottom-20 left-[-60px] w-44 h-44 bg-blue-200 rounded-full opacity-35 blur-2xl z-0"></div>
      <div className="absolute top-20 right-[-80px] w-60 h-60 bg-cyan-200 rounded-full opacity-40 blur-2xl z-0"></div>
      <div className="absolute top-1/2 right-[-100px] w-72 h-72 bg-pink-200 rounded-full opacity-35 blur-2xl z-0"></div>
      <div className="absolute bottom-10 right-[-60px] w-44 h-44 bg-blue-200 rounded-full opacity-35 blur-2xl z-0"></div>

      <div className="bg-white rounded-3xl shadow-sm flex flex-col w-full max-w-6xl overflow-hidden relative">
        <div className="flex flex-row w-full">
          {/* Main Content */}
          <div className="flex-1">
            <div className="max-w-4xl mx-auto">
                <div className="p-7">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">Hồ sơ chuyên gia</h2>
                  <p className="text-gray-500 mb-8">Quản lý thông tin cá nhân, chuyên môn và các chứng chỉ của bạn.</p>
                  
                  {/* User Info Section */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
                    <div className='flex justify-between items-start'>
                        <h3 className="font-semibold text-gray-700 mb-6">Thông tin cá nhân</h3>
                        {!editMode ? (
                            <button onClick={() => setEditMode(true)} className="text-blue-600 text-sm font-medium flex items-center gap-1">
                                <Edit size={14}/> Chỉnh sửa
                            </button>
                        ) : (
                            <div className='flex gap-2'>
                                <button onClick={() => {setEditMode(false); setEditData(user || {})}} className="text-gray-600 text-sm font-medium">Hủy</button>
                                <button onClick={handleUpdate} className="text-blue-600 text-sm font-medium">Lưu</button>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-500 text-sm mb-2">Họ và tên</label>
                            <input
                                disabled={!editMode}
                                className={`w-full border border-gray-200 rounded-md px-4 py-2 text-gray-700 ${!editMode ? 'bg-gray-50' : 'bg-white'}`}
                                value={editMode ? (editData.fullName || '') : user?.fullName || ''}
                                onChange={e => setEditData({ ...editData, fullName: e.target.value })}
                                onBlur={(e) => handleBlurField('fullName', e.target.value)}
                            />
                            {fieldError.fullName && <div className="text-red-500 text-xs mt-1">{fieldError.fullName}</div>}
                        </div>
                        <div>
                            <label className="block text-gray-500 text-sm mb-2">Số điện thoại</label>
                            <input
                                disabled={!editMode}
                                className={`w-full border border-gray-200 rounded-md px-4 py-2 text-gray-700 ${!editMode ? 'bg-gray-50' : 'bg-white'}`}
                                value={editMode ? (editData.phoneNumber || '') : user?.phoneNumber || ''}
                                onChange={e => setEditData({ ...editData, phoneNumber: e.target.value })}
                                onBlur={(e) => handleBlurField('phoneNumber', e.target.value)}
                            />
                            {fieldError.phoneNumber && <div className="text-red-500 text-xs mt-1">{fieldError.phoneNumber}</div>}
                        </div>
                         <div className="bg-gray-50 rounded-md p-4">
                            <label className="block text-gray-500 text-sm mb-2">Email</label>
                            <div className="text-gray-700 font-medium">{user?.email || ''}</div>
                        </div>
                        <div className="bg-gray-50 rounded-md p-4 flex items-center justify-between">
                            <div>
                                <label className="block text-gray-500 text-sm mb-2">Mật khẩu</label>
                                <div className="text-gray-700 font-medium">••••••</div>
                            </div>
                             <button
                                className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded-lg text-sm font-medium bg-white transition-colors hover:bg-blue-50"
                                onClick={() => setShowPwdModal(true)}
                            >
                                Đổi mật khẩu
                            </button>
                        </div>
                    </div>
                  </div>

                  {/* Consultant Info Section */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
                     <div className='flex justify-between items-start'>
                        <h3 className="font-semibold text-gray-700 mb-6">Thông tin chuyên gia</h3>
                        {!editConsultant ? (
                          <button onClick={handleConsultantEdit} className="text-blue-600 text-sm font-medium flex items-center gap-1">
                            <Edit size={14}/> Chỉnh sửa
                          </button>
                        ) : (
                          <div className='flex gap-2'>
                            <button onClick={handleConsultantCancel} className="text-gray-600 text-sm font-medium">Hủy</button>
                            <button onClick={handleConsultantSave} className="text-blue-600 text-sm font-medium">Lưu</button>
                          </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-gray-500 text-sm mb-2">Ngày bắt đầu làm việc</label>
                             <input
                                type="date"
                                className={`w-full border border-gray-200 rounded-md px-4 py-2 text-gray-700 ${!editConsultant ? 'bg-gray-50' : 'bg-white'}`}
                                value={editConsultant ? (consultantEditData.startDateofWork || '') : (consultant?.startDateofWork || '')}
                                onChange={e => editConsultant && setConsultantEditData({ ...consultantEditData, startDateofWork: e.target.value })}
                                disabled={!editConsultant}
                            />
                        </div>
                         <div className="col-span-2">
                           <label className="block text-gray-500 text-sm mb-2">Giới thiệu bản thân</label>
                           <textarea
                                rows={4}
                                className={`w-full border border-gray-200 rounded-md px-4 py-2 text-gray-700 ${!editConsultant ? 'bg-gray-50' : 'bg-white'}`}
                                placeholder="Viết một vài dòng giới thiệu về kinh nghiệm và chuyên môn của bạn..."
                                value={editConsultant ? (consultantEditData.introduction || '') : (consultant?.introduction || '')}
                                onChange={e => editConsultant && setConsultantEditData({ ...consultantEditData, introduction: e.target.value })}
                                disabled={!editConsultant}
                            />
                        </div>
                    </div>
                  </div>

                  {/* Certificates Section */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-8">
                     <div className='flex justify-between items-start'>
                        <h3 className="font-semibold text-gray-700 mb-6">Quản lý chứng chỉ</h3>
                        <button onClick={() => { setChungChiDangSua(null); setInitialCertificateData({ name: '', issuer: '', issueDate: '', fileUrl: ''}); setModalCertificate(true); }} className="text-blue-600 text-sm font-medium flex items-center gap-1">
                            <PlusCircle size={14}/> Thêm chứng chỉ
                        </button>
                    </div>
                    <div className="space-y-4">
                        {consultant?.certificates?.length === 0 && <p className='text-gray-500 italic'>Chưa có chứng chỉ nào.</p>}
                        {consultant?.certificates?.map(cert => (
                            <div key={cert._id} className="p-4 border rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800">{cert.name}</p>
                                    <p className="text-sm text-gray-500">Cấp bởi: {cert.issuer} - Ngày cấp: {new Date(cert.issueDate).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700"><FileText size={18}/></a>
                                    <button onClick={() => {setChungChiDangSua(cert); setInitialCertificateData(cert); setModalCertificate(true);}} className="text-gray-500 hover:text-indigo-600"><Edit size={18}/></button>
                                    <button onClick={() => handleDeleteCertificate(cert._id)} className="text-gray-500 hover:text-red-600"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>

                </div>
            </div>
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="w-full h-40 mt-12 relative">
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
              <path fill="#b1e2f3" fillOpacity="1" d="M0,128L48,133.3C96,139,192,149,288,144C384,139,480,117,576,128C672,139,768,181,864,176C960,171,1056,117,1152,96C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            <img src={whaleLogo} alt="Whale decoration" className="absolute right-16 bottom-4 w-32 h-auto opacity-80" style={{ transform: "scaleX(-1)" }}/>
          </div>
        </div>
      </div>

      {/* Toasts and Modals */}
      {toast && <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-base font-semibold transition-all ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{toast.message}</div>}
      
      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Đổi mật khẩu</h3>
            {pwdStep==='email' && (
              <>
                <label className="block text-gray-500 text-sm mb-2">Email</label>
                <input className="w-full border border-gray-300 rounded px-3 py-2 mb-3" value={pwdEmail} onChange={e=>setPwdEmail(e.target.value)} placeholder="Nhập email đã đăng ký" />
                {pwdError && <div className="text-red-500 text-xs mb-2">{pwdError}</div>}
                <button className="w-full bg-blue-600 text-white py-2 rounded font-medium" onClick={handleSendOtp} disabled={pwdLoading}>{pwdLoading?'Đang gửi...':'Gửi mã OTP'}</button>
              </>
            )}
            {pwdStep==='otp' && (
              <>
                <label className="block text-gray-500 text-sm mb-2">Mã OTP</label>
                <input className="w-full border border-gray-300 rounded px-3 py-2 mb-3" value={pwdOtp} onChange={e=>setPwdOtp(e.target.value)} placeholder="Nhập mã OTP" />
                {pwdError && <div className="text-red-500 text-xs mb-2">{pwdError}</div>}
                <button className="w-full bg-blue-600 text-white py-2 rounded font-medium" onClick={handleVerifyOtp} disabled={pwdLoading}>{pwdLoading?'Đang xác thực...':'Xác nhận OTP'}</button>
              </>
            )}
            {pwdStep==='newpass' && (
              <>
                <label className="block text-gray-500 text-sm mb-2">Mật khẩu mới</label>
                <div className="relative mb-2">
                  <input
                    type={showPwdNew ? 'text' : 'password'}
                    className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                    value={pwdNew}
                    onChange={e=>setPwdNew(e.target.value)}
                    placeholder="Mật khẩu mới"
                  />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" onClick={()=>setShowPwdNew(v=>!v)}>
                    {showPwdNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="relative mb-3">
                  <input
                    type={showPwdConfirm ? 'text' : 'password'}
                    className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                    value={pwdConfirm}
                    onChange={e=>{
                        setPwdConfirm(e.target.value)
                        if (pwdNew !== e.target.value) {
                            setPwdError("Mật khẩu không khớp.")
                        } else {
                            setPwdError("")
                        }
                    }}
                    placeholder="Xác nhận mật khẩu"
                  />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" onClick={()=>setShowPwdConfirm(v=>!v)}>
                    {showPwdConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {pwdError && <div className="text-red-500 text-xs mb-2">{pwdError}</div>}
                <button className="w-full bg-blue-600 text-white py-2 rounded font-medium" onClick={handleChangePassword} disabled={pwdLoading || !!pwdError}>{pwdLoading?'Đang đổi...':'Đổi mật khẩu'}</button>
              </>
            )}
            <button className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm" onClick={()=>setShowPwdModal(false)}>Hủy</button>
          </div>
        </div>
      )}

      {modalCertificate && (
          <CertificateModal 
            initialData={initialCertificateData}
            onClose={() => setModalCertificate(false)}
            onSubmit={handleCertificateSubmit}
          />
      )}
    </div>
  );
}

// Certificate Modal Component
function CertificateModal({ initialData, onClose, onSubmit }: { initialData: ICertificate, onClose: () => void, onSubmit: (data: ICertificate) => void }) {
    const [data, setData] = useState(initialData);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    }
    
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
                <h3 className="text-lg font-semibold mb-6 text-gray-900">{initialData.name ? 'Chỉnh sửa' : 'Thêm mới'} Chứng chỉ</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                         <div>
                            <label className="block text-gray-600 text-sm mb-1">Tên chứng chỉ</label>
                            <input required className="w-full border border-gray-300 rounded px-3 py-2" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
                        </div>
                         <div>
                            <label className="block text-gray-600 text-sm mb-1">Đơn vị cấp</label>
                            <input required className="w-full border border-gray-300 rounded px-3 py-2" value={data.issuer} onChange={e => setData({...data, issuer: e.target.value})} />
                        </div>
                         <div>
                            <label className="block text-gray-600 text-sm mb-1">Ngày cấp</label>
                            <input required type="date" className="w-full border border-gray-300 rounded px-3 py-2" value={data.issueDate} onChange={e => setData({...data, issueDate: e.target.value})} />
                        </div>
                         <div>
                            <label className="block text-gray-600 text-sm mb-1">Link file chứng chỉ (URL)</label>
                            <input required placeholder="https://example.com/certificate.pdf" type="url" className="w-full border border-gray-300 rounded px-3 py-2" value={data.fileUrl} onChange={e => setData({...data, fileUrl: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onClose} className="text-gray-600 font-medium px-4 py-2 rounded-lg">Hủy</button>
                        <button type="submit" className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
}


