import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllBlogsApi } from '../api';
import MainLayout from '../components/layout/MainLayout';
import CreateBlogForm from '../components/blog/CreateBlogForm';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string;
  image?: string;
  thumbnail?: string;
  tags?: string[];
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
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchTag, setSearchTag] = useState('');
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
        // Chỉ hiển thị blog đã được xuất bản
        const publishedBlogs = allBlogs.filter((blog: Blog) => blog.published);
        setBlogs(publishedBlogs);
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

  // Filter blogs based on search term, author, and tag
  const filteredBlogs = blogs.filter(blog => {
    const matchTitleContentAuthor =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAuthor = searchAuthor.trim() === '' || blog.author.toLowerCase().includes(searchAuthor.toLowerCase());
    const matchTag = searchTag.trim() === '' || (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchTag.toLowerCase())));
    return matchTitleContentAuthor && matchAuthor && matchTag;
  });

  // Get current blogs for pagination
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

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
  const truncateContent = (content: string) => {
    const strippedContent = content.replace(/<[^>]*>?/gm, ''); // Remove HTML tags
    return strippedContent.length > 150 
      ? strippedContent.substring(0, 150) + '...' 
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
      
      {/* Hero Section - Updated with softer colors */}
      <div className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 py-8">
        <div className="container mx-auto px-4 relative">
          {/* Decorative circles */}
          <div className="absolute top-0 left-10 w-20 h-20 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-5 right-20 w-16 h-16 rounded-full bg-white opacity-10"></div>
          <div className="absolute top-10 right-40 w-8 h-8 rounded-full bg-white opacity-10"></div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white drop-shadow-sm">Blog & Tin tức</h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-white drop-shadow-sm">
            Khám phá những bài viết bổ ích và cập nhật về tâm lý học, sức khỏe tinh thần và các phương pháp trị liệu mới nhất.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 bg-gray-50">
        {/* Create blog button - show different versions based on login state */}
        {!showCreateForm && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={handleCreateBlogClick}
              className={`${
                isLoggedIn 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600' 
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
              } text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 flex items-center`}
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
            {/* Search Bar - Improved design */}
            <div className="max-w-2xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full px-5 py-4 rounded-full border-0 shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                  <svg className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm theo tác giả..."
                  className="w-full px-5 py-4 rounded-full border-0 shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  value={searchAuthor}
                  onChange={(e) => setSearchAuthor(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                  <svg className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm theo tag..."
                  className="w-full px-5 py-4 rounded-full border-0 shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                  <svg className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm max-w-2xl mx-auto">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-500 font-medium text-lg mb-4">{error}</p>
            <button
              className="mt-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-600 hover:to-blue-600 transition shadow-md"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm max-w-2xl mx-auto">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Không tìm thấy bài viết</h2>
            <p className="text-gray-500">Không có bài viết nào phù hợp với tìm kiếm của bạn.</p>
          </div>
        ) : (
          <>
            {/* Blog Grid - Enhanced design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentBlogs.map((blog) => (
                <Link 
                  to={`/blogs/${blog._id}`} 
                  key={blog._id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 group"
                >
                  {blog.image ? (
                    <div className="h-56 overflow-hidden relative">
                      <img 
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ) : (
                    <div className={`h-56 ${getBgColor(blog._id)} flex items-center justify-center p-6 relative`}>
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-sm font-medium text-gray-500 italic">Hình ảnh minh họa</p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center mb-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{formatDate(blog.createdAt)}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-xs text-cyan-600 font-medium">{blog.author}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-cyan-600 transition-colors">{blog.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm flex-grow">{truncateContent(blog.content)}</p>
                    
                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-xs bg-cyan-50 text-cyan-600 px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-auto pt-3 border-t border-gray-100">
                      <span className="text-cyan-600 font-medium group-hover:text-cyan-700 transition flex items-center text-sm">
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

            {/* Pagination - Improved design */}
            {filteredBlogs.length > blogsPerPage && (
              <div className="flex justify-center mt-12">
                <nav className="inline-flex bg-white rounded-lg shadow-sm overflow-hidden">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 border-r border-gray-200 flex items-center ${
                      currentPage === 1 
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-600'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Trước
                  </button>
                  
                  {Array.from({ length: Math.min(5, Math.ceil(filteredBlogs.length / blogsPerPage)) }, (_, i) => {
                    const pageNumber = currentPage > 3 && Math.ceil(filteredBlogs.length / blogsPerPage) > 5
                      ? currentPage - 3 + i + (currentPage + 2 > Math.ceil(filteredBlogs.length / blogsPerPage) 
                          ? Math.ceil(filteredBlogs.length / blogsPerPage) - (currentPage + 2) 
                          : 0)
                      : i + 1;
                      
                    if (pageNumber > Math.ceil(filteredBlogs.length / blogsPerPage)) return null;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`w-10 border-r border-gray-200 ${
                          currentPage === pageNumber 
                            ? 'bg-cyan-500 text-white font-medium' 
                            : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-600'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(Math.min(Math.ceil(filteredBlogs.length / blogsPerPage), currentPage + 1))}
                    disabled={currentPage === Math.ceil(filteredBlogs.length / blogsPerPage)}
                    className={`px-4 py-2 flex items-center ${
                      currentPage === Math.ceil(filteredBlogs.length / blogsPerPage) 
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-600'
                    }`}
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
