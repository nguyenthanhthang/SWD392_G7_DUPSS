import React from 'react';

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
          <div className="w-full h-full bg-gradient-to-r from-blue-400 via-pink-300 to-pink-200"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 flex items-end">
          <div className="px-6 pb-10">
            <div className="flex items-center mb-3">
              <span className="bg-cyan-600/80 text-white px-4 py-1 rounded-full text-sm backdrop-blur-sm">
                {dinhDangNgay(blog.createdAt)}
              </span>
              <span className="mx-3 text-white/70">•</span>
              <span className="text-white/90">Tác giả: <span className="font-medium">{blog.author}</span></span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-sm">{blog.title}</h1>
          </div>
        </div>
      </div>
      {/* Nội dung blog */}
      <div className="bg-white py-8 px-4 md:px-10 rounded-b-xl shadow-sm">
        {/* Chủ đề */}
        {blog.topics && blog.topics.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {blog.topics.map((chuDe) => (
              <span key={chuDe} className="inline-block bg-cyan-50 text-cyan-600 text-xs px-3 py-1 rounded-full">
                {chuDe}
              </span>
            ))}
          </div>
        )}
        {/* Nội dung chính */}
        <div
          className="prose lg:prose-xl prose-cyan max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </div>
  );
};

export default BlogDetailView; 