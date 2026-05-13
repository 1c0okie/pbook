import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { contactService } from '../../services/contact.service';

const ContactManager = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const data = await contactService.getAll();
      setContacts(data);
    } catch (error) {
      toast.error('Lỗi tải danh sách liên hệ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleView = async (contact) => {
    setSelectedContact(contact);
    if (!contact.isRead) {
      try {
        await contactService.markRead(contact._id);
        fetchContacts(); // Reload để cập nhật trạng thái "đã đọc"
      } catch (error) { console.error(error); }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa liên hệ này?')) {
      try {
        await contactService.delete(id);
        toast.success('Đã xóa');
        fetchContacts();
      } catch (error) { toast.error('Lỗi khi xóa'); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Hộp Thư Liên Hệ</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Quản lý phản hồi và yêu cầu từ khách hàng</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Khách hàng</th>
                <th className="p-5 font-semibold">Chủ đề</th>
                <th className="p-5 font-semibold">Ngày gửi</th>
                <th className="p-5 font-semibold text-center">Trạng thái</th>
                <th className="p-5 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center p-8">Đang tải...</td></tr>
              ) : contacts.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8">Hộp thư trống.</td></tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact._id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${!contact.isRead ? 'font-bold bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                    <td className="p-5">
                      <div className="text-gray-900 dark:text-white">{contact.name}</div>
                      <div className="text-xs text-gray-500">{contact.email}</div>
                    </td>
                    <td className="p-5 text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{contact.subject}</td>
                    <td className="p-5 text-sm text-gray-500">{new Date(contact.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="p-5 text-center">
                      {contact.isRead ? 
                        <span className="text-gray-400 text-xs uppercase">Đã xem</span> : 
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-[10px] uppercase font-bold">Mới</span>
                      }
                    </td>
                    <td className="p-5 text-center flex justify-center gap-2">
                      <button onClick={() => handleView(contact)} className="text-blue-600 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><i className="ri-eye-line text-lg"></i></button>
                      <button onClick={() => handleDelete(contact._id)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><i className="ri-delete-bin-line text-lg"></i></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold dark:text-white">Chi Tiết Lời Nhắn</h3>
              <button onClick={() => setSelectedContact(null)} className="text-2xl text-gray-400 hover:text-gray-600"><i className="ri-close-line"></i></button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Người gửi</p>
                <p className="text-gray-900 dark:text-white">{selectedContact.name} ({selectedContact.email})</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Chủ đề</p>
                <p className="text-gray-900 dark:text-white font-bold">{selectedContact.subject}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Nội dung</p>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-700 dark:text-gray-300 leading-relaxed max-h-60 overflow-y-auto">
                  {selectedContact.message}
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedContact(null)} className="w-full mt-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 rounded-xl">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManager;