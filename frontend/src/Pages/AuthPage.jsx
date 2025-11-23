import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  // API Base URL with fallback
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // API Base URL
  const API_URL = `${API}/api/auth`;

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (userData.role === 'store_owner') {
        navigate('/store-dashboard');
      } else {
        navigate('/home');
      }
    }
  }, [navigate]);

  // Validation functions
  const validateName = (name) => {
    if (name.length < 20) return 'Name must be at least 20 characters';
    if (name.length > 60) return 'Name must not exceed 60 characters';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (password.length < 8 || password.length > 16) {
      return 'Password must be 8-16 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must include at least one uppercase letter';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must include at least one special character';
    }
    return '';
  };

  const validateAddress = (address) => {
    if (address.length > 400) return 'Address must not exceed 400 characters';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin) {
      const nameError = validateName(formData.name);
      if (nameError) newErrors.name = nameError;

      const addressError = validateAddress(formData.address);
      if (addressError) newErrors.address = addressError;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        console.log('Attempting login...');
        const response = await axios.post(`${API_URL}/login`, {
          email: formData.email,
          password: formData.password,
        });

        console.log('Login response:', response.data);

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        console.log('Login successful, redirecting...');

        await new Promise((resolve) => setTimeout(resolve, 100));

        if (response.data.user.role === 'admin') {
          console.log('Navigating to admin dashboard');
          navigate('/admin-dashboard', { replace: true });
        } else if (response.data.user.role === 'store_owner') {
          console.log('Navigating to store dashboard');
          navigate('/store-dashboard', { replace: true });
        } else {
          console.log('Navigating to home');
          navigate('/home', { replace: true });
        }
      } else {
        // Signup request - role is automatically set to normal_user
        console.log('Attempting signup...');
        const response = await axios.post(`${API_URL}/signup`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          role: 'normal_user', // Always normal_user for public signup
        });

        console.log('Signup response:', response.data);
        alert('Registration successful! Please login.');

        setIsLogin(true);
        setFormData({ name: '', email: '', password: '', address: '' });
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data) {
        setErrors({
          submit: error.response.data.message || 'An error occurred',
        });
      } else {
        setErrors({ submit: 'Network error. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', address: '' });
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white border border-gray-200 rounded w-full max-w-md p-8">
        <h2 className="text-2xl font-medium text-gray-900 mb-6 text-center">
          {isLogin ? 'Login' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field - only for signup */}
          {!isLogin && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                  errors.name ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="Enter your full name (20-60 characters)"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
              {formData.name && !errors.name && (
                <p className="mt-1 text-sm text-gray-500 text-right">
                  {formData.name.length}/60
                </p>
              )}
            </div>
          )}

          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                errors.email ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400 pr-16 ${
                  errors.password ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
            {!isLogin && (
              <p className="mt-1 text-xs text-gray-500">
                8-16 characters, at least one uppercase letter and one special
                character
              </p>
            )}
          </div>

          {/* Address field - only for signup */}
          {!isLogin && (
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none ${
                  errors.address ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="Enter your address (max 400 characters)"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
              {formData.address && !errors.address && (
                <p className="mt-1 text-sm text-gray-500 text-right">
                  {formData.address.length}/400
                </p>
              )}
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
              {errors.submit}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2 rounded font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : isLogin ? (
              'Login'
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Toggle between login and signup */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-gray-900 hover:text-gray-700 font-medium"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
