import { Request, Response } from 'express';
import Blog from '../models/Blog';

// Extend Request để bao gồm file từ Multer
interface MulterRequest extends Request {
  file?: any; // Sử dụng any thay vì Express.Multer.File
}

export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    console.log('Getting all blogs...');
    const blogs = await Blog.find().sort({ createdAt: -1 });
    console.log(`Found ${blogs.length} blogs`);
    
    // Thêm một số blog mẫu nếu không có blog nào
    if (blogs.length === 0) {
      console.log('No blogs found, creating sample blogs...');
      const sampleBlogs = [
        {
          title: 'Hiểu về Sức Khỏe Tâm Thần',
          content: '<p>Sức khỏe tâm thần là một phần quan trọng của cuộc sống. Bài viết này giúp bạn hiểu rõ hơn về chủ đề này.</p>',
          author: 'Admin',
          published: true,
          tags: ['sức khỏe', 'tâm lý']
        },
        {
          title: 'Phương pháp điều trị hiện đại',
          content: '<p>Các phương pháp điều trị tâm lý hiện đại đang được áp dụng rộng rãi với hiệu quả cao.</p>',
          author: 'Admin',
          published: true,
          tags: ['điều trị', 'phương pháp']
        },
        {
          title: 'Làm thế nào để vượt qua căng thẳng',
          content: '<p>Căng thẳng là một phần tất yếu của cuộc sống hiện đại. Bài viết này cung cấp các kỹ thuật để đối phó với căng thẳng.</p>',
          author: 'Admin',
          published: true,
          tags: ['stress', 'tâm lý']
        }
      ];

      for (const blogData of sampleBlogs) {
        const blog = new Blog(blogData);
        await blog.save();
      }

      const newBlogs = await Blog.find().sort({ createdAt: -1 });
      console.log(`Created ${newBlogs.length} sample blogs`);
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
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Không tìm thấy blog' });
    res.json(blog);
  } catch (error) {
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
    // Nếu topics là string (từ form-data), parse thành mảng
    let topicsArr = topics;
    if (typeof topics === 'string') {
      try {
        topicsArr = JSON.parse(topics);
      } catch {
        topicsArr = topics.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    }
    const newBlog = new Blog({ title, content, author, topics: topicsArr, published, image: imageUrl });
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateBlog = async (req: MulterRequest, res: Response) => {
  try {
    const { title, content, author, tags, published } = req.body;
    let updateData: any = { title, content, author, tags, published };
    
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