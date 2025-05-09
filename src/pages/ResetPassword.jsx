import { useParams, useNavigate } from 'react-router-dom'; // 🧭 added useNavigate
import { useState } from 'react';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate(); // 🧭 initialize navigator
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [strength, setStrength] = useState('');

  const checkStrength = (pwd) => {
    if (pwd.length < 6) return 'Weak';
    if (/[A-Z]/.test(pwd) && /\d/.test(pwd) && /[!@#$%^&*]/.test(pwd)) return 'Strong';
    return 'Medium';
  };

  const handlePasswordChange = (e) => {
    const newPwd = e.target.value;
    setPassword(newPwd);
    setStrength(checkStrength(newPwd));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Password does not match');
      return;
    }

    try {
      const res = await axios.post(`https://ovs-backend-1.onrender.com/api/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);

      // ✅ Redirect to login page after short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000); // delay to show message briefly

    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  const strengthColor = {
    Weak: 'text-red-500',
    Medium: 'text-yellow-500',
    Strong: 'text-green-500',
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-52">
      <h2 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Password Field */}
        <div className="mb-2">
          <label className="block mb-1 font-medium">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={handlePasswordChange}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <AiOutlineEyeInvisible size={24} /> : <AiOutlineEye size={24} />}
            </button>
          </div>
          {password && (
            <p className={`mt-1 text-sm ${strengthColor[strength]}`}>Strength: {strength}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className='mb-3'>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <AiOutlineEyeInvisible size={24} /> : <AiOutlineEye size={24} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Reset Password
        </button>

        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;
