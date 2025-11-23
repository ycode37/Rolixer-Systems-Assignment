import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateStore = () => {
  const API = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    address: '',
    owner_name: '',
    owner_email: '',
    temporary_password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one uppercase, one lowercase, one number, one special char
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    setFormData((prev) => ({ ...prev, temporary_password: password }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Store name is required';
    }

    if (!formData.email || formData.email.trim().length === 0) {
      newErrors.email = 'Store email is required';
    } else {
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
    }

    if (!formData.owner_name || formData.owner_name.trim().length === 0) {
      newErrors.owner_name = 'Store owner name is required';
    }

    if (!formData.owner_email || formData.owner_email.trim().length === 0) {
      newErrors.owner_email = 'Store owner email is required';
    } else {
      const ownerEmailError = validateEmail(formData.owner_email);
      if (ownerEmailError) newErrors.owner_email = ownerEmailError;
    }

    if (
      !formData.temporary_password ||
      formData.temporary_password.length < 8
    ) {
      newErrors.temporary_password =
        'Temporary password must be at least 8 characters';
    }

    if (formData.address && formData.address.length > 400) {
      newErrors.address = 'Address must not exceed 400 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/api/admin/stores`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(
        `Store created successfully!\n\nStore Owner Credentials:\nEmail: ${formData.owner_email}\nTemporary Password: ${formData.temporary_password}\n\nPlease share these credentials with the store owner. They will be required to change the password on first login.`
      );
      navigate('/admin/stores');
    } catch (error) {
      if (error.response?.data) {
        if (error.response.data.errors) {
          const backendErrors = {};
          error.response.data.errors.forEach((err) => {
            backendErrors[err.path || 'submit'] = err.msg || err.message;
          });
          setErrors(backendErrors);
        } else {
          setErrors({
            submit: error.response.data.message || 'Failed to create store',
          });
        }
      } else {
        setErrors({ submit: 'Network error. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-lg font-medium text-gray-900">Create Store</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white border border-gray-200 rounded p-6">
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded p-3">
            <p className="text-sm text-gray-600">
              Creating a store will automatically create a store owner account.
              The store owner will need to change their password on first login.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store Information Section */}
            <div className="border-b border-gray-200 pb-5">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Store Information
              </h3>

           
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                    errors.name ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Enter store name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Store Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                    errors.email ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Enter store email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
                  placeholder="Enter store description"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Address (optional)
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none ${
                    errors.address ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Enter store address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Store Owner Information Section */}
            <div className="border-b border-gray-200 pb-5">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Store Owner Information
              </h3>

              {/* Owner Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Owner Name
                </label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                    errors.owner_name ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Enter store owner name"
                />
                {errors.owner_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.owner_name}
                  </p>
                )}
              </div>

              {/* Owner Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Owner Email
                </label>
                <input
                  type="email"
                  name="owner_email"
                  value={formData.owner_email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                    errors.owner_email ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Enter store owner email"
                />
                {errors.owner_email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.owner_email}
                  </p>
                )}
              </div>
            </div>

            {/* Temporary Password Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Temporary Password
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Password
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="temporary_password"
                      value={formData.temporary_password}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400 pr-10 ${
                        errors.temporary_password
                          ? 'border-red-400'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter or generate password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
                {errors.temporary_password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.temporary_password}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  The store owner will be required to change this password on
                  first login
                </p>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2 rounded font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Store & Owner Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStore;
