import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-3 bg-slate-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Checking admin access...</p>
      </div>
    );
  }

  // Check if user is admin
  if (!user || !user.is_staff) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute;
