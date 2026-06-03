import { create } from 'zustand';
import { io } from 'socket.io-client';
import { chatService } from '../services/chat.service';

const socket = io('http://localhost:5000', { autoConnect: false });
let storeListener = null;

const useChatStore = create((set, get) => ({
  isOpen: false,
  unreadCount: 0,
  
  // === THÊM STATE CHO ADMIN SIDEBAR ===
 // === SỬA ĐOẠN NÀY ===
  adminUnreadCount: 0,
  setAdminUnreadCount: (count) => set({ adminUnreadCount: count }), // Thêm hàm này để AdminChat tự đồng bộ lên
  isAdminChatOpen: false,
  setAdminChatOpen: (status) => set({ isAdminChatOpen: status }), // ĐÃ XÓA adminUnreadCount: 0 ở đây
  attachedBook: null,
  attachedOrder: null,
  messages: [],
  socket: socket,

  connectSocket: async (userId, isAdmin) => {
    const joinMyRooms = () => {
      socket.emit('join_room', userId);
      if (isAdmin) socket.emit('join_room', 'admin_room');
    };

    if (!socket.connected) {
      socket.connect();
    } else {
      joinMyRooms();
    }

    socket.off('connect');
    socket.on('connect', joinMyRooms); 

    if (!isAdmin) {
      try {
        const history = await chatService.getMessagesByUser(userId);
        set({ messages: history });
      } catch (error) {
        console.error('Lỗi tải lịch sử chat:', error);
      }
    }

    if (storeListener) {
      socket.off('receive_message', storeListener);
    }

    storeListener = (newMessage) => {
      set((state) => {
        const isExist = state.messages.find(m => m._id === newMessage._id || (m.timestamp === newMessage.timestamp && m.text === newMessage.text));
        if (isExist) return state;
        
        let newUnreadCount = state.unreadCount;
        let newAdminUnreadCount = state.adminUnreadCount;

        // Nếu là User thường và chat đang đóng
        if (!isAdmin && !state.isOpen) {
           newUnreadCount += 1;
        }
        
        // NẾU LÀ ADMIN, ĐANG Ở TRANG KHÁC, VÀ TIN NHẮN TỪ KHÁCH TỚI
        if (isAdmin && !state.isAdminChatOpen && newMessage.senderId !== userId) {
           newAdminUnreadCount += 1;
        }

        return { 
          messages: [...state.messages, newMessage],
          unreadCount: newUnreadCount,
          adminUnreadCount: newAdminUnreadCount
        };
      });
    };

    socket.on('receive_message', storeListener);
  },

  disconnectSocket: () => {
    socket.disconnect();
    if (storeListener) {
      socket.off('receive_message', storeListener);
      storeListener = null;
    }
    set({ messages: [] });
  },

  openChat: (attachment = {}) => set((state) => ({ 
    isOpen: true, 
    unreadCount: 0,
    attachedBook: attachment.book || state.attachedBook,
    attachedOrder: attachment.order || state.attachedOrder
  })),

  closeChat: () => set({ isOpen: false }),
  clearAttachment: () => set({ attachedBook: null, attachedOrder: null }),

  sendMessage: (messageData) => {
    socket.emit('send_message', messageData);
    set((state) => ({ messages: [...state.messages, messageData] }));
  }
}));

export default useChatStore;