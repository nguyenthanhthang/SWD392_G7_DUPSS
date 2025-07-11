import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEventsApi, getAllBlogsApi } from "../api";
import HomePic from "../assets/Home.png";
import BubbleBackground from "../components/BubbleBackground";
import VerificationAlert from "../components/VerificationAlert";
import { motion } from "framer-motion";

// Dữ liệu cứng cho About Us
const aboutData = [
  {
    heading: "Về chúng tôi.",
    imgSrc: "https://themewagon.github.io/Desgy//images/aboutus/imgOne.svg",
    paragraph:
      "Chúng tôi cung cấp giải pháp hỗ trợ phòng ngừa và tư vấn về nguy cơ nghiện ma túy, giúp cộng đồng sống khỏe mạnh hơn.",
    link: "Xem thêm",
  },
  {
    heading: "Dịch vụ.",
    imgSrc: "https://themewagon.github.io/Desgy//images/aboutus/imgTwo.svg",
    paragraph:
      "Dịch vụ kiểm tra mức độ nghiện, tư vấn cá nhân hóa, kết nối chuyên gia và cung cấp tài liệu phòng ngừa.",
    link: "Xem thêm",
  },
  {
    heading: "Tư vấn viên.",
    imgSrc: "https://themewagon.github.io/Desgy//images/aboutus/imgTwo.svg",
    paragraph:
      "Chúng tôi đã hỗ trợ hàng ngàn cá nhân và gia đình vượt qua nguy cơ nghiện, xây dựng cộng đồng an toàn hơn.",
    link: "Xem thêm",
  },
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

  // State cho event từ API
  const [events, setEvents] = useState<EventHome[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [errorEvent, setErrorEvent] = useState<string | null>(null);

  // State cho blog từ API
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [errorBlog, setErrorBlog] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvent(true);
        const data: EventHome[] = await getAllEventsApi("upcoming");
        setEvents(Array.isArray(data) ? data : []);
        setErrorEvent(null);
      } catch {
        setErrorEvent("Không thể tải danh sách sự kiện.");
      } finally {
        setLoadingEvent(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoadingBlog(true);
        const allBlogs = await getAllBlogsApi();
        // Chỉ hiển thị blog đã được xuất bản và lấy 3 bài mới nhất theo updatedAt
        const publishedBlogs = allBlogs
          .filter((blog: Blog) => blog.published)
          .sort((a: Blog, b: Blog) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 3);
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

  // Truncate content for preview
  const truncateContent = (content: string) => {
    const strippedContent = content.replace(/<[^>]*>?/gm, '');
    return strippedContent.length > 150 
      ? strippedContent.substring(0, 150) + '...' 
      : strippedContent;
  };

  return (
    <div>
      <Header />
      <VerificationAlert />
      <BubbleBackground />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Banner Section */}
        <div className="mx-auto max-w-7xl my-10 sm:py-10 px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 my-16">
            {/* COLUMN-1 */}
            <div className="mx-auto sm:mx-0 mt-8">
              <div className="py-3 text-center lg:text-start">
                <button className="text-blue-600 bg-blue-100 hover:shadow-xl text-sm md:text-lg font-bold px-6 py-1 rounded-3xl tracking-wider hover:text-white hover:bg-blue-700">
                  PHÒNG CHỐNG MA TÚY
                </button>
              </div>
              <div className="py-3 text-center lg:text-start">
                <h1
                  className="text-6xl lg:text-7xl font-bold text-black"
                  style={{
                    fontFamily: "'Fira Sans', 'Poppins', 'Nunito', sans-serif",
                  }}
                >
                  Đoàn kết là <br /> sức mạnh, <br /> tin tưởng là ánh sáng
                </h1>
              </div>
              <div className="my-7 text-center lg:text-start">
                <button
                  className="text-sm md:text-xl font-semibold hover:shadow-xl bg-blue-600 text-white py-3 px-6 md:py-5 md:px-14 rounded-full hover:bg-blue-700"
                  onClick={() => navigate("/quizz")}
                >
                  Làm trắc nghiệm
                </button>
              </div>
            </div>
            {/* COLUMN-2 */}
            <div className="hidden lg:flex items-center justify-center px-8">
              <img
                src={HomePic}
                alt="hero-image"
                className="w-[380px] h-auto rounded-3xl object-cover transform scale-150 -translate-x-8"
              />
            </div>
          </div>
        </div>
        {/* About Us Section */}
        <div id="aboutus-section">
          <div className="mx-auto max-w-7xl px-4 py-24 my-32 lg:px-10 bg-gray-100 rounded-3xl relative">
            <h3 className="text-center text-blue-600 text-lg tracking-widest">
              GIỚI THIỆU
            </h3>
            <h4 className="text-center text-4xl lg:text-6xl font-bold">
              Tìm hiểu thêm về chúng tôi.
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 my-16 gap-x-16 lg:gap-x-32">
              {aboutData.map((item: { heading: string; imgSrc: string; paragraph: string; link: string }, i: number) => (
                <div
                  key={i}
                  className="hover:bg-blue-600 bg-white rounded-3xl mt-16 pt-10 pl-8 pb-10 pr-6 shadow-xl group transition-colors h-200"
                >
                  {" "}
                  {/* thêm chiều cao cố định */}
                  <h4 className="text-4xl font-semibold text-black mb-5 group-hover:text-white">
                    {item.heading}
                  </h4>
                  <img
                    src={item.imgSrc}
                    alt={item.imgSrc}
                    width={100}
                    height={100}
                    className="mb-5"
                  />
                  <h4 className="text-lg font-normal text-black group-hover:text-white mb-5 line-clamp-3">
                    {" "}
                    {/* thêm line-clamp-3 */}
                    {item.paragraph}
                  </h4>
                  <button
                    className="text-lg font-semibold group-hover:text-white text-blue-600 hover:underline"
                    onClick={() => {
                      if (item.heading === "Về chúng tôi.") navigate("/about-us");
                      else if (item.heading === "Dịch vụ.") navigate("/service");
                      else if (item.heading === "Chuyên viên tư vấn.") navigate("/consulting");
                    }}
                  >
                    {item.link}
                    <span className="inline-block ml-1">→</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Event Section (thay cho Consultant Slider Section) */}
        <div className="bg-blue-50 py-32 w-full">
          <div className="mx-auto w-full sm:py-4 px-0 lg:px-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-center mb-12"
            >
              <h3 className="text-4xl sm:text-6xl font-bold text-black my-2">
                Sự kiện nổi bật – 
                <br/>Cùng tham gia và kết nối cộng đồng!
              </h3>
              <h3 className="text-xl font-medium text-blue-700 mt-4 opacity-80">
                Đừng bỏ lỡ những hoạt động ý nghĩa và cơ hội giao lưu, học hỏi!
              </h3>
            </motion.div>
            <div className="flex flex-wrap justify-center gap-8 px-8">
              {loadingEvent ? (
                <div className="text-center w-full py-20 text-xl">Đang tải sự kiện...</div>
              ) : errorEvent ? (
                <div className="text-center w-full py-20 text-red-600 text-xl">{errorEvent}</div>
              ) : events.length === 0 ? (
                <div className="text-center w-full py-20 text-gray-500 text-xl">Hiện chưa có sự kiện nào.</div>
              ) : (
                events
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .slice(0, 3)
                  .map((event, idx) => (
                    <motion.div
                      key={event._id || idx}
                      initial={{ opacity: 0, y: 60 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
                      className="relative w-[380px] h-[380px] rounded-[32px] overflow-hidden group cursor-pointer"
                      onClick={() => {
                        window.scrollTo(0, 0);
                        navigate(`/events`);
                      }}
                    >
                      {/* Background Image với Gradient Overlay */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                        style={{ 
                          backgroundImage: `url(${event.image || 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a'})`,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#31889b]/90 via-black/40 to-transparent" />

                      {/* Content */}
                      <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                        {/* Date */}
                        <div className="flex items-start gap-3">
                          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 text-center">
                            <div className="text-sm font-medium opacity-80">
                              {new Date(event.startDate).toLocaleString('vi-VN', { month: 'short' }).toUpperCase()}
                            </div>
                            <div className="text-2xl font-bold">
                              {new Date(event.startDate).getDate()}
                            </div>
                          </div>
                        </div>

                        {/* Event Info */}
                        <div>
                          <h3 className="text-3xl font-bold mb-4 line-clamp-2 text-white">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm font-medium">
                            <div className="flex items-center gap-2 bg-[#31889b] px-3 py-2 rounded-xl">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {event.location || "Trực tuyến"}
                            </div>
                            <div className="flex items-center gap-2 bg-[#31889b] px-3 py-2 rounded-xl">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(event.startDate).toLocaleString('vi-VN', { 
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              })} GMT
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
              )}
            </div>
          </div>
        </div>
        {/* Latest Posts Section */}
        <div className="bg-gray-50 py-20 w-full" id="blog-section">
          <div className="mx-auto w-full sm:py-4 px-0 lg:px-0">
            <div className="text-center">
              <h3 className="text-blue-600 text-lg font-normal tracking-widest">
                BÀI VIẾT
              </h3>
              <h3 className="text-4xl sm:text-6xl font-bold">
                Bài viết mới nhất.
              </h3>
            </div>
            <div className="relative w-full flex items-center mt-12">
              {/* Slider */}
              <div className="w-full overflow-hidden px-12">
                <div className="flex gap-8 justify-center">
                  {loadingBlog ? (
                    <div className="text-center w-full py-20 text-xl">Đang tải bài viết...</div>
                  ) : errorBlog ? (
                    <div className="text-center w-full py-20 text-red-600 text-xl">{errorBlog}</div>
                  ) : blogs.length === 0 ? (
                    <div className="text-center w-full py-20 text-gray-500 text-xl">Chưa có bài viết nào.</div>
                  ) : (
                    blogs.map((blog) => (
                      <div
                        key={blog._id}
                        className="bg-white my-10 shadow-lg rounded-3xl relative min-w-[380px] max-w-[400px] w-[400px] flex-shrink-0 overflow-hidden cursor-pointer"
                        onClick={() => {
                          window.scrollTo(0, 0);
                          navigate(`/blogs/${blog._id}`);
                        }}
                      >
                        <div className="relative">
                          <img
                            src={blog.image || blog.thumbnail || 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a'}
                            alt={blog.title}
                            width={400}
                            height={262}
                            className="w-full h-[262px] object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <span className="bg-[#31889b]/80 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-medium">
                              {getTimeAgo(blog.updatedAt)} trước
                            </span>
                          </div>
                        </div>
                        <div className="px-6 pb-12 pt-8">
                          <h4 className="text-2xl font-bold text-black line-clamp-1">
                            {blog.title}
                          </h4>
                          <p className="mt-3 text-gray-600 line-clamp-3">
                            {truncateContent(blog.content)}
                          </p>
                          <div className="mt-6">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">
                                {blog.author}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}
