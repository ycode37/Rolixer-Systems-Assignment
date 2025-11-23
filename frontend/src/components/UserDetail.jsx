import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const UserDetail = () => {
  const API = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = () => {
    return 'bg-gray-100 text-gray-800 border border-gray-300';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded p-6 text-center">
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-gray-900 text-white px-4 py-2 rounded text-sm"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <button
              onClick={() => navigate('/admin/users')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-lg font-medium text-gray-900">User Details</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-gray-900">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-medium rounded ${getRoleBadgeColor()}`}
              >
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 border border-gray-200 p-4 rounded">
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="text-sm font-medium text-gray-900">
                    #{user.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Role</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            {user.address && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Address
                </h3>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                  <p className="text-sm text-gray-900">{user.address}</p>
                </div>
              </div>
            )}

            {/* Rating (for Store Owners) */}
            {user.role === 'store_owner' && user.average_rating !== null && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Store Rating
                </h3>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-medium text-gray-900">
                      {user.average_rating || 'N/A'}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Rating</p>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${
                              star <= Math.round(user.average_rating || 0)
                                ? 'text-gray-900'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Account Information
              </h3>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Registered On:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(user.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Status:</span>
                  <span className="text-sm font-medium text-gray-900">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
