import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'voter',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordHints, setShowPasswordHints] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const getPasswordStatus = (password) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[@$!%*?&]/.test(password),
  });

  const passwordStatus = getPasswordStatus(form.password);
  const allPasswordValid = Object.values(passwordStatus).every(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'email') {
      setEmailError(validateEmail(value) || value === '' ? '' : 'Please enter a valid email');
    }

    if (name === 'password') {
      setPasswordError(validatePassword(value) ? '' : 'Password must meet the requirements');
      setShowPasswordHints(value.length > 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password } = form;

    if (!firstName || !lastName || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Password must meet all requirements');
      return;
    }

    setIsSubmitting(true);

    try {
      const trimmedForm = {
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
      };
      const res = await API.post('/auth/register', trimmedForm);
      localStorage.setItem('token', res.data.token);
      toast.success('Registered successfully');
      navigate('/UserDashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className=" rounded-lg px-8 pt-8 pb-6 w-full max-w-md space-y-4"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Create Account</h2>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">Please fill in the form to register.</p>

        <input
          name="firstName"
          onChange={handleChange}
          placeholder="First Name"
          value={form.firstName}
          required
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />

        <input
          name="lastName"
          onChange={handleChange}
          placeholder="Last Name"
          value={form.lastName}
          required
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />

        <input
          name="email"
          onChange={handleChange}
          placeholder="Email"
          value={form.email}
          required
          autoComplete="email"
          className={`w-full p-3 border rounded-md mb-2 focus:outline-none focus:ring-2 ${
            emailError ? 'border-red-500 focus:ring-red-400' : 'focus:ring-blue-500'
          }`}
        />
        {emailError && <p className="text-red-500 text-sm">{emailError}</p>}

        <div className="relative">
          <input
            name="password"
            onChange={handleChange}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={form.password}
            required
            autoComplete="new-password"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-3 text-xl text-gray-500"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
        </div>

        <div
          className={`transition-all duration-300 text-sm text-gray-700 dark:text-gray-300 ${
            showPasswordHints && !allPasswordValid ? 'space-y-1 mb-2' : 'h-0 overflow-hidden'
          }`}
        >
          <p className="flex items-center gap-2">
            {passwordStatus.length ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />}
            Minimum 8 characters
          </p>
          <p className="flex items-center gap-2">
            {passwordStatus.uppercase ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />}
            At least one uppercase letter
          </p>
          <p className="flex items-center gap-2">
            {passwordStatus.number ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />}
            At least one number
          </p>
          <p className="flex items-center gap-2">
            {passwordStatus.specialChar ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />}
            At least one special character (@$!%*?&)
          </p>
        </div>

        <select
          name="role"
          onChange={handleChange}
          value={form.role}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        >
          <option value="voter">Voter</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          disabled={isSubmitting || !allPasswordValid || !!emailError}
          className="w-full p-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex justify-center items-center">
              <div className="w-5 h-5 border-4 border-t-transparent border-white border-solid rounded-full animate-spin"></div>
            </div>
          ) : (
            'Register'
          )}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline dark:text-blue-400">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
