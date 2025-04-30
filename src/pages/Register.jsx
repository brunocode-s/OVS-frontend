import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      toast.error('Password must be at least 8 characters long, include a number, an uppercase letter, and a special character');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Form data:', form);
      const res = await API.post('/auth/register', form);
      localStorage.setItem('token', res.data.token);  // Save token for authentication
      toast.success('Registered successfully');
      
      // Redirect to the User Dashboard
      navigate('/UserDashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-[700px] flex flex-col items-center justify-center max-w-md w-full mx-auto p-4 space-y-4"
      autoComplete="on"
    >
      <h2 className="text-3xl font-bold mb-3">Register</h2>

      <input
        name="firstName"
        onChange={handleChange}
        placeholder="First Name"
        value={form.firstName}
        required
        className="w-full p-3 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        name="lastName"
        onChange={handleChange}
        placeholder="Last Name"
        value={form.lastName}
        required
        className="w-full p-3 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      {emailError && <p className="text-red-500 text-sm w-full -mt-1 mb-2">{emailError}</p>}

      <div className="w-full relative">
        <input
          name="password"
          onChange={handleChange}
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={form.password}
          required
          autoComplete="new-password"
          className="w-full p-3 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Password Checklist */}
      <div
        className={`w-full overflow-hidden transition-all duration-500 ${
          showPasswordHints && !allPasswordValid ? 'max-h-[200px] opacity-100 mb-3' : 'max-h-0 opacity-0 mb-0'
        }`}
      >
        <div className="text-sm text-gray-700 dark:text-gray-300 w-full space-y-1">
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
      </div>

      <select
        name="role"
        onChange={handleChange}
        value={form.role}
        className="w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-black-500"
      >
        <option value="voter">Voter</option>
        <option value="admin">Admin</option>
      </select>

      <button
        type="submit"
        disabled={isSubmitting || !allPasswordValid}
        className="w-full p-3 text-white bg-blue-500 rounded-md disabled:opacity-50"
      >
        {isSubmitting ? (
          <div className="flex justify-center items-center">
            <div className="w-6 h-6 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          'Register'
        )}
      </button>
    </form>
  );
}
