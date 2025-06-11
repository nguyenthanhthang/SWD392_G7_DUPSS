import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getBlogByIdApi } from '../api';
import MainLayout from '../components/layout/MainLayout';

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

function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const blogData = await getBlogByIdApi(id);
        
        // Nếu blog chưa được xuất bản, chuyển hướng về trang blogs
        if (!blogData.published) {
          navigate('/blogs');
          return;
        }
        
        setBlog(blogData);
        setError(null);
        
        // Set page title
        document.title = `${blogData.title} | HopeHub Blog`;
      } catch (err) {
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, navigate]);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !blog) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col justify-center items-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-sm max-w-2xl mx-auto text-center">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-red-500 mb-4">
              {error || 'Không tìm thấy bài viết'}
            </h1>
            <p className="text-gray-600 mb-6">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link
              to="/blogs"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-600 hover:to-blue-600 transition shadow-md flex items-center justify-center max-w-xs mx-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại danh sách bài viết
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero section with image */}
      <div className="relative h-[450px] overflow-hidden">
        {blog.image ? (
          <img 
            src={blog.image} 
            alt={blog.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 flex items-end">
          <div className="container mx-auto px-4 pb-16">
            <div className="max-w-4xl">
              <div className="flex items-center mb-4">
                <span className="bg-cyan-600/80 text-white px-4 py-1 rounded-full text-sm backdrop-blur-sm">
                  {formatDate(blog.createdAt)}
                </span>
                <span className="mx-3 text-white/70">•</span>
                <span className="text-white/90">Tác giả: <span className="font-medium">{blog.author}</span></span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-sm">{blog.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Blog content */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 md:p-10">
            {/* Tags if available */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-cyan-50 text-cyan-600 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Blog body content */}
            <div 
              className="prose lg:prose-xl prose-cyan max-w-none mb-10"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Divider with icon */}
            <div className="flex items-center my-10">
              <div className="flex-grow border-t border-gray-200"></div>
              <div className="flex-shrink-0 mx-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Author and share section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-t border-gray-100 pt-6">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-500 text-sm">Chia sẻ bài viết này:</p>
                <div className="flex space-x-3 mt-2">
                  <button className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                    </svg>
                  </button>
                  <button className="w-9 h-9 rounded-full bg-cyan-400 text-white flex items-center justify-center hover:bg-cyan-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                  <button className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 3H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1zM8.339 18.337H5.667v-8.59h2.672v8.59zM7.003 8.574a1.548 1.548 0 110-3.096 1.548 1.548 0 010 3.096zm11.335 9.763h-2.669V14.16c0-.996-.018-2.277-1.388-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248h-2.667v-8.59h2.56v1.174h.037c.355-.675 1.227-1.387 2.524-1.387 2.704 0 3.203 1.778 3.203 4.092v4.71z"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Back button with improved styling */}
              <Link
                to="/blogs"
                className="inline-flex items-center text-cyan-600 hover:text-cyan-700 font-medium group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại danh sách bài viết
              </Link>
            </div>
          </div>
          
          {/* Related content section */}
          <div className="max-w-4xl mx-auto mt-12">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Bài viết liên quan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gray-100 animate-pulse"></div>
                  <div className="p-4">
                    <div className="w-1/3 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-full h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-2/3 h-5 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default BlogDetailPage; 