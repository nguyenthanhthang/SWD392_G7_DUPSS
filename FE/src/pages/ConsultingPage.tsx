import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

// Mock data cho consultant
const consultantData = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    specialty: 'Tư vấn tâm lý',
    imgSrc: 'https://randomuser.me/api/portraits/men/32.jpg',
    description: 'Chuyên gia tư vấn tâm lý với hơn 10 năm kinh nghiệm hỗ trợ cộng đồng.',
    experience: 10,
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Trần Thị B',
    specialty: 'Tư vấn xã hội',
    imgSrc: 'https://randomuser.me/api/portraits/women/44.jpg',
    description: 'Tư vấn xã hội, hỗ trợ các trường hợp khó khăn, nguy cơ nghiện.',
    experience: 8,
    rating: 4.6,
  },
  {
    id: 3,
    name: 'Lê Văn C',
    specialty: 'Bác sĩ trị liệu',
    imgSrc: 'https://randomuser.me/api/portraits/men/34.jpg',
    description: 'Bác sĩ trị liệu chuyên sâu về cai nghiện và phục hồi.',
    experience: 12,
    rating: 4.9,
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    specialty: 'Chuyên gia xã hội',
    imgSrc: 'https://randomuser.me/api/portraits/women/45.jpg',
    description: 'Chuyên gia xã hội, tư vấn và hỗ trợ cộng đồng.',
    experience: 7,
    rating: 4.5,
  },
  {
    id: 5,
    name: 'Ngô Văn E',
    specialty: 'Tư vấn tâm lý',
    imgSrc: 'https://randomuser.me/api/portraits/men/35.jpg',
    description: 'Tư vấn tâm lý, đồng hành cùng bạn vượt qua khó khăn.',
    experience: 5,
    rating: 4.2,
  },
  {
    id: 6,
    name: 'Đặng Thị F',
    specialty: 'Bác sĩ trị liệu',
    imgSrc: 'https://randomuser.me/api/portraits/women/46.jpg',
    description: 'Bác sĩ trị liệu, hỗ trợ phục hồi sức khỏe tâm thần.',
    experience: 9,
    rating: 4.7,
  },
  // ... thêm dữ liệu nếu cần
];

const specialties = [
  'Tư vấn tâm lý',
  'Tư vấn xã hội',
  'Bác sĩ trị liệu',
];

function ConsultingPage() {
  // State filter
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [minRating, setMinRating] = useState('');
  // State phân trang
  const [page, setPage] = useState(1);
  const pageSize = 4;

  // Lọc dữ liệu
  const filteredConsultants = consultantData.filter(c => {
    return (
      (!selectedSpecialty || c.specialty === selectedSpecialty) &&
      (!minExperience || c.experience >= Number(minExperience)) &&
      (!minRating || c.rating >= Number(minRating))
    );
  });

  // Phân trang
  const totalPage = Math.ceil(filteredConsultants.length / pageSize);
  const pagedConsultants = filteredConsultants.slice((page - 1) * pageSize, page * pageSize);

  // Consultant tiêu biểu (top 3 rating)
  const featuredConsultants = [...consultantData]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div>
      <Header />
      {/* Section tiêu biểu */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">Chuyên gia tiêu biểu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredConsultants.map(c => (
            <Link
              key={c.id}
              to={`/consultant/${c.id}`}
              className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition cursor-pointer no-underline"
            >
              <img src={c.imgSrc} alt={c.name} className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">{c.name}</h3>
              <div className="text-blue-600 font-semibold mb-2">{c.specialty}</div>
              <div className="text-gray-600 text-center mb-2 line-clamp-2">{c.description}</div>
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <span>★</span>
                <span className="font-bold">{c.rating}</span>
                <span className="text-gray-400 ml-2 text-sm">{c.experience} năm kinh nghiệm</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* Bộ lọc */}
      <div className="max-w-7xl mx-auto px-4 py-6 bg-blue-50 rounded-2xl mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 w-full md:w-auto">
            <select
              className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedSpecialty}
              onChange={e => { setSelectedSpecialty(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả chuyên môn</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="number"
              min="0"
              placeholder="Kinh nghiệm tối thiểu (năm)"
              className="border rounded-xl px-4 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={minExperience}
              onChange={e => { setMinExperience(e.target.value); setPage(1); }}
            />
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              placeholder="Rating tối thiểu"
              className="border rounded-xl px-4 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={minRating}
              onChange={e => { setMinRating(e.target.value); setPage(1); }}
            />
          </div>
          <div className="text-gray-500 text-sm mt-2 md:mt-0">Tìm thấy <span className="font-bold text-blue-600">{filteredConsultants.length}</span> chuyên gia</div>
        </div>
      </div>
      {/* Danh sách consultant */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-gray-700 mb-6">Danh sách chuyên gia</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pagedConsultants.length === 0 ? (
            <div className="col-span-4 text-center text-gray-500 py-12">Không tìm thấy chuyên gia phù hợp.</div>
          ) : (
            pagedConsultants.map(c => (
              <Link
                key={c.id}
                to={`/consultant/${c.id}`}
                className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl hover:scale-105 transition cursor-pointer no-underline"
              >
                <img src={c.imgSrc} alt={c.name} className="w-24 h-24 rounded-full object-cover border-2 border-blue-100 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">{c.name}</h3>
                <div className="text-blue-600 font-medium mb-1">{c.specialty}</div>
                <div className="text-gray-600 text-center mb-2 line-clamp-2">{c.description}</div>
                <div className="flex items-center gap-2 text-yellow-500 mb-2">
                  <span>★</span>
                  <span className="font-bold">{c.rating}</span>
                  <span className="text-gray-400 ml-2 text-xs">{c.experience} năm</span>
                </div>
              </Link>
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
