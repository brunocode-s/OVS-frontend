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
  const { isLoggedIn, userRole } = useAuth();
  const location = useLocation();

  return (
    <div>
      {/* Show navbar only on specific pages */}
      {(location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') && (
        <Navbar />
      )}

      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* PROTECTED ROUTES */}
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
          path="/admin"
          element={
            isLoggedIn && userRole === 'admin' ? (
              <AdminDashboard />
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

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={isLoggedIn ? <Navigate to={userRole === 'admin' ? '/admin' : '/userdashboard'} replace /> : <Login />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/userdashboard" replace /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 404 fallback */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </div>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
