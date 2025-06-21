import React, { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';
import axios from 'axios';

// Interface cho dữ liệu dịch vụ
interface IService {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string; // Thêm trường image thay vì duration
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image: '', // Thêm trường image thay vì duration
    status: 'active' as 'active' | 'inactive'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const totalPages = Math.ceil(services.length / rowsPerPage);
  const paginatedServices = services.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Thêm state lưu lỗi cho từng trường
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    backend: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  // Validation riêng khi blur hoặc submit
  const validateField = (name: string, value: string | number) => {
    if (name === 'name' && typeof value === 'string') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, name: 'Vui lòng nhập tên dịch vụ!' }));
        return false;
      } else {
        setErrors(prev => ({ ...prev, name: '' }));
        return true;
      }
    }
    
    if (name === 'description' && typeof value === 'string') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, description: 'Vui lòng nhập mô tả dịch vụ!' }));
        return false;
      } else {
        setErrors(prev => ({ ...prev, description: '' }));
        return true;
      }
    }
    
    if (name === 'price') {
      setErrors(prev => ({ ...prev, price: '' }));
      return true;
    }

    return true;
  };

  // Handle field blur - validation khi người dùng rời khỏi trường
  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // Hàm xử lý upload ảnh
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file hình ảnh (JPG, PNG, GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      // Log trước khi upload
      console.log('Đang upload ảnh...');
      console.log('File:', file.name, file.type, file.size);

      // Sử dụng API riêng cho upload
      const response = await axios.post('http://localhost:5000/api/uploads/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Log kết quả upload
      console.log('Kết quả upload:', response.data);

      if (response.data && response.data.imageUrl) {
        setFormData(prev => ({
          ...prev,
          image: response.data.imageUrl
        }));
        
        // Reset lỗi image nếu có
        setErrors(prev => ({...prev, image: ''}));
        
        toast.success('Tải ảnh lên thành công!');
      } else {
        toast.error('Không nhận được URL ảnh từ server!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  // Xử lý khi nhấn nút chọn file
  const handleSelectImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Fetch services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services');
      // Sắp xếp dịch vụ từ mới nhất đến cũ nhất dựa trên createdAt
      const sortedServices = response.data.sort((a: IService, b: IService) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setServices(sortedServices);
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

  // Open create modal
  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      image: '',
      status: 'active'
    });
    // Reset errors khi mở modal tạo mới
    setErrors({
      name: '',
      description: '',
      price: '',
      image: '',
      backend: ''
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
      image: '',
      status: 'active'
    });
  };

  // Handle create service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Bắt đầu xử lý tạo dịch vụ');
    
    // Kiểm tra lỗi các trường khi submit
    let hasError = false;
    
    // Kiểm tra tất cả các trường
    if (!validateField('name', formData.name)) hasError = true;
    if (!validateField('description', formData.description)) hasError = true;
    
    if (!formData.image) {
      setErrors(prev => ({ ...prev, image: 'Vui lòng tải lên hình ảnh cho dịch vụ!' }));
      hasError = true;
    }
    
    console.log('Form data:', formData);
    console.log('Validation errors:', errors);
    
    if (hasError) {
      console.log('Có lỗi validation, không submit');
      return;
    }
    
    try {
      // Tạo đối tượng dữ liệu để gửi đi
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        image: formData.image,
        status: formData.status
      };
      
      console.log('Gửi dữ liệu lên API:', serviceData);
      
      // Gọi API tạo dịch vụ
      const response = await api.post('/services', serviceData);
      console.log('Kết quả từ API:', response.data);
      
      // Cập nhật danh sách dịch vụ
      setServices(prev => [...prev, response.data]);
      
      // Đóng modal và thông báo thành công
      handleCloseCreateModal();
      toast.success('Tạo dịch vụ thành công!');
      
      // Tải lại danh sách dịch vụ
      fetchServices();
    } catch (error: any) {
      console.error('Lỗi khi tạo dịch vụ:', error);
      
      // Xử lý lỗi từ API
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo dịch vụ!';
      setErrors(prev => ({ ...prev, backend: errorMessage }));
      toast.error(errorMessage);
    }
  };

  // Open update modal
  const handleOpenUpdateModal = (service: IService) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      image: service.image,
      status: service.status
    });
    // Reset errors khi mở modal cập nhật
    setErrors({
      name: '',
      description: '',
      price: '',
      image: '',
      backend: ''
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
      image: '',
      status: 'active'
    });
    // Reset errors khi đóng modal cập nhật
    setErrors({
      name: '',
      description: '',
      price: '',
      image: '',
      backend: ''
    });
  };

  // Handle update service
  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    // Kiểm tra lỗi các trường khi submit
    let hasError = false;
    const newErrors = { ...errors };
    
    // Kiểm tra tất cả các trường - chỉ validate những trường bắt buộc
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên dịch vụ!';
      hasError = true;
    } else {
      newErrors.name = '';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả dịch vụ!';
      hasError = true;
    } else {
      newErrors.description = '';
    }
    
    if (!formData.image) {
      newErrors.image = 'Vui lòng tải lên hình ảnh cho dịch vụ!';
      hasError = true;
    } else {
      newErrors.image = '';
    }
    
    setErrors(newErrors);
    console.log('Update form data:', formData);
    console.log('Validation errors:', newErrors);
    
    if (hasError) {
      console.log('Có lỗi validation, không submit');
      toast.error('Vui lòng điền đầy đủ thông tin trước khi lưu thay đổi');
      return;
    }

    try {
      await api.put(`/services/${selectedService._id}`, formData);
      
      // Reset errors ngay sau khi API thành công
      setErrors({
        name: '',
        description: '',
        price: '',
        image: '',
        backend: ''
      });

      // Fetch dữ liệu mới và đóng modal
      fetchServices();
      handleCloseUpdateModal();
      
      // Sử dụng set timeout để đảm bảo thông báo hiển thị sau khi modal đóng
      setTimeout(() => {
        // Hiển thị thông báo thành công nổi bật và rõ ràng
        toast.success('🎉 Dịch vụ đã được cập nhật thành công!', {
          position: "top-center",
          autoClose: 5000, // Tăng thời gian hiển thị lên 5 giây
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            background: "#10b981",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #047857",
            padding: "16px"
          }
        });
      }, 300);
    } catch (err) {
      console.error('Lỗi khi cập nhật dịch vụ:', err);
      toast.error('Có lỗi xảy ra khi cập nhật dịch vụ');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg mt-4">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={true}
        theme="colored"
        limit={3}
      />

      {/* Input file ẩn */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/jpeg, image/png, image/gif, image/jpg"
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
      <div className="overflow-x-auto shadow-md rounded-lg max-h-[70vh] overflow-y-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-purple-50 text-gray-600 text-left text-sm font-semibold uppercase tracking-wider">
              <th className="px-4 py-3 rounded-tl-lg">Tên dịch vụ</th>
              <th className="px-4 py-3">Mô tả</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Hình ảnh</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 rounded-tr-lg">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
            {paginatedServices.map((service) => (
              <tr key={service._id} className="border-b border-gray-200 hover:bg-purple-50">
                <td className="px-4 py-3 font-medium">{service.name}</td>
                <td className="px-4 py-3 max-w-xs truncate">{service.description}</td>
                <td className="px-4 py-3">{formatCurrency(service.price)}</td>
                <td className="px-4 py-3">
                  {service.image && (
                    <img 
                      src={service.image} 
                      alt={service.name} 
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  )}
                </td>
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 gap-2">
        <button
          className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>

      {/* Modal Tạo dịch vụ mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-indigo-700">Thêm dịch vụ mới</h2>
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {errors.backend && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <div className="flex">
                  <svg className="h-4 w-4 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{errors.backend}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    placeholder="Nhập tên dịch vụ"
                    className={`block w-full rounded-md py-2 px-3 text-sm border focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    step="1000"
                    placeholder="Nhập giá dịch vụ"
                    className={`block w-full rounded-md py-2 px-3 text-sm border focus:ring-indigo-500 focus:border-indigo-500 ${errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  rows={3}
                  placeholder="Nhập mô tả chi tiết về dịch vụ"
                  className={`block w-full rounded-md py-2 px-3 text-sm border focus:ring-indigo-500 focus:border-indigo-500 ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                <div className="flex items-center space-x-3 mb-2">
                  <button
                    type="button"
                    onClick={handleSelectImage}
                    className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors flex items-center text-sm"
                    disabled={uploading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {uploading ? 'Đang tải lên...' : 'Chọn ảnh'}
                  </button>
                  {formData.image && (
                    <span className="text-sm text-green-600 flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Đã tải ảnh lên
                    </span>
                  )}
                </div>
                {formData.image && (
                  <div className="mt-2 border rounded overflow-hidden shadow-sm">
                    <img 
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="block w-full rounded-md py-2 px-3 text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                    uploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                  disabled={uploading}
                >
                  {uploading ? 'Đang tải lên...' : 'Tạo dịch vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cập nhật dịch vụ */}
      {isUpdateModalOpen && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          {/* Nội dung form cập nhật */}
          <form onSubmit={handleUpdateService} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa dịch vụ</h2>
              <button type="button" onClick={handleCloseUpdateModal} className="p-2 rounded-full hover:bg-gray-100">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} 
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur} 
                  rows={4} 
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                ></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleInputChange} 
                  onBlur={handleFieldBlur}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh dịch vụ</label>
                <div className="mt-2 flex items-center gap-4">
                  {formData.image && <img src={formData.image} alt="Preview" className="w-24 h-24 rounded-lg object-cover" />}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  <button type="button" onClick={handleSelectImage} disabled={uploading} className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none`}>
                    {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                  </button>
                </div>
                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
            </div>
            {/* Footer */}
            <div className="flex justify-end items-center p-6 border-t border-gray-200 space-x-3">
              <button type="button" onClick={handleCloseUpdateModal} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Hủy</button>
              <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Lưu thay đổi</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Service;
