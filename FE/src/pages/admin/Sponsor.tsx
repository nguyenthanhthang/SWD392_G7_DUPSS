import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';
import Select from 'react-select';

// Interface cho dữ liệu nhà tài trợ
interface ISponsor {
  _id: string;
  fullName: string;
  email: string;
  status: 'active' | 'inactive' | 'isDeleted';
  ranking: 'platinum' | 'gold' | 'silver' | 'bronze';
  logo?: string;
  donation?: string;
  eventIds: {
    _id: string;
    title: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Interface cho dữ liệu event
interface IEvent {
  _id: string;
  title: string;
}

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

interface IFormData {
  fullName: string;
  email: string;
  ranking: 'platinum' | 'gold' | 'silver' | 'bronze';
  eventIds: string[];
  status: 'active' | 'inactive' | 'isDeleted';
  logo?: string;
  donation?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white text-xs rounded py-1 px-2 -top-10 left-1/2 transform -translate-x-1/2 w-max">
        {text}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-2 h-2 bg-gray-800 rotate-45"></div>
      </div>
    </div>
  );
};

const Sponsor: React.FC = () => {
  const [sponsors, setSponsors] = useState<ISponsor[]>([]);
  const [filteredSponsors, setFilteredSponsors] = useState<ISponsor[]>([]);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<ISponsor | null>(null);
  const [formData, setFormData] = useState<IFormData>({
    fullName: '',
    email: '',
    ranking: 'bronze',
    eventIds: [],
    status: 'active'
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rankingFilter, setRankingFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const totalPages = Math.ceil(filteredSponsors.length / rowsPerPage);
  const paginatedSponsors = filteredSponsors.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Fetch sponsors
  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sponsors');
      setSponsors(response.data);
      setFilteredSponsors(response.data);
      setError(null);
    } catch (err) {
      console.error('API Error:', err);
      setError('Có lỗi xảy ra khi tải danh sách nhà tài trợ');
      toast.error('Không thể tải danh sách nhà tài trợ');
    } finally {
      setLoading(false);
    }
  };

  // Filter sponsors
  const filterSponsors = () => {
    let filtered = [...sponsors];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sponsor =>
        sponsor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sponsor.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(sponsor => sponsor.status === statusFilter);
    }

    // Filter by ranking
    if (rankingFilter) {
      filtered = filtered.filter(sponsor => sponsor.ranking === rankingFilter);
    }

    setFilteredSponsors(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setRankingFilter('');
    setFilteredSponsors(sponsors);
    setCurrentPage(1);
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  useEffect(() => {
    fetchSponsors();
    fetchEvents();
  }, []);

  // Apply filters when status filter or ranking filter changes
  useEffect(() => {
    filterSponsors();
  }, [statusFilter, rankingFilter, sponsors]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterSponsors();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, sponsors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenCreateModal = () => {
    setFormData({
      fullName: '',
      email: '',
      ranking: 'bronze',
      eventIds: [],
      status: 'active'
    });
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || formData.eventIds.length === 0) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    try {
      const response = await api.post('/sponsors', formData);
      setSponsors(prev => [response.data, ...prev]);
      handleCloseCreateModal();
      toast.success('Tạo nhà tài trợ thành công!');
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(`Có lỗi xảy ra khi tạo nhà tài trợ: ${apiError.response?.data?.message || 'Lỗi không xác định'}`);
    }
  };

  const handleOpenUpdateModal = (sponsor: ISponsor) => {
    setFormData({
      fullName: sponsor.fullName,
      email: sponsor.email,
      ranking: sponsor.ranking,
      eventIds: sponsor.eventIds.map(ev => ev._id),
      status: sponsor.status,
      logo: sponsor.logo || '',
      donation: sponsor.donation || ''
    });
    setSelectedSponsor(sponsor);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedSponsor(null);
  };

  const handleUpdateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSponsor) return;

    try {
      await api.put(`/sponsors/${selectedSponsor._id}`, formData);
      setSponsors(prev =>
        prev.map(sponsor =>
          sponsor._id === selectedSponsor._id ? { ...sponsor, ...formData } : sponsor
        )
      );
      handleCloseUpdateModal();
      toast.success('Cập nhật nhà tài trợ thành công!');
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(`Có lỗi xảy ra khi cập nhật nhà tài trợ: ${apiError.response?.data?.message || 'Lỗi không xác định'}`);
    }
  };

  const handleOpenDeleteModal = (sponsor: ISponsor) => {
    setSelectedSponsor(sponsor);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedSponsor(null);
  };

  const handleDeleteSponsor = async () => {
    if (!selectedSponsor) return;

    try {
      await api.delete(`/sponsors/${selectedSponsor._id}`);
      setSponsors(prev =>
        prev.filter(sponsor => sponsor._id !== selectedSponsor._id)
      );
      handleCloseDeleteModal();
      toast.success('Xóa nhà tài trợ thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa nhà tài trợ!');
    }
  };

  const getRankingColor = (ranking: string) => {
    switch (ranking) {
      case 'platinum':
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
      case 'gold':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300';
      case 'silver':
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300';
      case 'bronze':
        return 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getRankingName = (ranking: string) => {
    switch (ranking) {
      case 'platinum':
        return 'Bạch kim';
      case 'gold':
        return 'Vàng';
      case 'silver':
        return 'Bạc';
      case 'bronze':
        return 'Đồng';
      default:
        return ranking;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
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
    <div className="p-4 bg-white rounded-lg mt-4">
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
        <h1 className="text-2xl font-semibold text-gray-800">Quản lý nhà tài trợ</h1>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center shadow-md transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm nhà tài trợ
        </button>
      </div>

      {/* Phần tìm kiếm và lọc */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Tìm kiếm và Lọc</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tìm kiếm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Tìm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-sky-500 focus:border-sky-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          {/* Lọc theo trạng thái */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
          
          {/* Lọc theo ranking */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ranking</label>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
              value={rankingFilter}
              onChange={(e) => setRankingFilter(e.target.value)}
            >
              <option value="">Tất cả ranking</option>
              <option value="platinum">Bạch kim</option>
              <option value="gold">Vàng</option>
              <option value="silver">Bạc</option>
              <option value="bronze">Đồng</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Đặt lại bộ lọc
          </button>
        </div>
      </div>

      {/* Thông tin kết quả */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Hiển thị {paginatedSponsors.length} trong tổng số {filteredSponsors.length} nhà tài trợ
          {searchTerm || statusFilter || rankingFilter ? (
            <span className="ml-2 text-sky-600">
              (đã lọc)
            </span>
          ) : null}
        </div>
      </div>

      {/* Bảng nhà tài trợ */}
      <div className="overflow-x-auto shadow-md rounded-lg max-h-[70vh] overflow-y-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gradient-to-r from-sky-50 to-cyan-50 text-gray-700 text-left text-sm font-semibold uppercase tracking-wider">
              <th className="px-4 py-3">Logo</th>
              <th className="px-4 py-3">Tên nhà tài trợ</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Sự kiện</th>
              <th className="px-4 py-3">Ranking</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Donation</th>
              <th className="px-4 py-3 rounded-tr-lg text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
            {paginatedSponsors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900">Không tìm thấy nhà tài trợ</p>
                    <p className="text-sm text-gray-500">
                      {searchTerm || statusFilter || rankingFilter 
                        ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                        : 'Chưa có nhà tài trợ nào được thêm vào hệ thống'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedSponsors.map(sponsor => (
              <tr key={sponsor._id} className="hover:bg-sky-50 transition-colors duration-150">
                <td>
                  {sponsor.logo && <img src={sponsor.logo} alt="Logo" className="w-12 h-12 object-cover rounded" />}
                </td>
                <td className="px-4 py-3 font-medium">{sponsor.fullName}</td>
                <td className="px-4 py-3">{sponsor.email}</td>
                <td className="px-4 py-3">
                  {sponsor.eventIds && sponsor.eventIds.length > 0 ? sponsor.eventIds.map(ev => ev.title).join(', ') : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getRankingColor(sponsor.ranking)}`}>
                    {getRankingName(sponsor.ranking)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      sponsor.status === 'active'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    {sponsor.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>
                  {sponsor.donation || '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Tooltip text="Chỉnh sửa">
                      <button
                        onClick={() => handleOpenUpdateModal(sponsor)}
                        className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </Tooltip>
                    
                    <Tooltip text="Xóa">
                      <button
                        onClick={() => handleOpenDeleteModal(sponsor)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
      )}

      {/* Modal Tạo mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl px-8 py-6 transform transition-all">
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Thêm nhà tài trợ mới</h3>
            </div>
            
            <form onSubmit={handleCreateSponsor}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên nhà tài trợ</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                    required
                    placeholder="Nhập tên nhà tài trợ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                    required
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Logo nhà tài trợ</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const form = new FormData();
                      form.append('image', file);
                      const res = await fetch('http://localhost:5000/api/uploads/upload', {
                        method: 'POST',
                        body: form,
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                      });
                      const data = await res.json();
                      setFormData(prev => ({ ...prev, logo: data.imageUrl }));
                    }}
                  />
                  {formData.logo && (
                    <img src={formData.logo} alt="Logo" className="w-24 h-24 object-cover mt-2" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Sự kiện</label>
                  <Select
                    isMulti
                    name="eventIds"
                    options={events.map(ev => ({ value: ev._id, label: ev.title }))}
                    value={events.filter(ev => formData.eventIds.includes(ev._id)).map(ev => ({ value: ev._id, label: ev.title }))}
                    onChange={selected => {
                      setFormData(prev => ({
                        ...prev,
                        eventIds: selected ? (selected as any[]).map(item => item.value) : []
                      }));
                    }}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Chọn sự kiện..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ranking</label>
                  <select
                    name="ranking"
                    value={formData.ranking}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                    required
                  >
                    <option value="bronze">Đồng</option>
                    <option value="silver">Bạc</option>
                    <option value="gold">Vàng</option>
                    <option value="platinum">Bạch kim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Donation</label>
                  <input
                    type="text"
                    name="donation"
                    value={formData.donation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                    placeholder="Nhập số tiền hoặc hiện vật tài trợ"
                  />
                </div>

                {formData.eventIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {events
                      .filter(ev => formData.eventIds.includes(ev._id))
                      .map(ev => (
                        <span key={ev._id} className="px-2 py-1 bg-sky-100 text-sky-700 rounded text-xs">
                          {ev.title}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
                <button type="button" onClick={handleCloseCreateModal} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cập nhật */}
      {isUpdateModalOpen && selectedSponsor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl px-8 py-6 transform transition-all">
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Cập nhật nhà tài trợ</h3>
            </div>
            
            <form onSubmit={handleUpdateSponsor}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên nhà tài trợ</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                    required
                    placeholder="Nhập tên nhà tài trợ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                    required
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Logo nhà tài trợ</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const form = new FormData();
                      form.append('image', file);
                      const res = await fetch('http://localhost:5000/api/uploads/upload', {
                        method: 'POST',
                        body: form,
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                      });
                      const data = await res.json();
                      setFormData(prev => ({ ...prev, logo: data.imageUrl }));
                    }}
                  />
                  {formData.logo && (
                    <img src={formData.logo} alt="Logo" className="w-24 h-24 object-cover mt-2" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Sự kiện</label>
                  <Select
                    isMulti
                    name="eventIds"
                    options={events.map(ev => ({ value: ev._id, label: ev.title }))}
                    value={events.filter(ev => formData.eventIds.includes(ev._id)).map(ev => ({ value: ev._id, label: ev.title }))}
                    onChange={selected => {
                      setFormData(prev => ({
                        ...prev,
                        eventIds: selected ? (selected as any[]).map(item => item.value) : []
                      }));
                    }}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Chọn sự kiện..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ranking</label>
                  <select
                    name="ranking"
                    value={formData.ranking}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                    required
                  >
                    <option value="bronze">Đồng</option>
                    <option value="silver">Bạc</option>
                    <option value="gold">Vàng</option>
                    <option value="platinum">Bạch kim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Donation</label>
                  <input
                    type="text"
                    name="donation"
                    value={formData.donation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                    placeholder="Nhập số tiền hoặc hiện vật tài trợ"
                  />
                </div>

                {formData.eventIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {events
                      .filter(ev => formData.eventIds.includes(ev._id))
                      .map(ev => (
                        <span key={ev._id} className="px-2 py-1 bg-sky-100 text-sky-700 rounded text-xs">
                          {ev.title}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
                <button type="button" onClick={handleCloseUpdateModal} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xóa */}
      {isDeleteModalOpen && selectedSponsor && (
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
              <p>Bạn có chắc chắn muốn xóa nhà tài trợ "{selectedSponsor.fullName}"?</p>
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
                onClick={handleDeleteSponsor}
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

export default Sponsor;
