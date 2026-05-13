import Book from '../models/Book.js';
import Author from '../models/Author.js';
// 1. IMPORT HÀM GHI LOG VÀO ĐÂY:
import { logAction } from './audit.controller.js';

// @desc    Lấy danh sách sách (Có phân trang, tìm kiếm, lọc)
// @route   GET /api/v1/books
// @access  Public
export const getBooks = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.pageSize) || 12; 
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? { title: { $regex: req.query.keyword, $options: 'i' } } 
      : {};

    const categoryFilter = req.query.category ? { categories: req.query.category } : {};
    const query = { ...keyword, ...categoryFilter };
    const count = await Book.countDocuments(query);

    const books = await Book.find(query)
      .populate('author', 'name') 
      .populate('categories', 'name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 }); 

    res.json({
      books,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết 1 quyển sách
// @route   GET /api/v1/books/:id
// @access  Public
export const getBookById = async (req, res, next) => {
 
  try {
    const book = await Book.findById(req.params.id)
      .populate('author', 'name bio')
      .populate('categories', 'name');

    if (book) {
      res.json(book);
    } else {
      res.status(404);
      throw new Error('Không tìm thấy sách');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Thêm mới sách
// @route   POST /api/v1/books
// @access  Private/Admin
export const createBook = async (req, res, next) => {
  try {
    const bookData = req.body;
    const book = await Book.create(bookData);

    if (bookData.author) {
      await Author.findByIdAndUpdate(bookData.author, {
        $push: { books: book._id }
      });
    }

    // [GHI LOG] - ADMIN THÊM SÁCH
    await logAction(req.user._id, 'THÊM', 'Sản Phẩm', `Đã thêm sách mới: "${book.title}"`);

    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật sách
// @route   PUT /api/v1/books/:id
// @access  Private/Admin
export const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      const oldAuthorId = book.author;
      const updatedBook = await Book.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { returnDocument: 'after', runValidators: true } 
      );

      if (req.body.author && String(oldAuthorId) !== String(req.body.author)) {
        if (oldAuthorId) {
          await Author.findByIdAndUpdate(oldAuthorId, { $pull: { books: book._id } });
        }
        await Author.findByIdAndUpdate(req.body.author, { $push: { books: book._id } });
      }

      // [GHI LOG] - ADMIN CẬP NHẬT SÁCH
      await logAction(req.user._id, 'SỬA', 'Sản Phẩm', `Đã cập nhật thông tin sách: "${updatedBook.title}"`);

      res.json(updatedBook);
    } else {
      res.status(404);
      throw new Error('Không tìm thấy sách');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa sách
// @route   DELETE /api/v1/books/:id
// @access  Private/Admin
export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      if (book.author) {
        await Author.findByIdAndUpdate(book.author, { $pull: { books: book._id } });
      }

      await Book.deleteOne({ _id: book._id });

      // [GHI LOG] - ADMIN XÓA SÁCH
      await logAction(req.user._id, 'XÓA', 'Sản Phẩm', `Đã xóa sách: "${book.title}"`);

      res.json({ message: 'Đã xóa sách thành công' });
    } else {
      res.status(404);
      throw new Error('Không tìm thấy sách');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Đồng bộ giỏ hàng (Self-healing Cart)
// @route   POST /api/v1/books/sync-cart
// @access  Public
export const syncCart = async (req, res, next) => {
  try {
    const { cartItems } = req.body; 

    if (!cartItems || cartItems.length === 0) {
      return res.json([]);
    }

    const bookIds = cartItems.map(item => item.book);
    const booksInDb = await Book.find({ _id: { $in: bookIds } });

    const syncedCart = [];
    let hasChanges = false; 

    cartItems.forEach(cartItem => {
      const realBook = booksInDb.find(b => b._id.toString() === cartItem.book);
      
      if (realBook) {
        let validQty = cartItem.qty;
        if (realBook.quantityInStock < cartItem.qty) {
          validQty = realBook.quantityInStock;
          hasChanges = true;
        }

        if (validQty > 0) {
          syncedCart.push({
            book: realBook._id,
            title: realBook.title,
            imageUrl: realBook.imageUrl,
            price: realBook.sale_price > 0 ? realBook.sale_price : realBook.price,
            qty: validQty,
            countInStock: realBook.quantityInStock
          });
        } else {
          hasChanges = true; 
        }
      } else {
        hasChanges = true; 
      }
    });

    res.json({ syncedCart, hasChanges });
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo đánh giá sách (Review & Rating)
// @route   POST /api/v1/books/:id/reviews
// @access  Private (Chỉ user đã đăng nhập)
export const createBookReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const book = await Book.findById(req.params.id);

    if (book) {
      const alreadyReviewed = book.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error('Bạn đã đánh giá quyển sách này rồi');
      }

      const review = {
        name: `${req.user.lastname} ${req.user.firstname}`,
        avatarUrl: req.user.avatarUrl || "",
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      book.reviews.push(review);
      book.numReviews = book.reviews.length;
      book.rating = book.reviews.reduce((acc, item) => item.rating + acc, 0) / book.reviews.length;

      await book.save();

      // [GHI LOG] - NGƯỜI DÙNG ĐÁNH GIÁ SÁCH
      await logAction(req.user._id, 'THÊM', 'Đánh Giá', `Đã gửi đánh giá ${rating} sao cho sách: "${book.title}"`);

      res.status(201).json({ message: 'Đã gửi đánh giá thành công' });
    } else {
      res.status(404);
      throw new Error('Không tìm thấy sách');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật đánh giá sách
// @route   PUT /api/v1/books/:id/reviews
// @access  Private (Chỉ user đã đăng nhập và là chủ của đánh giá)
export const updateBookReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const book = await Book.findById(req.params.id);

    if (book) {
      const reviewIndex = book.reviews.findIndex(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (reviewIndex !== -1) {
        book.reviews[reviewIndex].rating = Number(rating);
        book.reviews[reviewIndex].comment = comment;
        book.rating = book.reviews.reduce((acc, item) => item.rating + acc, 0) / book.reviews.length;

        await book.save();

        // [GHI LOG] - NGƯỜI DÙNG CẬP NHẬT ĐÁNH GIÁ SÁCH
        await logAction(req.user._id, 'SỬA', 'Đánh Giá', `Đã cập nhật đánh giá thành ${rating} sao cho sách: "${book.title}"`);

        res.json({ message: 'Cập nhật đánh giá thành công' });
      } else {
        res.status(404);
        throw new Error('Không tìm thấy đánh giá của bạn để sửa');
      }
    } else {
      res.status(404);
      throw new Error('Không tìm thấy sách');
    }
  } catch (error) {
    next(error);
  }
};
// @desc    Lấy toàn bộ đánh giá tốt trên toàn hệ thống (Dùng cho trang chủ)
// @route   GET /api/v1/books/reviews/all
// @access  Public
export const getAllSystemReviews = async (req, res, next) => {
  try {
    // Dùng Aggregation Pipeline của MongoDB để "bóc" mảng reviews ra
    const reviews = await Book.aggregate([
      // 1. Tách mỗi phần tử trong mảng reviews thành 1 document riêng biệt
      { $unwind: '$reviews' },
      
      // 2. Chỉ lấy những đánh giá từ 4 sao trở lên (Tùy chọn)
      { $match: { 'reviews.rating': { $gte: 4 } } },
      
      // 3. Sắp xếp lấy những đánh giá mới nhất
      { $sort: { 'reviews.createdAt': -1 } },
      
      // 4. Giới hạn số lượng hiển thị trên trang chủ (Ví dụ: 10 đánh giá)
      { $limit: 10 },
      
      // 5. Định dạng lại dữ liệu trả về cho Frontend dễ đọc
      {
        $project: {
          _id: '$reviews._id',
          userName: '$reviews.name',
          avatar: '$reviews.avatarUrl',
          rating: '$reviews.rating',
          comment: '$reviews.comment',
          bookTitle: '$title', // Lấy tên sách chứa review này
          bookId: '$_id',
          createdAt: '$reviews.createdAt'
        }
      }
    ]);

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
};