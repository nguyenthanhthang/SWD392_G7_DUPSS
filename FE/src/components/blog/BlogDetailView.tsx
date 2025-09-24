import React, { useState, useEffect } from 'react';
import { getCommentsApi, addCommentApi, deleteCommentApi, loginApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface IComment {
  _id?: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  authorId: {
    _id: string;
    fullName: string;
    username: string;
  };
  image?: string;
  thumbnail?: string;
  topics?: string[];
  published: 'draft' | 'published' | 'unpublished' | 'rejected';
  comments: IComment[];
  createdAt: string;
  updatedAt: string;
  anDanh: boolean;
}

interface BlogDetailViewProps {
  blog: Blog;
  onClose?: () => void;
}

const dinhDangNgay = (chuoiNgay: string) => {
  const tuyChon: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(chuoiNgay).toLocaleDateString('vi-VN', tuyChon);
};

const BlogDetailView: React.FC<BlogDetailViewProps> = ({ blog, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    fetchComments();
  }, [blog._id]);

  const fetchComments = async () => {
    try {
      const data = await getCommentsApi(blog._id);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Không thể tải bình luận');
    }
  };

  const sortComments = (commentsToSort: IComment[]) => {
    switch (sortOrder) {
      case 'newest':
        return [...commentsToSort].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return [...commentsToSort].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      default:
        return commentsToSort;
    }
  };

  const sortedComments = sortComments(comments);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để bình luận');
      return;
    }
    
    if (!user || !user._id) {
      toast.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    setIsLoading(true);
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!blog || !blog._id) {
        toast.error('Không tìm thấy ID bài viết');
        setIsLoading(false);
        return;
      }

      const commentData = {
        userId: user._id,
        username: user.username || user.fullName || 'Người dùng',
        content: newComment.trim()
      };
      
      console.log('Bài viết ID:', blog._id);
      console.log('Dữ liệu bình luận:', commentData);
      
      try {
        await addCommentApi(blog._id, commentData);
        setNewComment('');
        await fetchComments();
        toast.success('Đã thêm bình luận');
      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          // Trường hợp lỗi dữ liệu
          console.error('Lỗi dữ liệu:', error.response.data);
          toast.error(error.response.data.message || 'Dữ liệu bình luận không hợp lệ');
        } else if (error.response && error.response.status === 401) {
          // Trường hợp token hết hạn
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        } else {
          // Lỗi khác
          console.error('Lỗi thêm bình luận:', error);
          toast.error('Không thể thêm bình luận. Vui lòng thử lại sau.');
        }
      }
    } catch (error: any) {
      console.error('Lỗi:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user?._id) return;
    
    try {
      await deleteCommentApi(blog._id, commentId, user._id);
      await fetchComments();
      toast.success('Đã xóa bình luận');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Không thể xóa bình luận');
    }
  };

  if (!blog) return null;

  return (
    <div className="relative">
      {/* Nút đóng nếu dùng trong modal */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-100 text-gray-500 hover:text-indigo-600 transition"
          title="Đóng"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      {/* Hero section */}
      <div className="relative h-[300px] md:h-[350px] overflow-hidden rounded-t-xl">
        {blog.image ? (
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-400 via-secondary-300 to-accent-200"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 flex items-end">
          <div className="px-6 pb-10">
            <div className="flex items-center mb-3">
              <span className="bg-primary/80 text-light px-4 py-1 rounded-full text-sm backdrop-blur-sm">
                {dinhDangNgay(blog.createdAt)}
              </span>
              <span className="mx-3 text-white/70">•</span>
              <span className="text-white/90">Tác giả: <span className="font-medium">{blog.anDanh ? 'Ẩn danh' : blog.authorId.fullName}</span></span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-sm">{blog.title}</h1>
          </div>
        </div>
      </div>
      {/* Nội dung blog */}
      <div className="bg-light py-8 px-4 md:px-10 rounded-b-xl shadow-sm">
        {/* Chủ đề */}
        {blog.topics && blog.topics.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {blog.topics.map((chuDe) => (
              <span key={chuDe} className="inline-block bg-primary-50 text-primary text-xs px-3 py-1 rounded-full">
                {chuDe}
              </span>
            ))}
          </div>
        )}
        {/* Nội dung chính */}
        <div
          className="prose lg:prose-xl prose-stone max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Comments section */}
        <div className="mt-12 border-t pt-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-primary">Bình luận ({comments.length})</h3>
            
            {/* Sort options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-bodytext">Sắp xếp:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="px-3 py-1 text-sm border border-primary-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>
          
          {/* Comment form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex gap-4">
                <div className="flex-grow">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận của bạn..."
                    className="w-full px-4 py-3 rounded-lg border border-primary-200 focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-light rounded-lg hover:from-primary-700 hover:to-accent-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed h-fit"
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi bình luận'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-primary-50 rounded-lg text-center">
              <p className="text-bodytext">
                Vui lòng <a href="/login" className="text-primary hover:text-primary-700 font-medium">đăng nhập</a> để bình luận
              </p>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-6">
            {sortedComments.map((comment) => (
              <div key={comment._id} className="flex gap-4 p-4 bg-primary-50 rounded-lg">
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-primary">{comment.username}</span>
                      <span className="mx-2 text-secondary-400">•</span>
                      <span className="text-sm text-bodytext">{dinhDangNgay(comment.createdAt)}</span>
                    </div>
                    {user?._id === comment.userId && (
                      <button
                        onClick={() => comment._id && handleDeleteComment(comment._id)}
                        className="text-danger hover:text-danger-600"
                        title="Xóa bình luận"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-bodytext">{comment.content}</p>
                </div>
              </div>
            ))}
            
            {comments.length === 0 && (
              <div className="text-center py-8 text-secondary-500">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailView; 