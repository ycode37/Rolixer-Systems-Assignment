import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const API = import.meta.env.VITE_API_URL;

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!storedUser || storedUser.role !== 'admin') {
      navigate('/auth');
      return;
    }

    setUser(storedUser);
    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <h1 className="text-lg font-medium text-gray-900">
              Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-gray-900 mb-1">
            Welcome back, {user?.name}
          </h2>
          <p className="text-gray-500">Administrator</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-white border border-gray-200 p-5 rounded">
            <p className="text-sm text-gray-500 mb-1">Total Users</p>
            <p className="text-2xl font-medium text-gray-900">
              {stats.totalUsers}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded">
            <p className="text-sm text-gray-500 mb-1">Total Stores</p>
            <p className="text-2xl font-medium text-gray-900">
              {stats.totalStores}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded">
            <p className="text-sm text-gray-500 mb-1">Total Ratings</p>
            <p className="text-2xl font-medium text-gray-900">
              {stats.totalRatings}
            </p>
          </div>
        </div>

        {/* Management Sections */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Management</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Users */}
            <div className="bg-white border border-gray-200 p-5 rounded">
              <h4 className="font-medium text-gray-900 mb-1">Users</h4>
              <p className="text-sm text-gray-500 mb-4">
                View and manage all users
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="w-full text-sm bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded"
                >
                  View All Users
                </button>
                <button
                  onClick={() => navigate('/admin/users/create')}
                  className="w-full text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded"
                >
                  Add New User
                </button>
              </div>
            </div>

            {/* Stores */}
            <div className="bg-white border border-gray-200 p-5 rounded">
              <h4 className="font-medium text-gray-900 mb-1">Stores</h4>
              <p className="text-sm text-gray-500 mb-4">
                View and manage stores
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/admin/stores')}
                  className="w-full text-sm bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded"
                >
                  View All Stores
                </button>
                <button
                  onClick={() => navigate('/admin/stores/create')}
                  className="w-full text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded"
                >
                  Add New Store
                </button>
              </div>
            </div>

            {/* Ratings */}
            <div className="bg-white border border-gray-200 p-5 rounded">
              <h4 className="font-medium text-gray-900 mb-1">Ratings</h4>
              <p className="text-sm text-gray-500 mb-4">
                View all submitted ratings
              </p>
              <button
                onClick={() => navigate('/admin/ratings')}
                className="w-full text-sm bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded"
              >
                View All Ratings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
