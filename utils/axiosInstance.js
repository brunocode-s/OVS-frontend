import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL, 
  headers: {
    'Content-Type': 'application/json',  // Default headers for JSON
  },
  withCredentials: true,  // Include credentials (cookies) in requests
});

// Optional: You can add interceptors here to manage request or response globally
axiosInstance.interceptors.request.use(config => {
  // If you need to send an auth token in headers, for example
  const token = localStorage.getItem('token');  // Or retrieve it from another store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Export the instance
export default axiosInstance;
