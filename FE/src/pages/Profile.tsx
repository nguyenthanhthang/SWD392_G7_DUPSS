import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccountByIdApi, updateAccountApi, changePasswordApi, sendResetPasswordEmailApi } from '../api';
import whaleLogo from '../assets/whale.png';
import AppointmentsPage from './Appointments';
import PaymentsTable  from './PaymentHistory';
import type { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';

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

const menuTabs = [
  { key: "profile", label: "User Profile" },
  { key: "Appointments", label: "Appointments" },
  { key: "payments", label: "Payments" },
];

export default function Profile() {
  const [tab, setTab] = useState("profile");
  const [user, setUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<User>({});
  const [editMode, setEditMode] = useState(false);
  const [editPhoneOnly, setEditPhoneOnly] = useState(false);
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

  const handleEdit = () => setEditMode(true);

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
      if (editPhoneOnly) {
        await updateAccountApi(user._id, {
          phoneNumber: editData.phoneNumber,
        });
      } else {
        await updateAccountApi(user._id, {
          fullName: editData.fullName,
          phoneNumber: editData.phoneNumber,
        });
      }
      const updated = await getAccountByIdApi(user._id);
      setUser(updated);
      setEditData(updated);
      setEditMode(false);
      setEditPhoneOnly(false);
      showToast('success', 'Cập nhật thành công!');
    } catch {
      showToast('error', 'Cập nhật thất bại!');
    }
  };

  const handleUpdatePhoneOnly = async () => {
    if (!user?._id) return;
    try {
      await updateAccountApi(user._id, {
        phoneNumber: editData.phoneNumber,
      });
      const updated = await getAccountByIdApi(user._id);
      setUser(updated);
      setEditData(updated);
      setEditPhoneOnly(false);
      showToast('success', 'Cập nhật số điện thoại thành công!');
    } catch {
      showToast('error', 'Cập nhật số điện thoại thất bại!');
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

  return (
    <div className="min-h-screen bg-[#f6f8fb] flex flex-col items-center py-4 px-2">
      <div className="bg-white rounded-3xl shadow-sm flex flex-col w-full max-w-6xl overflow-hidden relative">
        {/* Main content container */}
        <div className="flex flex-row w-full">
          {/* Sidebar */}
          <div className="w-64 py-10 px-6 bg-[#f7fafd]">
            {/* Nút quay về trang chủ nằm trong menu */}
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 font-medium hover:underline bg-white rounded-lg px-3 py-1.5 shadow-sm border border-blue-100 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Home Page
            </Link>
            <nav className="flex flex-col gap-2">
              {menuTabs.map(m => (
                m.key === 'Appointments' ? (
                  <button
                    key={m.key}
                    className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${tab === m.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-blue-50'}`}
                    onClick={() => setTab(m.key)}
                  >
                    {m.label}
                  </button>
                ) : m.key === 'payments' ? (
                  <button
                    key={m.key}
                    className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${tab === m.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-blue-50'}`}
                    onClick={() => setTab(m.key)}
                  >
                    {m.label}
                  </button>
                ) : (
                  <button
                    key={m.key}
                    className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      tab === m.key
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-blue-50"
                    }`}
                    onClick={() => setTab(m.key)}
                  >
                    {m.label}
                  </button>
                )
              ))}
              <div className="mt-auto pt-8 border-t border-gray-200 mt-8">
                <Link
                  to="/login"
                  className="text-red-500 font-medium hover:underline flex items-center gap-2 px-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 5a1 1 0 10-2 0v4a1 1 0 102 0V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sign out
                </Link>
              </div>
            </nav>
          </div>
          {/* Main content */}
          <div className="flex-1">
            <div className="max-w-4xl mx-auto">
              {tab === 'profile' && (
                <div className="p-7">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">User profile</h2>
                  <p className="text-gray-500 mb-8">Manage your details, view your tier status and change your password.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Avatar + Name */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center">
                      <img src={user?.photoUrl || 'https://i.pravatar.cc/150?img=3'} alt="avatar" className="w-24 h-24 rounded-full mb-4" />
                      <div className="font-bold text-lg text-gray-800 mb-1">{user?.fullName || '---'}</div>
                      <div className="text-gray-500 text-sm mb-2 flex items-center gap-2">
                        {editPhoneOnly ? (
                          <div className="flex items-center gap-2">
                            <input 
                              id="edit-phone-input"
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                              value={editData.phoneNumber || ''}
                              onChange={e => setEditData({ ...editData, phoneNumber: e.target.value })}
                              placeholder="Phone number"
                              onBlur={e => handleBlurField('phoneNumber', e.target.value)}
                            />
                            {fieldError.phoneNumber && <div className="text-red-500 text-xs mt-1">{fieldError.phoneNumber}</div>}
                            <button 
                              onClick={handleUpdatePhoneOnly}
                              className="text-green-600 hover:text-green-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => {
                                setEditPhoneOnly(false);
                                setEditData({ ...user }); // Reset edit data
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <span>{user?.phoneNumber || 'No phone number'}</span>
                        )}
                      </div>
                      {!editPhoneOnly && (
                        <div className="text-blue-500 font-medium text-sm cursor-pointer">
                          <button type="button" onClick={() => {
                            setEditPhoneOnly(true);
                            setEditData({ ...user }); // Initialize edit data with current user data
                            setTimeout(() => {
                              const phoneInput = document.getElementById('edit-phone-input');
                              if (phoneInput) phoneInput.focus();
                            }, 100);
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Edit Phone
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* General info */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8">
                      <div className="font-semibold text-gray-700 mb-6">General information</div>
                      <div>
                        <label className="block text-gray-500 text-sm mb-2">Full name</label>
                        <input
                          disabled={!editMode || editPhoneOnly}
                          className={`w-full border border-gray-200 rounded-md px-4 py-2 text-gray-700 ${(!editMode || editPhoneOnly) ? 'bg-gray-50' : 'bg-white'}`}
                          value={editMode && !editPhoneOnly ? (editData.fullName || '') : user?.fullName || ''}
                          onChange={e => {
                            if (editMode && !editPhoneOnly) {
                              setEditData({ ...editData, fullName: e.target.value });
                            }
                          }}
                          onBlur={e => handleBlurField('fullName', e.target.value)}
                        />
                        {fieldError.fullName && <div className="text-red-500 text-xs mt-1">{fieldError.fullName}</div>}
                      </div>
                      <div className="mt-6">
                        <button 
                          className={`px-6 py-2 rounded-lg font-medium ${editMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                          onClick={editMode ? handleUpdate : undefined}
                          disabled={!editMode}
                        >
                          Update
                        </button>
                        {!editMode && (
                          <button onClick={() => { handleEdit(); setEditPhoneOnly(false); }} className="ml-4 text-blue-600 text-sm font-medium">
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Security */}
                  <div className="mt-8">
                    <div className="font-semibold text-gray-700 mb-6">Security</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 rounded-md p-4">
                        <label className="block text-gray-500 text-sm mb-2">Email</label>
                        <div className="text-gray-700 font-medium">{user?.email || ''}</div>
                      </div>
                      <div className="bg-gray-50 rounded-md p-4">
                        <label className="block text-gray-500 text-sm mb-2">Password</label>
                        <div className="text-gray-700 font-medium">••••••</div>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                      <button
                        className="w-50 border border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-medium bg-white transition-colors hover:bg-blue-50 hover:border-blue-700 hover:text-blue-800 focus:outline-none"
                        onClick={() => setShowPwdModal(true)}
                      >
                        Change password
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {tab === 'Appointments' && (
                <div className="w-full">
                  <AppointmentsPage />
                </div>
              )}
              {tab === 'payments' && (
                <div className="w-full">
                  <PaymentsTable />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="w-full h-40 mt-12 relative">
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              className="w-full"
            >
              <path
                fill="#b1e2f3"
                fillOpacity="1"
                d="M0,128L48,133.3C96,139,192,149,288,144C384,139,480,117,576,128C672,139,768,181,864,176C960,171,1056,117,1152,96C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
            <img
              src={whaleLogo}
              alt="Whale decoration"
              className="absolute right-16 bottom-4 w-32 h-auto opacity-80"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>
        </div>
      </div>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-base font-semibold transition-all ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}
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
                    onChange={e=>setPwdConfirm(e.target.value)}
                    placeholder="Xác nhận mật khẩu"
                  />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" onClick={()=>setShowPwdConfirm(v=>!v)}>
                    {showPwdConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {pwdError && <div className="text-red-500 text-xs mb-2">{pwdError}</div>}
                <button className="w-full bg-blue-600 text-white py-2 rounded font-medium" onClick={handleChangePassword} disabled={pwdLoading}>{pwdLoading?'Đang đổi...':'Đổi mật khẩu'}</button>
              </>
            )}
            <button className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm" onClick={()=>setShowPwdModal(false)}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
}
