import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RatingsList = () => {
  const API = import.meta.env.VITE_API_URL;
  const [ratings, setRatings] = useState([]);
  const [filteredRatings, setFilteredRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    storeName: '',
    userName: '',
    rating: '',
    comment: '',
  });
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRatings();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [filters, sortConfig, ratings]);

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/api/admin/ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRatings(response.data.ratings);
      setFilteredRatings(response.data.ratings);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setError('Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...ratings];

    if (filters.storeName) {
      filtered = filtered.filter((rating) =>
        rating.store_name
          .toLowerCase()
          .includes(filters.storeName.toLowerCase())
      );
    }

    if (filters.userName) {
      filtered = filtered.filter((rating) =>
        rating.user_name.toLowerCase().includes(filters.userName.toLowerCase())
      );
    }

    if (filters.rating) {
      filtered = filtered.filter(
        (rating) => rating.rating === parseInt(filters.rating)
      );
    }

    if (filters.comment) {
      filtered = filtered.filter(
        (rating) =>
          rating.comment &&
          rating.comment.toLowerCase().includes(filters.comment.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.sortBy) {
        case 'store_name':
          aValue = a.store_name.toLowerCase();
          bValue = b.store_name.toLowerCase();
          break;
        case 'user_name':
          aValue = a.user_name.toLowerCase();
          bValue = b.user_name.toLowerCase();
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (aValue < bValue) {
        return sortConfig.sortOrder === 'ASC' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.sortOrder === 'ASC' ? 1 : -1;
      }
      return 0;
    });

    setFilteredRatings(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      storeName: '',
      userName: '',
      rating: '',
      comment: '',
    });
  };

  const handleSort = (field) => {
    const newSortOrder =
      sortConfig.sortBy === field && sortConfig.sortOrder === 'ASC'
        ? 'DESC'
        : 'ASC';

    setSortConfig({
      sortBy: field,
      sortOrder: newSortOrder,
    });
  };

  const getSortIcon = (field) => {
    if (sortConfig.sortBy !== field) {
      return <span className="ml-1 opacity-50">⇅</span>;
    }
    return sortConfig.sortOrder === 'ASC' ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                All Ratings
              </h1>
            </div>
            <span className="text-sm text-gray-500">
              {filteredRatings.length} of {ratings.length} ratings
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              name="storeName"
              value={filters.storeName}
              onChange={handleFilterChange}
              placeholder="Filter by store..."
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <input
              type="text"
              name="userName"
              value={filters.userName}
              onChange={handleFilterChange}
              placeholder="Filter by user..."
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <select
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
            <input
              type="text"
              name="comment"
              value={filters.comment}
              onChange={handleFilterChange}
              placeholder="Search comments..."
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          {(filters.storeName ||
            filters.userName ||
            filters.rating ||
            filters.comment) && (
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Showing {filteredRatings.length} filtered results
              </span>
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Ratings Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('id')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    ID {getSortIcon('id')}
                  </th>
                  <th
                    onClick={() => handleSort('store_name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    Store {getSortIcon('store_name')}
                  </th>
                  <th
                    onClick={() => handleSort('user_name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    User {getSortIcon('user_name')}
                  </th>
                  <th
                    onClick={() => handleSort('rating')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    Rating {getSortIcon('rating')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Comment
                  </th>
                  <th
                    onClick={() => handleSort('created_at')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    Date {getSortIcon('created_at')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRatings.map((rating) => (
                  <tr key={rating.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      #{rating.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {rating.store_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {rating.user_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {rating.rating}
                        </span>
                        <div className="flex text-sm">
                          {renderStars(rating.rating)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      {rating.comment ? (
                        <span className="line-clamp-2">{rating.comment}</span>
                      ) : (
                        <span className="text-gray-400 italic">No comment</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(rating.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRatings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {ratings.length === 0
                  ? 'No ratings yet'
                  : 'No ratings match your filters'}
              </p>
              {ratings.length > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-sm text-yellow-600 hover:text-yellow-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        {filteredRatings.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Quick Stats
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-500">Average Rating</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {(
                    filteredRatings.reduce((sum, r) => sum + r.rating, 0) /
                    filteredRatings.length
                  ).toFixed(1)}
                  <span className="text-base text-gray-400 ml-1">/ 5</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Ratings</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {filteredRatings.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">With Comments</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {filteredRatings.filter((r) => r.comment).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingsList;
