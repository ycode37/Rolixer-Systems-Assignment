import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UsersList = () => {
  const API = import.meta.env.VITE_API_URL;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: '',
  });
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (
    filterParams = filters,
    sortParams = sortConfig
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/auth');
        return;
      }

      const queryParams = new URLSearchParams();
      if (filterParams.name) queryParams.append('name', filterParams.name);
      if (filterParams.email) queryParams.append('email', filterParams.email);
      if (filterParams.address)
        queryParams.append('address', filterParams.address);
      if (filterParams.role) queryParams.append('role', filterParams.role);
      if (sortParams.sortBy) queryParams.append('sortBy', sortParams.sortBy);
      if (sortParams.sortOrder)
        queryParams.append('sortOrder', sortParams.sortOrder);

      const response = await axios.get(
        `${API}/api/admin/users?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('You are not authorized to view this page');
        setTimeout(() => navigate('/admin-dashboard'), 2000);
      } else {
        setError('Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchUsers(filters, sortConfig);
  };

  const handleClearFilters = () => {
    const clearedFilters = { name: '', email: '', address: '', role: '' };
    setFilters(clearedFilters);
    fetchUsers(clearedFilters, sortConfig);
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
    fetchUsers(filters, newSortConfig);
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

  const handleViewDetails = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      case 'store_owner':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      case 'normal_user':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
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

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading users...</p>
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
              <h1 className="text-lg font-medium text-gray-900">Users</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Total: <span className="font-medium">{users.length}</span>
              </span>
              <button
                onClick={() => navigate('/admin/users/create')}
                className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded"
              >
                Add User
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Search by name"
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
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
              <option value="normal_user">Normal User</option>
            </select>
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
                    Name {getSortIcon('name')}
                  </th>
                  <th
                    onClick={() => handleSort('email')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    Email {getSortIcon('email')}
                  </th>
                  <th
                    onClick={() => handleSort('role')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    Role {getSortIcon('role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Address
                  </th>
                  <th
                    onClick={() => handleSort('created_at')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    Registered {getSortIcon('created_at')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs font-medium rounded ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {user.address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetails(user.id)}
                        className="text-gray-900 hover:text-gray-600 font-medium"
                      >
                        View
                      </button>
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
                <span className="font-medium">{sortConfig.sortBy}</span>
                <span className="ml-2">
                  (
                  {sortConfig.sortOrder === 'ASC'
                    ? 'Ascending ↑'
                    : 'Descending ↓'}
                  )
                </span>
              </p>
            </div>
            {users.map((user) => (
              <div
                key={user.id}
                className="border-b border-gray-200 p-5 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-2 text-sm mb-3">
                  <div>
                    <span className="font-medium text-gray-700">ID:</span>
                    <span className="ml-2 text-gray-600">#{user.id}</span>
                  </div>
                  {user.address && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Address:
                      </span>
                      <p className="text-gray-600 mt-1">{user.address}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">
                      Registered:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleViewDetails(user.id)}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm py-2 rounded"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          {users.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersList;
