import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (!token) {
          navigate('/auth');
          return;
        }

        // Optionally verify token with backend
        const response = await axios.get(`${API}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <h1 className="text-lg font-medium text-gray-900">
              Store Rating Platform
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/change-password')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white border border-gray-200 rounded p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-1">
              Welcome, {user?.name}
            </h2>
            <p className="text-gray-600">
              You are logged in as{' '}
              <span className="font-medium">
                {user?.role?.replace('_', ' ')}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded p-5">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Your Profile
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
                {user?.address && (
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded p-5">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {user?.role === 'normal_user' && (
                  <>
                    <button
                      onClick={() => navigate('/browse-stores')}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm py-2 rounded"
                    >
                      Browse Stores
                    </button>
                    <button
                      onClick={() => navigate('/my-ratings')}
                      className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm py-2 rounded"
                    >
                      My Ratings
                    </button>
                    <button
                      onClick={() => navigate('/change-password')}
                      className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm py-2 rounded"
                    >
                      Change Password
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
