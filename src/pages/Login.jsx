import { useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { MdFingerprint } from 'react-icons/md';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'user' });
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fingerprintError, setFingerprintError] = useState('');
  const [loadingFingerprint, setLoadingFingerprint] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  function base64urlToUint8Array(base64url) {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const raw = atob(padded);
    const buffer = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      buffer[i] = raw.charCodeAt(i);
    }
    return buffer;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'password' && passwordError) setPasswordError('');
    if (name === 'email' && fingerprintError) setFingerprintError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);

      const formattedUser = {
        id: res.data.user.id,
        email: res.data.user.email,
        role: res.data.user.role,
        firstName: res.data.user.firstName,
        lastName: res.data.user.lastName,
      };

      login(res.data.token, form.role, formattedUser);
      toast.success('Login successful');
      // ❌ navigation removed — handled by route logic
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setPasswordError('Incorrect Password');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const startFingerprintLogin = async () => {
    if (!form.email) {
      setFingerprintError('Please enter your email first');
      return;
    }

    setFingerprintError('');
    setLoadingFingerprint(true);

    try {
      const response = await API.post('/webauthn/generate-authentication-options', {
        email: form.email,
      });

      const publicKeyCredentialRequestOptions = {
        ...response.data,
        challenge: base64urlToUint8Array(response.data.challenge),
        allowCredentials: (response.data.allowCredentials || [])
          .filter((cred) => cred.transports?.includes('internal'))
          .map((cred) => ({
            ...cred,
            id: base64urlToUint8Array(cred.id),
          })),
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      const verifyResponse = await API.post('/webauthn/verify-authentication', credential);

      if (verifyResponse.data.success && verifyResponse.data.user) {
        const user = verifyResponse.data.user;
      
        const formattedUser = {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName, // ✅ backend gives `firstname`, we need `firstName`
          lastName: user.lastName,
        };
      
        login(verifyResponse.data.token, user.role, formattedUser);
        toast.success('Fingerprint login successful');
      } else {
        setFingerprintError('Fingerprint authentication failed');
      }
    } catch (error) {
      console.error(error);
      setFingerprintError('Error during fingerprint authentication');
      toast.error('Error during fingerprint authentication');
    } finally {
      setLoadingFingerprint(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center dark:bg-gray-900 bg-white px-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-center max-w-md w-full mx-auto p-4 space-y-4"
      >
        <h2 className="text-3xl font-bold mb-6">Login</h2>

        <select
          name="role"
          onChange={handleChange}
          value={form.role}
          className="w-full p-2 border border-gray-300 rounded-lg mb-3"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <input
          name="email"
          type="email"
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full p-2 border border-gray-300 rounded-lg mb-3"
        />

        <div className="w-full relative mb-1">
          <input
            name="password"
            onChange={handleChange}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            required
            className={clsx(
              'w-full p-2 border rounded-lg transition-all duration-300',
              passwordError ? 'border-red-500' : 'border-gray-300'
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? (
              <AiOutlineEyeInvisible size={24} />
            ) : (
              <AiOutlineEye size={24} />
            )}
          </button>
          {passwordError && (
            <p className="text-sm text-red-500">{passwordError}</p>
          )}
        </div>

        <div className="w-full text-right mb-1">
          <Link
            to="/forgot-password"
            className="text-sm text-red-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="flex w-full space-x-4 gap-0.5">
          <button
            type="submit"
            disabled={loading || loadingFingerprint}
            className={clsx(
              'flex items-center justify-center flex-1 px-6 py-2 rounded-md font-medium transition',
              loading
                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                : 'bg-gray-800 text-white hover:bg-white hover:text-black hover:border hover:border-black'
            )}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : 'Login'}
          </button>

          <button
            type="button"
            onClick={startFingerprintLogin}
            disabled={loadingFingerprint}
            className={clsx(
              'flex items-center justify-center w-12 h-12 rounded-md transition',
              loadingFingerprint
                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                : 'bg-gray-600 text-white hover:bg-white hover:text-black hover:border hover:border-black'
            )}
            title="Login with Fingerprint"
          >
            <MdFingerprint size={24} />
          </button>
        </div>

        {fingerprintError && (
          <p className="text-sm text-red-500 mt-2 text-center">
            {fingerprintError}
          </p>
        )}

        <div className="mt-4 text-sm text-center">
          Don’t have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </div>
      </form>
    </div>
  );
}
