import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBlogsApi } from "../api";
import { motion } from "framer-motion";
import bgHome from "../assets/background.png";

// Triết lý và trích dẫn nổi tiếng
const philosophyQuotes = [
  {
    quote: "Cuộc sống không được kiểm tra là không đáng sống",
    author: "Socrates",
    context: "Triết học cổ đại Hy Lạp"
  },
  {
    quote: "Tôi tư duy, vậy tôi tồn tại",
    author: "René Descartes", 
    context: "Triết học hiện đại"
  },
  {
    quote: "Con người bị kết án tự do",
    author: "Jean-Paul Sartre",
    context: "Chủ nghĩa hiện sinh"
  },
  {
    quote: "Hạnh phúc phụ thuộc vào chính chúng ta",
    author: "Aristotle",
    context: "Đạo đức học"
  }
];

// Interface cho event hiển thị ở Home
interface EventHome {
  _id: string;
  
  title: string;
  startDate: string;
  location?: string;
  description?: string;
  image?: string;
}

// Interface cho blog
interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string;
  image?: string;
  thumbnail?: string;
  topics?: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tính thời gian đăng bài
const getTimeAgo = (updatedAt: string): string => {
  const now = new Date();
  const updated = new Date(updatedAt);
  const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Vừa xong";
  if (diffInMinutes === 1) return "1 phút";
  if (diffInMinutes < 60) return `${diffInMinutes} phút`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours === 1) return "1 giờ";
  if (diffInHours < 24) return `${diffInHours} giờ`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "1 ngày";
  return `${diffInDays} ngày`;
};

export default function Home() {
  const navigate = useNavigate();

  // State cho blog từ API
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [errorBlog, setErrorBlog] = useState<string | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoadingBlog(true);
        const allBlogs = await getAllBlogsApi();
        // Chỉ hiển thị blog đã được xuất bản và lấy 6 bài mới nhất theo updatedAt
        const publishedBlogs = allBlogs
          .filter((blog: Blog) => blog.published)
          .sort((a: Blog, b: Blog) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 6);
        setBlogs(publishedBlogs);
        setErrorBlog(null);
      } catch (err) {
        setErrorBlog('Không thể tải danh sách bài viết.');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoadingBlog(false);
      }
    };

    fetchBlogs();
  }, []);

  // Auto-rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % philosophyQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Truncate content for preview
  const truncateContent = useCallback((content: string): string => {
    const strippedContent = content.replace(/<[^>]*>?/gm, '');
    return strippedContent.length > 150 
      ? strippedContent.substring(0, 150) + '...' 
      : strippedContent;
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section with Philosophy Quote */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative min-h-screen flex items-center justify-center px-4 py-20"
        style={{
          backgroundImage: `url(${bgHome})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay để làm mờ background */}
        <div className="absolute inset-0 bg-amber-50/80"></div>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border border-amber-300 rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border border-amber-400 rounded-full"></div>
          <div className="absolute bottom-32 left-1/4 w-16 h-16 border border-amber-200 rounded-full"></div>
          <div className="absolute bottom-20 right-1/3 w-20 h-20 border border-amber-300 rounded-full"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Main Title */}
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-amber-900 mb-8 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Triết Học
            <span className="block text-amber-700 text-4xl md:text-5xl lg:text-6xl mt-4 font-light italic">
              Hành trình tìm kiếm chân lý
            </span>
          </motion.h1>

          {/* Philosophy Quote Carousel */}
          <motion.div 
            className="philosophy-card max-w-4xl mx-auto my-16 p-8 md:p-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="philosophy-quote">
              <motion.p 
                key={currentQuoteIndex}
                className="text-2xl md:text-3xl text-amber-900 mb-6 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {philosophyQuotes[currentQuoteIndex].quote}
              </motion.p>
              <motion.div 
                className="text-right"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <p className="text-xl text-amber-800 font-medium">
                  — {philosophyQuotes[currentQuoteIndex].author}
                </p>
                <p className="text-sm text-amber-600 mt-1 italic">
                  {philosophyQuotes[currentQuoteIndex].context}
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <button
              onClick={() => navigate("/blogs")}
              className="px-8 py-4 bg-amber-800 text-white rounded-full text-lg font-medium hover:bg-amber-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Khám phá bài viết triết học
            </button>
            <div className="flex gap-2">
              {philosophyQuotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuoteIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentQuoteIndex ? 'bg-amber-600' : 'bg-amber-300'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
      {/* Philosophy Blog Section */}
      <motion.div 
        className="py-20 px-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-amber-900 mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Thư viện Triết học
            </motion.h2>
            <motion.p 
              className="text-xl text-amber-700 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Khám phá những tư tưởng sâu sắc, triết lý sống và những câu hỏi vĩnh cửu về con người và vũ trụ
            </motion.p>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingBlog ? (
              <div className="col-span-full text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800"></div>
                <p className="mt-4 text-xl text-amber-700">Đang tải bài viết triết học...</p>
              </div>
            ) : errorBlog ? (
              <div className="col-span-full text-center py-20 text-red-600 text-xl">{errorBlog}</div>
            ) : blogs.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="ancient-scroll rounded-2xl p-12 max-w-md mx-auto">
                  <p className="text-xl text-amber-800">Chưa có bài viết triết học nào.</p>
                  <p className="text-amber-600 mt-2">Hãy quay lại sau để khám phá những tư tưởng mới.</p>
                </div>
              </div>
            ) : (
              blogs.map((blog, index) => (
                <motion.div
                  key={blog._id}
                  className="philosophy-card cursor-pointer group overflow-hidden"
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate(`/blogs/${blog._id}`);
                  }}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  {/* Blog Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={blog.image || blog.thumbnail || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-amber-800/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        {getTimeAgo(blog.updatedAt)} trước
                      </span>
                    </div>
                  </div>

                  {/* Blog Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-amber-900 mb-3 line-clamp-2 group-hover:text-amber-800 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-amber-700 line-clamp-3 leading-relaxed mb-4">
                      {truncateContent(blog.content)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-amber-600 italic">
                        {blog.author}
                      </span>
                      <div className="flex items-center text-amber-600 group-hover:text-amber-800 transition-colors">
                        <span className="text-sm mr-1">Đọc thêm</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* View All Button */}
          {blogs.length > 0 && (
            <motion.div 
              className="text-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <button
                onClick={() => navigate("/blogs")}
                className="px-8 py-4 bg-transparent border-2 border-amber-800 text-amber-800 rounded-full text-lg font-medium hover:bg-amber-800 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Xem tất cả bài viết triết học
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}
