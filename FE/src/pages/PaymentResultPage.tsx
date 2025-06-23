import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { CheckCircle, XCircle } from 'lucide-react';

interface Bill {
  service?: {
    name: string;
    price: number;
  };
  consultant?: {
    accountId?: {
      fullName: string;
    };
  };
  slot?: {
    day: string;
    time: string;
  };
  dateStr?: string;
  fullName?: string;
  phone?: string;
  gender?: string;
  reason?: string;
}

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState<Bill | null>(null);

  // VNPay response parameters
  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
  const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');

  useEffect(() => {
    // Get pending bill from localStorage
    const pendingBill = localStorage.getItem('pendingBill');
    if (pendingBill) {
      setBill(JSON.parse(pendingBill));
      // Clear pending bill after loading
      localStorage.removeItem('pendingBill');
    }
  }, []);

  const isPaymentSuccess = vnp_ResponseCode === '00' && vnp_TransactionStatus === '00';

  return (
    <div className="bg-gradient-to-b from-sky-50 to-[#f0f7fa] min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 w-full px-4 py-8 flex flex-col justify-center items-center">
        <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-10 border border-cyan-100 flex flex-col gap-8 animate-fadeIn">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              {isPaymentSuccess ? (
                <CheckCircle className="w-20 h-20 text-green-500" />
              ) : (
                <XCircle className="w-20 h-20 text-red-500" />
              )}
            </div>
            <h2 className={`text-3xl font-bold mb-2 tracking-tight ${
              isPaymentSuccess ? 'text-green-700' : 'text-red-700'
            }`}>
              {isPaymentSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
            </h2>
            <p className="text-gray-600 text-lg">
              {isPaymentSuccess 
                ? 'Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi.'
                : 'Rất tiếc, giao dịch của bạn không thành công. Vui lòng thử lại.'}
            </p>
          </div>

          {bill && (
            <div className={`p-6 rounded-2xl border shadow-md ${
              isPaymentSuccess 
                ? 'bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-100'
                : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-100'
            }`}>
              <div className="flex flex-col gap-4 text-base text-gray-700">
                <div className="flex justify-between border-b border-emerald-100 pb-3">
                  <span className="text-gray-600">Dịch vụ:</span>
                  <span className="font-semibold text-gray-800">{bill.service?.name}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-3">
                  <span className="text-gray-600">Chuyên viên:</span>
                  <span className="font-semibold text-gray-800">
                    {bill.consultant?.accountId?.fullName || "Không xác định"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-3">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium text-gray-800">
                    {bill.slot ? `${bill.slot.day}, ${bill.dateStr}, ${bill.slot.time}` : '--'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-3">
                  <span className="text-gray-600">Khách hàng:</span>
                  <span className="font-medium text-gray-800">{bill.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-3">
                  <span className="text-gray-600">SĐT:</span>
                  <span className="font-medium text-gray-800">{bill.phone}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-3">
                  <span className="text-gray-600">Giới tính:</span>
                  <span className="font-medium text-gray-800">
                    {bill.gender === 'male' ? 'Nam' : 'Nữ'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-3">
                  <span className="text-gray-600">Lý do tư vấn:</span>
                  <span className="font-medium text-gray-800">{bill.reason}</span>
                </div>
                <div className="flex justify-between items-center pt-3 text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className={isPaymentSuccess ? 'text-emerald-700' : 'text-red-700'}>
                    {bill.service?.price?.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4 mt-6">
            {isPaymentSuccess ? (
              <button 
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-10 py-4 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={() => navigate('/')}
              >
                Trở về trang chủ
              </button>
            ) : (
              <>
                <button 
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-10 py-4 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => navigate(-1)}
                >
                  Thử lại
                </button>
                <button 
                  className="bg-gray-100 text-gray-700 px-10 py-4 rounded-2xl font-medium hover:bg-gray-200 transition-all duration-200 shadow border border-gray-200"
                  onClick={() => navigate('/')}
                >
                  Về trang chủ
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 