import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { getAllBlogsApi, createBlogApi, updateBlogApi, deleteBlogApi } from '../../api';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import Editor from '../../components/Editor';

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
  const { user } = useAuth();

  // Filtered blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch =
      searchTerm === '' ||
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === '' ||
      (statusFilter === 'published' && blog.published) ||
      (statusFilter === 'draft' && !blog.published);
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
    setFormData({ title: '', content: '', author: user?.username || 'Admin', tags: '', published: false });
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
      tags: blog.tags?.join(', ') || '',
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
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setFilePreview(URL.createObjectURL(f));
      setFormData({ ...formData, image: f });
    }
  };

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, published: e.target.checked });
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let blogData: any = {
        title: formData.title,
        content: formData.content,
        author: formData.author || user?.username || 'Admin',
        published: formData.published || false,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [],
      };
      if (file) {
        blogData.image = file;
      } else if (formData.image && typeof formData.image === 'string') {
        blogData.image = formData.image;
      }
      if (editingBlog) {
        await updateBlogApi(editingBlog._id, blogData);
        message.success('Cập nhật blog thành công');
      } else {
        await createBlogApi(blogData);
        message.success('Tạo blog mới thành công');
      }
      handleCloseModal();
      fetchBlogs();
    } catch (error) {
      message.error('Không thể lưu blog');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteBlogApi(id);
      message.success('Xóa blog thành công');
      fetchBlogs();
    } catch {
      message.error('Không thể xóa blog');
    }
  };

  // Badge helpers
  const getStatusBadge = (published: boolean) =>
    published ? (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Đã xuất bản</span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">Bản nháp</span>
    );

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm mt-4">
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
              <option value="draft">Bản nháp</option>
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
          {statusFilter && <span className="bg-gray-100 px-2 py-1 rounded-full">Trạng thái: {statusFilter === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</span>}
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
              {/* <th className="px-4 py-3 w-1/6">Tags</th> */}
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
                    {blog.tags && blog.tags.length > 0 ? (
                      blog.tags.map(tag => (
                        <span key={tag} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">{tag}</span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">Không có tag</span>
                    )}
                  </td>
                  */}
                  <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(blog.published)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => window.open(`/blogs/${blog._id}`, '_blank')}
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
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        title="Xóa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{editingBlog ? 'Sửa blog' : 'Thêm blog mới'}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tác giả</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nội dung</label>
                <Editor
                  value={formData.content || ''}
                  onChange={content => setFormData({ ...formData, content })}
                  height={300}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published || false}
                  onChange={handleSwitch}
                  className="mr-2"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700">
                  Đã xuất bản
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ảnh đại diện blog</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm"
                />
                {filePreview && (
                  <img src={filePreview} alt="Preview" className="mt-2 w-32 h-20 object-cover rounded border" />
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  {editingBlog ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement; 