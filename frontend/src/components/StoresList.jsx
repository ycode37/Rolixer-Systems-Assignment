import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StoresList = () => {
  const API = import.meta.env.VITE_API_URL;
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
  });
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async (
    filterParams = filters,
    sortParams = sortConfig
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const queryParams = new URLSearchParams();
      if (filterParams.name) queryParams.append('name', filterParams.name);
      if (filterParams.email) queryParams.append('email', filterParams.email);
      if (filterParams.address)
        queryParams.append('address', filterParams.address);
      if (sortParams.sortBy) queryParams.append('sortBy', sortParams.sortBy);
      if (sortParams.sortOrder)
        queryParams.append('sortOrder', sortParams.sortOrder);

      const response = await axios.get(
        `${API}/api/admin/stores?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStores(response.data.stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchStores(filters, sortConfig);
  };

  const handleClearFilters = () => {
    const clearedFilters = { name: '', email: '', address: '' };
    setFilters(clearedFilters);
    fetchStores(clearedFilters, sortConfig);
  };

  const handleSort = (field) => {
    const newSortOrder =
      sortConfig.sortBy === field && sortConfig.sortOrder === 'ASC'
        ? 'DESC'
        : 'ASC';

    const newSortConfig = {
      sortBy: field,
      sortOrder: newSortOrder,
    };

    setSortConfig(newSortConfig);
    fetchStores(filters, newSortConfig);
  };

  const getSortIcon = (field) => {
    if (sortConfig.sortBy !== field) {
      return <span className="text-gray-400 ml-1">↕</span>;
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
        className={`text-sm ${
          star <= Math.round(rating || 0) ? 'text-gray-900' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  if (loading && stores.length === 0) {
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-lg font-medium text-gray-900">Stores</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Total: <span className="font-medium">{stores.length}</span>
              </span>
              <button
                onClick={() => navigate('/admin/stores/create')}
                className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded"
              >
                Add Store
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded p-5 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Search by store name"
              className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              placeholder="Search by email"
              className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <input
              type="text"
              name="address"
              value={filters.address}
              onChange={handleFilterChange}
              placeholder="Search by address"
              className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded"
            >
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('id')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    ID {getSortIcon('id')}
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    Store Name {getSortIcon('name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Owner
                  </th>
                  <th
                    onClick={() => handleSort('average_rating')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    Rating {getSortIcon('average_rating')}
                  </th>
                  <th
                    onClick={() => handleSort('created_at')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    Created {getSortIcon('created_at')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{store.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{store.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {store.email || store.owner_email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {store.address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {store.owner_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {store.average_rating || 'N/A'}
                        </span>
                        {store.average_rating && (
                          <div className="flex">
                            {renderStars(store.average_rating)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(store.created_at).toLocaleDateString()}
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
                <span className="font-medium">
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
            {stores.map((store) => (
              <div
                key={store.id}
                className="border-b border-gray-200 p-5 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      {store.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {store.email || store.owner_email || 'No email'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-900">
                      {store.average_rating || 'N/A'}
                    </span>
                    {store.average_rating && (
                      <span className="text-sm text-gray-900">★</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">ID:</span>
                    <span className="ml-2 text-gray-600">#{store.id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Owner:</span>
                    <span className="ml-2 text-gray-600">
                      {store.owner_name}
                    </span>
                  </div>
                  {store.address && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Address:
                      </span>
                      <p className="text-gray-600 mt-1">{store.address}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">
                      Total Ratings:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {store.total_ratings || 0}
                    </span>
                  </div>
                  {store.average_rating && (
                    <div className="flex items-center mt-2">
                      {renderStars(store.average_rating)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {stores.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500">No stores found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoresList;
