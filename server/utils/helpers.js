import Order from '../models/Order.js';

/**
 * Hàm dùng chung: Gắn danh sách người mua thật vào mảng sách
 * @param {Array} books - Mảng các cuốn sách (đã được .lean())
 * @returns {Array} - Mảng sách đã được thêm trường `buyers`
 */
export const attachBuyersToBooks = async (books) => {
  if (!books || books.length === 0) return [];

  // 1. Lấy ra danh sách tất cả ID của các cuốn sách truyền vào
  const bookIds = books.map(book => book._id);

  // 2. TỐI ƯU HÓA: Chỉ gọi DB 1 lần để quét TẤT CẢ đơn hàng chứa các ID sách này
  const orders = await Order.find({
    'orderItems.book': { $in: bookIds },
    status: { $ne: 'Đã hủy' } // Bỏ qua đơn hủy
  })
  .populate('user', 'firstname lastname avatarUrl')
  .lean();

  // 3. Phân loại người mua theo từng ID sách
  // Cấu trúc: { "id_sách_1": { "id_user_A": userA, "id_user_B": userB } }
  const buyersMap = {}; 

  orders.forEach(order => {
    if (!order.user) return; // Bỏ qua nếu user đã bị xóa khỏi hệ thống

    order.orderItems.forEach(item => {
      const bId = item.book.toString();
      
      // Nếu sách này có trong danh sách cần tìm
      if (bookIds.some(id => id.toString() === bId)) {
        if (!buyersMap[bId]) buyersMap[bId] = {};
        
        // Gán user vào map (dùng object key là user._id để tự động loại bỏ trùng lặp nếu 1 người mua 2 lần)
        buyersMap[bId][order.user._id.toString()] = order.user;
      }
    });
  });

  // 4. Lắp ghép danh sách người mua vào lại mảng sách ban đầu
  return books.map(book => {
    const bId = book._id.toString();
    const uniqueBuyers = buyersMap[bId] ? Object.values(buyersMap[bId]) : [];
    
    return {
      ...book,
      buyers: uniqueBuyers
    };
  });
};