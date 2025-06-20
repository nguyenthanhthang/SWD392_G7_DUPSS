const mongoose = require('mongoose');
const Blog = require('../models/Blog');

// Kết nối database
mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrateBlogStatus() {
  try {
    console.log('Bắt đầu migration trạng thái blog...');
    
    // Lấy tất cả blogs
    const blogs = await Blog.find({});
    console.log(`Tìm thấy ${blogs.length} blogs cần migration`);
    
    let updatedCount = 0;
    
    for (const blog of blogs) {
      // Kiểm tra nếu published là boolean
      if (typeof blog.published === 'boolean') {
        // Chuyển đổi boolean sang string
        const newStatus = blog.published ? 'published' : 'draft';
        
        // Cập nhật blog
        await Blog.findByIdAndUpdate(blog._id, {
          published: newStatus
        });
        
        console.log(`Đã cập nhật blog "${blog.title}" từ ${blog.published} thành "${newStatus}"`);
        updatedCount++;
      }
    }
    
    console.log(`Migration hoàn thành! Đã cập nhật ${updatedCount} blogs`);
    
  } catch (error) {
    console.error('Lỗi trong quá trình migration:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Chạy migration
migrateBlogStatus(); 