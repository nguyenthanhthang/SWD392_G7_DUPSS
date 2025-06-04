const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cấu hình storage cho multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hopehub', // Thay đổi tên folder nếu muốn
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  }
});

// Tạo middleware upload
const upload = multer({ storage: storage });

module.exports = upload; 
