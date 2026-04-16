import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Tab = ({ active, onClick, icon, label, badge }) => (
  <button onClick={onClick}
    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
      active ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
    }`}>
    <span>{icon}</span>{label}
    {badge > 0 && (
      <span className="bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {badge}
      </span>
    )}
  </button>
);

// ── All Approved Users ─────────────────────────────────────────────────────────
const ApprovedUsers = () => {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/approved-users/').then(r => setData(r.data)).catch(() => {});
  }, []);

  const filtered = data?.users?.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      {data && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Total Approved</p>
            <p className="text-2xl font-black text-green-700">{data.users.length}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Approved Today</p>
            <p className="text-2xl font-black text-blue-700">{data.today_approved}</p>
          </div>
        </div>
      )}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Search by name or email..."
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
      <div className="space-y-2">
        {filtered.map(u => (
          <div key={u.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-bold text-gray-800 text-sm">{u.username}</p>
              <p className="text-xs text-gray-400">{u.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                📦 {u.package_name} · Rs {u.package_amount} · Level {u.level}
              </p>
            </div>
            <div className="text-right">
              <p className="font-black text-green-600">Rs {(u.balance * 100).toFixed(0)}</p>
              <p className="text-xs text-gray-400">{u.approved_at ? new Date(u.approved_at).toLocaleDateString() : '-'}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {u.is_active ? 'Active' : 'Blocked'}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No approved users found</p>}
      </div>
    </div>
  );
};

// ── New User Requests ──────────────────────────────────────────────────────────
const NewUserRequests = ({ onRefresh }) => {
  const [data, setData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState('');
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const load = () => api.get('/admin/new-user-requests/').then(r => setData(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const approve = async (id, username) => {
    try { await api.post(`/admin/approve-package/${id}/`); flash(`✅ ${username} approved`); load(); onRefresh?.(); }
    catch { flash('❌ Failed'); }
  };
  const reject = async (id, username) => {
    const reason = prompt('Rejection reason:') || 'Rejected by admin';
    try { await api.post(`/admin/reject-package/${id}/`, { reason }); flash(`❌ ${username} rejected`); load(); onRefresh?.(); }
    catch { flash('❌ Failed'); }
  };

  return (
    <div className="space-y-4">
      {msg && <div className={`px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('✅') ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>{msg}</div>}
      {data && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Total Pending</p>
            <p className="text-2xl font-black text-yellow-700">{data.total}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Submitted Today</p>
            <p className="text-2xl font-black text-blue-700">{data.today}</p>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {data?.requests?.map(r => (
          <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-gray-800">{r.username}</p>
                <p className="text-xs text-gray-400">{r.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(r.submitted_at).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-orange-500">Rs {r.amount}</p>
                <p className="text-xs text-gray-400 capitalize">{r.package_name}</p>
              </div>
            </div>
            {r.screenshot && (
              <button onClick={() => setPreview(r.screenshot)}
                className="w-full mb-3 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-orange-400 transition">
                <img src={r.screenshot} alt="proof" loading="lazy" className="w-full object-cover" style={{ maxHeight: 140 }} />
                <p className="text-xs text-gray-400 py-1 text-center">Tap to enlarge</p>
              </button>
            )}
            <div className="flex gap-2">
              <button onClick={() => approve(r.id, r.username)} className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 transition">✅ Approve</button>
              <button onClick={() => reject(r.id, r.username)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition">❌ Reject</button>
            </div>
          </div>
        ))}
        {data?.requests?.length === 0 && <p className="text-center text-gray-400 py-8">🎉 No pending requests</p>}
      </div>
      {preview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl p-3 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <img src={preview} alt="screenshot" className="w-full rounded-xl object-contain max-h-[70vh]" />
            <button onClick={() => setPreview(null)} className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Withdrawal Requests ────────────────────────────────────────────────────────
const WithdrawalRequests = () => {
  const [data, setData] = useState(null);
  const [method, setMethod] = useState('all');
  const [msg, setMsg] = useState('');
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const load = () => api.get(`/admin/withdrawal-requests/?method=${method}`).then(r => setData(r.data)).catch(() => {});
  useEffect(() => { load(); }, [method]);

  const approve = async (id) => {
    const note = prompt('Approve note (optional):') ?? '';
    if (note === null) return;
    try { await api.post(`/admin/approve-withdrawal/${id}/`, { note }); flash('✅ Approved'); load(); }
    catch (e) { flash(e.response?.data?.error || '❌ Failed'); }
  };
  const reject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try { await api.post(`/admin/reject-withdrawal/${id}/`, { reason }); flash('✅ Rejected'); load(); }
    catch { flash('❌ Failed'); }
  };

  const methodColors = { jazzcash: 'bg-red-50 text-red-700', easypaisa: 'bg-green-50 text-green-700', bank: 'bg-blue-50 text-blue-700', paypal: 'bg-indigo-50 text-indigo-700' };

  return (
    <div className="space-y-4">
      {msg && <div className={`px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('✅') ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>{msg}</div>}

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-xl font-black text-yellow-700">{data.total_pending}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Today Approved</p>
            <p className="text-xl font-black text-green-700">{data.today_approved_count}</p>
            <p className="text-xs text-green-600">Rs {(data.today_approved_amount * 100).toFixed(0)}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Today Rejected</p>
            <p className="text-xl font-black text-red-700">{data.today_rejected_count}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">EasyPaisa</p>
            <p className="text-xl font-black text-gray-700">{data.easypaisa?.count}</p>
            <p className="text-xs text-gray-500">Rs {(data.easypaisa?.amount * 100).toFixed(0)}</p>
          </div>
        </div>
      )}

      {/* EasyPaisa & JazzCash breakdown */}
      {data && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-bold text-green-700">💚 EasyPaisa Pending</p>
            <p className="text-2xl font-black text-green-800 mt-1">{data.easypaisa?.count}</p>
            <p className="text-sm text-green-600">Rs {(data.easypaisa?.amount * 100).toFixed(0)}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-bold text-red-700">📱 JazzCash Pending</p>
            <p className="text-2xl font-black text-red-800 mt-1">{data.jazzcash?.count}</p>
            <p className="text-sm text-red-600">Rs {(data.jazzcash?.amount * 100).toFixed(0)}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'jazzcash', 'easypaisa', 'bank', 'paypal'].map(m => (
          <button key={m} onClick={() => setMethod(m)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${method === m ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {m}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {data?.pending?.map(w => (
          <div key={w.id} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-gray-800">{w.username}</p>
                <p className="text-xs text-gray-400">{w.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(w.created_at).toLocaleString()}</p>
                <div className="mt-1 bg-gray-50 px-3 py-2 rounded-xl">
                  <p className="text-xs font-semibold text-gray-600">Account Details:</p>
                  <p className="text-xs text-gray-700 mt-0.5 whitespace-pre-wrap">{w.payment_details}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-gray-800 text-lg">Rs {(w.amount * 100).toFixed(0)}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${methodColors[w.payment_method] || 'bg-gray-100 text-gray-600'}`}>
                  {w.payment_method}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approve(w.id)} className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 transition">✅ Approve</button>
              <button onClick={() => reject(w.id)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition">❌ Reject</button>
            </div>
          </div>
        ))}
        {data?.pending?.length === 0 && <p className="text-center text-gray-400 py-8">🎉 No pending withdrawals</p>}
      </div>
    </div>
  );
};

// ── Rejected Users ─────────────────────────────────────────────────────────────
const RejectedUsers = () => {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/rejected-users/').then(r => setData(r.data)).catch(() => {});
  }, []);

  const filtered = data?.users?.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      {data && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Rejected</p>
          <p className="text-2xl font-black text-red-700">{data.total}</p>
        </div>
      )}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Search..."
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
      <div className="space-y-2">
        {filtered.map(u => (
          <div key={u.id} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gray-800 text-sm">{u.username}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">📦 {u.package_name} · Rs {u.amount}</p>
                {u.admin_note && <p className="text-xs text-red-500 mt-1">Reason: {u.admin_note}</p>}
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">REJECTED</span>
                <p className="text-xs text-gray-400 mt-1">{u.processed_at ? new Date(u.processed_at).toLocaleDateString() : '-'}</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No rejected users</p>}
      </div>
    </div>
  );
};

// ── Main Reports Page ──────────────────────────────────────────────────────────
const AdminReports = () => {
  const [tab, setTab] = useState('approved');
  const [pendingCount, setPendingCount] = useState(0);
  const [withdrawalCount, setWithdrawalCount] = useState(0);

  const loadCounts = () => {
    api.get('/admin/package-payments/count/').then(r => setPendingCount(r.data.count)).catch(() => {});
    api.get('/admin/withdrawal-requests/').then(r => setWithdrawalCount(r.data.total_pending)).catch(() => {});
  };
  useEffect(() => { loadCounts(); }, []);

  const tabs = [
    { id: 'approved', icon: '✅', label: 'Approved Users' },
    { id: 'requests', icon: '📥', label: 'New Requests', badge: pendingCount },
    { id: 'withdrawals', icon: '💸', label: 'Withdrawals', badge: withdrawalCount },
    { id: 'rejected', icon: '❌', label: 'Rejected' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-800">📋 Reports</h1>
        <p className="text-gray-400 text-sm mt-0.5">Users, requests & withdrawals</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => <Tab key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} icon={t.icon} label={t.label} badge={t.badge} />)}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {tab === 'approved' && <ApprovedUsers />}
        {tab === 'requests' && <NewUserRequests onRefresh={loadCounts} />}
        {tab === 'withdrawals' && <WithdrawalRequests />}
        {tab === 'rejected' && <RejectedUsers />}
      </div>
    </div>
  );
};

export default AdminReports;
