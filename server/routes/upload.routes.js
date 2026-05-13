import express from 'express';
import { upload } from '../config/cloudinary.js';
import { mustBeAuthenticated, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @desc    Upload ảnh lên Cloudinary
// @route   POST /api/v1/upload
// @access  Private/Admin
// 'image' là tên trường (field name) mà Frontend sẽ gửi lên (formData.append('image', file))
router.post('/', mustBeAuthenticated, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không tìm thấy file tải lên' });
  }
  
  // req.file.path chính là đường link URL trả về từ Cloudinary
  res.json({
    message: 'Upload ảnh thành công',
    imageUrl: req.file.path, 
  });
});

export default router;