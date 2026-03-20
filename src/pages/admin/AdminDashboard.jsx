import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        api.get('/admin/dashboard-stats/'),
        api.get('/admin/recent-activities/')
      ]);
      setStats(statsRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!stats) return <div className="flex justify-center items-center h-screen">No data available</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-6 md:mb-8">Admin Dashboard 👨‍💼</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
            <p className="text-xs md:text-sm opacity-90">Total Users</p>
            <p className="text-2xl md:text-4xl font-bold">{stats.users.total}</p>
            <p className="text-xs md:text-sm mt-2">Active: {stats.users.active}</p>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
            <p className="text-xs md:text-sm opacity-90">Total Earnings</p>
            <p className="text-2xl md:text-4xl font-bold">₹{(stats.financial.total_earnings * 100).toFixed(0)}</p>
            <p className="text-xs md:text-sm mt-2">Revenue: ₹{(stats.financial.revenue * 100).toFixed(0)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
            <p className="text-xs md:text-sm opacity-90">Withdrawals</p>
            <p className="text-2xl md:text-4xl font-bold">₹{(stats.financial.total_withdrawals * 100).toFixed(0)}</p>
            <p className="text-xs md:text-sm mt-2">Pending: {stats.financial.pending_count}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
            <p className="text-xs md:text-sm opacity-90">Tasks</p>
            <p className="text-2xl md:text-4xl font-bold">{stats.tasks.total}</p>
            <p className="text-xs md:text-sm mt-2">Completed: {stats.tasks.total_completed}</p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md">
            <p className="text-sm md:text-base text-gray-600 mb-2">New Users Today</p>
            <p className="text-3xl md:text-4xl font-bold text-blue-600">{stats.users.new_today}</p>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md">
            <p className="text-sm md:text-base text-gray-600 mb-2">Blocked Users</p>
            <p className="text-3xl md:text-4xl font-bold text-red-600">{stats.users.blocked}</p>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md">
            <p className="text-sm md:text-base text-gray-600 mb-2">Fraud Alerts</p>
            <p className="text-3xl md:text-4xl font-bold text-yellow-600">{stats.security.fraud_alerts}</p>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md">
            <p className="text-sm md:text-base text-gray-600 mb-2">Pending Withdrawals</p>
            <p className="text-3xl md:text-4xl font-bold text-purple-600">₹{(stats.financial.pending_withdrawals * 100).toFixed(0)}</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Recent Users 👥</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities?.recent_users?.map((user) => (
                <div key={user.id} className="flex justify-between items-center border-b pb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm md:text-base truncate">{user.username}</p>
                    <p className="text-xs md:text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.is_active ? 'Active' : 'Blocked'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Withdrawals */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Recent Withdrawals 💸</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities?.recent_withdrawals?.map((withdrawal) => (
                <div key={withdrawal.id} className="flex justify-between items-center border-b pb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm md:text-base truncate">{withdrawal.user__username}</p>
                    <p className="text-xs md:text-sm text-gray-500">${withdrawal.amount} - {withdrawal.payment_method}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {withdrawal.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fraud Alerts */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Fraud Alerts 🚨</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities?.recent_frauds?.map((fraud) => (
                <div key={fraud.id} className="border-b pb-2">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-gray-800 text-sm md:text-base">{fraud.user__username}</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      fraud.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      fraud.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {fraud.severity}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600">{fraud.fraud_type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500 mt-1">{fraud.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
