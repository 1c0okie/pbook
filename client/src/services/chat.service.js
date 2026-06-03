import api from '../utils/api';

export const chatService = {
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },
  getMessagesByUser: async (userId) => {
    const response = await api.get(`/chat/${userId}`);
    return response.data;
  }
};