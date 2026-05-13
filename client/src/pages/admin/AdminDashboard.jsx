import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { orderService } from '../../services/order.service';
import { formatPrice } from '../../utils/format';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Lọc: 'all', 'thisMonth', 'lastMonth', 'custom'
  const [filterMonth, setFilterMonth] = useState('all');
  
  // State cho ngày tùy chỉnh
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const orderData = await orderService.getAll();
        setOrders(orderData);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu dashboard', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // --- HÀM LỌC DỮ LIỆU THEO THỜI GIAN ---
  const getFilteredOrders = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
      // Lọc theo khoảng ngày Tùy chỉnh
      if (filterMonth === 'custom') {
        let isValid = true;
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0); // Đưa về 00:00:00 của ngày bắt đầu
          if (orderDate < start) isValid = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // Đưa về 23:59:59 của ngày kết thúc
          if (orderDate > end) isValid = false;
        }
        return isValid;
      }

      // Các bộ lọc nhanh
      if (filterMonth === 'thisMonth') {
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      }
      if (filterMonth === 'lastMonth') {
        const targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return orderDate.getMonth() === targetMonth && orderDate.getFullYear() === targetYear;
      }
      return true; // 'all'
    });
  };

  const filteredOrders = getFilteredOrders();

  // --- TÍNH TOÁN KPI ---
  const totalRevenue = filteredOrders
    .filter(o => o.status === 'Đã giao' || o.status === 'Đang giao hàng')
    .reduce((acc, order) => acc + order.totalAmount, 0);
    
  const totalOrders = filteredOrders.length;
  const canceledOrders = filteredOrders.filter(o => o.status === 'Đã hủy').length;

  // --- TOP SÁCH BÁN CHẠY (Dựa trên số lượng) ---
  const getTopSellingBooks = () => {
    const bookMap = {};
    filteredOrders.forEach(order => {
      if (order.status === 'Đã hủy') return;
      order.orderItems.forEach(item => {
        if (!bookMap[item.title]) bookMap[item.title] = { name: item.title, count: 0 };
        bookMap[item.title].count += item.qty;
      });
    });
    return Object.values(bookMap).sort((a, b) => b.count - a.count).slice(0, 5);
  };

  // --- TOP KHÁCH HÀNG (Dựa trên chi tiêu) ---
  const getTopCustomers = () => {
    const customerMap = {};
    filteredOrders.forEach(order => {
      if (order.status === 'Đã hủy') return;
      const name = order.shippingAddress.fullName;
      if (!customerMap[name]) customerMap[name] = { name, spent: 0, count: 0 };
      customerMap[name].spent += order.totalAmount;
      customerMap[name].count += 1;
    });
    return Object.values(customerMap).sort((a, b) => b.spent - a.spent).slice(0, 5);
  };

  const processChartData = () => {
    const dataMap = {};
    [...filteredOrders].reverse().forEach(order => {
      if (order.status === 'Đã hủy') return;
      const date = new Date(order.createdAt).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' });
      if (!dataMap[date]) dataMap[date] = { name: date, DoanhThu: 0 };
      dataMap[date].DoanhThu += order.totalAmount;
    });
    return Object.values(dataMap);
  };

  if (isLoading) return <div className="p-8 text-center dark:text-white">Đang tải báo cáo...</div>;

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Filter */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Báo cáo kinh doanh</h2>
          <p className="text-gray-500 text-sm">Dữ liệu phân tích chuyên sâu của hệ thống</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Chọn ngày tùy chỉnh (Hiện ra khi bấm "Tùy chọn") */}
          {filterMonth === 'custom' && (
            <div className="flex items-center gap-2 animate-fade-in">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none text-gray-700 dark:text-white transition-colors focus:border-blue-500"
              />
              <span className="text-gray-400">→</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none text-gray-700 dark:text-white transition-colors focus:border-blue-500"
              />
            </div>
          )}

          {/* Nút lọc nhanh */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'thisMonth', label: 'Tháng này' },
              { id: 'lastMonth', label: 'Tháng trước' },
              { id: 'custom', label: 'Tùy chọn' }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setFilterMonth(btn.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterMonth === btn.id ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-600/20">
          <p className="text-blue-100 text-xs font-bold uppercase mb-1">Doanh Thu</p>
          <h3 className="text-2xl font-black">{formatPrice(totalRevenue)}</h3>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Tổng đơn</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">{totalOrders}</h3>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Đã hủy</p>
          <h3 className="text-2xl font-black text-red-500">{canceledOrders}</h3>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Khách mới</p>
          <h3 className="text-2xl font-black text-green-500">+12</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ Doanh Thu (2/3 chiều rộng) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Biến động doanh thu</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processChartData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip formatter={(v) => formatPrice(v)} />
                <Area type="monotone" dataKey="DoanhThu" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Sách Bán Chạy (1/3 chiều rộng) */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Top 5 sách bán chạy</h3>
          <div className="space-y-5">
            {getTopSellingBooks().map((book, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{idx + 1}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1 max-w-[150px]">{book.name}</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{book.count} cuốn</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Khách hàng chi tiêu mạnh nhất */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Khách hàng thân thiết</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-400 uppercase">
                  <th className="pb-4">Tên khách hàng</th>
                  <th className="pb-4">Số đơn</th>
                  <th className="pb-4 text-right">Tổng chi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {getTopCustomers().map((customer, idx) => (
                  <tr key={idx}>
                    <td className="py-4 text-sm font-bold text-gray-800 dark:text-white">{customer.name}</td>
                    <td className="py-4 text-sm text-gray-500">{customer.count} đơn</td>
                    <td className="py-4 text-sm font-black text-green-600 text-right">{formatPrice(customer.spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Sách đánh giá cao */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Sách được đánh giá tốt nhất</h3>
          <div className="space-y-4">
             {[
               { title: "Luật Kinh Doanh", rate: 5.0, count: 120 },
               { title: "Kỹ năng sống", rate: 4.8, count: 85 },
               { title: "Lập trình React", rate: 4.7, count: 64 }
             ].map((item, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                 <span className="text-sm font-bold text-gray-800 dark:text-white">{item.title}</span>
                 <div className="flex items-center gap-2">
                   <span className="text-yellow-500 font-bold">{item.rate}</span>
                   <i className="ri-star-fill text-yellow-500"></i>
                   <span className="text-xs text-gray-400">({item.count} đánh giá)</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;