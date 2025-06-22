import React from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaHandshake, FaLightbulb, FaChartLine } from 'react-icons/fa';
import Header from '../components/layout/Header';
import cardImg from '../assets/card.png';
import Footer from '../components/layout/Footer';

const AboutUsPage: React.FC = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const values = [
    {
      icon: <FaUsers size={40} />,
      title: 'Đội ngũ chuyên gia',
      description: 'Đội ngũ tư vấn viên giàu kinh nghiệm, được đào tạo bài bản và luôn tận tâm với khách hàng.',
    },
    {
      icon: <FaHandshake size={40} />,
      title: 'Cam kết chất lượng',
      description: 'Cam kết mang đến dịch vụ tư vấn chất lượng cao, đáp ứng mọi nhu cầu của khách hàng.',
    },
    {
      icon: <FaLightbulb size={40} />,
      title: 'Giải pháp sáng tạo',
      description: 'Luôn đổi mới và sáng tạo trong cách tiếp cận, mang đến những giải pháp tối ưu nhất.',
    },
    {
      icon: <FaChartLine size={40} />,
      title: 'Phát triển bền vững',
      description: 'Hướng đến sự phát triển bền vững, tạo giá trị lâu dài cho khách hàng và cộng đồng.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#DBE8FA]">
      <Header />
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-16">
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-6xl md:text-8xl font-bold uppercase text-center">
                About Us
              </h1>
              <p className="text-xl md:text-2xl mt-4 text-center max-w-3xl mx-auto">
                HopeHub - Nơi kết nối những chuyên gia tư vấn hàng đầu với những người cần được tư vấn
              </p>
            </div>
            <div className="flex-1 flex justify-center md:justify-end">
              <img src={cardImg} alt="HopeHub Card" className="w-[340px] md:w-[420px] rounded-2xl shadow-xl border border-gray-200" />
            </div>
          </div>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-4">Câu Chuyện Của Chúng Tôi</h2>
            <div className="mt-4">
              <p className="text-lg text-gray-700 mb-4">
                HopeHub được thành lập với sứ mệnh mang đến một nền tảng kết nối hiệu quả giữa các chuyên gia tư vấn và những người cần được tư vấn. Chúng tôi tin rằng mỗi người đều xứng đáng được tiếp cận với những lời khuyên và hỗ trợ chất lượng cao.
              </p>
              <p className="text-base md:text-lg text-gray-700">
                Với đội ngũ chuyên gia giàu kinh nghiệm và hệ thống đặt lịch thông minh, chúng tôi cam kết mang đến trải nghiệm tư vấn tốt nhất cho mọi khách hàng.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-8">Giá Trị Cốt Lõi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="text-indigo-900 mb-3">{value.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-center">{value.title}</h3>
                <p className="text-gray-600 text-center text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="mt-16 p-8 bg-indigo-900 text-white rounded-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Sứ Mệnh Của Chúng Tôi</h2>
            <p className="text-base md:text-lg">
              Chúng tôi cam kết mang đến một nền tảng tư vấn chuyên nghiệp, minh bạch và hiệu quả, giúp kết nối những người cần tư vấn với các chuyên gia phù hợp nhất. Mục tiêu của chúng tôi là tạo ra một cộng đồng nơi mọi người đều có thể tiếp cận được những lời khuyên chất lượng cao.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUsPage; 