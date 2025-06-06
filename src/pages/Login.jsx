import { useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { MdFingerprint } from 'react-icons/md';
import { useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'user' });
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fingerprintError, setFingerprintError] = useState('');
  const [loadingFingerprint, setLoadingFingerprint] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  function base64urlToUint8Array(base64url) {
    if (typeof base64url !== 'string') {
      throw new Error('Expected a base64url string but got ' + typeof base64url);
    }
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const raw = atob(padded);
    const buffer = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      buffer[i] = raw.charCodeAt(i);
    }
    return buffer;
  }

  function uint8ArrayToBase64url(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'password' && passwordError) {
      setPasswordError('');
    }

    if (name === 'email' && fingerprintError) {
      setFingerprintError('');
    }
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
      // toast.success('Logged in');
      navigate(form.role === 'admin' ? '/admin' : '/userdashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      if (message.toLowerCase().includes('password')) {
        setPasswordError('Incorrect password');
      } else {
        setPasswordError('Incorrect Password');
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const startFingerprintLogin = async () => {
    if (!form.email) {
      setFingerprintError('Please enter your email first');
      return;
    }

    function bufferLikeObjectToUint8Array(bufferObj) {
      if (
        bufferObj &&
        bufferObj.type === 'Buffer' &&
        Array.isArray(bufferObj.data)
      ) {
        return new Uint8Array(bufferObj.data);
      }
      throw new Error('Expected a Buffer-like object');
    }

    setFingerprintError('');
    setLoadingFingerprint(true);

    try {
      const response = await API.post('/auth/start-fingerprint-login', {
        email: form.email,
      });

      const publicKeyCredentialRequestOptions = {
        ...response.data,
        challenge: base64urlToUint8Array(response.data.challenge),
        allowCredentials: (response.data.allowCredentials || []).map((cred) => {
          let idUint8Array;

          if (typeof cred.id === 'string') {
            idUint8Array = base64urlToUint8Array(cred.id);
          } else if (
            cred.id &&
            cred.id.type === 'Buffer' &&
            Array.isArray(cred.id.data)
          ) {
            idUint8Array = bufferLikeObjectToUint8Array(cred.id);
          } else {
            throw new Error('Credential id is neither a string nor Buffer-like object');
          }

          return {
            ...cred,
            id: idUint8Array,
          };
        }),
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      const credentialData = {
        id: credential.id,
        rawId: uint8ArrayToBase64url(credential.rawId),
        type: credential.type,
        response: {
          authenticatorData: uint8ArrayToBase64url(credential.response.authenticatorData),
          clientDataJSON: uint8ArrayToBase64url(credential.response.clientDataJSON),
          signature: uint8ArrayToBase64url(credential.response.signature),
          userHandle: credential.response.userHandle
            ? uint8ArrayToBase64url(credential.response.userHandle)
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
          <option value="user">Voter</option>
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
            {loading && (
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}
            {loading ? 'Logging in...' : 'Login'}
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
