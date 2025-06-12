import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { getAllBlogsApi, createBlogApi, updateBlogApi } from '../../api';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import Editor from '../../components/Editor';
import CreateBlogForm from '../../components/blog/CreateBlogForm';
import BlogDetailView from '../../components/blog/BlogDetailView';

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

const BlogManagement: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [blogDangXem, setBlogDangXem] = useState<Blog | null>(null);
  const [hienModalXem, setHienModalXem] = useState(false);

  // Filtered blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch =
      searchTerm === '' ||
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === '' ||
      (statusFilter === 'published' && blog.published) ||
      (statusFilter === 'pending' && !blog.published);
    const matchesAuthor =
      authorFilter === '' || blog.author === authorFilter;
    return matchesSearch && matchesStatus && matchesAuthor;
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const totalPages = Math.ceil(filteredBlogs.length / rowsPerPage);
  const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Fetch blogs
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await getAllBlogsApi();
      setBlogs(data);
    } catch (error) {
      message.error('Không thể lấy danh sách blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Handle open modal
  const handleAddNew = () => {
    setEditingBlog(null);
    setFormData({ 
      title: '', 
      content: '', 
      author: user?.username || 'Admin', 
      topics: '', 
      published: false,
      image: '',
      thumbnail: ''
    });
    setFile(null);
    setFilePreview(null);
    setModalVisible(true);
  };
  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      author: blog.author,
      topics: blog.topics?.join(', ') || '',
      published: blog.published,
      image: blog.image || '',
    });
    setFilePreview(blog.image || null);
    setFile(null);
    setModalVisible(true);
  };
  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingBlog(null);
    setFormData({});
    setFile(null);
    setFilePreview(null);
    setFormErrors({});
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      // Validate image
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validImageTypes.includes(f.type)) {
        setFormErrors(prev => ({ ...prev, image: 'Ảnh phải có định dạng JPG, JPEG, PNG hoặc WEBP' }));
      } else if (f.size > 2 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, image: 'Ảnh không được quá 2MB' }));
      } else {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
      
      setFile(f);
      setFilePreview(URL.createObjectURL(f));
      
      // Tạo thumbnail từ ảnh gốc
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Tạo canvas để resize ảnh
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Kích thước thumbnail
          const maxWidth = 300;
          const maxHeight = 200;
          
          // Tính toán kích thước mới giữ nguyên tỷ lệ
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          // Vẽ ảnh đã resize lên canvas
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Chuyển canvas thành blob
          canvas.toBlob((blob) => {
            if (blob) {
              // Tạo file thumbnail từ blob
              const thumbnailFile = new File([blob], 'thumbnail_' + f.name, {
                type: f.type,
                lastModified: Date.now()
              });
              
              // Cập nhật formData với cả ảnh gốc và thumbnail
              setFormData(prev => ({
                ...prev,
                image: f,
                thumbnail: thumbnailFile
              }));
            }
          }, f.type, 0.7); // Chất lượng 70%
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(f);
    }
  };

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Validate the field that was just changed
    const field = e.target.name;
    let error = '';
    
    if (field === 'title') {
      if (!e.target.value || e.target.value.trim() === '') {
        error = 'Tiêu đề không được để trống';
      } else if (e.target.value.trim().length < 5) {
        error = 'Tiêu đề phải có ít nhất 5 ký tự';
      } else if (e.target.value.trim().length > 150) {
        error = 'Tiêu đề không được quá 150 ký tự';
      }
    }
    
    if (field === 'author') {
      if (!e.target.value || e.target.value.trim() === '') {
        error = 'Tác giả không được để trống';
      } else if (e.target.value.trim().length < 3) {
        error = 'Tên tác giả phải có ít nhất 3 ký tự';
      } else if (e.target.value.trim().length > 50) {
        error = 'Tên tác giả không được quá 50 ký tự';
      }
    }
    
    // Update only this field's error
    if (error) {
      setFormErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, published: e.target.checked });
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submit
    
    // Validate form
    const errors: {[key: string]: string} = {};
    
    // Validate title
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Tiêu đề không được để trống';
    } else if (formData.title.trim().length < 5) {
      errors.title = 'Tiêu đề phải có ít nhất 5 ký tự';
    } else if (formData.title.trim().length > 150) {
      errors.title = 'Tiêu đề không được quá 150 ký tự';
    }
    
    // Validate author
    if (!formData.author || formData.author.trim() === '') {
      errors.author = 'Tác giả không được để trống';
    } else if (formData.author.trim().length < 3) {
      errors.author = 'Tên tác giả phải có ít nhất 3 ký tự';
    } else if (formData.author.trim().length > 50) {
      errors.author = 'Tên tác giả không được quá 50 ký tự';
    }
    
    // Validate content
    if (!formData.content || formData.content.trim() === '') {
      errors.content = 'Nội dung không được để trống';
    } else if (formData.content.replace(/<[^>]*>/g, '').trim().length < 50) {
      errors.content = 'Nội dung phải có ít nhất 50 ký tự';
    }
    
    // Validate image
    if (file) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        errors.image = 'Ảnh phải có định dạng JPG, JPEG, PNG hoặc WEBP';
      } else if (file.size > 2 * 1024 * 1024) {
        errors.image = 'Ảnh không được quá 2MB';
      }
    }
    
    // Validate topics
    const topicString = formData.topics || '';
    const topicArr = topicString.split(',').map((t: any) => t.trim()).filter(Boolean);
    if (topicArr.length === 0) {
      setFormErrors((prev: any) => ({ ...prev, topics: 'Vui lòng nhập ít nhất 1 topic.' }));
    }
    if (topicArr.length > 5) {
      errors.topics = 'Chỉ được nhập tối đa 5 topic.';
    }
    for (let topic of topicArr) {
      if (topic.length > 20) {
        errors.topics = 'Mỗi topic không quá 20 ký tự.';
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(topic)) {
        errors.topics = 'Topic chỉ được chứa chữ cái, số, dấu gạch ngang hoặc gạch dưới.';
      }
    }
    
    // If there are errors, show them and stop submission
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }
    
    // Clear errors if no problems
    setFormErrors({});
    
    try {
      setIsSubmitting(true); // Set submitting state to true
      let blogData: any = {
        title: formData.title,
        content: formData.content,
        author: formData.author || user?.username || 'Admin',
        published: formData.published || false,
        topics: formData.topics ? formData.topics.split(',').map((topic: string) => topic.trim()) : [],
      };
      if (file) {
        blogData.image = file;
      } else if (formData.image && typeof formData.image === 'string') {
        blogData.image = formData.image;
      }
      if (editingBlog) {
        await updateBlogApi(editingBlog._id, blogData);
        setNotification({type: 'success', message: 'Cập nhật blog thành công'});
      } else {
        await createBlogApi(blogData);
        setNotification({type: 'success', message: 'Tạo blog mới thành công'});
      }
      handleCloseModal();
      fetchBlogs();
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      setNotification({type: 'error', message: 'Không thể lưu blog'});
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  // Badge helpers
  const getStatusBadge = (published: boolean) =>
    published ? (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Đã xuất bản</span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Chưa duyệt</span>
    );

  // Handle duyệt blog
  const handleDuyetBlog = async (blog: Blog) => {
    try {
      await updateBlogApi(blog._id, {
        ...blog,
        published: true
      });
      setNotification({type: 'success', message: 'Đã duyệt bài viết thành công'});
      fetchBlogs();
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      setNotification({type: 'error', message: 'Không thể duyệt bài viết'});
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  // Handle ngừng xuất bản blog
  const handleNgungXuatBan = async (blog: Blog) => {
    try {
      await updateBlogApi(blog._id, {
        ...blog,
        published: false
      });
      setNotification({type: 'success', message: 'Đã ngừng xuất bản bài viết'});
      fetchBlogs();
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      setNotification({type: 'error', message: 'Không thể ngừng xuất bản bài viết'});
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm mt-4">
      {/* Hiển thị thông báo */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 
          'bg-red-100 text-red-800 border-l-4 border-red-500'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-indigo-400">Quản lý bài viết</h1>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm bài viết
        </button>
      </div>

      {/* Filter/Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Tìm kiếm và Lọc</h2>
          {(searchTerm || statusFilter || authorFilter) && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter(''); setAuthorFilter(''); }}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Đặt lại bộ lọc
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tiêu đề, tác giả..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="pending">Chưa duyệt</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
            <select
              value={authorFilter}
              onChange={e => setAuthorFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Tất cả tác giả</option>
              {[...new Set(blogs.map(b => b.author))].map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Kết quả: {filteredBlogs.length} bài viết</span>
          {(searchTerm || statusFilter || authorFilter) && <span className="mx-2">|</span>}
          {searchTerm && <span className="bg-gray-100 px-2 py-1 rounded-full">Tìm kiếm: "{searchTerm}"</span>}
          {statusFilter && <span className="bg-gray-100 px-2 py-1 rounded-full">Trạng thái: {statusFilter === 'published' ? 'Đã xuất bản' : 'Chưa duyệt'}</span>}
          {authorFilter && <span className="bg-gray-100 px-2 py-1 rounded-full">Tác giả: {authorFilter}</span>}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-md rounded-lg max-h-[70vh] overflow-y-auto">
        <table className="min-w-full bg-white table-fixed">
          <thead>
            <tr className="bg-purple-50 text-gray-600 text-left text-sm font-semibold uppercase tracking-wider">
              <th className="px-4 py-3 rounded-tl-lg w-1/5">Tiêu đề</th>
              {/* <th className="px-4 py-3 w-1/6">Ảnh đại diện</th> */}
              <th className="px-4 py-3 w-1/6">Tác giả</th>
              {/* <th className="px-4 py-3 w-1/6">Topics</th> */}
              <th className="px-4 py-3 w-1/6">Trạng thái</th>
              <th className="px-4 py-3 w-1/6">Ngày tạo</th>
              <th className="px-4 py-3 rounded-tr-lg w-1/6">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
            {paginatedBlogs.length > 0 ? (
              paginatedBlogs.map(blog => (
                <tr key={blog._id} className="border-b border-gray-200 hover:bg-purple-50">
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{blog.title}</td>
                  {/*
                  <td className="px-4 py-3 whitespace-nowrap">
                    {blog.thumbnail ? (
                      <img src={blog.thumbnail} alt="Thumbnail" className="w-16 h-10 object-cover rounded" />
                    ) : (
                      <span className="text-xs text-gray-400">Không có ảnh</span>
                    )}
                  </td>
                  */}
                  <td className="px-4 py-3 whitespace-nowrap">{blog.author}</td>
                  {/*
                  <td className="px-4 py-3 whitespace-nowrap">
                    {blog.topics && blog.topics.length > 0 ? (
                      blog.topics.map(topic => (
                        <span key={topic} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">{topic}</span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">Không có topic</span>
                    )}
                  </td>
                  */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(blog.published)}
                      {!blog.published ? (
                        <button
                          onClick={() => handleDuyetBlog(blog)}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center gap-1 shadow-sm hover:shadow"
                          title="Duyệt bài viết"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Duyệt
                        </button>
                      ) : (
                        <button
                          onClick={() => handleNgungXuatBan(blog)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center gap-1 shadow-sm hover:shadow"
                          title="Ngừng xuất bản bài viết"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Ngừng xuất bản
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => { setBlogDangXem(blog); setHienModalXem(true); }}
                        className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                        title="Xem"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(blog)}
                        className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        title="Sửa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Không tìm thấy bài viết nào phù hợp với bộ lọc
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 gap-2">
        <button
          className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>

      {/* Modal Thêm/Sửa Blog */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-lg p-0 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CreateBlogForm
              initialData={editingBlog ? {
                title: editingBlog.title,
                content: editingBlog.content,
                author: editingBlog.author,
                topics: editingBlog.topics?.join(', ') || '',
                image: editingBlog.image || '',
                published: editingBlog.published,
              } : undefined}
              isAdmin={true}
              onCancel={handleCloseModal}
              onSuccess={() => {
                handleCloseModal();
                fetchBlogs();
              }}
              onSubmit={async (data) => {
                setIsSubmitting(true);
                try {
                  if (editingBlog) {
                    await updateBlogApi(editingBlog._id, data);
                    setNotification({type: 'success', message: 'Cập nhật blog thành công'});
                    } else {
                    await createBlogApi(data);
                    setNotification({type: 'success', message: 'Tạo blog mới thành công'});
                  }
                  setTimeout(() => setNotification(null), 3000);
                } catch (error) {
                  setNotification({type: 'error', message: 'Không thể lưu blog'});
                  setTimeout(() => setNotification(null), 3000);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            />
          </div>
              </div>
      )}

      {hienModalXem && blogDangXem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <BlogDetailView blog={blogDangXem} onClose={() => setHienModalXem(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement; 