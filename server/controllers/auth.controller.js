import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { logAction } from './audit.controller.js'; // Nhớ import hàm ghi log
import generateToken from '../utils/generateToken.js';


export const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng!' });
    }

    const user = await User.create({ firstname, lastname, email, password });

    // === GHI LOG: KHÁCH ĐĂNG KÝ MỚI ===
    await logAction(
      user._id, // Truyền ID của user vừa mới tạo
      'THÊM', 
      'Tài Khoản', 
      `Người dùng đăng ký tài khoản mới: ${email}`
    );

    res.status(201).json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      isAdmin: user.isAdmin,
      avatarUrl: user.avatarUrl,
      addresses: user.addresses || [],
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      
      // === GHI LOG: ĐĂNG NHẬP ===
      await logAction(
        user._id, 
        'ĐĂNG NHẬP', 
        'Hệ Thống', 
        `Tài khoản ${email} vừa đăng nhập`
      );

      res.json({
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        isAdmin: user.isAdmin,
        avatarUrl: user.avatarUrl,
        addresses: user.addresses || [],
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không hợp lệ!' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy thông tin profile
// @route   GET /api/v1/auth/profile
// @access  Private (Cần JWT)
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      isAdmin: user.isAdmin,
      addresses: user.addresses || [],
    });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }
};