import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1', // URL Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor tự động thêm JWT token vào header
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;