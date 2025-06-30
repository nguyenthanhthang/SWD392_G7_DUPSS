import React, { useState, useEffect } from "react";
import { getAllAccountsApi, getAllConsultantsApi, getTotalRevenueApi, getWeeklyRevenueApi, getMonthlyRevenueApi, getRevenueByServiceApi } from "../../api";
import { Users, UserPlus, UserCheck } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ThongKeNguoiDung {
  tongSoNguoiDung: number;
  tongSoTuVanVien: number;
  tongSoKhachHang: number;
  nguoiDungMoiThangNay: number;
  nguoiDungHoatDong: number;
  nguoiDungKhongHoatDong: number;
  nguoiDungTheoVaiTro: {
    customer: number;
    consultant: number;
  };
  dangTai: boolean;
}

interface ThongKeDoanhThu {
  tongDoanhThu: number;
  doanhThuTheoNgay: number[];
  soLuongGiaoDich: number;
  dangTai: boolean;
  loaiThongKe: 'week' | 'month';
}

interface ThongKeDichVu {
  services: {
    serviceId: string;
    serviceName: string;
    totalRevenue: number;
    transactionCount: number;
    dailyRevenue?: number[];
  }[];
  dangTai: boolean;
}

const Dashboard = () => {
  const [thongKeNguoiDung, setThongKeNguoiDung] = useState<ThongKeNguoiDung>({
    tongSoNguoiDung: 0,
    tongSoTuVanVien: 0,
    tongSoKhachHang: 0,
    nguoiDungMoiThangNay: 0,
    nguoiDungHoatDong: 0,
    nguoiDungKhongHoatDong: 0,
    nguoiDungTheoVaiTro: {
      customer: 0,
      consultant: 0,
    },
    dangTai: true,
  });

  const [thongKeDoanhThu, setThongKeDoanhThu] = useState<ThongKeDoanhThu>({
    tongDoanhThu: 0,
    doanhThuTheoNgay: Array(7).fill(0),
    soLuongGiaoDich: 0,
    dangTai: true,
    loaiThongKe: 'week',
  });

  const [thongKeDichVu, setThongKeDichVu] = useState<ThongKeDichVu>({
    services: [],
    dangTai: true
  });

  // Fetch user statistics
  useEffect(() => {
    const layThongKeNguoiDung = async () => {
      try {
        // Fetch all accounts
        const taiKhoan = await getAllAccountsApi();
        
        // Calculate statistics
        const tongSoNguoiDung = taiKhoan.length;
        
        // Count active and inactive users
        const nguoiDungHoatDong = taiKhoan.filter((tk: any) => !tk.isDisabled).length;
        const nguoiDungKhongHoatDong = taiKhoan.filter((tk: any) => tk.isDisabled).length;
        
        // Count users by role
        const nguoiDungTheoVaiTro = taiKhoan.reduce((acc: any, nguoiDung: any) => {
          acc[nguoiDung.role] = (acc[nguoiDung.role] || 0) + 1;
          return acc;
        }, { customer: 0, consultant: 0 });
        
        // Đảm bảo có giá trị cho cả hai vai trò
        if (!nguoiDungTheoVaiTro.customer) nguoiDungTheoVaiTro.customer = 0;
        if (!nguoiDungTheoVaiTro.consultant) nguoiDungTheoVaiTro.consultant = 0;
        
        // Lấy số lượng tư vấn viên và khách hàng từ vai trò
        const tongSoTuVanVien = nguoiDungTheoVaiTro.consultant;
        const tongSoKhachHang = nguoiDungTheoVaiTro.customer;
        
        // Count new users this month
        const homNay = new Date();
        const ngayDauThang = new Date(homNay.getFullYear(), homNay.getMonth(), 1);
        const nguoiDungMoiThangNay = taiKhoan.filter((tk: any) => {
          const ngayTao = new Date(tk.createdAt);
          return ngayTao >= ngayDauThang;
        }).length;
        
        setThongKeNguoiDung({
          tongSoNguoiDung,
          tongSoTuVanVien,
          tongSoKhachHang,
          nguoiDungMoiThangNay,
          nguoiDungHoatDong,
          nguoiDungKhongHoatDong,
          nguoiDungTheoVaiTro,
          dangTai: false,
        });
      } catch (error) {
        console.error("Lỗi khi lấy thống kê người dùng:", error);
        setThongKeNguoiDung(prev => ({ ...prev, dangTai: false }));
      }
    };
    
    layThongKeNguoiDung();
  }, []);

  // Tính toán phần trăm tư vấn viên và khách hàng một cách an toàn
  const phanTramTuVanVien = thongKeNguoiDung.tongSoNguoiDung > 0 
    ? (thongKeNguoiDung.tongSoTuVanVien / thongKeNguoiDung.tongSoNguoiDung) * 100 
    : 0;
    
  const phanTramKhachHang = thongKeNguoiDung.tongSoNguoiDung > 0 
    ? (thongKeNguoiDung.tongSoKhachHang / thongKeNguoiDung.tongSoNguoiDung) * 100 
    : 0;

  // Fetch revenue statistics
  useEffect(() => {
    const layThongKeDoanhThu = async () => {
      try {
        setThongKeDoanhThu(prev => ({ ...prev, dangTai: true }));
        
        // Gọi API dựa trên loại thống kê đã chọn
        if (thongKeDoanhThu.loaiThongKe === 'week') {
          const response = await getWeeklyRevenueApi();
          
          if (response.success && response.data) {
            setThongKeDoanhThu({
              tongDoanhThu: response.data.weeklyRevenue || 0,
              doanhThuTheoNgay: response.data.dailyRevenue || Array(7).fill(0),
              soLuongGiaoDich: response.data.count || 0,
              dangTai: false,
              loaiThongKe: 'week',
            });
          } else {
            setThongKeDoanhThu(prev => ({ ...prev, dangTai: false }));
          }
        } else if (thongKeDoanhThu.loaiThongKe === 'month') {
          const response = await getMonthlyRevenueApi();
          
          if (response.success && response.data) {
            // Lấy dữ liệu theo ngày trong tháng
            const dailyRevenue = response.data.dailyRevenue || [];
            
            setThongKeDoanhThu({
              tongDoanhThu: response.data.monthlyRevenue || 0,
              doanhThuTheoNgay: dailyRevenue,
              soLuongGiaoDich: response.data.count || 0,
              dangTai: false,
              loaiThongKe: 'month',
            });
          } else {
            setThongKeDoanhThu(prev => ({ ...prev, dangTai: false }));
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy thống kê doanh thu:", error);
        setThongKeDoanhThu(prev => ({ ...prev, dangTai: false }));
      }
    };
    
    layThongKeDoanhThu();
  }, [thongKeDoanhThu.loaiThongKe]);

  // Fetch service revenue statistics
  useEffect(() => {
    const layThongKeDichVu = async () => {
      try {
        setThongKeDichVu(prev => ({ ...prev, dangTai: true }));
        
        // Lấy doanh thu theo dịch vụ
        const response = await getRevenueByServiceApi();
        
        if (response.success && response.data) {
          setThongKeDichVu({
            services: response.data.services || [],
            dangTai: false
          });
        } else {
          setThongKeDichVu(prev => ({ ...prev, dangTai: false }));
        }
      } catch (error) {
        console.error("Lỗi khi lấy thống kê doanh thu theo dịch vụ:", error);
        setThongKeDichVu(prev => ({ ...prev, dangTai: false }));
      }
    };
    
    layThongKeDichVu();
  }, []);

  // Hàm xử lý khi thay đổi loại thống kê doanh thu
  const handleChangeLoaiThongKe = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'week' | 'month';
    setThongKeDoanhThu(prev => ({ ...prev, loaiThongKe: value }));
  };

  // Format tiền Việt Nam
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Tìm giá trị cao nhất để scale đồ thị
  const maxValue = Math.max(...thongKeDoanhThu.doanhThuTheoNgay, 1);
  
  // Tạo nhãn cho trục x dựa trên loại thống kê
  const getLabels = () => {
    if (thongKeDoanhThu.loaiThongKe === 'week') {
      return ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    } else {
      // Tạo nhãn cho các ngày trong tháng
      return Array.from({ length: thongKeDoanhThu.doanhThuTheoNgay.length }, (_, i) => `${i + 1}`);
    }
  };

  // Hiển thị các cột với số lượng phù hợp
  const visibleData = () => {
    const labels = getLabels();
    if (thongKeDoanhThu.loaiThongKe === 'week') {
      // Hiển thị đầy đủ 7 ngày trong tuần
      return thongKeDoanhThu.doanhThuTheoNgay.slice(0, 7);
    } else {
      // Hiển thị 7 ngày gần nhất nếu là view tháng
      if (thongKeDoanhThu.doanhThuTheoNgay.length > 7) {
        return thongKeDoanhThu.doanhThuTheoNgay.slice(-7);
      }
      return thongKeDoanhThu.doanhThuTheoNgay;
    }
  };

  // Lấy nhãn tương ứng với dữ liệu hiển thị
  const visibleLabels = () => {
    const allLabels = getLabels();
    if (thongKeDoanhThu.loaiThongKe === 'week') {
      return allLabels;
    } else {
      // Lấy 7 nhãn cuối cùng nếu là view tháng
      if (allLabels.length > 7) {
        return allLabels.slice(-7);
      }
      return allLabels;
    }
  };

  // Dữ liệu cho biểu đồ tròn
  const pieChartData = {
    labels: thongKeDichVu.services.map(service => service.serviceName),
    datasets: [
      {
        data: thongKeDichVu.services.map(service => service.totalRevenue),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',   // Xanh dương
          'rgba(75, 192, 192, 0.8)',   // Xanh ngọc
          'rgba(153, 102, 255, 0.8)',  // Tím
          'rgba(255, 159, 64, 0.8)',   // Cam
          'rgba(255, 206, 86, 0.8)',   // Vàng
          'rgba(111, 183, 214, 0.8)',  // Xanh nhạt
          'rgba(43, 108, 176, 0.8)',   // Xanh đậm
          'rgba(255, 99, 132, 0.8)',   // Đỏ hồng
          'rgba(144, 238, 144, 0.8)',  // Xanh lá nhạt
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(111, 183, 214, 1)',
          'rgba(43, 108, 176, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(144, 238, 144, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Tùy chọn cho biểu đồ tròn
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'start' as const,
        labels: {
          font: {
            family: 'Arial',
            size: 13
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 10
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'Arial',
          size: 16,
          weight: 'bold' as const
        },
        bodyFont: {
          family: 'Arial',
          size: 14
        },
        padding: 12,
        cornerRadius: 6,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const dataset = context.dataset;
            const total = dataset.data.reduce((acc: number, data: number) => acc + data, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6 mt-4">
      {/* User Statistics Section */}
      <div className="bg-white dark:bg-darkgray p-6 rounded-lg">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Thống kê người dùng</h2>
        </div>

        {thongKeNguoiDung.dangTai ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Users */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Tổng số người dùng</p>
                  <h3 className="text-2xl font-bold text-sky-500">{thongKeNguoiDung.tongSoNguoiDung}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-sky-500" />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Hoạt động: <span className="font-medium text-green-600">{thongKeNguoiDung.nguoiDungHoatDong}</span></span>
                <span className="text-gray-500">Không hoạt động: <span className="font-medium text-red-500">{thongKeNguoiDung.nguoiDungKhongHoatDong}</span></span>
              </div>
            </div>

            {/* User Roles - Consultant */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Tư vấn viên</p>
                  <h3 className="text-2xl font-bold text-cyan-400">{thongKeNguoiDung.tongSoTuVanVien}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: `${phanTramTuVanVien}%` }}></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{phanTramTuVanVien.toFixed(1)}%</span>
                  <span>của tổng số người dùng</span>
                </div>
              </div>
            </div>

            {/* User Roles - Customer */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Khách hàng</p>
                  <h3 className="text-2xl font-bold text-sky-500">{thongKeNguoiDung.tongSoKhachHang}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-sky-500" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${phanTramKhachHang}%` }}></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{phanTramKhachHang.toFixed(1)}%</span>
                  <span>của tổng số người dùng</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-darkgray p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Doanh thu</h2>

          <div className="relative">
            <select 
              className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
              value={thongKeDoanhThu.loaiThongKe}
              onChange={handleChangeLoaiThongKe}
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="h-60 w-full">
          {thongKeDoanhThu.dangTai ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-around items-end h-full w-full p-4">
                {visibleData().map((value, index) => {
                  // Calculate bar height - minimum 15px for visibility
                  const maxHeight = 150; // Maximum height in pixels
                  const height = value > 0 
                    ? Math.max(15, (value / maxValue) * maxHeight) 
                    : 0;
                  
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center justify-end"
                      style={{ width: '12%' }} // Wider columns
                    >
                      {value > 0 && (
                        <div className="flex flex-col items-center">
                          {/* Bar chart - primary part */}
                          <div
                            className="w-full bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-md relative group"
                            style={{ height: `${height}px`, minWidth: '30px' }}
                          >
                            {/* Tooltip on hover */}
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                              {formatCurrency(value)}
                            </div>
                          </div>
                          
                          {/* Decorative part */}
                          <div
                            className="w-full bg-sky-300 rounded-b-md mt-0.5"
                            style={{ height: '5px', minWidth: '30px' }}
                          ></div>
                        </div>
                      )}
                      
                      {/* Label */}
                      <span className="text-sm font-medium text-gray-700 mt-2">
                        {visibleLabels()[index]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Thêm thông tin tổng doanh thu */}
        {!thongKeDoanhThu.dangTai && (
          <div className="mt-4 flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <div className="text-base font-medium text-gray-700">
              Tổng doanh thu:&nbsp;
              <span className="font-bold text-sky-600 text-lg">
                {formatCurrency(thongKeDoanhThu.tongDoanhThu)}
              </span>
            </div>
            <div className="text-base font-medium text-gray-700">
              Số lượng giao dịch:&nbsp;
              <span className="font-bold text-sky-600 text-lg">
                {thongKeDoanhThu.soLuongGiaoDich}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Service Revenue Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Pie Chart - Revenue by Service */}
        <div className="bg-white dark:bg-darkgray p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Tỷ lệ doanh thu theo dịch vụ</h2>
          
          {thongKeDichVu.dangTai ? (
            <div className="flex justify-center items-center h-80">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
          ) : (
            <div className="h-80">
              {thongKeDichVu.services.length > 0 ? (
                <Pie data={pieChartData} options={pieChartOptions} />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500">Không có dữ liệu doanh thu theo dịch vụ</p>
                </div>
              )}
            </div>
          )}
          
          {!thongKeDichVu.dangTai && thongKeDichVu.services.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {thongKeDichVu.services.map((service, index) => (
                <div key={service.serviceId} className="p-3 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                  <p className="text-sm font-medium text-gray-800">{service.serviceName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCurrency(service.totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {service.transactionCount} giao dịch
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
