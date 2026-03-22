import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

// ── Reusable User Detail (same as ManageUsers) ────────────────────────────────
const UserDetail = ({ userId, onBack }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [addAmt, setAddAmt] = useState('');
  const [subAmt, setSubAmt] = useState('');
  const [loginConfirm, setLoginConfirm] = useState(false);

  useEffect(() => { load(); }, [userId]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/user-detail/${userId}/`);
      setData(res.data);
      setForm({
        username: res.data.username,
        email: res.data.email,
        phone: res.data.phone || '',
        level: res.data.level,
        password: '',
        balance: (res.data.wallet.main_balance * 100).toFixed(0),
      });
    } catch { setMsg('Failed to load user'); }
    finally { setLoading(false); }
  };

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const saveInfo = async () => {
    setSaving(true);
    try {
      const payload = { username: form.username, email: form.email, phone: form.phone, level: form.level, balance: parseFloat(form.balance) / 100 };
      if (form.password) payload.password = form.password;
      await api.post(`/admin/edit-user/${userId}/`, payload);
      flash('✅ User updated'); load();
    } catch (e) { flash(e.response?.data?.error || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const doBlock = async () => {
    const reason = prompt('Block reason:');
    if (!reason) return;
    await api.post(`/admin/block-user/${userId}/`, { reason });
    flash('✅ Blocked'); load();
  };

  const doUnblock = async () => {
    await api.post(`/admin/unblock-user/${userId}/`);
    flash('✅ Unblocked'); load();
  };

  const doAdd = async () => {
    if (!addAmt || isNaN(addAmt)) return;
    await api.post(`/admin/add-bonus/${userId}/`, { amount: parseFloat(addAmt) / 100, description: 'Admin credit' });
    flash(`✅ Rs ${addAmt} added`); setAddAmt(''); load();
  };

  const doSub = async () => {
    if (!subAmt || isNaN(subAmt)) return;
    const newBal = Math.max(0, data.wallet.main_balance - parseFloat(subAmt) / 100);
    await api.post(`/admin/edit-user/${userId}/`, { balance: newBal });
    flash(`✅ Rs ${subAmt} deducted`); setSubAmt(''); load();
  };

  const doLoginAsUser = async () => {
    await logout();
    // pre-fill email on login page
    localStorage.setItem('prefill_email', data.email);
    navigate('/login');
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!data) return <div className="text-center text-gray-400 py-10">User not found</div>;

  const w = data.wallet;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition">
          ← Back to Dashboard
        </button>
        <h2 className="text-lg font-bold text-gray-800 truncate">{data.username} — {data.email}</h2>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('✅') ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>
          {msg}
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '💰 Balance', value: `Rs ${(w.main_balance * 100).toFixed(0)}`, color: 'from-orange-500 to-red-500' },
          { label: '📥 Total Added', value: `Rs ${(w.total_earned * 100).toFixed(0)}`, color: 'from-blue-500 to-blue-600' },
          { label: '💸 Withdrawn', value: `Rs ${(w.total_withdrawn * 100).toFixed(0)}`, color: 'from-purple-500 to-purple-600' },
          { label: '🔄 Transactions', value: data.transaction_count, color: 'from-green-500 to-green-600' },
        ].map((c, i) => (
          <div key={i} className={`bg-gradient-to-br ${c.color} rounded-2xl p-4 text-white`}>
            <p className="text-xs opacity-80 mb-1">{c.label}</p>
            <p className="text-xl font-black">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Status badges */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-2">
        {data.is_active ? (
          <button onClick={doBlock} className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition">🚫 Block</button>
        ) : (
          <button onClick={doUnblock} className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition">✅ Unblock</button>
        )}
        <button
          onClick={() => setLoginConfirm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 transition"
        >
          � Login as User
        </button>
        <span className={`px-3 py-2 rounded-xl text-xs font-semibold ${data.has_package ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          📦 Package: {data.has_package ? 'Active' : 'None'}
        </span>
        <span className={`px-3 py-2 rounded-xl text-xs font-semibold ${data.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {data.is_active ? '🟢 Active' : '🔴 Blocked'}
        </span>
        <span className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600">
          👥 Team: {data.total_team}
        </span>
        <span className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600">
          🏷 Code: {data.referral_code}
        </span>
        <span className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600">
          📅 Joined: {new Date(data.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Add / Deduct */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Add Balance (Rs)</p>
          <div className="flex gap-2">
            <input type="number" value={addAmt} onChange={e => setAddAmt(e.target.value)} placeholder="Amount"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
            <button onClick={doAdd} className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition">Add</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Deduct Balance (Rs)</p>
          <div className="flex gap-2">
            <input type="number" value={subAmt} onChange={e => setSubAmt(e.target.value)} placeholder="Amount"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
            <button onClick={doSub} className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition">Deduct</button>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-4">Edit User Info</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Username', key: 'username', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Phone', key: 'phone', type: 'text' },
            { label: 'Level', key: 'level', type: 'number' },
            { label: 'Balance (Rs)', key: 'balance', type: 'number' },
            { label: 'New Password', key: 'password', type: 'password', placeholder: 'Leave blank to keep' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-500 mb-1 block font-semibold">{f.label}</label>
              <input type={f.type} value={form[f.key] || ''} placeholder={f.placeholder || ''}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm" />
            </div>
          ))}
        </div>
        <button onClick={saveInfo} disabled={saving}
          className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Login as User confirm modal */}
      {loginConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Login as User?</h3>
              <p className="text-sm text-gray-500 mt-1">
                You will be logged out as admin and redirected to the login page.
              </p>
              <p className="text-sm font-semibold text-blue-600 mt-2 bg-blue-50 px-3 py-2 rounded-xl">
                {data.email}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setLoginConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={doLoginAsUser}
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-600 transition"
              >
                Yes, Logout & Go
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── User Search Widget ────────────────────────────────────────────────────────
const UserSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    api.get('/admin/users/').then(r => setAllUsers(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setSearching(true);
    const q = query.toLowerCase();
    const filtered = allUsers.filter(u =>
      u.email?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q)
    ).slice(0, 6);
    setResults(filtered);
    setSearching(false);
  }, [query, allUsers]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setResults([]); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
        <span className="text-gray-400 text-lg">🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search user by email or username..."
          className="flex-1 text-sm focus:outline-none text-gray-700 placeholder-gray-400"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 overflow-hidden">
          {results.map(u => (
            <button
              key={u.id}
              onClick={() => { onSelect(u.id); setQuery(''); setResults([]); }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition text-left border-b border-gray-50 last:border-0"
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{u.username}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <span className="text-xs font-bold text-green-600">Rs {(u.balance * 100).toFixed(0)}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {u.is_active ? 'Active' : 'Blocked'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {searching && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 px-4 py-3 text-sm text-gray-400">
          Searching...
        </div>
      )}

      {query && !searching && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 px-4 py-3 text-sm text-gray-400">
          No users found for "{query}"
        </div>
      )}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        api.get('/admin/dashboard-stats/'),
        api.get('/admin/recent-activities/'),
      ]);
      setStats(statsRes.data);
      setActivities(activitiesRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (selectedUserId) {
    return <UserDetail userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
  }

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
    <div className="space-y-5">

      {/* User Search */}
      <UserSearch onSelect={setSelectedUserId} />

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
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {activities?.recent_users?.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No users yet</p>}
            {activities?.recent_users?.map(u => (
              <button key={u.id} onClick={() => setSelectedUserId(u.id)}
                className="w-full flex justify-between items-center py-2 px-2 rounded-xl hover:bg-orange-50 transition border-b border-gray-50 last:border-0 text-left">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{u.username}</p>
                  <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {u.is_active ? 'Active' : 'Blocked'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4">Recent Withdrawals</h2>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {activities?.recent_withdrawals?.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No withdrawals yet</p>}
            {activities?.recent_withdrawals?.map(w => (
              <div key={w.id} className="flex justify-between items-center py-2 px-2 border-b border-gray-50 last:border-0">
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
