import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import AuthPage from './Pages/AuthPage';
import HomePage from './components/HomePage';
import AdminDashboard from './components/AdminDashboard';
import UsersList from './components/UsersList';
import UserDetail from './components/UserDetail';
import CreateUser from './components/CreateUser';
import StoresList from './components/StoresList';
import CreateStore from './components/CreateStore';
import RatingsList from './components/RatingsList';
import ChangePassword from './components/ChangePassword';
import StoreOwnerDashboard from './components/StoreOwnerDashboard';
import BrowseStores from './components/BrowseStore';
import MyRatings from './components/MyRatings';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Route */}
        <Route path="/auth" element={<AuthPage />} />

        {/* User Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store-dashboard"
          element={
            <ProtectedRoute allowedRoles={['store_owner']}>
              <StoreOwnerDashboard />
            </ProtectedRoute>
          }
        />
        {/* User Management Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse-stores"
          element={
            <ProtectedRoute allowedRoles={['normal_user']}>
              <BrowseStores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-ratings"
          element={
            <ProtectedRoute allowedRoles={['normal_user']}>
              <MyRatings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/create"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CreateUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserDetail />
            </ProtectedRoute>
          }
        />

        {/* Store Management Routes */}
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StoresList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores/create"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CreateStore />
            </ProtectedRoute>
          }
        />

        {/* Ratings Management Routes */}
        <Route
          path="/admin/ratings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RatingsList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* Store Owner Routes */}

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
