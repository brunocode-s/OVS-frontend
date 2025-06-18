import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/useAuth';
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
// import BiometricSetup from './pages/Biometric

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [], redirectTo = '/login' }) {
  const { isLoggedIn, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Public Route Component (redirects if already logged in)
function PublicRoute({ children }) {
  const { isLoggedIn, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (isLoggedIn) {
    // Handle redirect after any type of login (password, fingerprint, etc.)
    const redirectPath = userRole === 'admin' ? '/admin' : '/userdashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

// // Redirect helper for post-login navigation
// function usePostLoginRedirect() {
//   const { userRole } = useAuth();
  
//   const redirectToDashboard = () => {
//     const path = userRole === 'admin' ? '/admin' : '/userdashboard';
//     return <Navigate to={path} replace />;
//   };

//   return redirectToDashboard;
// }

function App() {
  const { loading } = useAuth();
  const location = useLocation();

  // Define pages where navbar should be shown
  const showNavbarPaths = ['/', '/login', '/register', '/forgot-password'];
  const shouldShowNavbar = showNavbarPaths.includes(location.pathname) || 
                          location.pathname.startsWith('/reset-password');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Conditional navbar rendering */}
      {shouldShowNavbar && <Navbar />}

      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected User Routes */}
        <Route
          path="/userdashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/elections"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Elections />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/elections/:id"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <ElectionDetails />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized page */}
        <Route 
          path="/unauthorized" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized</h1>
                <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
                <button 
                  onClick={() => window.history.back()} 
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Go Back
                </button>
              </div>
            </div>
          } 
        />

        {/* 404 fallback */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-4">Page Not Found</p>
                <button 
                  onClick={() => window.location.href = '/'} 
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Go Home
                </button>
              </div>
            </div>
          } 
        />
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