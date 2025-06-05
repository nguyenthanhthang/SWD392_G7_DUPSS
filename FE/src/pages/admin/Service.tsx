import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';

// Interface cho dữ liệu dịch vụ
interface IService {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // Thời lượng tính bằng phút
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Component Tooltip
interface TooltipProps {
  text: string;
  children: React.ReactNode;
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

const Service: React.FC = () => {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<IService | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services');
      setServices(response.data);
      setError(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi tải danh sách dịch vụ');
      toast.error('Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' ? Number(value) : value
    }));
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      status: 'active'
    });
    setIsCreateModalOpen(true);
  };

  // Close create modal
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      status: 'active'
    });
  };

  // Handle create service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.description || formData.price <= 0 || formData.duration <= 0) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const response = await api.post('/services', formData);
      setServices(prev => [...prev, response.data]);
      handleCloseCreateModal();
      toast.success('Tạo dịch vụ thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo dịch vụ!');
    }
  };

  // Open update modal
  const handleOpenUpdateModal = (service: IService) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      status: service.status
    });
    setIsUpdateModalOpen(true);
  };

  // Close update modal
  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedService(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      status: 'active'
    });
  };

  // Handle update service
  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      const response = await api.put(`/services/${selectedService._id}`, formData);
      setServices(prev =>
        prev.map(service =>
          service._id === selectedService._id ? response.data : service
        )
      );
      handleCloseUpdateModal();
      toast.success('Cập nhật dịch vụ thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật dịch vụ!');
    }
  };

  // Open delete modal
  const handleOpenDeleteModal = (service: IService) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  // Close delete modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedService(null);
  };

  // Handle delete service
  const handleDeleteService = async () => {
    if (!selectedService) return;

    try {
      await api.delete(`/services/${selectedService._id}`);
      setServices(prev =>
        prev.filter(service => service._id !== selectedService._id)
      );
      handleCloseDeleteModal();
      toast.success('Xóa dịch vụ thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa dịch vụ!');
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

      {/* Tiêu đề và nút thêm mới */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-indigo-500">Quản lý dịch vụ</h1>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm dịch vụ
        </button>
      </div>

      {/* Bảng dịch vụ */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-purple-50 text-gray-600 text-left text-sm font-semibold uppercase tracking-wider">
              <th className="px-4 py-3 rounded-tl-lg">Tên dịch vụ</th>
              <th className="px-4 py-3">Mô tả</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Thời lượng</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3 rounded-tr-lg">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {services.map((service) => (
              <tr key={service._id} className="border-b border-gray-200 hover:bg-purple-50">
                <td className="px-4 py-3 font-medium">{service.name}</td>
                <td className="px-4 py-3 max-w-xs truncate">{service.description}</td>
                <td className="px-4 py-3">{formatCurrency(service.price)}</td>
                <td className="px-4 py-3">{service.duration} phút</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      service.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {service.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(service.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <Tooltip text="Cập nhật">
                      <button
                        onClick={() => handleOpenUpdateModal(service)}
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
                        onClick={() => handleOpenDeleteModal(service)}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tạo dịch vụ mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Thêm dịch vụ mới</h2>
              <button
                onClick={handleCloseCreateModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên dịch vụ</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Giá (VNĐ)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Thời lượng (phút)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="15"
                  step="15"
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
                  Tạo dịch vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cập nhật dịch vụ */}
      {isUpdateModalOpen && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Cập nhật dịch vụ</h2>
              <button
                onClick={handleCloseUpdateModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên dịch vụ</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Giá (VNĐ)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Thời lượng (phút)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="15"
                  step="15"
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
      {isDeleteModalOpen && selectedService && (
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
              <p>Bạn có chắc chắn muốn xóa dịch vụ "{selectedService.name}"?</p>
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
                onClick={handleDeleteService}
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

export default Service;
