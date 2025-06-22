import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, FileText, Download, Calendar, Clock, MoreHorizontal, ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Report {
  id: number;
  patientName: string;
  patientAvatar: string;
  appointmentDate: string;
  reportDate: string;
  status: 'completed' | 'pending' | 'draft';
  summary: string;
  recommendations: string[];
  nextAppointment?: string;
  tags: string[];
}

const ReportsAndUpdates = () => {
  // Mock data cho báo cáo
  const mockReports: Report[] = [
    {
      id: 1,
      patientName: 'Nguyễn Văn A',
      patientAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      appointmentDate: '15/06/2023',
      reportDate: '15/06/2023',
      status: 'completed',
      summary: 'Bệnh nhân đã có những tiến triển tích cực trong việc kiểm soát lo âu.',
      recommendations: ['Tiếp tục thực hành các bài tập thư giãn', 'Ghi nhật ký cảm xúc hàng ngày'],
      nextAppointment: '22/06/2023',
      tags: ['Lo âu', 'Stress']
    },
    {
      id: 2,
      patientName: 'Trần Thị B',
      patientAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      appointmentDate: '10/06/2023',
      reportDate: '10/06/2023',
      status: 'completed',
      summary: 'Bệnh nhân đã chia sẻ về các vấn đề mất ngủ và trầm cảm gần đây.',
      recommendations: ['Tham gia nhóm hỗ trợ', 'Tập thể dục nhẹ nhàng mỗi ngày'],
      nextAppointment: '24/06/2023',
      tags: ['Trầm cảm', 'Mất ngủ']
    },
    {
      id: 3,
      patientName: 'Lê Văn C',
      patientAvatar: 'https://randomuser.me/api/portraits/men/67.jpg',
      appointmentDate: '05/06/2023',
      reportDate: '05/06/2023',
      status: 'completed',
      summary: 'Thảo luận về các xung đột trong gia đình và cách giải quyết.',
      recommendations: ['Thực hành kỹ năng giao tiếp', 'Dành thời gian chất lượng với gia đình'],
      nextAppointment: '19/06/2023',
      tags: ['Vấn đề gia đình']
    },
    {
      id: 4,
      patientName: 'Phạm Thị D',
      patientAvatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      appointmentDate: '01/06/2023',
      reportDate: '02/06/2023',
      status: 'completed',
      summary: 'Bệnh nhân gặp áp lực học tập và lo âu về kỳ thi sắp tới.',
      recommendations: ['Lập kế hoạch học tập hợp lý', 'Thực hành kỹ thuật thư giãn trước khi học'],
      tags: ['Lo âu', 'Stress học tập']
    },
    {
      id: 5,
      patientName: 'Hoàng Văn E',
      patientAvatar: 'https://randomuser.me/api/portraits/men/42.jpg',
      appointmentDate: '28/05/2023',
      reportDate: '28/05/2023',
      status: 'completed',
      summary: 'Thảo luận về các vấn đề giấc ngủ và stress công việc.',
      recommendations: ['Thiết lập thói quen đi ngủ đều đặn', 'Giảm caffeine vào buổi chiều'],
      nextAppointment: '11/06/2023',
      tags: ['Rối loạn giấc ngủ', 'Stress công việc']
    },
    {
      id: 6,
      patientName: 'Ngô Thị F',
      patientAvatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      appointmentDate: '25/05/2023',
      reportDate: '',
      status: 'pending',
      summary: 'Đang soạn báo cáo...',
      recommendations: [],
      nextAppointment: '08/06/2023',
      tags: ['Khủng hoảng tuổi trung niên']
    },
    {
      id: 7,
      patientName: 'Vũ Văn G',
      patientAvatar: 'https://randomuser.me/api/portraits/men/55.jpg',
      appointmentDate: '20/05/2023',
      reportDate: '',
      status: 'draft',
      summary: 'Bản nháp: Thảo luận về stress công việc và các mối quan hệ.',
      recommendations: ['Thiết lập ranh giới công việc-cá nhân'],
      tags: ['Stress công việc', 'Mối quan hệ']
    },
  ];

  // State
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [reports, setReports] = useState<Report[]>(mockReports); // setReports sẽ được sử dụng khi có API thực
  const [filteredReports, setFilteredReports] = useState<Report[]>(mockReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(5);

  // Danh sách tất cả các tags để lọc
  const allTags = Array.from(
    new Set(mockReports.flatMap(report => report.tags))
  );

  // Xử lý tìm kiếm và lọc
  useEffect(() => {
    let result = reports;
    
    // Tìm kiếm
    if (searchTerm) {
      result = result.filter(report => 
        report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      result = result.filter(report => report.status === statusFilter);
    }
    
    // Lọc theo tag
    if (tagFilter !== 'all') {
      result = result.filter(report => 
        report.tags.includes(tagFilter)
      );
    }
    
    // Lọc theo khoảng thời gian
    if (dateFilter !== 'all') {
      const today = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      
      result = result.filter(report => {
        if (!report.appointmentDate) return false;
        
        const [day, month, year] = report.appointmentDate.split('/').map(Number);
        const appointmentDate = new Date(year, month - 1, day);
        const diffDays = Math.round(Math.abs((today.getTime() - appointmentDate.getTime()) / oneDay));
        
        if (dateFilter === 'last7days') return diffDays <= 7;
        if (dateFilter === 'last30days') return diffDays <= 30;
        if (dateFilter === 'last3months') return diffDays <= 90;
        
        return true;
      });
    }
    
    // Sắp xếp theo ngày báo cáo (mới nhất lên đầu)
    result = [...result].sort((a, b) => {
      if (!a.reportDate) return 1;
      if (!b.reportDate) return -1;
      
      const [dayA, monthA, yearA] = a.reportDate.split('/').map(Number);
      const [dayB, monthB, yearB] = b.reportDate.split('/').map(Number);
      
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      
      return dateB.getTime() - dateA.getTime();
    });
    
    setFilteredReports(result);
  }, [reports, searchTerm, statusFilter, tagFilter, dateFilter]);

  // Phân trang
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  // Xử lý chuyển trang
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Hàm lấy màu dựa trên trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Hàm lấy text trạng thái tiếng Việt
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'pending':
        return 'Đang chờ';
      case 'draft':
        return 'Bản nháp';
      default:
        return status;
    }
  };

  // Hàm lấy icon dựa trên trạng thái
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'draft':
        return <FileText className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Báo cáo & Cập nhật</h1>
            <p className="text-gray-600 mt-2">Quản lý báo cáo sau các buổi tư vấn và theo dõi tiến trình</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-gray-700 flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </button>
            <button className="bg-blue-600 px-4 py-2 rounded-lg shadow-sm text-white flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Tạo báo cáo mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Báo cáo đã hoàn thành</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {reports.filter(r => r.status === 'completed').length}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Đang chờ hoàn thành</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {reports.filter(r => r.status === 'pending').length}
                </h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng số báo cáo</p>
                <h3 className="text-2xl font-bold text-gray-800">{reports.length}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
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
                  placeholder="Tìm kiếm báo cáo..." 
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
                    <option value="completed">Đã hoàn thành</option>
                    <option value="pending">Đang chờ</option>
                    <option value="draft">Bản nháp</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select 
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                  >
                    <option value="all">Tất cả vấn đề</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select 
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">Tất cả thời gian</option>
                    <option value="last7days">7 ngày qua</option>
                    <option value="last30days">30 ngày qua</option>
                    <option value="last3months">3 tháng qua</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-6 mb-8">
          {currentReports.length > 0 ? (
            currentReports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="flex items-center">
                      <img 
                        src={report.patientAvatar} 
                        alt={report.patientName} 
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div>
                        <Link 
                          to={`/consultants/reports/${report.id}`} 
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {report.patientName}
                        </Link>
                        <div className="text-sm text-gray-500">Buổi tư vấn: {report.appointmentDate}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1">{getStatusText(report.status)}</span>
                      </div>
                      
                      {report.reportDate && (
                        <div className="text-sm text-gray-500">
                          Báo cáo: {report.reportDate}
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreHorizontal className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tóm tắt:</h4>
                    <p className="text-gray-600 mb-4">{report.summary}</p>
                    
                    {report.recommendations.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Khuyến nghị:</h4>
                        <ul className="list-disc pl-5 text-gray-600 space-y-1">
                          {report.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {report.tags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {report.nextAppointment && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Buổi hẹn tiếp theo: </span>
                        <span className="font-medium text-gray-800 ml-1">{report.nextAppointment}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-end gap-2">
                    {report.status === 'completed' ? (
                      <Link to={`/consultants/reports/${report.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Xem chi tiết
                      </Link>
                    ) : (
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        {report.status === 'draft' ? 'Tiếp tục chỉnh sửa' : 'Tạo báo cáo'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy báo cáo nào</h3>
              <p className="text-gray-500">Không có báo cáo nào phù hợp với điều kiện tìm kiếm của bạn.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredReports.length > reportsPerPage && (
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
            <div className="hidden md:block">
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{indexOfFirstReport + 1}</span> đến <span className="font-medium">
                  {Math.min(indexOfLastReport, filteredReports.length)}
                </span> trong <span className="font-medium">{filteredReports.length}</span> kết quả
              </p>
            </div>
            
            <div className="flex-1 flex justify-between md:justify-end">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md mr-2 ${
                  currentPage === 1 
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Trước
              </button>
              
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                  currentPage === totalPages 
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Sau
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsAndUpdates;
