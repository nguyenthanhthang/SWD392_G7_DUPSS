import { Request, Response } from 'express';
import Blog from '../models/Blog';
import mongoose from 'mongoose';

// Extend Request để bao gồm file từ Multer
interface MulterRequest extends Request {
  file?: any; // Sử dụng any thay vì Express.Multer.File
}

export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    
    // Thêm một số blog mẫu nếu không có blog nào
    if (blogs.length === 0) {
      const sampleBlogs = [
        {
          title: 'Hiểu về Sức Khỏe Tâm Thần',
          content: '<p>Sức khỏe tâm thần là một phần quan trọng của cuộc sống. Bài viết này giúp bạn hiểu rõ hơn về chủ đề này.</p>',
          author: 'Admin',
          published: 'published',
          topics: ['sức khỏe', 'tâm lý']
        },
        {
          title: 'Phương pháp điều trị hiện đại',
          content: '<p>Các phương pháp điều trị tâm lý hiện đại đang được áp dụng rộng rãi với hiệu quả cao.</p>',
          author: 'Admin',
          published: 'published',
          topics: ['điều trị', 'phương pháp']
        },
        {
          title: 'Làm thế nào để vượt qua căng thẳng',
          content: '<p>Căng thẳng là một phần tất yếu của cuộc sống hiện đại. Bài viết này cung cấp các kỹ thuật để đối phó với căng thẳng.</p>',
          author: 'Admin',
          published: 'published',
          topics: ['stress', 'tâm lý']
        }
      ];

      for (const blogData of sampleBlogs) {
        const blog = new Blog(blogData);
        await blog.save();
      }

      const newBlogs = await Blog.find().sort({ createdAt: -1 });
      return res.json(newBlogs);
    }

    res.json(blogs);
  } catch (error) {
    console.error('Error in getAllBlogs:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID blog không hợp lệ' });
    }

    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Không tìm thấy blog' });
    }
    
    if (blog.published !== 'published') {
      return res.status(404).json({ message: 'Bài viết này chưa được xuất bản hoặc không tồn tại' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Error in getBlogById:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const createBlog = async (req: MulterRequest, res: Response) => {
  try {
    const { title, content, author, topics, published } = req.body;
    let imageUrl = req.body.image;
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    }
    
    // Validate published status
    const validStatuses = ['draft', 'published', 'rejected'];
    const publishedStatus = published || 'draft';
    if (!validStatuses.includes(publishedStatus)) {
      return res.status(400).json({ message: 'Trạng thái published không hợp lệ' });
    }
    
    // Nếu topics là string (từ form-data), parse thành mảng
    let topicsArr = topics;
    if (typeof topics === 'string') {
      try {
        topicsArr = JSON.parse(topics);
      } catch {
        topicsArr = topics.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    }
    
    const newBlog = new Blog({ 
      title, 
      content, 
      author, 
      topics: topicsArr, 
      published: publishedStatus, 
      image: imageUrl 
    });
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    console.error('Error in createBlog:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateBlog = async (req: MulterRequest, res: Response) => {
  try {
    const { title, content, author, topics, published } = req.body;
    let updateData: any = { title, content, author, topics };
    
    // Validate published status if provided
    if (published) {
      const validStatuses = ['draft', 'published', 'rejected'];
      if (!validStatuses.includes(published)) {
        return res.status(400).json({ message: 'Trạng thái published không hợp lệ' });
      }
      updateData.published = published;
    }
    
    if (req.file && req.file.path) {
      updateData.image = req.file.path;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!blog) return res.status(404).json({ message: 'Không tìm thấy blog' });
    res.json(blog);
  } catch (error) {
    console.error('Error in updateBlog:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Không tìm thấy blog' });
    res.json({ message: 'Xóa blog thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getBlogsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    // Lấy user từ bảng Account
    const user = await import('../models/Account').then(m => m.default.findById(userId));
    if (!user) return res.json([]);
    // Lấy blog theo author là fullName hoặc username
    const blogs = await Blog.find({ author: { $in: [user.fullName, user.username] } }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [POST] /api/blogs/:id/comments - Thêm comment vào blog
export const addComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, username, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID blog không hợp lệ' });
    }

    if (!userId || !username || !content) {
      return res.status(400).json({ message: 'Thiếu thông tin comment' });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Không tìm thấy blog' });
    }

    const newComment = {
      userId,
      username,
      content,
      createdAt: new Date()
    };

    blog.comments.push(newComment);
    const updatedBlog = await blog.save();
    
    // Trả về comment mới đã được tạo
    const savedComment = updatedBlog.comments[updatedBlog.comments.length - 1];
    res.status(201).json(savedComment);
  } catch (error) {
    console.error('Error in addComment:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm comment' });
  }
};

// [DELETE] /api/blogs/:blogId/comments/:commentId - Xóa comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { blogId, commentId } = req.params;
    const { userId } = req.body; // Người dùng hiện tại

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ message: 'ID blog không hợp lệ' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Không tìm thấy blog' });
    }

    // Tìm comment cần xóa
    const comment = blog.comments.find(c => c._id && c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Không tìm thấy comment' });
    }

    // Kiểm tra quyền xóa comment (chỉ người tạo comment mới được xóa)
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Không có quyền xóa comment này' });
    }

    // Xóa comment
    blog.comments = blog.comments.filter(c => c._id && c._id.toString() !== commentId);
    await blog.save();

    res.json({ message: 'Đã xóa comment thành công' });
  } catch (error) {
    console.error('Error in deleteComment:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa comment' });
  }
};

// [GET] /api/blogs/:id/comments - Lấy tất cả comments của một blog
export const getComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID blog không hợp lệ' });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Không tìm thấy blog' });
    }

    res.json(blog.comments);
  } catch (error) {
    console.error('Error in getComments:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy comments' });
  }
}; 