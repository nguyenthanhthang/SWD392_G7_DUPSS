import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllBlogsApi } from '../api';
import MainLayout from '../components/layout/MainLayout';
import CreateBlogForm from '../components/blog/CreateBlogForm';
import toast, { Toaster } from 'react-hot-toast';

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

function BlogPage() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;

  // Check if user is logged in
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    const token = localStorage.getItem('token');
    
    if (storedUserInfo && token) {
      setUserInfo(JSON.parse(storedUserInfo));
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const allBlogs = await getAllBlogsApi();
        setBlogs(allBlogs); // getAllBlogsApi now only returns published blogs for non-admin users
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [showCreateForm]); // Refresh blogs after new post is created

  // Handle login prompt for non-authenticated users
  const handleCreateBlogClick = () => {
    if (isLoggedIn) {
      setShowCreateForm(true);
    } else {
      toast.error('Bạn cần đăng nhập để viết bài!', {
        duration: 3000,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        icon: '🔒',
      });
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login', { state: { returnUrl: '/blogs' } });
      }, 2000);
    }
  };

  // Filter blogs based on search term, author, and topic
  const filteredBlogs = blogs.filter(blog => {
    const matchTitleContentAuthor =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (blog.topics && blog.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchTitleContentAuthor;
  });

  // Get current blogs for pagination
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  
  // Separate the newest blog
  const newestBlog = filteredBlogs.length > 0 ? filteredBlogs[0] : null;
  
  // Get the rest of the blogs for the grid (excluding the newest one if on first page)
  const currentBlogs = currentPage === 1 
    ? filteredBlogs.slice(1, indexOfLastBlog) 
    : filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Truncate content for preview
  const truncateContent = (content: string, maxLength = 150) => {
    const strippedContent = content.replace(/<[^>]*>?/gm, ''); // Remove HTML tags
    return strippedContent.length > maxLength 
      ? strippedContent.substring(0, maxLength) + '...' 
      : strippedContent;
  };

  // Random pastel background colors for blog cards without images
  const getBgColor = (id: string) => {
    const colors = [
      'bg-gradient-to-r from-blue-50 to-blue-100',
      'bg-gradient-to-r from-green-50 to-green-100',
      'bg-gradient-to-r from-yellow-50 to-yellow-100',
      'bg-gradient-to-r from-pink-50 to-pink-100',
      'bg-gradient-to-r from-purple-50 to-purple-100',
      'bg-gradient-to-r from-indigo-50 to-indigo-100',
    ];
    // Use the first character of the id to deterministically choose a color
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <MainLayout>
      <Toaster position="top-center" />
      
      {/* Hero Section - Blue Professional Theme */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 py-10">
        <div className="container mx-auto px-4 relative">
          {/* Decorative circles - blue only */}
          <div className="absolute top-0 left-10 w-20 h-20 rounded-full bg-cyan-100 opacity-20"></div>
          <div className="absolute bottom-5 right-20 w-16 h-16 rounded-full bg-blue-200 opacity-20"></div>
          <div className="absolute top-10 right-40 w-8 h-8 rounded-full bg-blue-100 opacity-20"></div>
          {/* Blue bubbles */}
          <div className="absolute top-8 left-1/4 w-24 h-24 rounded-full bg-cyan-300 opacity-20 blur-xl"></div>
          <div className="absolute top-20 right-1/4 w-32 h-32 rounded-full bg-blue-300 opacity-20 blur-xl"></div>
          <div className="absolute bottom-10 left-1/3 w-20 h-20 rounded-full bg-cyan-200 opacity-20 blur-xl"></div>
          <div className="absolute bottom-0 right-1/3 w-28 h-28 rounded-full bg-blue-200 opacity-20 blur-xl"></div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white drop-shadow-lg">Blog & Tin tức</h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-white drop-shadow">Khám phá những bài viết bổ ích và cập nhật về tâm lý học, sức khỏe tinh thần và các phương pháp trị liệu mới nhất.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-blue-50 via-cyan-50 to-white min-h-screen">
        {/* Create blog button - show different versions based on login state */}
        {!showCreateForm && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={handleCreateBlogClick}
              className={`${
                isLoggedIn 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600' 
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
              } px-6 py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center font-semibold text-lg text-white drop-shadow`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isLoggedIn ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v5m0 0l-3-3m3 3l3-3M12 9V4m0 0L9 7m3-3l3 3" />
                )}
              </svg>
              {isLoggedIn ? 'Viết bài blog mới' : 'Đăng nhập để viết bài'}
            </button>
          </div>
        )}

        {/* Create blog form */}
        {showCreateForm ? (
          <div className="mb-10">
            <CreateBlogForm 
              onSuccess={() => setShowCreateForm(false)} 
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        ) : (
          <>
            {/* Search Bar - Blue theme, single input */}
            <div className="max-w-xl mx-auto mb-10 relative">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, tác giả, chủ đề..."
                className="w-full px-5 py-4 rounded-full border-0 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white text-blue-900 placeholder-blue-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                <svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Featured Newest Blog */}
            {currentPage === 1 && newestBlog && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-blue-800 mb-6 border-l-4 border-cyan-400 pl-4 bg-cyan-50 py-2 rounded-r-lg shadow-sm">
                  Bài viết mới nhất
                </h2>
                <Link
                  to={'/blogs/' + newestBlog._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex flex-col md:flex-row h-full group border border-cyan-100"
                >
                  <div className="md:w-1/2 h-64 md:h-auto overflow-hidden relative">
                    {newestBlog.image ? (
                      <img 
                        src={newestBlog.image}
                        alt={newestBlog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center p-6 relative">
                        <div className="text-center">
                          <svg className="w-24 h-24 text-blue-300 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <p className="text-sm font-medium text-blue-400 italic">Hình ảnh minh họa</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="md:w-1/2 p-8 bg-gradient-to-br from-white to-cyan-50">
                    <div className="flex items-center mb-4">
                      <span className="text-sm text-blue-500 bg-blue-50 px-3 py-1 rounded-full">{formatDate(newestBlog.createdAt)}</span>
                      <span className="mx-2 text-blue-200">•</span>
                      <span className="text-sm text-cyan-700 font-medium">{newestBlog.author}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-blue-900 group-hover:text-cyan-700 transition-colors">{newestBlog.title}</h3>
                    <p className="text-blue-700 mb-6 text-base">{truncateContent(newestBlog.content, 300)}</p>
                    
                    {/* Topics */}
                    {newestBlog.topics && newestBlog.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {newestBlog.topics.map((topic, idx) => (
                          <span key={idx} className="text-sm bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-auto pt-4 border-t border-cyan-100">
                      <span className="text-cyan-700 font-medium group-hover:text-blue-800 transition flex items-center text-base">
                        Đọc tiếp
                        <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Blog cards - Blue theme */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentBlogs.map((blog) => (
                <Link
                  key={blog._id}
                  to={'/blogs/' + blog._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full group border border-cyan-50"
                >
                  {blog.image ? (
                    <div className="h-56 overflow-hidden relative">
                      <img 
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ) : (
                    <div className="h-56 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center p-6 relative">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-blue-300 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-sm font-medium text-blue-400 italic">Hình ảnh minh họa</p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-6 bg-gradient-to-br from-white to-cyan-50/40">
                    <div className="flex items-center mb-3">
                      <span className="text-xs text-blue-500 bg-blue-50 px-3 py-1 rounded-full">{formatDate(blog.createdAt)}</span>
                      <span className="mx-2 text-blue-200">•</span>
                      <span className="text-xs text-cyan-700 font-medium">{blog.author}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-blue-900 group-hover:text-cyan-700 transition-colors">{blog.title}</h3>
                    <p className="text-blue-700 mb-4 text-sm flex-grow">{truncateContent(blog.content)}</p>
                    {/* Topics */}
                    {blog.topics && blog.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.topics.slice(0, 3).map((topic, idx) => (
                          <span key={idx} className="text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-end mt-auto pt-3 border-t border-cyan-100">
                      <span className="text-cyan-700 font-medium group-hover:text-blue-800 transition flex items-center text-sm">
                        Đọc tiếp
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination - Blue theme */}
            {filteredBlogs.length > blogsPerPage && (
              <div className="flex justify-center mt-12">
                <nav className="inline-flex bg-white rounded-lg shadow-lg overflow-hidden border border-cyan-100">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={currentPage === 1 
                      ? 'px-4 py-2 border-r border-cyan-100 flex items-center bg-blue-50 text-blue-300 cursor-not-allowed'
                      : 'px-4 py-2 border-r border-cyan-100 flex items-center text-blue-700 hover:bg-cyan-50 hover:text-cyan-700'
                    }
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Trước
                  </button>
                  {Array.from({ length: Math.ceil(filteredBlogs.length / blogsPerPage) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={pageNumber === currentPage
                          ? 'w-10 border-r border-cyan-100 bg-cyan-600 text-white font-medium'
                          : 'w-10 border-r border-cyan-100 text-blue-700 hover:bg-cyan-50 hover:text-cyan-700'
                        }
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => paginate(Math.min(Math.ceil(filteredBlogs.length / blogsPerPage), currentPage + 1))}
                    disabled={currentPage === Math.ceil(filteredBlogs.length / blogsPerPage)}
                    className={currentPage === Math.ceil(filteredBlogs.length / blogsPerPage)
                      ? 'px-4 py-2 flex items-center bg-blue-50 text-blue-300 cursor-not-allowed'
                      : 'px-4 py-2 flex items-center text-blue-700 hover:bg-cyan-50 hover:text-cyan-700'
                    }
                  >
                    Sau
                    <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default BlogPage;
