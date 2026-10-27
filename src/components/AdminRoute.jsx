import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  // Check if user is admin
  if (!user || !user.is_staff) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute;
