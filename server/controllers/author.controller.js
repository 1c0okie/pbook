import Author from '../models/Author.js';
import Book from '../models/Book.js'; // Đảm bảo bạn đã import Book để dùng cho hàm getAuthorDetails
import { logAction } from './audit.controller.js'; // <-- 1. IMPORT HÀM GHI LOG

// @desc    Lấy tất cả tác giả
// @route   GET /api/v1/authors
// @access  Public
export const getAllAuthors = async (req, res, next) => {
  try {
    const authors = await Author.find({});
    res.json(authors);
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết 1 tác giả
// @route   GET /api/v1/authors/:id
// @access  Public
export const getAuthorById = async (req, res, next) => {
  try {
    // Populate để lấy luôn thông tin cơ bản của các sách thuộc tác giả này
    const author = await Author.findById(req.params.id).populate('books', 'title imageUrl price');
    if (author) {
      res.json(author);
    } else {
      res.status(404);
      throw new Error('Không tìm thấy tác giả');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Thêm mới tác giả
// @route   POST /api/v1/authors
// @access  Private/Admin
export const createAuthor = async (req, res, next) => {
  try {
    const { name, bio, avatarUrl } = req.body;
    const author = await Author.create({ name, bio, avatarUrl });
    
    // <-- 2. GHI LOG: THÊM TÁC GIẢ -->
    await logAction(req.user._id, 'THÊM', 'Tác Giả', `Đã thêm tác giả mới: "${author.name}"`);

    res.status(201).json(author);
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật thông tin tác giả
// @route   PUT /api/v1/authors/:id
// @access  Private/Admin
export const updateAuthor = async (req, res, next) => {
  try {
    const { name, bio, avatarUrl } = req.body;
    const author = await Author.findById(req.params.id);

    if (author) {
      author.name = name || author.name;
      author.bio = bio || author.bio;
      author.avatarUrl = avatarUrl || author.avatarUrl;

      const updatedAuthor = await author.save();

      // <-- 3. GHI LOG: SỬA TÁC GIẢ -->
      await logAction(req.user._id, 'SỬA', 'Tác Giả', `Đã cập nhật thông tin tác giả: "${updatedAuthor.name}"`);

      res.json(updatedAuthor);
    } else {
      res.status(404);
      throw new Error('Không tìm thấy tác giả');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa tác giả
// @route   DELETE /api/v1/authors/:id
// @access  Private/Admin
export const deleteAuthor = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);
    if (author) {
      await Author.deleteOne({ _id: author._id });

      // <-- 4. GHI LOG: XÓA TÁC GIẢ -->
      await logAction(req.user._id, 'XÓA', 'Tác Giả', `Đã xóa tác giả: "${author.name}"`);

      res.json({ message: 'Đã xóa tác giả thành công' });
    } else {
      res.status(404);
      throw new Error('Không tìm thấy tác giả');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy thông tin Tác giả VÀ danh sách Sách của họ
// @route   GET /api/v1/authors/:id/details
// @access  Public
export const getAuthorDetails = async (req, res, next) => {
  try {
    const authorId = req.params.id;

    // 1. Lấy thông tin tác giả
    const author = await Author.findById(authorId);
    if (!author) {
      res.status(404);
      throw new Error('Không tìm thấy tác giả này');
    }

    // 2. Tìm tất cả sách có field author trùng với authorId
    const books = await Book.find({ author: authorId })
                            .populate('category', 'name') // Lấy thêm tên danh mục nếu cần
                            .sort({ createdAt: -1 });

    // Trả về cả 2
    res.json({
      author,
      books
    });
  } catch (error) {
    next(error);
  }
};