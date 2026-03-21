import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

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

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!stats) return <div className="text-center text-gray-400 py-20">No data available</div>;

  const statCards = [
    { label: 'Total Users', value: stats.users.total, sub: `Active: ${stats.users.active}`, color: 'from-blue-500 to-blue-600', icon: '👥' },
    { label: 'Total Earnings', value: `Rs ${(stats.financial.total_earnings * 100).toFixed(0)}`, sub: `Revenue: Rs ${(stats.financial.revenue * 100).toFixed(0)}`, color: 'from-green-500 to-green-600', icon: '💰' },
    { label: 'Withdrawals', value: `Rs ${(stats.financial.total_withdrawals * 100).toFixed(0)}`, sub: `Pending: ${stats.financial.pending_count}`, color: 'from-purple-500 to-purple-600', icon: '💸' },
    { label: 'Tasks', value: stats.tasks.total, sub: `Completed: ${stats.tasks.total_completed}`, color: 'from-orange-500 to-red-500', icon: '🎯' },
  ];

  const infoCards = [
    { label: 'New Users Today', value: stats.users.new_today, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Blocked Users', value: stats.users.blocked, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Fraud Alerts', value: stats.security.fraud_alerts, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Pending Withdrawals', value: `Rs ${(stats.financial.pending_withdrawals * 100).toFixed(0)}`, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs opacity-80">{s.label}</p>
              <span className="text-xl">{s.icon}</span>
            </div>
            <p className="text-xl font-black">{s.value}</p>
            <p className="text-xs opacity-70 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {infoCards.map((c, i) => (
          <div key={i} className={`${c.bg} rounded-2xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4">Recent Users</h2>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {activities?.recent_users?.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No users yet</p>}
            {activities?.recent_users?.map((u) => (
              <div key={u.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{u.username}</p>
                  <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {u.is_active ? 'Active' : 'Blocked'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4">Recent Withdrawals</h2>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {activities?.recent_withdrawals?.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No withdrawals yet</p>}
            {activities?.recent_withdrawals?.map((w) => (
              <div key={w.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{w.user__username}</p>
                  <p className="text-xs text-gray-400">Rs {(w.amount * 100).toFixed(0)} · {w.payment_method}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  w.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  w.status === 'approved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
