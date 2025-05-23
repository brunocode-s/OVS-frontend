import axios from 'axios';
import { toast } from 'react-toastify';

const API = axios.create({
  baseURL: 'https://ovs-backend-1.onrender.com/api',
  withCredentials: true, // Include credentials like cookies if needed
  timeout: 10000, // Set a timeout for request
});

// Request Interceptor: Add token to headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // Skip adding token for WebAuthn session-based endpoints
    const webauthnRoutes = [
      '/webauthn/generate-registration-options',
      '/webauthn/verify-registration',
      '/webauthn/generate-authentication-options',
      '/webauthn/verify-authentication',
      '/webauthn/check-registration',
    ];

    const isWebAuthnRoute = webauthnRoutes.some((path) =>
      config.url?.includes(path)
    );

    if (token && !isWebAuthnRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// Response Interceptor: Handle expired token or general error
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // Handle token expiration (401)
      if (status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login'; // Redirect to login page
      }
      // Handle other status codes
      else if (status === 404) {
        toast.error('Resource not found.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Something went wrong.');
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default API;
