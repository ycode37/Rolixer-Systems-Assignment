import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BrowseStores = () => {
  const API = import.meta.env.VITE_API_URL;
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingData, setRatingData] = useState({
    rating: 0,
    comment: '',
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    address: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchFilters, stores]);

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/api/user/stores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(response.data.stores);
      setFilteredStores(response.data.stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = stores;

    if (searchFilters.name) {
      filtered = filtered.filter((store) =>
        store.name.toLowerCase().includes(searchFilters.name.toLowerCase())
      );
    }

    if (searchFilters.address) {
      filtered = filtered.filter(
        (store) =>
          store.address &&
          store.address
            .toLowerCase()
            .includes(searchFilters.address.toLowerCase())
      );
    }

    setFilteredStores(filtered);
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setSearchFilters({ name: '', address: '' });
  };

  const handleRateStore = (store) => {
    setSelectedStore(store);
    setRatingData({
      rating: store.user_rating || 0,
      comment: store.user_comment || '',
    });
  };

  const handleSubmitRating = async () => {
    if (ratingData.rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/api/user/stores/${selectedStore.id}/rate`,
        ratingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(
        selectedStore.user_rating
          ? 'Rating updated successfully!'
          : 'Rating submitted successfully!'
      );
      setSelectedStore(null);
      setRatingData({ rating: 0, comment: '' });
      setHoveredRating(0);
      fetchStores(); // Refresh stores
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    }
  };

  const renderStars = (rating, interactive = false, onClick = null) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`text-2xl cursor-${
          interactive ? 'pointer' : 'default'
        } transition-colors ${
          star <= (interactive ? hoveredRating || ratingData.rating : rating)
            ? 'text-gray-900'
            : 'text-gray-300'
        }`}
        onClick={() => interactive && onClick && onClick(star)}
        onMouseEnter={() => interactive && setHoveredRating(star)}
        onMouseLeave={() => interactive && setHoveredRating(0)}
      >
        ★
      </span>
    ));
  };

  const renderSmallStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`text-sm ${
          star <= rating ? 'text-gray-900' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <button
              onClick={() => navigate('/home')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-lg font-medium text-gray-900">Browse Stores</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Search Filters */}
        <div className="bg-white border border-gray-200 rounded p-5 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Search Stores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                name="name"
                value={searchFilters.name}
                onChange={handleSearchChange}
                placeholder="Search by store name..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={searchFilters.address}
                onChange={handleSearchChange}
                placeholder="Search by address..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
          </div>
          {(searchFilters.name || searchFilters.address) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredStores.length} of {stores.length} stores
              </p>
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-900 hover:text-gray-600 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Store Listings */}
        {filteredStores.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-12 text-center">
            <p className="text-gray-500 mb-2">
              {stores.length === 0
                ? 'No stores available yet'
                : 'No stores match your search'}
            </p>
            {stores.length > 0 && (
              <button
                onClick={handleClearFilters}
                className="mt-4 text-gray-900 hover:text-gray-600 font-medium text-sm"
              >
                Clear search filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                className="bg-white border border-gray-200 rounded overflow-hidden"
              >
                {/* Store Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {store.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Managed by {store.owner_name}
                  </p>
                </div>

                <div className="p-5">
                  {/* Store Address */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Address
                    </p>
                    <p className="text-sm text-gray-600">
                      {store.address || 'No address provided'}
                    </p>
                  </div>

                  {/* Overall Rating */}
                  <div className="mb-4 bg-gray-50 border border-gray-200 rounded p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Overall Rating
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-2xl font-medium text-gray-900">
                            {store.average_rating || 'N/A'}
                          </span>
                          {store.average_rating > 0 && (
                            <div className="flex">
                              {renderSmallStars(
                                Math.round(store.average_rating)
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Based on {store.total_ratings}{' '}
                          {store.total_ratings === 1 ? 'review' : 'reviews'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User's Submitted Rating */}
                  {store.user_rating ? (
                    <div className="mb-4 bg-gray-50 border border-gray-300 rounded p-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        Your Rating
                      </p>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg font-medium text-gray-900">
                          {store.user_rating}
                        </span>
                        <div className="flex">
                          {renderSmallStars(store.user_rating)}
                        </div>
                      </div>
                      {store.user_comment && (
                        <p className="text-sm text-gray-700 italic mt-2">
                          "{store.user_comment}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4 bg-gray-50 border border-gray-200 rounded p-4">
                      <p className="text-sm text-gray-600">
                        You haven't rated this store yet
                      </p>
                    </div>
                  )}

                  {/* Store Description */}
                  {store.description && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        About
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {store.description}
                      </p>
                    </div>
                  )}

                  {/* Contact Info */}
                  {store.email && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">{store.email}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <button
                    onClick={() => handleRateStore(store)}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm py-2 rounded font-medium"
                  >
                    {store.user_rating ? 'Modify Rating' : 'Submit Rating'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded max-w-lg w-full p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {selectedStore.user_rating
                  ? 'Modify Your Rating'
                  : 'Rate This Store'}
              </h3>
              <p className="text-sm text-gray-600">{selectedStore.name}</p>
            </div>

            {selectedStore.user_rating && (
              <div className="mb-4 bg-gray-50 border border-gray-200 rounded p-3">
                <p className="text-sm text-gray-600">
                  You previously rated this store {selectedStore.user_rating}{' '}
                  stars
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Rating
              </label>
              <div className="flex justify-center space-x-2 mb-2">
                {renderStars(ratingData.rating, true, (rating) =>
                  setRatingData((prev) => ({ ...prev, rating }))
                )}
              </div>
              <p className="text-center text-sm text-gray-500">
                {ratingData.rating > 0 ? (
                  <span className="font-medium text-gray-900">
                    {ratingData.rating} out of 5 stars
                  </span>
                ) : (
                  'Click on stars to rate'
                )}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment (optional)
              </label>
              <textarea
                value={ratingData.comment}
                onChange={(e) =>
                  setRatingData((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
                placeholder="Share your experience with this store..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {ratingData.comment.length}/500 characters
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSelectedStore(null);
                  setRatingData({ rating: 0, comment: '' });
                  setHoveredRating(0);
                }}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm py-2 rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={ratingData.rating === 0}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-sm py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedStore.user_rating ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseStores;
