import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Elections from './pages/Elections';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ElectionDetails from './pages/ElectionDetails';
import Navbar from './components/Navbar';

function App() {
  const { isLoggedIn, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Show navbar only on specific pages */}
      {(location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') && (
        <Navbar />
      )}

      <ToastContainer />
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Home />} />

        {/* Protected routes */}
        <Route
          path="/userdashboard"
          element={
            isLoggedIn && userRole === 'user' ? (
              <UserDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/elections"
          element={
            isLoggedIn && userRole === 'user' ? (
              <Elections />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/elections/:id"
          element={
            isLoggedIn && userRole === 'user' ? (
              <ElectionDetails />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin"
          element={
            isLoggedIn && userRole === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public routes */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to={userRole === 'admin' ? '/admin' : '/userdashboard'} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to="/userdashboard" replace />
            ) : (
              <Register />
            )
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 404 fallback */}
        <Route path="*" element={<div className="text-center mt-20 text-xl font-bold">404 Not Found</div>} />
      </Routes>
    </div>
  );
}

// Main entry with router wrapper
export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
