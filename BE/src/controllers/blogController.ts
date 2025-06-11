import { Request, Response } from 'express';
import Blog from '../models/Blog';

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

export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, author, thumbnail, tags, published } = req.body;
    const newBlog = new Blog({ title, content, author, thumbnail, tags, published });
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
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