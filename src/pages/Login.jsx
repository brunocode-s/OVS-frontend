import { useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'user' });
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fingerprintError, setFingerprintError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Helper function to convert Base64URL to Base64
  function base64urlToBase64(base64url) {
    return base64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(base64url.length + (4 - base64url.length % 4) % 4, '=');
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'password' && passwordError) {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      toast.success('Logged in');

      if (form.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/userdashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';

      if (message.toLowerCase().includes('password')) {
        setPasswordError('Incorrect password');
      } else {
        setPasswordError('Incorrect Password')
        toast.error(message);
      }
    }
  };

  const startFingerprintLogin = async () => {
    try {
      const response = await API.post('/auth/start-fingerprint-login', { email: form.email });

      const publicKeyCredentialRequestOptions = {
        ...response.data,
        challenge: Uint8Array.from(atob(base64urlToBase64(response.data.challenge)), c => c.charCodeAt(0)),
        allowCredentials: (response.data.allowCredentials || []).map((cred) => ({
          ...cred,
          id: cred.id
            ? Uint8Array.from(atob(cred.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
            : new Uint8Array(),
        })),        
      };

      const credential = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });

      const credentialData = {
        id: credential.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
        type: credential.type,
        response: {
          authenticatorData: btoa(String.fromCharCode(...new Uint8Array(credential.response.authenticatorData))),
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
          signature: btoa(String.fromCharCode(...new Uint8Array(credential.response.signature))),
          userHandle: credential.response.userHandle
            ? btoa(String.fromCharCode(...new Uint8Array(credential.response.userHandle)))
            : null,
        },
        email: form.email,
      };

      const verifyResponse = await API.post('/auth/verify-fingerprint', credentialData);

      if (verifyResponse.data.success) {
        const { user } = verifyResponse.data;
        login(verifyResponse.data.token, user.role, user);
        toast.success('Fingerprint login successful');
        navigate(user.role === 'admin' ? '/admin' : '/userdashboard');
      } else {
        setFingerprintError('Fingerprint authentication failed');
      }
    } catch (error) {
      console.error(error);
      setFingerprintError('Error during fingerprint authentication');
      toast.error('Error during fingerprint authentication');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-[700px] flex flex-col items-center justify-center max-w-md w-full mx-auto p-4 space-y-4"
    >
      <h2 className="text-3xl font-bold mb-6">Login</h2>

      <input
        name="email"
        onChange={handleChange}
        placeholder="Email"
        required
        className="w-full p-2 border border-gray-300 rounded-lg mb-3"
      />

      <div className="w-full relative mb-2">
        <input
          name="password"
          onChange={handleChange}
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          required
          className={clsx(
            'w-full p-2 border rounded-lg mb-1 transition-all duration-300',
            passwordError ? 'border-red-500' : 'border-gray-300'
          )}
        />
        {passwordError && (
          <p className="text-sm text-red-500 mt-1 animate-fade-in animate-fade-out">
            {passwordError}
          </p>
        )}
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
      </div>

      <button
        type="button"
        onClick={startFingerprintLogin}
        className="w-full py-2 rounded-md mb-3 bg-gray-500 text-white font-medium hover:bg-white hover:text-black hover:border hover:border-black transition"
      >
        Login with Fingerprint
      </button>

      {fingerprintError && (
        <p className="text-sm text-red-500 mt-1">{fingerprintError}</p>
      )}

      <select
        name="role"
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded-lg mb-3"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button className="px-6 py-2 rounded-md bg-gray-800 text-white font-medium hover:bg-white hover:text-black hover:border hover:border-black transition">
        Login
      </button>
    </form>
  );
}
