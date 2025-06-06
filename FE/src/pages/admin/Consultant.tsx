import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';
import ConsultantScheduleModal from '../../components/admin/ConsultantScheduleModal';

interface IConsultant {
  _id: string;
  accountId: {
    _id: string;
    username: string;
    email: string;
    photoUrl?: string;
    fullName: string;
    phoneNumber: string;
    role: string;
    gender?: string;
  };
  introduction: string;
  contact: string;
  experience: number;
  status: 'active' | 'inactive' | 'isDeleted';
  createdAt: string;
  updatedAt: string;
}

interface IUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
}

interface IConsultantWithUser extends IConsultant {
  userInfo?: IUser;
}

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

interface IFormData {
  accountId: string;
  fullName: string;
  email: string;
  phone: string;
  introduction: string;
  contact: string;
  experience: number;
  status: 'active' | 'inactive' | 'isDeleted';
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
        {text}
      </div>
    </div>
  );
};

const Consultant: React.FC = () => {
  const [consultants, setConsultants] = useState<IConsultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<IConsultant | null>(null);
  const [formData, setFormData] = useState<IFormData>({
    accountId: '',
    fullName: '',
    email: '',
    phone: '',
    introduction: '',
    contact: '',
    experience: 0,
    status: 'active'
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedConsultantId, setSelectedConsultantId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchConsultants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/consultants');
      console.log('API Response:', response.data);
      setConsultants(response.data);
      setError(null);
    } catch (err) {
      console.error('API Error:', err);
      setError('Có lỗi xảy ra khi tải danh sách tư vấn viên');
      toast.error('Không thể tải danh sách tư vấn viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultants();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience' ? Number(value) : value
    }));
  };

  const handleOpenCreateModal = () => {
    setFormData({
      accountId: '',
      fullName: '',
      email: '',
      phone: '',
      introduction: '',
      contact: '',
      experience: 0,
      status: 'active'
    });
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      accountId: '',
      fullName: '',
      email: '',
      phone: '',
      introduction: '',
      contact: '',
      experience: 0,
      status: 'active'
    });
  };

  const handleCreateConsultant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId || !formData.introduction) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      // Tạo consultant mới chỉ với thông tin consultant
      const consultantData = {
        accountId: formData.accountId,
        introduction: formData.introduction,
        contact: formData.contact,
        experience: formData.experience,
        status: formData.status
      };
      
      console.log('Creating consultant with data:', consultantData);
      const response = await api.post('/consultants', consultantData);
      console.log('Create response:', response.data);
      
      setConsultants(prev => [...prev, response.data]);
      handleCloseCreateModal();
      toast.success('Tạo tư vấn viên thành công!');
    } catch (error) {
      console.error('Error creating consultant:', error);
      toast.error('Có lỗi xảy ra khi tạo tư vấn viên!');
    }
  };

  const handleOpenUpdateModal = (consultant: IConsultant) => {
    setSelectedConsultant(consultant);
    setFormData({
      accountId: consultant.accountId._id,
      fullName: consultant.accountId.fullName,
      email: consultant.accountId.email,
      phone: consultant.accountId.phoneNumber,
      introduction: consultant.introduction,
      contact: consultant.contact,
      experience: consultant.experience,
      status: consultant.status
    });
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedConsultant(null);
    setFormData({
      accountId: '',
      fullName: '',
      email: '',
      phone: '',
      introduction: '',
      contact: '',
      experience: 0,
      status: 'active'
    });
  };

  const handleUpdateConsultant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultant) return;

    try {
      // Cập nhật thông tin consultant - không gửi accountId vì không nên thay đổi
      const consultantData = {
        introduction: formData.introduction,
        contact: formData.contact,
        experience: formData.experience,
        status: formData.status
      };
      
      console.log('Consultant data to update:', consultantData);
      const response = await api.put(`/consultants/${selectedConsultant._id}`, consultantData);
      console.log('Update response:', response.data);
      
      setConsultants(prev =>
        prev.map(consultant =>
          consultant._id === selectedConsultant._id ? response.data : consultant
        )
      );
      handleCloseUpdateModal();
      toast.success('Cập nhật tư vấn viên thành công!');
    } catch (error) {
      console.error('Error updating consultant:', error);
      toast.error('Có lỗi xảy ra khi cập nhật tư vấn viên!');
    }
  };

  const handleOpenDeleteModal = (consultant: IConsultant) => {
    setSelectedConsultant(consultant);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedConsultant(null);
  };

  const handleDeleteConsultant = async () => {
    if (!selectedConsultant) return;

    try {
      await api.delete(`/consultants/${selectedConsultant._id}`);
      setConsultants(prev =>
        prev.filter(consultant => consultant._id !== selectedConsultant._id)
      );
      handleCloseDeleteModal();
      toast.success('Xóa tư vấn viên thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa tư vấn viên!');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Chưa có ngày';
      }
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Chưa có ngày';
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/uploads/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.imageUrl;
      setFormData(prev => ({
        ...prev,
        photoUrl: url
      }));
      setIsUploadingAvatar(false);
      toast.success('Tải ảnh lên thành công!');
    } catch (err) {
      setIsUploadingAvatar(false);
      toast.error('Tải ảnh lên thất bại!');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-indigo-500">Quản lý tư vấn viên</h1>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm tư vấn viên
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-purple-50 text-gray-600 text-left text-sm font-semibold uppercase tracking-wider">
              <th className="px-4 py-3 rounded-tl-lg">Họ và tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Lịch làm việc</th>
              <th className="px-4 py-3 rounded-tr-lg">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {consultants.map(consultant => (
              <tr key={consultant._id} className="border-b border-gray-200 hover:bg-purple-50">
                <td className="px-4 py-3 font-medium flex items-center">
                  <img src={consultant.accountId.photoUrl || '/avarta.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover mr-2 inline-block" />
                  {consultant.accountId.fullName}
                </td>
                <td className="px-4 py-3">{consultant.accountId.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      consultant.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : consultant.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {consultant.status === 'active' ? 'Hoạt động' : consultant.status === 'inactive' ? 'Không hoạt động' : 'Đã xóa'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => { setSelectedConsultantId(consultant._id); setScheduleModalOpen(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-semibold shadow-md transition-all"
                  >
                    Lịch làm việc
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => { setSelectedConsultant(consultant); setIsDetailModalOpen(true); }}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 mr-2"
                    title="Xem chi tiết"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleOpenUpdateModal(consultant)}
                    className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                    title="Chỉnh sửa"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tạo tư vấn viên mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Thêm tư vấn viên mới</h2>
              <button
                onClick={handleCloseCreateModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateConsultant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID Tài khoản</label>
                <input
                  type="text"
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Nhập ID của tài khoản đã tồn tại</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Giới thiệu</label>
                <textarea
                  name="introduction"
                  value={formData.introduction}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Nhập thông tin giới thiệu về tư vấn viên"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Thông tin liên hệ</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Thông tin liên hệ thêm (nếu có)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Kinh nghiệm (năm)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="isDeleted">Đã xóa</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cập nhật tư vấn viên */}
      {isUpdateModalOpen && selectedConsultant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Cập nhật thông tin tư vấn viên</h2>
              <button
                onClick={handleCloseUpdateModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateConsultant} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <img src={avatarPreview || selectedConsultant?.accountId.photoUrl || '/avarta.png'} alt="avatar" className="w-24 h-24 rounded-full object-cover border-2 border-indigo-200 mb-2" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="mt-1 block w-full text-sm" disabled={isUploadingAvatar} />
                {isUploadingAvatar && <div className="text-xs text-blue-500 mt-1">Đang tải ảnh lên...</div>}
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin tài khoản (chỉ đọc)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Họ tên:</p>
                    <p className="font-medium">{formData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email:</p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại:</p>
                    <p className="font-medium">{formData.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Giới thiệu</label>
                <textarea
                  name="introduction"
                  value={formData.introduction}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Nhập thông tin giới thiệu về tư vấn viên"
                />
                <p className="mt-1 text-xs text-gray-500">Thông tin này sẽ hiển thị cho người dùng</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Thông tin liên hệ</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Thông tin liên hệ thêm (nếu có)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Kinh nghiệm (năm)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="isDeleted">Đã xóa</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseUpdateModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận xóa */}
      {isDeleteModalOpen && selectedConsultant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Xác nhận xóa</h2>
              <button
                onClick={handleCloseDeleteModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p>Bạn có chắc chắn muốn xóa tư vấn viên "{selectedConsultant.accountId.fullName}"?</p>
              <p className="text-sm text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConsultant}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {scheduleModalOpen && selectedConsultantId && (
        <ConsultantScheduleModal
          consultantId={selectedConsultantId}
          open={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
        />
      )}

      {isDetailModalOpen && selectedConsultant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl relative">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-2xl"
              title="Đóng"
            >
              &times;
            </button>
            <div className="flex flex-col items-center mb-6">
              <img
                src={selectedConsultant.accountId.photoUrl || '/avarta.png'}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow mb-2"
              />
              <h2 className="text-xl font-bold text-blue-700 mb-1">{selectedConsultant.accountId.fullName}</h2>
              <span className={`px-3 py-1 text-xs rounded-full font-semibold mt-1 ${
                selectedConsultant.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : selectedConsultant.status === 'inactive'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedConsultant.status === 'active' ? 'Hoạt động' : selectedConsultant.status === 'inactive' ? 'Không hoạt động' : 'Đã xóa'}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold text-gray-600">Email:</span> {selectedConsultant.accountId.email}</div>
              <div><span className="font-semibold text-gray-600">Số điện thoại:</span> {selectedConsultant.accountId.phoneNumber}</div>
              <div><span className="font-semibold text-gray-600">Giới thiệu:</span> {selectedConsultant.introduction || <span className="italic text-gray-400">Chưa cập nhật</span>}</div>
              <div><span className="font-semibold text-gray-600">Liên hệ:</span> {selectedConsultant.contact || <span className="italic text-gray-400">Chưa cập nhật</span>}</div>
              <div><span className="font-semibold text-gray-600">Kinh nghiệm:</span> {selectedConsultant.experience} năm</div>
            </div>
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold shadow"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultant; 