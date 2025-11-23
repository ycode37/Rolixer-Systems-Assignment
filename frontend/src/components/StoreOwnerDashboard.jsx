import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StoreOwnerDashboard = () => {
  const API = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!storedUser || storedUser.role !== 'store_owner') {
      navigate('/auth');
      return;
    }

    setUser(storedUser);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/api/store-owner/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`text-base ${
          star <= Math.round(rating) ? 'text-gray-900' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
          <p className="mt-3 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-gray-200 rounded p-6 text-center">
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-gray-900 text-white px-4 py-2 rounded text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <h1 className="text-lg font-medium text-gray-900">
              Store Owner Dashboard
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
        {/* Welcome Section */}
        <div className="bg-white border border-gray-200 rounded p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-medium text-gray-900 mb-1">
              Welcome, {user?.name}
            </h2>
            <p className="text-gray-600">
              Managing: {dashboardData.store.name}
            </p>
          </div>

          {/* Store Details */}
          <div className="bg-gray-50 border border-gray-200 rounded p-5 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Store Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Store Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {dashboardData.store.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">
                  {dashboardData.store.email}
                </p>
              </div>
              {dashboardData.store.address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">
                    {dashboardData.store.address}
                  </p>
                </div>
              )}
              {dashboardData.store.description && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm font-medium text-gray-900">
                    {dashboardData.store.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Average Rating */}
            <div className="bg-white border border-gray-200 rounded p-5">
              <p className="text-sm text-gray-500 mb-1">Average Rating</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-medium text-gray-900">
                  {dashboardData.stats.average_rating || 'N/A'}
                </p>
                {dashboardData.stats.average_rating > 0 && (
                  <div className="flex">
                    {renderStars(dashboardData.stats.average_rating)}
                  </div>
                )}
              </div>
            </div>

            {/* Total Ratings */}
            <div className="bg-white border border-gray-200 rounded p-5">
              <p className="text-sm text-gray-500 mb-1">Total Ratings</p>
              <p className="text-2xl font-medium text-gray-900">
                {dashboardData.stats.total_ratings}
              </p>
              <p className="text-sm text-gray-500 mt-1">Reviews Received</p>
            </div>
          </div>
        </div>

        {/* Ratings List */}
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">
              Customer Ratings & Reviews
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              See what your customers are saying
            </p>
          </div>

          <div className="p-6">
            {dashboardData.ratings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No ratings yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Your store hasn't received any ratings yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.ratings.map((rating) => (
                  <div
                    key={rating.rating_id}
                    className="border border-gray-200 rounded p-5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                          <span className="text-gray-700 font-medium text-sm">
                            {rating.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {rating.user_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {rating.user_email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {rating.rating}
                          </span>
                          <div className="flex">
                            {renderStars(rating.rating)}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(rating.created_at)}
                        </p>
                      </div>
                    </div>

                    {rating.comment && (
                      <div className="bg-gray-50 rounded p-3 mt-3">
                        <p className="text-sm text-gray-700 italic">
                          "{rating.comment}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
