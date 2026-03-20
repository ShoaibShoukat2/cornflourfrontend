import { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const fetchWithdrawals = async () => {
    try {
      const response = await api.get(`/admin/withdrawals/?status=${filter}`);
      setWithdrawals(response.data);
    } catch (error) {
      console.error(error);
      setMessage('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, username) => {
    const note = prompt(`Approve withdrawal for ${username}? Add note (optional):`);
    if (note === null) return; // User cancelled
    
    try {
      await api.post(`/admin/approve-withdrawal/${id}/`, { note });
      setMessage(`✅ Withdrawal approved for ${username}`);
      fetchWithdrawals();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to approve withdrawal');
    }
  };

  const handleReject = async (id, username) => {
    const reason = prompt(`Reject withdrawal for ${username}? Enter reason:`);
    if (!reason) return;
    
    try {
      await api.post(`/admin/reject-withdrawal/${id}/`, { reason });
      setMessage(`✅ Withdrawal rejected for ${username}`);
      fetchWithdrawals();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to reject withdrawal');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-6 md:mb-8">Manage Withdrawals 💸</h1>

        {message && (
          <div className={`${message.includes('✅') ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded mb-6`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-semibold ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-semibold ${filter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-semibold ${filter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600">User</th>
                  <th className="px-4 py-3 text-left text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-left text-gray-600">Method</th>
                  <th className="px-4 py-3 text-left text-gray-600">Details</th>
                  <th className="px-4 py-3 text-left text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No withdrawals found
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{withdrawal.user.username}</td>
                      <td className="px-4 py-3 text-green-600 font-bold">₹{(withdrawal.amount * 100).toFixed(0)}</td>
                      <td className="px-4 py-3 capitalize">{withdrawal.payment_method}</td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate" title={withdrawal.payment_details}>
                        {withdrawal.payment_details}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[withdrawal.status]}`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {withdrawal.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(withdrawal.id, withdrawal.user.username)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(withdrawal.id, withdrawal.user.username)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {withdrawal.admin_note && (
                          <p className="text-xs text-gray-500 mt-1">{withdrawal.admin_note}</p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            💡 <strong>Tip:</strong> Use Django admin panel for bulk actions and advanced withdrawal management at{' '}
            <a href="http://localhost:8000/admin/wallet/withdrawal/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
              Admin Panel
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManageWithdrawals;
