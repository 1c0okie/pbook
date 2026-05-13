import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { logAction } from './audit.controller.js'; // IMPORT HÀM GHI LOG
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';
import axios from 'axios';
import generateToken from '../utils/generateToken.js';  
// @desc    Lấy danh sách Wishlist
// @route   GET /api/v1/users/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Thêm/Xóa sách khỏi Wishlist
// @route   POST /api/v1/users/wishlist/toggle
// @access  Private
export const toggleWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const user = await User.findById(req.user._id);
    
    // Ép kiểu về toString() để so sánh chính xác giữa String và ObjectId
    const isExist = user.wishlist.some(id => id.toString() === bookId.toString());

    if (isExist) {
      // Dùng filter để lọc bỏ ID cũ thay vì dùng pull (an toàn hơn)
      user.wishlist = user.wishlist.filter(id => id.toString() !== bookId.toString());
    } else {
      user.wishlist.push(bookId);
    }

    await user.save();
    res.json({ message: 'Đã cập nhật Tủ sách yêu thích' });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách tất cả người dùng
// @route   GET /api/v1/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    // Không trả về password để bảo mật
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa người dùng
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      // Bảo vệ: Không cho phép Admin tự xóa chính mình hoặc xóa Admin khác
      if (user.isAdmin) {
        res.status(400);
        throw new Error('Hệ thống không cho phép xóa tài khoản Quản trị viên');
      }
      
      const userEmail = user.email; // Lưu lại email để ghi log
      await user.deleteOne();

      // [GHI LOG] - Admin xóa tài khoản
      await logAction(req.user._id, 'XÓA', 'Tài Khoản', `Admin đã xóa tài khoản người dùng: ${userEmail}`);

      res.json({ message: 'Đã xóa người dùng thành công' });
    } else {
      res.status(404);
      throw new Error('Không tìm thấy người dùng');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật quyền (Role) của người dùng
// @route   PUT /api/v1/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      // Không cho phép Admin tự hạ quyền của chính mình
      if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Bạn không thể tự thay đổi quyền của chính mình');
      }

      user.isAdmin = Boolean(req.body.isAdmin);
      await user.save();
      
      // [GHI LOG] - Admin đổi quyền
      await logAction(req.user._id, 'SỬA', 'Phân Quyền', `Admin đã phân quyền cho ${user.email} thành ${user.isAdmin ? 'Quản trị viên' : 'Khách hàng'}`);

      res.json({ message: 'Cập nhật phân quyền thành công' });
    } else {
      res.status(404);
      throw new Error('Không tìm thấy người dùng');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật thông tin cá nhân (Tên)
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstname = req.body.firstname || user.firstname;
      user.lastname = req.body.lastname || user.lastname;
      user.avatarUrl = req.body.avatarUrl || user.avatarUrl;
      const updatedUser = await user.save();

      // [GHI LOG] - User tự đổi thông tin (Có thể bỏ qua nếu sợ rác log, nhưng để quản lý chặt thì nên thêm)
      await logAction(req.user._id, 'SỬA', 'Hồ Sơ', `Đã cập nhật thông tin cá nhân/Avatar`);

      // Trả về thông tin mới để Frontend cập nhật State
      res.json({
        _id: updatedUser._id,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        avatarUrl: updatedUser.avatarUrl,
      });
    } else {
      res.status(404);
      throw new Error('Không tìm thấy người dùng');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Đổi mật khẩu
// @route   PUT /api/v1/users/password
// @access  Private
export const updateUserPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      // Kiểm tra mật khẩu cũ có khớp không
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        res.status(400);
        throw new Error('Mật khẩu cũ không chính xác');
      }

      // Gán mật khẩu mới (Mongoose pre('save') sẽ tự động mã hóa nó)
      user.password = newPassword;
      await user.save();

      // [GHI LOG] - User đổi mật khẩu
      await logAction(req.user._id, 'SỬA', 'Bảo Mật', `Đã thay đổi mật khẩu tài khoản`);

      res.json({ message: 'Đổi mật khẩu thành công' });
    } else {
      res.status(404);
      throw new Error('Không tìm thấy người dùng');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Thêm địa chỉ mới vào Sổ địa chỉ
// @route   POST /api/v1/users/addresses
export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new Error('Không tìm thấy người dùng');

    // Nếu đây là địa chỉ đầu tiên, tự động chọn làm mặc định
    if (user.addresses.length === 0) {
      req.body.isDefault = true;
    } else if (req.body.isDefault) {
      // Nếu tick chọn mặc định, gỡ mặc định của các địa chỉ cũ
      user.addresses.forEach(a => a.isDefault = false);
    }

    user.addresses.push(req.body);
    await user.save();
    
    // [GHI LOG] - Thêm địa chỉ
    await logAction(req.user._id, 'THÊM', 'Sổ Địa Chỉ', `Đã thêm địa chỉ giao hàng mới: ${req.body.city}`);

    // Trả về danh sách địa chỉ mới nhất
    res.status(201).json(user.addresses);
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật địa chỉ đã lưu
// @route   PUT /api/v1/users/addresses/:id
export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new Error('Không tìm thấy người dùng');

    // Tìm địa chỉ trong mảng bằng ID
    const address = user.addresses.id(req.params.id);
    if (!address) throw new Error('Không tìm thấy địa chỉ');

    // Cập nhật thông tin mới
    address.fullName = req.body.fullName || address.fullName;
    address.phone = req.body.phone || address.phone;
    address.city = req.body.city || address.city;
    address.address = req.body.address || address.address;

    await user.save();
    
    // [GHI LOG] - Sửa địa chỉ
    await logAction(req.user._id, 'SỬA', 'Sổ Địa Chỉ', `Đã cập nhật thông tin địa chỉ giao hàng`);

    // Trả về toàn bộ mảng địa chỉ mới
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa 1 địa chỉ
// @route   DELETE /api/v1/users/addresses/:id
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new Error('Không tìm thấy người dùng');

    // Lọc bỏ địa chỉ có ID trùng với ID truyền lên
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.id
    );

    // Xử lý thông minh: Nếu lỡ xóa mất địa chỉ mặc định, tự động gán địa chỉ đầu tiên làm mặc định (nếu còn)
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    // [GHI LOG] - Xóa địa chỉ
    await logAction(req.user._id, 'XÓA', 'Sổ Địa Chỉ', `Đã xóa một địa chỉ giao hàng`);

    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

// @desc    Đặt địa chỉ làm mặc định
// @route   PUT /api/v1/users/addresses/:id/default
export const setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new Error('Không tìm thấy người dùng');

    // Bước 1: Gỡ bỏ cờ isDefault của tất cả các địa chỉ
    user.addresses.forEach(a => a.isDefault = false);

    // Bước 2: Bật cờ isDefault cho địa chỉ được chọn
    const address = user.addresses.id(req.params.id);
    if (address) {
      address.isDefault = true;
    }

    await user.save();

    // [GHI LOG] - Đổi mặc định
    await logAction(req.user._id, 'SỬA', 'Sổ Địa Chỉ', `Đã thay đổi địa chỉ giao hàng mặc định`);

    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Đăng nhập bằng Google
// @route   POST /api/v1/users/google
export const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body; // Đây là access_token từ Frontend gửi xuống

    // 1. Xác thực token với máy chủ Google thông qua Axios
    const googleResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { email, given_name, family_name, picture } = googleResponse.data;

    // 2. Kiểm tra user trong DB
    let user = await User.findOne({ email });

    if (!user) {
      // XỬ LÝ LỖI LASTNAME BỊ TRỐNG TẠI ĐÂY
      // Nếu không có given_name, lấy name tổng. Nếu vẫn không có, gán là 'Người dùng'
      const finalFirstName = given_name || name || 'Người dùng'; 
      // Nếu không có family_name, gán là 'Google' (để vượt qua Mongoose required)
      const finalLastName = family_name || 'Google';       

      // 3. Tạo user mới
      user = await User.create({
        firstname: finalFirstName,
        lastname: finalLastName,
        email,
        password: Math.random().toString(36).slice(-8) + 'Aa1@', 
        avatarUrl: picture,
        addresses: [],
      });
    }

    // 4. Trả về thông tin và tạo token đăng nhập nội bộ cho hệ thống của bạn
    res.json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      avatarUrl: user.avatarUrl,
      addresses: user.addresses || [],
      isAdmin: user.isAdmin,
      token: generateToken(user._id), // Hàm tạo JWT của bạn
    });
  } catch (error) {
    console.error("Lỗi xác thực Google tại Backend:", error.response?.data || error.message);
    res.status(401);
    next(new Error('Xác thực Google thất bại'));
  }
};


// @desc    Quên mật khẩu (Gửi link vào Email)
// @route   POST /api/v1/users/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404);
      throw new Error('Không tìm thấy tài khoản với email này');
    }

    // 1. Tạo chuỗi token ngẫu nhiên (chưa mã hóa) để gửi cho user
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // 2. Mã hóa (Hash) token để lưu vào DB (bảo mật)
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Hết hạn sau 10 phút
    
    await user.save({ validateBeforeSave: false });

    // 3. Tạo URL để gửi vào email khách (Dùng token CHƯA mã hóa)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const message = `
      <div style="max-width: 600px; margin: auto; padding: 20px; font-family: sans-serif; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2563eb;">Yêu cầu đặt lại mật khẩu</h2>
        <p>Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu tại cửa hàng sách của chúng tôi.</p>
        <p>Vui lòng click vào nút bên dưới để tạo mật khẩu mới. Link này chỉ có hiệu lực trong <strong>10 phút</strong>:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Đổi Mật Khẩu Ngay</a>
        </div>
        <p style="color: #666; font-size: 12px;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Khôi phục mật khẩu tài khoản của bạn',
        html: message
      });
      res.json({ message: 'Vui lòng kiểm tra hộp thư email của bạn' });
    } catch (error) {
      // Nếu gửi mail lỗi thì xóa token trong DB
      console.log("LỖI GỐC TỪ NODEMAILER:", error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      res.status(500);
      throw new Error('Không thể gửi email lúc này');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Đặt lại mật khẩu mới
// @route   PUT /api/v1/users/reset-password/:token
export const resetPassword = async (req, res, next) => {
  try {
    // 1. Lấy token từ URL và mã hóa nó lại để so sánh với DB
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // 2. Tìm user có mã hash khớp và thời gian chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Link xác nhận không hợp lệ hoặc đã hết hạn');
    }

    // 3. Đổi mật khẩu
    user.password = req.body.password; // Model Schema tự động hash password trước khi lưu
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Cập nhật mật khẩu thành công. Hãy đăng nhập lại.' });
  } catch (error) {
    next(error);
  }
};