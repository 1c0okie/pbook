import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../../store/chat.store';
import useAuthStore from '../../store/auth.store';
import { chatService } from '../../services/chat.service';
import { Link } from 'react-router-dom';

const AdminChat = () => {
  const { user } = useAuthStore();
  const { socket, connectSocket, setAdminChatOpen , setAdminUnreadCount} = useChatStore(); 
  
  const [customers, setCustomers] = useState([]); 
  const [activeUser, setActiveUser] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  // Báo cho Store biết là đang mở trang AdminChat
  useEffect(() => {
    setAdminChatOpen(true);
    return () => setAdminChatOpen(false); 
  }, [setAdminChatOpen]);
  useEffect(() => {
    const totalUnread = customers.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    setAdminUnreadCount(totalUnread);
  }, [customers, setAdminUnreadCount]);

  useEffect(() => {
    if (user && user.isAdmin) connectSocket(user._id, true);
  }, [user, connectSocket]);

  // Lấy danh sách (Giờ đã có unreadCount chuẩn từ Database)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await chatService.getConversations();
        setCustomers(data);
      } catch (error) { console.error("Lỗi lấy danh sách chat:", error); }
    };
    fetchConversations();
  }, []);

  // Lấy tin nhắn
  useEffect(() => {
    if (!activeUser) return;
    const fetchMessages = async () => {
      try {
        const data = await chatService.getMessagesByUser(activeUser._id);
        setMessages(data);
      } catch (error) { console.error("Lỗi lấy lịch sử chat:", error); }
    };
    fetchMessages();
  }, [activeUser]);

  // Lắng nghe tin mới và đếm số
  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = (newMessage) => {
      const isCurrentlyActive = activeUser && (newMessage.senderId === activeUser._id || newMessage.receiverId === activeUser._id);

      if (isCurrentlyActive) {
        setMessages((prev) => [...prev, newMessage]);
      }
      
      if (newMessage.senderId !== user._id) {
        setCustomers((prev) => {
          const filteredList = prev.filter(c => c._id !== newMessage.senderId);
          const existingCustomer = prev.find(c => c._id === newMessage.senderId);
          
          const customerData = existingCustomer || { 
            _id: newMessage.senderId, 
            firstname: newMessage.senderName || 'Khách', 
            lastname: 'Mới',
            unreadCount: 0
          };
          
          if (!isCurrentlyActive) {
            customerData.unreadCount = (customerData.unreadCount || 0) + 1;
          }
          
          return [customerData, ...filteredList]; 
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    return () => socket.off('receive_message', handleReceiveMessage);
  }, [socket, activeUser, user._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectUser = (customer) => {
    setActiveUser(customer);
    setCustomers(prev => prev.map(c => c._id === customer._id ? { ...c, unreadCount: 0 } : c));
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUser) return;

    const replyMsg = {
      senderId: user._id, 
      senderName: "Admin",
      receiverId: activeUser._id, 
      text: text,
      timestamp: new Date()
    };

    socket.emit('send_message', replyMsg);
    setMessages((prev) => [...prev, replyMsg]);
    setText('');
    
    setCustomers((prev) => {
       const filtered = prev.filter(c => c._id !== activeUser._id);
       const current = prev.find(c => c._id === activeUser._id);
       return [current, ...filtered];
    });
  };

  return (
    <div className="flex h-[85vh] bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 transition-colors">
      
      {/* CỘT TRÁI */}
      <div className="w-[380px] border-r border-gray-100 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
            <i className="ri-message-3-fill text-blue-600"></i> Tin nhắn
          </h2>
          <span className="text-xs font-bold bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
            {customers.length} hội thoại
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
           {customers.map((customer) => {
             const isActive = activeUser?._id === customer._id;
             const hasUnread = customer.unreadCount > 0;
             
             return (
               <div 
                  key={customer._id}
                  onClick={() => handleSelectUser(customer)}
                  // BỔ SUNG GIAO DIỆN MÀU ĐỎ KHI CÓ TIN NHẮN CHƯA ĐỌC TẠI ĐÂY
                  className={`p-3 rounded-2xl cursor-pointer flex items-center gap-4 transition-all duration-200 border ${
                    isActive 
                      ? 'bg-blue-600 text-white border-transparent shadow-md shadow-blue-600/20' 
                      : hasUnread 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40' 
                        : 'border-transparent hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                >
                 
                 <div className="relative">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden shadow-sm transition-colors ${
                     isActive ? 'bg-white/20 text-white border border-white/20' 
                     : hasUnread ? 'bg-red-200/50 text-red-600 dark:text-red-400' 
                     : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-transparent'
                   }`}>
                     {customer.avatarUrl ? <img src={customer.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : customer.firstname?.charAt(0) || 'K'}
                   </div>

                
                  
                 </div>
                 
                 <div className="flex-1 overflow-hidden">
                   <div className="flex justify-between items-center mb-0.5">
                     <p className={`font-bold truncate text-[15px] ${isActive ? 'text-white' : hasUnread ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                       {customer.lastname} {customer.firstname}
                     </p>
                   </div>
                   <p className={`text-[13px] truncate ${isActive ? 'text-blue-100' : hasUnread ? 'font-bold text-red-500' : 'text-gray-500'}`}>
                     {hasUnread ? 'Có tin nhắn mới chưa đọc!' : `ID: ${customer._id.substring(0,8)}`}
                   </p>
                 </div>

                 {/* CỤC BADGE SỐ LƯỢNG TIN NHẮN */}
                 {hasUnread && !isActive && (
                   <div className="w-6 h-6 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center shadow-sm">
                     {customer.unreadCount > 9 ? '9+' : customer.unreadCount}
                   </div>
                 )}
               </div>
             )
           })}
        </div>
      </div>

      {/* CỘT PHẢI */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 transition-colors">
        
        {activeUser ? (
          <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm z-10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold text-lg overflow-hidden">
                {activeUser.avatarUrl ? <img src={activeUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : activeUser.firstname?.charAt(0) || 'K'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                  {activeUser.lastname || ''} {activeUser.firstname || 'Khách'}
                </h3>
                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Đang kết nối
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 h-[89px] flex items-center">
            <p className="text-gray-400 font-medium">Chưa chọn đoạn chat nào</p>
          </div>
        )}
        
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar bg-slate-50/30 dark:bg-gray-950/50">
          {!activeUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <i className="ri-message-3-line text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">PBook Chat</h3>
              <p className="text-sm text-gray-500 mt-2">Chọn một khách hàng ở cột trái để bắt đầu hỗ trợ</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Chưa có tin nhắn nào. Hãy gửi lời chào!</div>
          ) : (
            messages.map((msg, index) => {
              const isAdmin = msg.senderId === user._id;
              return (
                <div key={index} className={`flex flex-col animate-fade-in-up ${isAdmin ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3.5 px-4 rounded-2xl text-[15px] max-w-[75%] shadow-sm leading-relaxed transition-colors ${isAdmin ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm'}`}>
                    
                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                    
                    {msg.attachedBook && (
                      <Link to={`/book/${msg.attachedBook._id}`} target="_blank" className={`mt-3 p-2 transition-colors rounded-xl flex gap-3 items-center cursor-pointer group ${isAdmin ? 'bg-black/15 hover:bg-black/25' : 'bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900'}`}>
                        <img src={msg.attachedBook.imageUrl} alt="book" className="w-12 h-16 object-cover rounded-md shadow-sm" />
                        <div className="flex-1 overflow-hidden">
                          <span className="font-bold text-[14px] line-clamp-2 group-hover:underline">{msg.attachedBook.title}</span>
                          <span className={`text-[11px] mt-1 block flex items-center gap-1 ${isAdmin ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>
                            <i className="ri-external-link-line"></i> Xem chi tiết
                          </span>
                        </div>
                      </Link>
                    )}

                    {msg.attachedOrder && (
                     <Link to={`/admin/orders?q=${msg.attachedOrder._id}`} target="_blank" className={`mt-3 p-3 transition-colors rounded-xl flex gap-3 items-center cursor-pointer group ${isAdmin ? 'bg-black/15 hover:bg-black/25' : 'bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isAdmin ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'}`}>
                          <i className="ri-shopping-bag-3-fill text-xl"></i>
                        </div>
                        <div>
                          <span className="font-bold text-[14px] block group-hover:underline">Chi tiết đơn hàng</span>
                          <span className={`text-[12px] font-mono mt-0.5 block ${isAdmin ? 'text-blue-100' : 'text-gray-500'}`}>
                            #{msg.attachedOrder._id?.substring(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <i className={`ri-external-link-line ml-auto ${isAdmin ? 'text-blue-200' : 'text-gray-400'}`}></i>
                      </Link>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1.5 font-medium px-1">
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors">
          <form onSubmit={handleReply} className="flex gap-3 items-end relative max-w-4xl mx-auto">
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-[24px] border border-transparent focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors flex items-center pr-2">
              <input 
                type="text" 
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={!activeUser}
                placeholder={activeUser ? "Nhập câu trả lời cho khách..." : "Vui lòng chọn hội thoại..."}
                className="w-full bg-transparent px-5 py-3.5 outline-none text-[15px] dark:text-white disabled:opacity-50"
              />
            </div>
            
            <button type="submit" disabled={!activeUser || !text.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:dark:bg-gray-800 text-white w-[52px] h-[52px] flex-shrink-0 rounded-full flex items-center justify-center font-bold transition-all active:scale-90 shadow-md disabled:shadow-none">
               <i className="ri-send-plane-fill text-xl ml-1"></i>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminChat;