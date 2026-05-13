// Xử lý khi user truy cập route không tồn tại (404)
export const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Bắt tất cả các lỗi trong app và trả về JSON
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Lỗi CastError của Mongoose (ID không hợp lệ)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Không tìm thấy tài nguyên (ID không hợp lệ)';
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};