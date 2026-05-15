import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { userService } from '../../services/user.service';
import useAuthStore from '../../store/auth.store';
import { useSearchParams } from 'react-router-dom';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuthStore(); // Lấy thông tin admin đang đăng nhập để tránh tự khóa mình

  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || '';

  // Logic lọc giữ nguyên không cần đổi
  const filteredUsers = users.filter(user => 
    `${user.lastname} ${user.firstname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này không? Hành động này không thể hoàn tác!')) {
      try {
        await userService.deleteUser(id);
        toast.success('Xóa người dùng thành công');
        fetchUsers(); // Tải lại danh sách
      } catch (error) {
        toast.error(error.response?.data?.message || 'Có lỗi khi xóa người dùng');
      }
    }
  };

  const handleRoleChange = async (id, newRoleStatus) => {
    try {
      await userService.updateUserRole(id, newRoleStatus);
      toast.success('Cập nhật quyền thành công');
      fetchUsers(); // Tải lại danh sách
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi khi cập nhật quyền');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý Khách Hàng</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Quản lý tài khoản và phân quyền hệ thống</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl font-bold">
          {/* SỬA CHỖ NÀY 1: Đổi users.length thành filteredUsers.length */}
          Tổng cộng: {filteredUsers.length}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Tên người dùng</th>
                <th className="p-5 font-semibold">Email</th>
                <th className="p-5 font-semibold">Ngày đăng ký</th>
                <th className="p-5 font-semibold">Quyền (Role)</th>
                <th className="p-5 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : filteredUsers.length === 0 ? (
                // SỬA CHỖ NÀY ĐỂ BÁO NẾU TÌM KHÔNG THẤY
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Không tìm thấy người dùng nào.</td></tr>
              ) : (
                // SỬA CHỖ NÀY 2: Đổi users.map thành filteredUsers.map
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                          {user.firstname?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {user.lastname} {user.firstname}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="p-5 text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-5">
                      {user._id === currentUser?._id ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold">
                          (Bạn) Admin
                        </span>
                      ) : (
                        <select 
                          value={user.isAdmin}
                          onChange={(e) => handleRoleChange(user._id, e.target.value === 'true')}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer transition-colors ${user.isAdmin ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                        >
                          <option value="false">Khách hàng</option>
                          <option value="true">Quản trị viên</option>
                        </select>
                      )}
                    </td>
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => handleDelete(user._id)}
                        disabled={user.isAdmin} // Không cho xóa Admin
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={user.isAdmin ? "Không thể xóa Admin" : "Xóa người dùng"}
                      >
                        <i className="ri-delete-bin-line text-lg"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManager;