import api from '../utils/api';

export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file); // 'image' phải khớp với upload.single('image') ở Backend

    // Phải set header Content-Type cho form chứa file
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};