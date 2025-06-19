import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getAllConsultantsApi } from '../api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaEnvelope, FaCalendarAlt, FaSearch } from 'react-icons/fa';

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

  const [searchTerm, setSearchTerm] = useState('');

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

  // Lọc consultant theo searchTerm
  const filteredConsultants = pagedConsultants.filter(c =>
    c.accountId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.accountId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          className="text-3xl font-bold text-[#283593] mb-8 text-center"
        >
          Chuyên gia tiêu biểu
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {featuredConsultants.map((consultant, idx) => (
            consultant.accountId ? (
              <motion.div
                key={consultant._id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                className="bg-white rounded-3xl border border-[#DBE8FA] shadow p-9 flex flex-col items-center transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:border-[#3a4bb3] cursor-pointer"
              >
                <img 
                  src={consultant.accountId.photoUrl || 'https://via.placeholder.com/150'} 
                  alt={consultant.accountId.fullName || 'Chuyên gia'} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#DBE8FA] shadow mb-6" 
                />
                <h3 className="text-2xl font-bold text-[#283593] mb-1 text-center">{consultant.accountId.fullName || 'Chuyên gia'}</h3>
                <div className="flex items-center gap-2 text-[15px] font-medium text-[#5C6BC0] mb-2 text-center">
                  <FaUserTie className="inline-block text-[#5C6BC0] text-base" />
                  <span>Chuyên gia tư vấn</span>
                </div>
                <div className="text-gray-500 text-center mb-2 line-clamp-2 leading-relaxed">{consultant.introduction}</div>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-6 text-center">
                  <FaEnvelope className="inline-block text-gray-400 text-sm" />
                  <span>Liên hệ: {consultant.accountId.email || 'Không có email'}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-2 px-8 py-3 rounded-full bg-[#283593] text-white font-semibold shadow hover:bg-[#3a4bb3] transition text-base tracking-wide flex items-center gap-2"
                  onClick={() => navigate(`/consultant/${consultant._id}`)}
                >
                  <FaCalendarAlt className="inline-block text-white text-lg mb-0.5" />
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
          className="text-2xl font-bold text-[#283593] mb-6"
        >
          Danh sách chuyên gia
        </motion.h2>
        {/* Thanh tìm kiếm */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              className="w-full py-3 pl-12 pr-4 rounded-full border border-[#DBE8FA] text-[#283593] bg-white shadow-sm focus:outline-none focus:border-[#3a4bb3] text-base"
              placeholder="Tìm kiếm chuyên gia theo tên hoặc email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#DBE8FA] text-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {filteredConsultants.length === 0 ? (
            <div className="col-span-4 text-center text-gray-500 py-12">Không tìm thấy chuyên gia.</div>
          ) : (
            filteredConsultants.map((consultant, idx) => (
              consultant.accountId ? (
                <motion.div
                  key={consultant._id}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                  className="bg-white rounded-2xl border border-[#DBE8FA] shadow p-7 flex flex-col items-center transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:border-[#3a4bb3] cursor-pointer"
                >
                  <img
                    src={consultant.accountId.photoUrl || 'https://via.placeholder.com/150'}
                    alt={consultant.accountId.fullName || 'Chuyên gia'}
                    className="w-20 h-20 rounded-full object-cover border-4 border-[#DBE8FA] shadow mb-4"
                  />
                  <h3 className="text-lg font-bold text-[#283593] mb-1 text-center">{consultant.accountId.fullName || 'Chuyên gia'}</h3>
                  <div className="flex items-center gap-2 text-[14px] font-medium text-[#5C6BC0] mb-2 text-center">
                    <FaUserTie className="inline-block text-[#5C6BC0] text-base" />
                    <span>Chuyên gia tư vấn</span>
                  </div>
                  <div className="text-gray-500 text-center mb-2 line-clamp-2 leading-relaxed">{consultant.introduction}</div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-4 text-center">
                    <FaEnvelope className="inline-block text-gray-400 text-sm" />
                    <span>{consultant.accountId.email || 'Không có email'}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-2 px-7 py-2.5 rounded-full bg-[#283593] text-white font-semibold shadow hover:bg-[#3a4bb3] transition text-base tracking-wide flex items-center gap-2"
                    onClick={() => navigate(`/consultant/${consultant._id}`)}
                  >
                    <FaCalendarAlt className="inline-block text-white text-lg mb-0.5" />
                    Đặt lịch
                  </motion.button>
                </motion.div>
              ) : (
                <div key={consultant._id} className="bg-red-100 rounded-2xl shadow p-6 flex flex-col items-center">
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
