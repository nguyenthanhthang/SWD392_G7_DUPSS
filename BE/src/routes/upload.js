const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadImage');

// Route upload ảnh
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file nào được upload!' });
  }
  // req.file.path chứa URL của ảnh đã upload lên Cloudinary
  res.json({ imageUrl: req.file.path });
});

module.exports = router; 