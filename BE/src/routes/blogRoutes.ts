import express from 'express';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController';

const router = express.Router();

// Lấy tất cả blogs
router.get('/', getAllBlogs);
// Lấy blog theo id
router.get('/:id', getBlogById);
// Tạo blog mới
router.post('/', createBlog);
// Cập nhật blog
router.put('/:id', updateBlog);
// Xóa blog
router.delete('/:id', deleteBlog);

export default router; 