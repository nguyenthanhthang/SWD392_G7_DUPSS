import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';

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
  const [filteredConsultants, setFilteredConsultants] = useState<IConsultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<IConsultant | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    experience: 'all' // all, 0-1, 1-3, 3+
  });
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

  const fetchConsultants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/consultants');
      console.log('API Response:', response.data);
      setConsultants(response.data);
      setFilteredConsultants(response.data);
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

  // Xử lý lọc dữ liệu
  useEffect(() => {
    let result = [...consultants];
    
    // Lọc theo trạng thái
    if (filters.status !== 'all') {
      result = result.filter(consultant => consultant.status === filters.status);
    }
    
    // Lọc theo kinh nghiệm
    if (filters.experience !== 'all') {
      if (filters.experience === '0-1') {
        result = result.filter(consultant => consultant.experience >= 0 && consultant.experience <= 1);
      } else if (filters.experience === '1-3') {
        result = result.filter(consultant => consultant.experience > 1 && consultant.experience <= 3);
      } else if (filters.experience === '3+') {
        result = result.filter(consultant => consultant.experience > 3);
      }
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(consultant => 
        (consultant.accountId.username && consultant.accountId.username.toLowerCase().includes(searchLower)) || 
        (consultant.accountId.email && consultant.accountId.email.toLowerCase().includes(searchLower)) ||
        (consultant.accountId.fullName && consultant.accountId.fullName.toLowerCase().includes(searchLower)) ||
        (consultant.introduction && consultant.introduction.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredConsultants(result);
  }, [consultants, filters]);

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
        {/* Đã ẩn nút thêm tư vấn viên - người dùng sẽ tạo tài khoản ở trang quản lý tài khoản */}
      </div>

      {/* Thông báo hướng dẫn */}
      <div className="bg-blue-50 p-4 rounded-lg mb-4 flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-blue-800 font-medium mb-1">Thêm tư vấn viên mới</p>
          <p className="text-blue-700 text-sm">Để thêm tư vấn viên mới, vui lòng tạo tài khoản có vai trò "Tư vấn viên" trong trang <a href="/admin/users" className="text-blue-600 underline hover:text-blue-800">Quản lý tài khoản</a>.</p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-purple-50 p-4 rounded-lg mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Tìm kiếm */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Tìm theo tên, email..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          {/* Lọc theo trạng thái */}
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="isDeleted">Đã xóa</option>
            </select>
          </div>
          
          {/* Lọc theo kinh nghiệm */}
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm</label>
            <select
              value={filters.experience}
              onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">Tất cả</option>
              <option value="0-1">0-1 năm</option>
              <option value="1-3">1-3 năm</option>
              <option value="3+">Trên 3 năm</option>
            </select>
          </div>
          
          {/* Nút xóa bộ lọc */}
          <div>
            <button
              onClick={() => setFilters({ status: 'all', search: '', experience: 'all' })}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white table-fixed">
          <thead>
            <tr className="bg-purple-50 text-gray-600 text-left text-sm font-semibold uppercase tracking-wider">
              <th className="px-4 py-3 rounded-tl-lg w-1/5">Họ và tên</th>
              <th className="px-4 py-3 w-1/6">Email</th>
              <th className="px-4 py-3 w-1/6">Số điện thoại</th>
              <th className="px-4 py-3 w-1/5">Giới thiệu</th>
              <th className="px-4 py-3 w-24">Kinh nghiệm</th>
              <th className="px-4 py-3 w-24">Trạng thái</th>
              <th className="px-4 py-3 w-24">Ngày tạo</th>
              <th className="px-4 py-3 rounded-tr-lg w-20">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {filteredConsultants.length > 0 ? (
              filteredConsultants.map((consultant) => (
                <tr key={consultant._id} className="border-b border-gray-200 hover:bg-purple-50">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    <img src={consultant.accountId.photoUrl || '/avarta.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover mr-2 inline-block" />
                    {consultant.accountId.fullName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{consultant.accountId.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{consultant.accountId.phoneNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis" style={{ maxWidth: '150px' }}>
                    {consultant.introduction}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{consultant.experience} năm</td>
                  <td className="px-4 py-3 whitespace-nowrap">
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
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(consultant.createdAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Tooltip text="Cập nhật">
                        <button
                          onClick={() => handleOpenUpdateModal(consultant)}
                          className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      </Tooltip>

                      <Tooltip text="Xóa">
                        <button
                          onClick={() => handleOpenDeleteModal(consultant)}
                          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  {filters.status !== 'all' || filters.experience !== 'all' || filters.search ? 
                    'Không tìm thấy tư vấn viên nào phù hợp với bộ lọc' : 
                    'Không có tư vấn viên nào'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  );
};

export default Consultant; 