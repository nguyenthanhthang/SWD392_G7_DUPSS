import express from 'express';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogsByUserId,
} from '../controllers/blogController';
const upload = require('../middleware/uploadImage');

const router = express.Router();

// Lấy tất cả blogs
router.get('/', getAllBlogs);
// Lấy blog theo id
router.get('/:id', getBlogById);
// Tạo blog mới (có upload ảnh)
router.post('/', upload.single('image'), createBlog);
// Cập nhật blog (có upload ảnh)
router.put('/:id', upload.single('image'), updateBlog);
// Xóa blog
router.delete('/:id', deleteBlog);
// Lấy blog theo userId
router.get('/user/:userId', getBlogsByUserId);

export default router; 