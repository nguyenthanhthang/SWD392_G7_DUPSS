import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getAllConsultantsApi } from '../api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  fullName: string;
  photoUrl: string;
  email: string;
  phoneNumber: string;
}

interface Consultant {
  _id: string;
  userId: string;
  introduction: string;
  contactLink: string;
  licenseNumber: string;
  startDate: string;
  googleMeetLink: string;
  accountId: User;  // This comes from the populated field
}

function ConsultingPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State phân trang
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setLoading(true);
        const data = await getAllConsultantsApi();
        setConsultants(data);
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách chuyên gia. Vui lòng thử lại sau.');
        console.error('Error fetching consultants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultants();
  }, []);

  // Phân trang
  const totalPage = Math.ceil(consultants.length / pageSize);
  const pagedConsultants = consultants.slice((page - 1) * pageSize, page * pageSize);

  // Consultant tiêu biểu (top 3)
  const featuredConsultants = consultants.slice(0, 3);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="text-xl">Đang tải dữ liệu...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="text-xl text-red-600">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#DBE8FA]">
      <Header />
      {/* Section tiêu biểu */}
      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-3xl font-bold text-gray-700 mb-8 text-center"
        >
          Chuyên gia tiêu biểu
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredConsultants.map((consultant, idx) => (
            consultant.accountId ? (
              <motion.div
                key={consultant._id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition cursor-pointer no-underline"
              >
                <img 
                  src={consultant.accountId.photoUrl || 'https://via.placeholder.com/150'} 
                  alt={consultant.accountId.fullName || 'Chuyên gia'} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mb-4" 
                />
                <h3 className="text-xl font-bold text-gray-900 mb-1">{consultant.accountId.fullName || 'Chuyên gia'}</h3>
                <div className="text-blue-600 font-semibold mb-2">Chuyên gia tư vấn</div>
                <div className="text-gray-600 text-center mb-2 line-clamp-2">{consultant.introduction}</div>
                <div className="text-gray-400 text-sm mb-4">Liên hệ: {consultant.accountId.email || 'Không có email'}</div>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  className="mt-2 px-8 py-3 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition text-lg"
                  onClick={() => navigate(`/consultant/${consultant._id}`)}
                >
                  Đặt lịch
                </motion.button>
              </motion.div>
            ) : (
              <div key={consultant._id} className="bg-red-100 rounded-3xl shadow-xl p-8 flex flex-col items-center">
                <div className="text-red-600 font-bold">Thiếu thông tin tài khoản cho chuyên gia này</div>
              </div>
            )
          ))}
        </div>
      </div>
      {/* Danh sách consultant */}
      <div className="max-w-7xl mx-auto px-4 pb-16 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-2xl font-bold text-gray-700 mb-6"
        >
          Danh sách chuyên gia
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pagedConsultants.length === 0 ? (
            <div className="col-span-4 text-center text-gray-500 py-12">Không tìm thấy chuyên gia.</div>
          ) : (
            pagedConsultants.map((consultant, idx) => (
              consultant.accountId ? (
                <motion.div
                  key={consultant._id}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                  className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl hover:scale-105 transition cursor-pointer no-underline"
                >
                  <img 
                    src={consultant.accountId.photoUrl || 'https://via.placeholder.com/150'} 
                    alt={consultant.accountId.fullName || 'Chuyên gia'} 
                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-100 mb-3" 
                  />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{consultant.accountId.fullName || 'Chuyên gia'}</h3>
                  <div className="text-blue-600 font-medium mb-1">Chuyên gia tư vấn</div>
                  <div className="text-gray-600 text-center mb-2 line-clamp-2">{consultant.introduction}</div>
                  <div className="text-gray-400 text-sm mb-4">Liên hệ: {consultant.accountId.phoneNumber || 'Không có số điện thoại'}</div>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                    className="mt-2 px-8 py-3 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition text-lg"
                    onClick={() => navigate(`/consultant/${consultant._id}`)}
                  >
                    Đặt lịch
                  </motion.button>
                </motion.div>
              ) : (
                <div key={consultant._id} className="bg-red-100 rounded-3xl shadow-lg p-6 flex flex-col items-center">
                  <div className="text-red-600 font-bold">Thiếu thông tin tài khoản cho chuyên gia này</div>
                </div>
              )
            ))
          )}
        </div>
        {/* Pagination */}
        {totalPage > 1 && (
          <div className="flex justify-center mt-10 gap-2">
            {Array.from({ length: totalPage }, (_, i) => (
              <button
                key={i}
                className={`w-10 h-10 rounded-full font-bold border-2 ${page === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'} hover:bg-blue-100 transition`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default ConsultingPage;
