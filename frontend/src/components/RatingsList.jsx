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

    // Apply filters
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

    // Apply sorting
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
      return <span className="text-gray-400 ml-1">⇅</span>;
    }
    return sortConfig.sortOrder === 'ASC' ? (
      <span className="text-white ml-1">↑</span>
    ) : (
      <span className="text-white ml-1">↓</span>
    );
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`text-2xl ${
          star <= rating ? 'text-yellow-400' : 'text-gray-300'
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500">
        <div className="bg-white p-8 rounded-2xl shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-semibold">Loading ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="text-yellow-600 hover:text-yellow-800 font-semibold flex items-center"
              >
                <span className="text-2xl mr-2">←</span> Back
              </button>
              <h1 className="text-2xl font-bold text-yellow-600">
                All Ratings
              </h1>
            </div>
            <span className="text-gray-600">
              Showing:{' '}
              <span className="font-bold text-yellow-600">
                {filteredRatings.length}
              </span>{' '}
              of{' '}
              <span className="font-bold text-yellow-600">
                {ratings.length}
              </span>
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Filters & Search
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name
              </label>
              <input
                type="text"
                name="storeName"
                value={filters.storeName}
                onChange={handleFilterChange}
                placeholder="Search by store name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Name
              </label>
              <input
                type="text"
                name="userName"
                value={filters.userName}
                onChange={handleFilterChange}
                placeholder="Search by user name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating Value
              </label>
              <select
                name="rating"
                value={filters.rating}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <input
                type="text"
                name="comment"
                value={filters.comment}
                onChange={handleFilterChange}
                placeholder="Search in comments"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredRatings.length !== ratings.length && (
                <span className="font-semibold text-yellow-600">
                  Filtered: {filteredRatings.length} of {ratings.length} ratings
                </span>
              )}
            </p>
            {(filters.storeName ||
              filters.userName ||
              filters.rating ||
              filters.comment) && (
              <button
                onClick={handleClearFilters}
                className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-yellow-500 to-orange-500">
                <tr>
                  <th
                    onClick={() => handleSort('id')}
                    className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-yellow-600"
                  >
                    ID {getSortIcon('id')}
                  </th>
                  <th
                    onClick={() => handleSort('store_name')}
                    className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-yellow-600"
                  >
                    Store Name {getSortIcon('store_name')}
                  </th>
                  <th
                    onClick={() => handleSort('user_name')}
                    className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-yellow-600"
                  >
                    User Name {getSortIcon('user_name')}
                  </th>
                  <th
                    onClick={() => handleSort('rating')}
                    className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-yellow-600"
                  >
                    Rating {getSortIcon('rating')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Comment
                  </th>
                  <th
                    onClick={() => handleSort('created_at')}
                    className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-yellow-600"
                  >
                    Date {getSortIcon('created_at')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRatings.map((rating, index) => (
                  <tr
                    key={rating.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{rating.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {rating.store_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {rating.user_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-orange-600">
                          {rating.rating}
                        </span>
                        <div className="flex">{renderStars(rating.rating)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                      {rating.comment ? (
                        <span className="line-clamp-2" title={rating.comment}>
                          {rating.comment}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No comment</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(rating.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                Sorting by:{' '}
                <span className="font-semibold">
                  {sortConfig.sortBy.replace('_', ' ')}
                </span>
                <span className="ml-2">
                  (
                  {sortConfig.sortOrder === 'ASC'
                    ? 'Ascending ↑'
                    : 'Descending ↓'}
                  )
                </span>
              </p>
            </div>
            {filteredRatings.map((rating) => (
              <div
                key={rating.id}
                className="border-b border-gray-200 p-6 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {rating.store_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      by {rating.user_name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xl font-bold text-orange-600">
                      {rating.rating}
                    </span>
                    <span className="text-yellow-400 text-xl">★</span>
                  </div>
                </div>
                <div className="flex mb-2">{renderStars(rating.rating)}</div>
                {rating.comment && (
                  <p className="text-sm text-gray-700 mb-2 italic bg-gray-50 p-3 rounded-lg">
                    "{rating.comment}"
                  </p>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
                  <span>ID: #{rating.id}</span>
                  <span>{formatDate(rating.created_at)}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredRatings.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <p className="text-gray-500 text-lg">
                {ratings.length === 0
                  ? 'No ratings submitted yet'
                  : 'No ratings match your filters'}
              </p>
              {ratings.length > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-yellow-600 hover:text-yellow-800 font-semibold"
                >
                  Clear filters to see all ratings
                </button>
              )}
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        {/* {filteredRatings.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Rating Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = filteredRatings.filter(
                  (r) => r.rating === star
                ).length;
                const percentage = (
                  (count / filteredRatings.length) *
                  100
                ).toFixed(1);
                return (
                  <div key={star} className="text-center">
                    <div className="text-3xl mb-2">{star}★</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {count}
                    </div>
                    <div className="text-sm text-gray-500">{percentage}%</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(
                      filteredRatings.reduce((sum, r) => sum + r.rating, 0) /
                      filteredRatings.length
                    ).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Ratings</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {filteredRatings.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">With Comments</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {filteredRatings.filter((r) => r.comment).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default RatingsList;
