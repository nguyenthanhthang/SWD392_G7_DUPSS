import React, { useEffect, useState } from 'react';
import { Calendar, Eye, List, CheckCircle2, Clock } from 'lucide-react';
import { getAllAppointmentsApi, getPaymentByAppointmentIdApi } from '../api';

interface Appointment {
  _id: string;
  dateBooking: string;
  service_id: {
    name: string;
    price: number;
  };
  consultant_id: {
    accountId?: {
      fullName: string;
    };
  };
  status: string;
}

interface Payment {
  _id: string;
  appointmentId: string;
  date: string;
  paymentMethod: string;
  status: string;
  totalPrice: number;
  description?: string;
}

const PaymentHistory = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Record<string, Payment | null>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  // State cho filter
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apps = await getAllAppointmentsApi();
        setAppointments(apps);
        // Lấy payment cho từng appointment
        const paymentResults: Record<string, Payment | null> = {};
        await Promise.all(
          apps.map(async (app: Appointment) => {
            try {
              const payment = await getPaymentByAppointmentIdApi(app._id);
              paymentResults[app._id] = payment;
            } catch {
              paymentResults[app._id] = null;
            }
          })
        );
        setPayments(paymentResults);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Tính toán stats
  const stats = {
    total: appointments.length,
    completed: Object.values(payments).filter(p => p && p.status === 'completed').length,
    pending: Object.values(payments).filter(p => !p || p.status !== 'completed').length,
  };

  // Lọc dữ liệu
  const filteredAppointments = appointments.filter(app => {
    const payment = payments[app._id];
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && payment && payment.status === 'completed') ||
      (filterStatus === 'pending' && (!payment || payment.status !== 'completed'));
    const matchMethod =
      filterMethod === 'all' || (payment && payment.paymentMethod === filterMethod);
    // Tìm kiếm theo tên dịch vụ, mã giao dịch, tên tư vấn viên
    const search = searchTerm.toLowerCase();
    const matchSearch =
      app.service_id?.name?.toLowerCase().includes(search) ||
      (payment && payment._id?.toLowerCase().includes(search)) ||
      (app.consultant_id?.accountId?.fullName?.toLowerCase().includes(search));
    // Lọc theo ngày
    let matchDate = true;
    if (dateFrom) {
      matchDate = matchDate && !!app.dateBooking && new Date(app.dateBooking as string) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchDate = matchDate && !!app.dateBooking && new Date(app.dateBooking as string) <= new Date(dateTo + 'T23:59:59');
    }
    return matchStatus && matchMethod && matchSearch && matchDate;
  });

  const dateFromProps = dateTo ? { max: dateTo } : {};
  const dateToProps = dateFrom ? { min: dateFrom } : {};

  return (
    <div className="px-3 py-3">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Tất cả */}
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`group relative bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 shadow border flex flex-row items-center gap-4 transition-all focus:outline-none hover:shadow-md hover:scale-[1.03] active:scale-100 ${filterStatus === 'all' ? 'ring-2 ring-blue-400 border-blue-300' : 'border-gray-200'}`}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-all">
            <List className="w-7 h-7 text-blue-500" />
          </div>
          <div className="flex flex-col items-start flex-1">
            <span className="text-sm text-gray-500 font-medium">Tất cả</span>
            <span className="text-2xl font-bold text-blue-700">{stats.total}</span>
          </div>
        </button>
        {/* Đã thanh toán */}
        <button
          type="button"
          onClick={() => setFilterStatus('completed')}
          className={`group relative bg-gradient-to-br from-green-50 to-white rounded-xl p-4 shadow border flex flex-row items-center gap-4 transition-all focus:outline-none hover:shadow-md hover:scale-[1.03] active:scale-100 ${filterStatus === 'completed' ? 'ring-2 ring-green-400 border-green-300' : 'border-gray-200'}`}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-200 transition-all">
            <CheckCircle2 className="w-7 h-7 text-green-500" />
          </div>
          <div className="flex flex-col items-start flex-1">
            <span className="text-sm text-gray-500 font-medium">Đã thanh toán</span>
            <span className="text-2xl font-bold text-green-700">{stats.completed}</span>
          </div>
        </button>
        {/* Chưa thanh toán */}
        <button
          type="button"
          onClick={() => setFilterStatus('pending')}
          className={`group relative bg-gradient-to-br from-yellow-50 to-white rounded-xl p-4 shadow border flex flex-row items-center gap-4 transition-all focus:outline-none hover:shadow-md hover:scale-[1.03] active:scale-100 ${filterStatus === 'pending' ? 'ring-2 ring-yellow-400 border-yellow-300' : 'border-gray-200'}`}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 group-hover:bg-yellow-200 transition-all">
            <Clock className="w-7 h-7 text-yellow-500" />
          </div>
          <div className="flex flex-col items-start flex-1">
            <span className="text-sm text-gray-500 font-medium">Chưa thanh toán</span>
            <span className="text-2xl font-bold text-yellow-700">{stats.pending}</span>
          </div>
        </button>
      </div>
      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo dịch vụ, mã giao dịch, tư vấn viên..."
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              {...dateFromProps}
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              className="px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              {...dateToProps}
            />
          </div>
          {/* Method Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
          >
            <option value="all">Tất cả phương thức</option>
            <option value="momo">MoMo</option>
            <option value="paypal">PayPal</option>
            <option value="cash">Tại quầy</option>
          </select>
        </div>
      </div>
      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <div className="p-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
            Lịch sử giao dịch ({filteredAppointments.length})
            </h2>
        </div>
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Dịch vụ</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Ngày</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Số tiền</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Chuyên viên</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Trạng thái</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Đang tải...</td></tr>
              ) : filteredAppointments.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8">Không có giao dịch nào</td></tr>
              ) : (
                filteredAppointments.map((app) => {
                  const payment = payments[app._id];
                  return (
                    <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-2 align-top">
                        <div className="font-medium text-gray-900 truncate max-w-[120px]">{app.service_id?.name}</div>
                  </td>
                  <td className="py-2 px-2 align-top">
                    <div className="flex items-center text-gray-900">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      <div>
                        <div className="font-medium">
                              {app.dateBooking ? new Date(app.dateBooking).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
                            </div>
                          </div>
                    </div>
                  </td>
                  <td className="py-2 px-2 align-top">
                    <div className="text-base font-semibold text-gray-900">
                          {app.service_id?.price?.toLocaleString('vi-VN')}đ
                    </div>
                  </td>
                  <td className="py-2 px-2 align-top">
                        <div className="font-medium text-gray-900 truncate max-w-[120px]">
                          {app.consultant_id?.accountId?.fullName || '--'}
                    </div>
                  </td>
                  <td className="py-2 px-2 align-top">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${payment && payment.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}
                      style={{minWidth: 70}}>
                          {payment ? (payment.status === 'completed' ? 'Đã thanh toán' : payment.status) : 'Chưa thanh toán'}
                    </div>
                  </td>
                  <td className="py-2 px-2 align-top">
                    <div className="flex items-center space-x-1">
                          {payment && (
                      <button 
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <Eye className="w-3 h-3 text-gray-400" />
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Payment Detail Modal */}
      {selectedPayment && (() => {
        // Tìm appointment liên quan
        const appointment = appointments.find(app => app._id === selectedPayment.appointmentId);
        return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl relative animate-fadeIn">
              <button 
                onClick={() => setSelectedPayment(null)}
                className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full text-gray-500"
                title="Đóng"
              >
                ×
              </button>
              <h3 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" /> Chi tiết thanh toán
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Khách hàng</div>
                    <div className="text-base text-gray-900 font-semibold">Bạn</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Dịch vụ</div>
                    <div className="text-base text-gray-900">{appointment?.service_id?.name || '--'}</div>
            </div>
                <div>
                    <div className="text-xs text-gray-500 font-medium">Chuyên viên</div>
                    <div className="text-base text-gray-900">{appointment?.consultant_id?.accountId?.fullName || '--'}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 font-medium">Thời gian đặt</div>
                    <div className="text-base text-gray-900">{appointment?.dateBooking ? new Date(appointment.dateBooking).toLocaleString('vi-VN') : '--'}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Phương thức thanh toán</div>
                    <div className="text-base text-gray-900 capitalize">{selectedPayment.paymentMethod || '--'}</div>
              </div>
              <div>
                    <div className="text-xs text-gray-500 font-medium">Trạng thái</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border mt-1 ${selectedPayment.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                      {selectedPayment.status === 'completed' ? 'Đã thanh toán' : selectedPayment.status}
                    </div>
              </div>
                <div>
                    <div className="text-xs text-gray-500 font-medium">Số tiền</div>
                    <div className="text-xl font-bold text-blue-700">{selectedPayment.totalPrice?.toLocaleString('vi-VN')}đ</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 font-medium">Thời gian thanh toán</div>
                    <div className="text-base text-gray-900">{selectedPayment.date ? new Date(selectedPayment.date).toLocaleString('vi-VN') : '--'}</div>
                  </div>
                </div>
              </div>
              {selectedPayment.description && (
                <div className="mt-6">
                  <div className="text-xs text-gray-500 font-medium mb-1">Ghi chú</div>
                  <div className="text-gray-900 bg-gray-50 rounded-lg p-3 border border-gray-100">{selectedPayment.description}</div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default PaymentHistory;
