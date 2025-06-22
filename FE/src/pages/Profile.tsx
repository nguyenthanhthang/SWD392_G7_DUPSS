import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAccountByIdApi, updateAccountApi, changePasswordApi, sendResetPasswordEmailApi, getBlogsByUserIdApi, updateBlogApi } from '../api';
import whaleLogo from '../assets/whale.png';
import AppointmentsPage from './Appointments';
import PaymentsTable  from './PaymentHistory';
import type { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import BlogDetailView from '../components/blog/BlogDetailView';
import CreateBlogForm from '../components/blog/CreateBlogForm';

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

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string;
  image?: string;
  thumbnail?: string;
  topics?: string[];
  published: 'draft' | 'published' | 'rejected';
  comments: { userId: string; username: string; content: string; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
  anDanh?: boolean;
  rejectionReason?: string;
}

const menuTabs = [
  { key: "profile", label: "Hồ sơ người dùng" },
  { key: "blogs", label: "Bài viết" },
  { key: "Appointments", label: "Lịch hẹn" },
  { key: "payments", label: "Thanh toán" },
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
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogDangXem, setBlogDangXem] = useState<Blog | null>(null);
  const [modalBlog, setModalBlog] = useState(false);
  const [blogDangSua, setBlogDangSua] = useState<Blog | null>(null);
  const [modalEdit, setModalEdit] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (user?._id) {
      getBlogsByUserIdApi(user._id).then(setBlogs).catch(() => setBlogs([]));
    }
  }, [user?._id]);

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
      if (!user?.email) throw new Error('Không tìm thấy email người dùng');
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

  // Hàm lọc blog
  const filteredBlogs = blogs.filter(blog => {
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && blog.published === 'published') ||
      (filterStatus === 'pending' && blog.published === 'draft') ||
      (filterStatus === 'rejected' && blog.published === 'rejected');
    const matchKeyword =
      blog.title.toLowerCase().includes(filterKeyword.toLowerCase());
    return matchStatus && matchKeyword;
  });

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?._id) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploadingAvatar(true);
    try {
      // First, upload the image to Cloudinary
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadResponse = await fetch('http://localhost:5000/api/uploads/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload image');
      const { imageUrl } = await uploadResponse.json();

      // Then, update user's photoUrl
      await updateAccountApi(user._id, { photoUrl: imageUrl });

      // Update local user state
      setUser(prev => prev ? { ...prev, photoUrl: imageUrl } : null);
      showToast('success', 'Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showToast('error', 'Không thể cập nhật ảnh đại diện!');
      setAvatarPreview(null); // Reset preview on error
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DBE8FA] flex flex-col items-center py-4 px-2 relative overflow-x-hidden">
      {/* Bóng tròn 2 màu chủ đạo */}
      <div className="absolute top-10 left-[-80px] w-60 h-60 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-1/3 left-[-100px] w-72 h-72 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute bottom-20 left-[-60px] w-44 h-44 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-20 right-[-80px] w-60 h-60 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-1/2 right-[-100px] w-72 h-72 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute bottom-10 right-[-60px] w-44 h-44 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>
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
              Trang chủ
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
                  Đăng xuất
                </Link>
              </div>
            </nav>
          </div>
          {/* Main content */}
          <div className="flex-1">
            <div className="max-w-4xl mx-auto">
              {tab === 'profile' && (
                <div className="p-7">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">Hồ sơ người dùng</h2>
                  <p className="text-gray-500 mb-8">Quản lý thông tin cá nhân, xem trạng thái và thay đổi mật khẩu.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Avatar + Name */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center">
                      <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <div className="w-24 h-24 rounded-full overflow-hidden">
                          <img 
                            src={avatarPreview || user?.photoUrl || 'https://i.pravatar.cc/150?img=3'} 
                            alt="avatar" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                      {isUploadingAvatar && (
                        <div className="text-sm text-blue-500 animate-pulse">Đang tải ảnh lên...</div>
                      )}
                      <div className="font-bold text-lg text-gray-800 mb-1">{user?.fullName || '---'}</div>
                      <div className="text-gray-500 text-sm mb-2 flex items-center gap-2">
                        {editPhoneOnly ? (
                          <div className="flex items-center gap-2">
                            <input 
                              id="edit-phone-input"
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                              value={editData.phoneNumber || ''}
                              onChange={e => setEditData({ ...editData, phoneNumber: e.target.value })}
                              placeholder="Số điện thoại"
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
                          <span>{user?.phoneNumber || 'Chưa có số điện thoại'}</span>
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
                            Sửa SĐT
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* General info */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8">
                      <div className="font-semibold text-gray-700 mb-6">Thông tin chung</div>
                      <div>
                        <label className="block text-gray-500 text-sm mb-2">Họ và tên</label>
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
                          Cập nhật
                        </button>
                        {!editMode && (
                          <button onClick={() => { handleEdit(); setEditPhoneOnly(false); }} className="ml-4 text-blue-600 text-sm font-medium">
                            Chỉnh sửa
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Security */}
                  <div className="mt-8">
                    <div className="font-semibold text-gray-700 mb-6">Bảo mật</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 rounded-md p-4">
                        <label className="block text-gray-500 text-sm mb-2">Email</label>
                        <div className="text-gray-700 font-medium">{user?.email || ''}</div>
                      </div>
                      <div className="bg-gray-50 rounded-md p-4">
                        <label className="block text-gray-500 text-sm mb-2">Mật khẩu</label>
                        <div className="text-gray-700 font-medium">••••••</div>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                      <button
                        className="w-50 border border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-medium bg-white transition-colors hover:bg-blue-50 hover:border-blue-700 hover:text-blue-800 focus:outline-none"
                        onClick={() => setShowPwdModal(true)}
                      >
                        Đổi mật khẩu
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {tab === 'blogs' && (
                <div className="p-7">
                  <div className="font-semibold text-gray-700 mb-4 text-lg">Bài viết của bạn</div>
                  {/* Filter */}
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
                    <select 
                      value={filterStatus} 
                      onChange={e => setFilterStatus(e.target.value)} 
                      className="rounded-lg border border-sky-100 px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="all">Tất cả</option>
                      <option value="published">Đã xuất bản</option>
                      <option value="pending">Chưa duyệt</option>
                      <option value="rejected">Đã từ chối</option>
                    </select>
                    <input
                      type="text"
                      value={filterKeyword}
                      onChange={e => setFilterKeyword(e.target.value)}
                      placeholder="Tìm theo tiêu đề..."
                      className="rounded-lg border border-sky-100 px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 w-full md:w-64"
                    />
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {/* Đã xuất bản */}
                    <div
                      className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${filterStatus === 'published' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'}`}
                      onClick={() => setFilterStatus('published')}
                    >
                      <div className="p-2.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-full mb-2 flex items-center justify-center">
                        <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Đã xuất bản</p>
                      <p className="text-xl font-bold text-gray-900">{blogs.filter(blog => blog.published === 'published').length}</p>
                    </div>
                    
                    {/* Chưa duyệt */}
                    <div
                      className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${filterStatus === 'pending' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'}`}
                      onClick={() => setFilterStatus('pending')}
                    >
                      <div className="p-2.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-full mb-2 flex items-center justify-center">
                        <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Chưa duyệt</p>
                      <p className="text-xl font-bold text-gray-900">{blogs.filter(blog => blog.published === 'draft').length}</p>
                    </div>
                    
                    {/* Đã từ chối */}
                    <div
                      className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${filterStatus === 'rejected' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'}`}
                      onClick={() => setFilterStatus('rejected')}
                    >
                      <div className="p-2.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-full mb-2 flex items-center justify-center">
                        <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Đã từ chối</p>
                      <p className="text-xl font-bold text-gray-900">{blogs.filter(blog => blog.published === 'rejected').length}</p>
                    </div>
                  </div>

                  {/* Danh sách bài viết */}
                  <div>
                    <div className="font-semibold mb-2 text-sky-700">
                      {filterStatus === 'published' ? 'Bài viết đã xuất bản' : 
                       filterStatus === 'pending' ? 'Bài viết chưa duyệt' : 
                       filterStatus === 'rejected' ? 'Bài viết bị từ chối' : 
                       'Tất cả bài viết'}
                    </div>
                    
                    {filteredBlogs.length === 0 ? (
                      <div className="text-gray-500 italic">Không tìm thấy bài viết nào.</div>
                    ) : (
                      <div className="space-y-3">
                        {filteredBlogs.map(blog => (
                          <div 
                            key={blog._id} 
                            className={`bg-gradient-to-r from-sky-50 via-cyan-50 to-white hover:from-sky-100 transition rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-sm cursor-pointer border border-sky-100`}
                          >
                            <div>
                              <div className="font-medium text-base text-gray-800">{blog.title}</div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Tác giả: {(blog.author === user?.fullName || blog.author === user?.username) && blog.anDanh ? 'Ẩn danh' : blog.author}
                              </div>
                              <div className={`text-xs ${
                                blog.published === 'published' ? 'text-sky-700' : 'text-red-700'
                              } font-medium mt-1 inline-block px-2 py-0.5 rounded-full ${
                                blog.published === 'published' ? 'bg-sky-50 border-sky-200' : 'bg-red-50 border-red-200'
                              } border`}>
                                {blog.published === 'published' ? 'Đã xuất bản' : 
                                 blog.published === 'draft' ? 'Chưa duyệt' : 'Đã từ chối'}
                              </div>
                              {blog.published === 'rejected' && blog.rejectionReason && (
                                <div className="text-xs text-red-600 mt-1">
                                  Lý do từ chối: {blog.rejectionReason}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={e => {e.preventDefault(); setBlogDangXem(blog); setModalBlog(true);}} 
                                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                Xem chi tiết
                              </button>
                              {blog.published !== 'rejected' && (
                                <button 
                                  onClick={() => { setBlogDangSua(blog); setModalEdit(true); }} 
                                  className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Chỉnh sửa
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                fill="#DBE8FA"
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
      {/* Modal xem chi tiết blog */}
      {modalBlog && blogDangXem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <BlogDetailView blog={blogDangXem} onClose={() => setModalBlog(false)} />
          </div>
        </div>
      )}
      {/* Modal chỉnh sửa blog */}
      {modalEdit && blogDangSua && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <CreateBlogForm
              initialData={{
                title: blogDangSua.title,
                content: blogDangSua.content,
                author: blogDangSua.author,
                topics: blogDangSua.topics?.join(', ') || '',
                image: blogDangSua.image || '',
                published: blogDangSua.published,
              }}
              onCancel={() => setModalEdit(false)}
              onSuccess={() => { setModalEdit(false); setBlogDangSua(null); /* reload blogs */ if(user?._id) getBlogsByUserIdApi(user._id).then(setBlogs); }}
              onSubmit={async (data) => {
                const dataUpdate = { ...data };
                if (blogDangSua.published === 'published') dataUpdate.published = 'draft';
                await updateBlogApi(blogDangSua._id, dataUpdate);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
