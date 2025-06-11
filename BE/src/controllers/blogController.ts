import { Request, Response } from 'express';
import Blog from '../models/Blog';

// Thêm type cho req.file
interface MulterRequest extends Request {
  file?: any;
}

export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
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
    const { title, content, author, tags, published } = req.body;
    let imageUrl = req.body.image;
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    }
    const newBlog = new Blog({ title, content, author, tags, published, image: imageUrl });
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateBlog = async (req: MulterRequest, res: Response) => {
  try {
    let updateData = { ...req.body };
    if (req.file && req.file.path) {
      updateData.image = req.file.path;
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
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