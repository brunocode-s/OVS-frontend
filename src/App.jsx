import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Elections from './pages/Elections';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ElectionDetails from './pages/ElectionDetails';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Navbar from './components/Navbar';

function App() {
  const { isLoggedIn, userRole } = useAuth();
  const location = useLocation(); // Use useLocation hook to get the current path

  // Function to check if the user is logged in
  const checkIsLoggedIn = () => !!localStorage.getItem('token');

  return (
    <div>
      {/* Display Navbar only on Home, Login, and Register pages */}
      {location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register' ? <Navbar /> : null}

      <ToastContainer />
      <Routes>
        {/* Home route */}
        <Route path="/" element={<Home />} />

        {/* Route for user dashboard */}
        <Route 
          path="/userdashboard" 
          element={checkIsLoggedIn() && userRole === 'user' ? <UserDashboard /> : <Login />}
        />
        
        {/* Route for elections */}
        <Route 
          path="/elections" 
          element={checkIsLoggedIn() && userRole === 'user' ? <Elections /> : <Login />} 
        />
        
        {/* Admin routes */}
        <Route 
          path="/admin" 
          element={checkIsLoggedIn() && userRole === 'admin' ? <AdminDashboard /> : <Login />}
        />

        {/* Routes for login and register */}
        <Route path="/login" element={isLoggedIn ? <UserDashboard /> : <Login />} />
        <Route path="/register" element={isLoggedIn ? <UserDashboard /> : <Register />} />
        
        {/* Route for forgot password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Route for reset password */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Route for election details */}
        <Route 
          path="/elections/:id" 
          element={checkIsLoggedIn() && userRole === 'user' ? <ElectionDetails /> : <Login />}
        />

        {/* 404 Route */}
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
