import React, { useState } from 'react';
import { CreditCard, Calendar, Download, Search, Eye, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

// Định nghĩa type Payment
interface Payment {
  id: string;
  date: string;
  time: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  method: 'Credit Card' | 'PayPal' | 'Bank Transfer' | string;
  cardLast4: string;
  transactionId: string;
  refundable: boolean;
  invoice: string | null;
}

export const PaymentsTable = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Mock payment data
  const payments: Payment[] = [
    {
      id: 'PAY-2025-001',
      date: '2025-06-05',
      time: '14:30',
      description: 'Cardiology Consultation - Dr. Sarah Johnson',
      amount: 150.00,
      status: 'completed',
      method: 'Credit Card',
      cardLast4: '****4532',
      transactionId: 'TXN-789456123',
      refundable: true,
      invoice: 'INV-2025-001'
    },
    {
      id: 'PAY-2025-002',
      date: '2025-06-03',
      time: '09:15',
      description: 'Psychology Session - Dr. Emily Rodriguez',
      amount: 200.00,
      status: 'completed',
      method: 'PayPal',
      cardLast4: 'paypal@email.com',
      transactionId: 'PP-987654321',
      refundable: true,
      invoice: 'INV-2025-002'
    },
    {
      id: 'PAY-2025-003',
      date: '2025-06-01',
      time: '16:45',
      description: 'Dermatology Consultation - Dr. Michael Chen',
      amount: 120.00,
      status: 'pending',
      method: 'Bank Transfer',
      cardLast4: 'Bank ***1234',
      transactionId: 'BT-456789012',
      refundable: false,
      invoice: 'INV-2025-003'
    },
    {
      id: 'PAY-2025-004',
      date: '2025-05-28',
      time: '11:20',
      description: 'Orthopedics Follow-up - Dr. James Wilson',
      amount: 180.00,
      status: 'failed',
      method: 'Credit Card',
      cardLast4: '****9876',
      transactionId: 'TXN-123456789',
      refundable: false,
      invoice: null
    },
    {
      id: 'PAY-2025-005',
      date: '2025-05-25',
      time: '13:10',
      description: 'General Health Checkup - Dr. Lisa Park',
      amount: 250.00,
      status: 'refunded',
      method: 'Credit Card',
      cardLast4: '****1111',
      transactionId: 'TXN-555666777',
      refundable: false,
      invoice: 'INV-2025-005'
    }
  ];

  const getStatusColor = (status: Payment['status']) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'refunded': return <RefreshCw className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getMethodIcon = (method: Payment['method']) => {
    switch(method) {
      case 'Credit Card': return '💳';
      case 'PayPal': return '🅿️';
      case 'Bank Transfer': return '🏦';
      default: return '💰';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesMethod && matchesSearch;
  });

  const totalAmount = filteredPayments.reduce((sum, payment) => 
    payment.status === 'completed' ? sum + payment.amount : sum, 0
  );

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    refunded: payments.filter(p => p.status === 'refunded').length,
    totalAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
  };

  return (
    <div className="px-3 py-3">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <button
          type="button"
          onClick={() => setFilterStatus('completed')}
          className={`bg-white rounded-lg p-3 shadow-sm border flex flex-col items-center justify-center transition-all focus:outline-none ${filterStatus === 'completed' ? 'ring-2 ring-green-400 border-green-300' : 'border-gray-200'}`}
        >
          <div className="p-2 bg-green-100 rounded-lg mb-1 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs text-gray-600 mb-0.5">Completed</p>
          <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('pending')}
          className={`bg-white rounded-lg p-3 shadow-sm border flex flex-col items-center justify-center transition-all focus:outline-none ${filterStatus === 'pending' ? 'ring-2 ring-yellow-400 border-yellow-300' : 'border-gray-200'}`}
        >
          <div className="p-2 bg-yellow-100 rounded-lg mb-1 flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-xs text-gray-600 mb-0.5">Pending</p>
          <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('failed')}
          className={`bg-white rounded-lg p-3 shadow-sm border flex flex-col items-center justify-center transition-all focus:outline-none ${filterStatus === 'failed' ? 'ring-2 ring-red-400 border-red-300' : 'border-gray-200'}`}
        >
          <div className="p-2 bg-red-100 rounded-lg mb-1 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-xs text-gray-600 mb-0.5">Failed</p>
          <p className="text-xl font-bold text-gray-900">{stats.failed}</p>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('refunded')}
          className={`bg-white rounded-lg p-3 shadow-sm border flex flex-col items-center justify-center transition-all focus:outline-none ${filterStatus === 'refunded' ? 'ring-2 ring-blue-400 border-blue-300' : 'border-gray-200'}`}
        >
          <div className="p-2 bg-blue-100 rounded-lg mb-1 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs text-gray-600 mb-0.5">Refunded</p>
          <p className="text-xl font-bold text-gray-900">{stats.refunded}</p>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by description or payment ID..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Method Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
          >
            <option value="all">All Methods</option>
            <option value="Credit Card">Credit Card</option>
            <option value="PayPal">PayPal</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>

          {/* Period Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <div className="p-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Transactions ({filteredPayments.length})
            </h2>
            <div className="text-base font-semibold text-gray-900">
              Total: ${totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Payment</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Method</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-2 align-top">
                    <div>
                      <div className="font-medium text-gray-900 truncate max-w-[120px]">{payment.id}</div>
                      <div className="text-xs text-gray-600 truncate max-w-[140px]">{payment.description}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[100px]">TXN: {payment.transactionId}</div>
                    </div>
                  </td>
                  <td className="py-2 px-2 align-top">
                    <div className="flex items-center text-gray-900">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-500">{payment.time}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2 align-top">
                    <div className="text-base font-semibold text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="py-2 px-2 align-top">
                    <div className="flex items-center">
                      <span className="text-lg mr-1">{getMethodIcon(payment.method)}</span>
                      <div>
                        <div className="font-medium text-gray-900 truncate max-w-[80px]">{payment.method}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[80px]">{payment.cardLast4}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2 align-top">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}
                      style={{minWidth: 70}}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1.5 capitalize truncate">{payment.status}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 align-top">
                    <div className="flex items-center space-x-1">
                      <button 
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <Eye className="w-3 h-3 text-gray-400" />
                      </button>
                      {payment.invoice && (
                        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                          <Download className="w-3 h-3 text-gray-400" />
                        </button>
                      )}
                      {payment.refundable && payment.status === 'completed' && (
                        <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms</p>
        </div>
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Payment Details</h3>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment ID</label>
                  <p className="text-gray-900 font-mono">{selectedPayment?.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(selectedPayment.status)}`}>
                    {getStatusIcon(selectedPayment.status)}
                    <span className="ml-1 capitalize">{selectedPayment.status}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{selectedPayment?.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-xl font-bold text-gray-900">${selectedPayment?.amount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-gray-900">
                    {selectedPayment && new Date(selectedPayment.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-500">{selectedPayment?.time}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="text-gray-900">{selectedPayment?.method}</p>
                  <p className="text-sm text-gray-500">{selectedPayment?.cardLast4}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                  <p className="text-gray-900 font-mono text-sm">{selectedPayment?.transactionId}</p>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4 border-t">
                {selectedPayment?.invoice && (
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Download Invoice
                  </button>
                )}
                {selectedPayment?.refundable && selectedPayment?.status === 'completed' && (
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Request Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentHistory = () => {
  return (
    <PaymentsTable />
  );
};

export default PaymentHistory;
