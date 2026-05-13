import Post from '../models/Post.js';
import { logAction } from './audit.controller.js'; // <-- IMPORT HÀM GHI LOG

// @desc    Tạo bài viết mới (Chỉ Admin)
export const createPost = async (req, res, next) => {
  try {
    const post = await Post.create(req.body);
    
    // GHI LOG
    await logAction(req.user._id, 'THÊM', 'Bài Viết', `Đã tạo bài viết mới: "${post.title}"`);
    
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật bài viết (Chỉ Admin)
export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!post) throw new Error('Không tìm thấy bài viết');
    
    // GHI LOG
    await logAction(req.user._id, 'SỬA', 'Bài Viết', `Đã cập nhật bài viết: "${post.title}"`);
    
    res.json(post);
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa bài viết (Chỉ Admin)
export const deletePost = async (req, res, next) => {
  try {
    // Dùng findByIdAndDelete nó sẽ trả về document vừa xóa (để lấy được title)
    const post = await Post.findByIdAndDelete(req.params.id);
    
    // GHI LOG (Kiểm tra nếu post tồn tại mới ghi)
    if (post) {
      await logAction(req.user._id, 'XÓA', 'Bài Viết', `Đã xóa bài viết: "${post.title}"`);
    }
    
    res.json({ message: 'Đã xóa bài viết' });
  } catch (error) {
    next(error);
  }
};

// @desc    Bật/Tắt trạng thái bài viết (Chỉ Admin)
export const togglePostStatus = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) throw new Error('Không tìm thấy bài viết');
    post.isActive = !post.isActive;
    await post.save();
    
    // GHI LOG
    await logAction(req.user._id, 'SỬA', 'Bài Viết', `Đã ${post.isActive ? 'hiện' : 'ẩn'} bài viết: "${post.title}"`);
    
    res.json({ message: 'Đã cập nhật trạng thái', isActive: post.isActive });
  } catch (error) {
    next(error);
  }
};

// 1. SỬA LẠI hàm getPosts (Chỉ lấy dữ liệu, KHÔNG CẦN GHI LOG)
export const getPosts = async (req, res, next) => {
  try {
    // THAY ĐỔI Ở ĐÂY: Nhận thêm biến ?all=true từ Admin
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const posts = await Post.find(filter).sort({ isPinned: -1, createdAt: -1 });
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// 2. THÊM HÀM MỚI XUỐNG CUỐI FILE
// @desc    Bật/tắt ghim bài viết
export const togglePostPin = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) throw new Error('Không tìm thấy bài viết');
    post.isPinned = !post.isPinned;
    await post.save();
    
    // GHI LOG
    await logAction(req.user._id, 'SỬA', 'Bài Viết', `Đã ${post.isPinned ? 'ghim lên đầu' : 'bỏ ghim'} bài viết: "${post.title}"`);
    
    res.json({ message: post.isPinned ? 'Đã ghim bài viết lên đầu' : 'Đã bỏ ghim bài viết' });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết 1 bài viết (Chỉ lấy dữ liệu, KHÔNG CẦN GHI LOG)
// @route   GET /api/v1/posts/:id
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Không tìm thấy bài viết');
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
};