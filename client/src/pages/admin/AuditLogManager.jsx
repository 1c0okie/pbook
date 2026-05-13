import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { auditService } from '../../services/audit.service';

const AuditLogManager = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await auditService.getAll();
      setLogs(data);
    } catch (error) {
      toast.error('Lỗi tải nhật ký hệ thống');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Hàm render nhãn màu tùy theo loại hành động
  const getActionBadge = (action) => {
    switch (action.toUpperCase()) {
      case 'THÊM': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase">THÊM</span>;
      case 'SỬA': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase">SỬA</span>;
      case 'XÓA': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold uppercase">XÓA</span>;
      case 'ĐĂNG NHẬP': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold uppercase">LOGIN</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <i className="ri-history-line text-blue-600"></i> Nhật Ký Hoạt Động
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Lưu trữ lịch sử thao tác của tất cả quản trị viên và người dùng</p>
        </div>
        <button onClick={fetchLogs} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <i className="ri-refresh-line mr-1"></i> Làm mới
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold w-40">Thời gian</th>
                <th className="p-5 font-semibold w-48">Tài khoản</th>
                <th className="p-5 font-semibold w-24 text-center">Hành động</th>
                <th className="p-5 font-semibold w-40">Module</th>
                <th className="p-5 font-semibold">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center p-8">Đang tải dữ liệu...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Chưa có nhật ký nào được ghi lại.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-5 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {log.user ? `${log.user.lastname} ${log.user.firstname}` : 'Hệ thống'}
                      </div>
                      <div className="text-xs text-gray-500">{log.user?.email || ''}</div>
                    </td>
                    <td className="p-5 text-center">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="p-5 font-medium text-gray-700 dark:text-gray-300">
                      {log.resource}
                    </td>
                    <td className="p-5 text-gray-600 dark:text-gray-400">
                      {log.description}
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

export default AuditLogManager;