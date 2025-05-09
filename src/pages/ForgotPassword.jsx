import { useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email });
      toast.success('Password reset link sent!');
      navigate('/login');
    } catch (err) {
      toast.error('Error sending reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-[700px] flex flex-col items-center justify-center max-w-md w-full mx-auto p-4 space-y-4"
    >
      <h2 className="text-3xl font-bold mb-6">Forgot Password</h2>

      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="w-full p-2 border border-gray-300 rounded-lg mb-3"
      />

      <button
        type="submit"
        className="w-full py-2 rounded-md bg-gray-800 text-white font-medium hover:bg-white hover:text-black hover:border hover:border-black transition"
        disabled={loading}
      >
        {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
      </button>
    </form>
  );
}
