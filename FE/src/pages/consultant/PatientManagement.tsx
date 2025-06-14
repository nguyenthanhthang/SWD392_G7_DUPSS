import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, UserPlus, FileText, Calendar, Clock, Download, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Patient {
  id: number;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  age: number;
  gender: 'Nam' | 'Nữ' | 'Khác';
  lastVisit: string;
  nextAppointment?: string;
  totalSessions: number;
  status: 'active' | 'inactive' | 'pending';
  concerns: string[];
}

const PatientManagement = () => {
  // Mock data cho danh sách bệnh nhân
  const mockPatients: Patient[] = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      email: 'nguyenvana@example.com',
      phone: '0901234567',
      age: 35,
      gender: 'Nam',
      lastVisit: '15/06/2023',
      nextAppointment: '22/07/2023',
      totalSessions: 8,
      status: 'active',
      concerns: ['Stress', 'Lo âu']
    },
    {
      id: 2,
      name: 'Trần Thị B',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      email: 'tranthib@example.com',
      phone: '0912345678',
      age: 28,
      gender: 'Nữ',
      lastVisit: '10/06/2023',
      totalSessions: 5,
      status: 'active',
      concerns: ['Trầm cảm', 'Mất ngủ']
    },
    {
      id: 3,
      name: 'Lê Văn C',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
      email: 'levanc@example.com',
      phone: '0923456789',
      age: 42,
      gender: 'Nam',
      lastVisit: '05/06/2023',
      nextAppointment: '25/06/2023',
      totalSessions: 3,
      status: 'active',
      concerns: ['Vấn đề gia đình']
    },
    {
      id: 4,
      name: 'Phạm Thị D',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      email: 'phamthid@example.com',
      phone: '0934567890',
      age: 19,
      gender: 'Nữ',
      lastVisit: '01/06/2023',
      totalSessions: 2,
      status: 'pending',
      concerns: ['Lo âu', 'Stress học tập']
    },
    {
      id: 5,
      name: 'Hoàng Văn E',
      avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
      email: 'hoangvane@example.com',
      phone: '0945678901',
      age: 50,
      gender: 'Nam',
      lastVisit: '28/05/2023',
      totalSessions: 10,
      status: 'inactive',
      concerns: ['Rối loạn giấc ngủ', 'Stress công việc']
    },
    {
      id: 6,
      name: 'Ngô Thị F',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      email: 'ngothif@example.com',
      phone: '0956789012',
      age: 31,
      gender: 'Nữ',
      lastVisit: '25/05/2023',
      nextAppointment: '18/06/2023',
      totalSessions: 6,
      status: 'active',
      concerns: ['Khủng hoảng tuổi trung niên']
    },
    {
      id: 7,
      name: 'Vũ Văn G',
      avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
      email: 'vuvang@example.com',
      phone: '0967890123',
      age: 27,
      gender: 'Nam',
      lastVisit: '20/05/2023',
      totalSessions: 4,
      status: 'active',
      concerns: ['Stress công việc', 'Mối quan hệ']
    },
  ];

  // State
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [concernFilter, setConcernFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5);

  // Danh sách tất cả các concerns (vấn đề) để lọc
  const allConcerns = Array.from(
    new Set(mockPatients.flatMap(patient => patient.concerns))
  );

  // Xử lý tìm kiếm và lọc
  useEffect(() => {
    let result = patients;
    
    // Tìm kiếm
    if (searchTerm) {
      result = result.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      );
    }
    
    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      result = result.filter(patient => patient.status === statusFilter);
    }
    
    // Lọc theo vấn đề
    if (concernFilter !== 'all') {
      result = result.filter(patient => 
        patient.concerns.includes(concernFilter)
      );
    }
    
    // Sắp xếp
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'lastVisit') {
        // Chuyển đổi ngày từ dd/mm/yyyy sang định dạng có thể so sánh
        const dateA = a.lastVisit.split('/').reverse().join('-');
        const dateB = b.lastVisit.split('/').reverse().join('-');
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      } else if (sortBy === 'sessions') {
        return b.totalSessions - a.totalSessions;
      }
      return 0;
    });
    
    setFilteredPatients(result);
  }, [patients, searchTerm, statusFilter, concernFilter, sortBy]);

  // Phân trang
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  // Xử lý chuyển trang
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Hàm lấy màu dựa trên trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Hàm lấy text trạng thái tiếng Việt
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang điều trị';
      case 'inactive':
        return 'Ngừng điều trị';
      case 'pending':
        return 'Chờ xác nhận';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quản lý bệnh nhân</h1>
            <p className="text-gray-600 mt-2">Quản lý danh sách và hồ sơ bệnh nhân của bạn</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-gray-700 flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </button>
            <button className="bg-blue-600 px-4 py-2 rounded-lg shadow-sm text-white flex items-center">
              <UserPlus className="w-4 h-4 mr-2" />
              Thêm bệnh nhân
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng số bệnh nhân</p>
                <h3 className="text-2xl font-bold text-gray-800">{patients.length}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Đang điều trị</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {patients.filter(p => p.status === 'active').length}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Buổi tư vấn đã thực hiện</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {patients.reduce((sum, patient) => sum + patient.totalSessions, 0)}
                </h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm bệnh nhân..." 
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Lọc:</span>
                </div>
                
                <div className="relative">
                  <select 
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang điều trị</option>
                    <option value="inactive">Ngừng điều trị</option>
                    <option value="pending">Chờ xác nhận</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select 
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    value={concernFilter}
                    onChange={(e) => setConcernFilter(e.target.value)}
                  >
                    <option value="all">Tất cả vấn đề</option>
                    {allConcerns.map(concern => (
                      <option key={concern} value={concern}>{concern}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Sắp xếp theo:</span>
              <div className="relative">
                <select 
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Tên</option>
                  <option value="lastVisit">Lần khám gần nhất</option>
                  <option value="sessions">Số buổi tư vấn</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bệnh nhân
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin liên hệ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lần khám gần nhất
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lịch hẹn tới
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số buổi tư vấn
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vấn đề
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover" src={patient.avatar} alt={patient.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.age} tuổi, {patient.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.email}</div>
                      <div className="text-sm text-gray-500">{patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.lastVisit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.nextAppointment || "Chưa có lịch hẹn"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.totalSessions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {patient.concerns.map((concern, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {concern}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                        {getStatusText(patient.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link to={`/consultants/patients/${patient.id}`} className="text-blue-600 hover:text-blue-900">
                          <FileText className="w-5 h-5" />
                        </Link>
                        <button className="text-gray-500 hover:text-gray-700">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredPatients.length > 0 ? (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Trước
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{indexOfFirstPatient + 1}</span> đến <span className="font-medium">
                      {Math.min(indexOfLastPatient, filteredPatients.length)}
                    </span> trong <span className="font-medium">{filteredPatients.length}</span> kết quả
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Trang trước</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Hiển thị các số trang */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Trang sau</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">Không tìm thấy bệnh nhân nào phù hợp với điều kiện tìm kiếm.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientManagement;
