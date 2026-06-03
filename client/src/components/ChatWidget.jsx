import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/chat.store';
import useAuthStore from '../store/auth.store';
import { Link } from 'react-router-dom';

const ChatWidget = () => {
  const { user } = useAuthStore();
  const { isOpen, closeChat, attachedBook, attachedOrder, clearAttachment, messages, sendMessage } = useChatStore();
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!user || !isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !attachedBook && !attachedOrder) return;

    const newMessage = {
      senderId: user._id,
      senderName: user.firstname,
      text: text,
      attachedBook: attachedBook || null,
      attachedOrder: attachedOrder || null,
      timestamp: new Date()
    };

    sendMessage(newMessage);
    setText('');
    clearAttachment(); 
  };

  return (
    <div className="fixed bottom-24 right-6 sm:right-8 w-[340px] max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-900 rounded-[24px] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 z-[9999] flex flex-col overflow-hidden animate-fade-in-up transition-all duration-300">
      
      {/* HEADER: Đã chuyển về bg-blue-600 để ăn khớp với theme */}
      <div className="bg-blue-600 p-4 flex justify-between items-center shadow-md z-10 transition-colors">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-lg shadow-inner">
              <i className="ri-customer-service-2-fill"></i>
            </div>
            
          </div>
          <div>
            <h3 className="font-bold text-white leading-tight">Pbook Hỗ trợ</h3>
            <p className="text-[11px] text-white/90">Chúng tôi trả lời trong vài phút</p>
          </div>
        </div>
        <button onClick={closeChat} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <i className="ri-subtract-line text-xl"></i>
        </button>
      </div>

      {/* BODY: Danh sách tin nhắn */}
      <div className="h-[360px] p-4 overflow-y-auto bg-slate-50/50 dark:bg-gray-950/50 flex flex-col gap-4 custom-scrollbar">
        
        {/* Tin nhắn chào mừng tự động */}
        <div className="flex flex-col items-start mt-2">
          <div className="p-3.5 rounded-2xl rounded-tl-sm text-sm max-w-[85%] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 shadow-sm">
            👋 Xin chào <b>{user.firstname}</b>! MERNBook có thể giúp gì cho bạn hôm nay?
          </div>
        </div>

        {messages.map((msg, index) => {
          const isMine = msg.senderId === user._id;
          return (
            <div key={index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} animate-fade-in`}>
              {/* BÓNG CHAT: Đã đổi bg-gradient thành bg-blue-600 để đổi theo theme */}
              <div className={`p-3.5 rounded-2xl text-[14px] max-w-[85%] shadow-sm leading-relaxed transition-colors ${isMine ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm'}`}>
                
                {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                
                {/* Đính kèm Sách */}
                {msg.attachedBook && (
                  <Link 
                    to={`/book/${msg.attachedBook._id}`} 
                    target="_blank"
                    className={`mt-2 p-2.5 transition-colors rounded-xl flex gap-3 items-center group relative cursor-pointer block ${isMine ? 'bg-black/15 hover:bg-black/25' : 'bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900'}`}
                  >
                    <img src={msg.attachedBook.imageUrl} alt="book" className="w-12 h-16 object-cover rounded-md shadow-sm border border-black/5 dark:border-white/5" />
                    <div className="flex-1 overflow-hidden">
                      <span className="font-semibold text-[13px] line-clamp-2 group-hover:underline">{msg.attachedBook.title}</span>
                      <span className={`text-[10px] mt-1 block flex items-center gap-1 ${isMine ? 'opacity-90 text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                        Xem chi tiết <i className="ri-arrow-right-up-line"></i>
                      </span>
                    </div>
                  </Link>
                )}

                {/* Đính kèm Đơn hàng */}
                {msg.attachedOrder && (
                  <Link 
                    to={`/profile?orderId=${msg.attachedOrder._id}`}
                    target="_blank"
                    className={`mt-2 p-3 transition-colors rounded-xl flex gap-3 items-center group cursor-pointer ${isMine ? 'bg-black/15 hover:bg-black/25' : 'bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900'}`}
                  >
                    {/* ICON ĐƠN HÀNG: Dùng bg-blue-100 và text-blue-600 */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${isMine ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                      <i className="ri-shopping-bag-3-fill text-lg"></i>
                    </div>
                    <div>
                      <span className="font-bold text-[13px] block group-hover:underline">Đơn hàng của bạn</span>
                      <span className={`text-[11px] font-mono ${isMine ? 'opacity-90' : 'text-gray-500'}`}>#{msg.attachedOrder._id?.substring(0, 8).toUpperCase()}</span>
                    </div>
                  </Link>
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-1.5 font-medium px-1">
                {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* FOOTER: Preview đính kèm trước khi gửi (Dùng bg-blue-50 để khớp theme) */}
      {(attachedBook || attachedOrder) && (
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 relative transition-colors">
          <button onClick={clearAttachment} className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/5 hover:bg-red-500 hover:text-white rounded-full text-gray-500 transition-all">
            <i className="ri-close-line"></i>
          </button>
          
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2 transition-colors">
            <i className="ri-attachment-2"></i> Đang đính kèm
          </span>
          
          {attachedBook && (
            <div className="flex gap-3 items-center bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <img src={attachedBook.imageUrl} alt="book" className="w-9 h-12 object-cover rounded shadow-sm" />
              <div className="text-[13px] font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight pr-4">{attachedBook.title}</div>
            </div>
          )}
          
          {attachedOrder && (
            <div className="flex gap-2 items-center bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-[13px] font-bold text-gray-800 dark:text-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center transition-colors">
                <i className="ri-file-list-3-fill"></i>
              </div>
              <span>Mã ĐH: #{attachedOrder._id.substring(0, 8).toUpperCase()}</span>
            </div>
          )}
        </div>
      )}

      {/* FOOTER: Input nhập liệu (Dùng focus:border-blue-500 để khớp theme) */}
      <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSend} className="flex gap-2 items-end relative">
          <textarea 
            rows="1"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Nhập tin nhắn..." 
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-[20px] px-4 py-3 outline-none text-[14px] dark:text-white border border-transparent focus:border-blue-500 dark:focus:border-blue-500 transition-colors resize-none max-h-24 custom-scrollbar"
          />
          <button 
            type="submit" 
            disabled={!text.trim() && !attachedBook && !attachedOrder}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:dark:bg-gray-700 text-white w-[46px] h-[46px] flex-shrink-0 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-md"
          >
            <i className="ri-send-plane-fill text-lg ml-1"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget;