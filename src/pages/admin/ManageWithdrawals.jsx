import { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWithdrawals(); }, [filter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/withdrawals/?status=${filter}`);
      setWithdrawals(res.data);
    } catch {
      setMessage('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, username) => {
    const note = prompt(`Approve for ${username}? Add note (optional):`);
    if (note === null) return;
    try {
      await api.post(`/admin/approve-withdrawal/${id}/`, { note });
      setMessage(`✅ Approved for ${username}`);
      fetchWithdrawals();
    } catch (e) {
      setMessage(e.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async (id, username) => {
    const reason = prompt(`Reject for ${username}? Enter reason:`);
    if (!reason) return;
    try {
      await api.post(`/admin/reject-withdrawal/${id}/`, { reason });
      setMessage(`✅ Rejected for ${username}`);
      fetchWithdrawals();
    } catch (e) {
      setMessage(e.response?.data?.error || 'Failed to reject');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Manage Withdrawals 💸</h1>

      {message && (
        <div className={`border px-4 py-3 rounded-xl text-sm font-semibold ${message.includes('✅') ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Filter tabs */}
      <div className="bg-white rounded-xl p-3 shadow-sm">
        <div className="flex gap-2 flex-wrap">
          {['pending', 'approved', 'rejected', 'all'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filter === s
                  ? s === 'pending' ? 'bg-yellow-500 text-white'
                    : s === 'approved' ? 'bg-green-500 text-white'
                    : s === 'rejected' ? 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {withdrawals.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm">No withdrawals found</div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {withdrawals.map(w => (
              <div key={w.id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{w.user.username}</p>
                    <p className="text-xs text-gray-400">{w.user.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[w.status]}`}>
                    {w.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-green-600">Rs {(w.amount * 100).toFixed(0)}</span>
                  <span className="text-gray-500 capitalize">{w.payment_method}</span>
                  <span className="text-gray-400 text-xs">{new Date(w.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{w.payment_details}</p>
                {w.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(w.id, w.user.username)}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg text-xs font-semibold hover:bg-green-600 transition">
                      ✅ Approve
                    </button>
                    <button onClick={() => handleReject(w.id, w.user.username)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg text-xs font-semibold hover:bg-red-600 transition">
                      ❌ Reject
                    </button>
                  </div>
                )}
                {w.admin_note && <p className="text-xs text-gray-400">Note: {w.admin_note}</p>}
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Details</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map(w => (
                    <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-sm">{w.user.username}</td>
                      <td className="px-4 py-3 text-green-600 font-bold text-sm">Rs {(w.amount * 100).toFixed(0)}</td>
                      <td className="px-4 py-3 capitalize text-sm">{w.payment_method}</td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate" title={w.payment_details}>{w.payment_details}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[w.status]}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(w.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {w.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleApprove(w.id, w.user.username)}
                              className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-600 transition">
                              Approve
                            </button>
                            <button onClick={() => handleReject(w.id, w.user.username)}
                              className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition">
                              Reject
                            </button>
                          </div>
                        )}
                        {w.admin_note && <p className="text-xs text-gray-400 mt-1">{w.admin_note}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageWithdrawals;
