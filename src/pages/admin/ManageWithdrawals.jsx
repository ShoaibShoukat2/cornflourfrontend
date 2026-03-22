import { useState, useEffect } from 'react';
import api from '../../api/axios';

const statusColors = {
  pending:  { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
  approved: { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-400'  },
  rejected: { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-400'    },
};

const ManageWithdrawals = () => {
  const [all, setAll] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/withdrawals/?status=all');
      setAll(res.data);
    } catch {
      setMessage('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const flash = (m) => { setMessage(m); setTimeout(() => setMessage(''), 3000); };

  const handleApprove = async (id, username) => {
    const note = prompt(`Approve for ${username}? Add note (optional):`);
    if (note === null) return;
    try {
      await api.post(`/admin/approve-withdrawal/${id}/`, { note });
      flash(`✅ Approved for ${username}`);
      fetchAll();
    } catch (e) { flash(e.response?.data?.error || 'Failed to approve'); }
  };

  const handleReject = async (id, username) => {
    const reason = prompt(`Reject for ${username}? Enter reason:`);
    if (!reason) return;
    try {
      await api.post(`/admin/reject-withdrawal/${id}/`, { reason });
      flash(`✅ Rejected for ${username}`);
      fetchAll();
    } catch (e) { flash(e.response?.data?.error || 'Failed to reject'); }
  };

  // Stats
  const pending  = all.filter(w => w.status === 'pending');
  const approved = all.filter(w => w.status === 'approved');
  const rejected = all.filter(w => w.status === 'rejected');
  const totalPendingAmt  = pending.reduce((s, w) => s + w.amount * 100, 0);
  const totalApprovedAmt = approved.reduce((s, w) => s + w.amount * 100, 0);

  // Filter + search
  const filtered = all
    .filter(w => filter === 'all' || w.status === filter)
    .filter(w => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return w.user.username?.toLowerCase().includes(q) ||
             w.user.email?.toLowerCase().includes(q) ||
             w.payment_details?.toLowerCase().includes(q);
    });

  const statCards = [
    { label: 'Pending',  value: pending.length,  amt: totalPendingAmt,  color: 'from-yellow-400 to-yellow-500', icon: '⏳', key: 'pending'  },
    { label: 'Approved', value: approved.length, amt: totalApprovedAmt, color: 'from-green-500 to-green-600',   icon: '✅', key: 'approved' },
    { label: 'Rejected', value: rejected.length, amt: null,             color: 'from-red-500 to-red-600',       icon: '❌', key: 'rejected' },
    { label: 'Total',    value: all.length,       amt: null,             color: 'from-blue-500 to-blue-600',     icon: '📋', key: 'all'      },
  ];

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-4">

      <h1 className="text-xl font-bold text-gray-800">Withdrawals 💸</h1>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold border ${message.includes('✅') ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Summary cards — clickable to filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(c => (
          <button key={c.key} onClick={() => setFilter(c.key)}
            className={`bg-gradient-to-br ${c.color} rounded-2xl p-4 text-white text-left transition hover:opacity-90 ${filter === c.key ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-100' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs opacity-80">{c.label}</p>
              <span className="text-lg">{c.icon}</span>
            </div>
            <p className="text-2xl font-black">{c.value}</p>
            {c.amt !== null && <p className="text-xs opacity-70 mt-0.5">Rs {c.amt.toFixed(0)}</p>}
          </button>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-xl p-3 shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by username, email or account..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
        />
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                filter === s
                  ? s === 'pending'  ? 'bg-yellow-500 text-white'
                  : s === 'approved' ? 'bg-green-500 text-white'
                  : s === 'rejected' ? 'bg-red-500 text-white'
                  : 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-gray-400 shadow-sm">
          No withdrawals found
        </div>
      ) : (
        <>
          {/* ── Mobile cards ── */}
          <div className="md:hidden space-y-3">
            {filtered.map(w => {
              const sc = statusColors[w.status];
              return (
                <div key={w.id} className="bg-white rounded-2xl shadow-sm p-3 space-y-2">
                  {/* Header row — user + status + approve/reject */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-800 text-sm truncate">{w.user.username}</p>
                      <p className="text-xs text-gray-400 truncate">{w.user.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {w.status === 'pending' ? (
                        <>
                          <button onClick={() => handleApprove(w.id, w.user.username)}
                            className="bg-green-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-green-600 transition">
                            ✅
                          </button>
                          <button onClick={() => handleReject(w.id, w.user.username)}
                            className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-red-600 transition">
                            ❌
                          </button>
                        </>
                      ) : (
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                          {w.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount + method + date */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-black text-green-600 text-sm">Rs {(w.amount * 100).toFixed(0)}</span>
                    <span className="capitalize text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">{w.payment_method}</span>
                    <span className="text-gray-400 ml-auto">{new Date(w.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Account details */}
                  <div className="bg-gray-50 rounded-xl px-3 py-1.5">
                    <p className="text-xs text-gray-400">Account</p>
                    <p className="text-xs text-gray-700 font-medium break-all">{w.payment_details}</p>
                  </div>

                  {w.admin_note && (
                    <p className="text-xs text-gray-400 italic">Note: {w.admin_note}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Desktop table ── */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Account / Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Note</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w, idx) => {
                  const sc = statusColors[w.status];
                  return (
                    <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 text-sm">{w.user.username}</p>
                        <p className="text-xs text-gray-400">{w.user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-black text-green-600">Rs {(w.amount * 100).toFixed(0)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-sm bg-gray-100 px-2 py-1 rounded-lg text-gray-600">{w.payment_method}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-[180px]">
                        <p className="break-all">{w.payment_details}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(w.created_at).toLocaleDateString()}
                        {w.processed_at && (
                          <p className="text-gray-400">Done: {new Date(w.processed_at).toLocaleDateString()}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-[120px]">
                        {w.admin_note || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {w.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleApprove(w.id, w.user.username)}
                              className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition whitespace-nowrap">
                              ✅ Approve
                            </button>
                            <button onClick={() => handleReject(w.id, w.user.username)}
                              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition whitespace-nowrap">
                              ❌ Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Table footer summary */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Showing {filtered.length} of {all.length} withdrawals</span>
              <span className="font-semibold text-gray-700">
                Total shown: Rs {filtered.reduce((s, w) => s + w.amount * 100, 0).toFixed(0)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageWithdrawals;
