import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyRatings();
  }, []);

  const fetchMyRatings = async () => {
    const API = import.meta.env.VITE_API_URL;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API}/api/user/my-ratings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRatings(response.data.ratings);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setError('Failed to load your ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/user/ratings/${ratingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Rating deleted successfully!');
      fetchMyRatings();
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert('Failed to delete rating');
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="bg-white p-8 rounded-2xl shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-semibold">
            Loading your ratings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/home')}
              className="text-purple-600 hover:text-purple-800 font-semibold flex items-center"
            >
              <span className="text-2xl mr-2">←</span> Back to Home
            </button>
            <h1 className="text-2xl font-bold text-purple-600">My Ratings</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">
              Your Ratings & Reviews
            </h2>
            <p className="text-purple-100 mt-1">
              You have submitted {ratings.length}{' '}
              {ratings.length === 1 ? 'rating' : 'ratings'}
            </p>
          </div>

          <div className="p-8">
            {ratings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⭐</div>
                <p className="text-gray-500 text-lg">
                  You haven't rated any stores yet
                </p>
                <button
                  onClick={() => navigate('/browse-stores')}
                  className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Browse Stores
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {ratings.map((rating) => (
                  <div
                    key={rating.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {rating.store_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {rating.store_email}
                        </p>
                        {rating.store_address && (
                          <p className="text-sm text-gray-500 mt-1">
                            📍 {rating.store_address}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteRating(rating.id)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl font-bold text-orange-600">
                        {rating.rating}
                      </span>
                      <div className="flex">{renderStars(rating.rating)}</div>
                    </div>

                    {rating.comment && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <p className="text-gray-700 italic">
                          "{rating.comment}"
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Submitted: {formatDate(rating.created_at)}</span>
                      {rating.updated_at !== rating.created_at && (
                        <span>Updated: {formatDate(rating.updated_at)}</span>
                      )}
                    </div>
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

export default MyRatings;
