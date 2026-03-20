import { useState, useEffect } from 'react';
import api from '../../api/axios';

// ── User Detail Panel ──────────────────────────────────────────────────────────
const UserDetail = ({ userId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [addBalanceAmt, setAddBalanceAmt] = useState('');
  const [subBalanceAmt, setSubBalanceAmt] = useState('');

  useEffect(() => { fetchDetail(); }, [userId]);

  const fetchDetail = async () => {
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
      const payload = {
        username: form.username,
        email: form.email,
        phone: form.phone,
        level: form.level,
        balance: parseFloat(form.balance) / 100,
      };
      if (form.password) payload.password = form.password;
      await api.post(`/admin/edit-user/${userId}/`, payload);
      flash('✅ User updated');
      fetchDetail();
    } catch (e) { flash(e.response?.data?.error || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const doBlock = async () => {
    const reason = prompt('Block reason:');
    if (!reason) return;
    await api.post(`/admin/block-user/${userId}/`, { reason });
    flash('✅ User blocked'); fetchDetail();
  };

  const doUnblock = async () => {
    await api.post(`/admin/unblock-user/${userId}/`);
    flash('✅ User unblocked'); fetchDetail();
  };

  const doBonus = async () => {
    if (!addBalanceAmt || isNaN(addBalanceAmt)) return;
    await api.post(`/admin/add-bonus/${userId}/`, { amount: parseFloat(addBalanceAmt) / 100, description: 'Admin credit' });
    flash(`✅ Rs ${addBalanceAmt} added`); setAddBalanceAmt(''); fetchDetail();
  };

  const doSubtract = async () => {
    if (!subBalanceAmt || isNaN(subBalanceAmt)) return;
    try {
      const wallet = data.wallet;
      const newBal = Math.max(0, wallet.main_balance - parseFloat(subBalanceAmt) / 100);
      await api.post(`/admin/edit-user/${userId}/`, { balance: newBal });
      flash(`✅ Rs ${subBalanceAmt} deducted`); setSubBalanceAmt(''); fetchDetail();
    } catch { flash('Failed to deduct'); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!data) return <div className="text-center text-gray-400 py-20">User not found</div>;

  const w = data.wallet;

  return (
    <div className="space-y-4">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-600">
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-800">User Detail — {data.username}</h1>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('✅') ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>
          {msg}
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 text-white">
          <p className="text-xs opacity-80 mb-1">💰 Balance</p>
          <p className="text-xl font-black">Rs {(w.main_balance * 100).toFixed(0)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
          <p className="text-xs opacity-80 mb-1">📥 Total Earned</p>
          <p className="text-xl font-black">Rs {(w.total_earned * 100).toFixed(0)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
          <p className="text-xs opacity-80 mb-1">💸 Withdrawn</p>
          <p className="text-xl font-black">Rs {(w.total_withdrawn * 100).toFixed(0)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white">
          <p className="text-xs opacity-80 mb-1">🔄 Transactions</p>
          <p className="text-xl font-black">{data.transaction_count}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {data.is_active ? (
            <button onClick={doBlock} className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition">
              🚫 Block User
            </button>
          ) : (
            <button onClick={doUnblock} className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition">
              ✅ Unblock User
            </button>
          )}
          <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${data.has_package ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            📦 Package: {data.has_package ? 'Active' : 'None'}
          </span>
          <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${data.is_email_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            📧 Email: {data.is_email_verified ? 'Verified' : 'Unverified'}
          </span>
          <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${data.two_factor_enabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
            🔐 2FA: {data.two_factor_enabled ? 'On' : 'Off'}
          </span>
        </div>
      </div>

      {/* Add / Subtract Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Add Balance (Rs)</p>
          <div className="flex gap-2">
            <input
              type="number"
              value={addBalanceAmt}
              onChange={e => setAddBalanceAmt(e.target.value)}
              placeholder="Amount in Rs"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
            />
            <button onClick={doBonus} className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition">
              Add
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Deduct Balance (Rs)</p>
          <div className="flex gap-2">
            <input
              type="number"
              value={subBalanceAmt}
              onChange={e => setSubBalanceAmt(e.target.value)}
              placeholder="Amount in Rs"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
            />
            <button onClick={doSubtract} className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition">
              Deduct
            </button>
          </div>
        </div>
      </div>

      {/* Edit Info Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-4">User Information</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-semibold">Username</label>
            <input value={form.username || ''} onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-semibold">Email</label>
            <input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-semibold">Phone</label>
            <input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+92 3001234567"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-semibold">Level</label>
            <input type="number" value={form.level || 1} onChange={e => setForm({ ...form, level: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-semibold">Main Balance (Rs)</label>
            <input type="number" value={form.balance || ''} onChange={e => setForm({ ...form, balance: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-semibold">
              New Password <span className="text-gray-400 font-normal">(leave blank to keep)</span>
            </label>
            <input type="password" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Enter new password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm" />
          </div>
        </div>

        {/* Read-only info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Referral Code</p>
            <p className="font-bold text-gray-700 text-sm mt-1">{data.referral_code}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Total Team</p>
            <p className="font-bold text-gray-700 text-sm mt-1">{data.total_team}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Points</p>
            <p className="font-bold text-gray-700 text-sm mt-1">{data.points}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Joined</p>
            <p className="font-bold text-gray-700 text-sm mt-1">{new Date(data.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <button
          onClick={saveInfo}
          disabled={saving}
          className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

// ── Users List ─────────────────────────────────────────────────────────────────
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users/');
      setUsers(res.data);
    } catch { setMessage('Failed to load users'); }
    finally { setLoading(false); }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedUserId) {
    return <UserDetail userId={selectedUserId} onBack={() => { setSelectedUserId(null); fetchUsers(); }} />;
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Manage Users 👥</h1>

      {message && (
        <div className="px-4 py-3 rounded-xl text-sm font-semibold border bg-red-50 border-red-300 text-red-700">
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUserId(user.id)}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800 text-sm">{user.username}</p>
                    <p className="text-xs text-gray-400">Level {user.level}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">Rs {(user.balance * 100).toFixed(0)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedUserId(user.id); }}
                      className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-orange-600 transition"
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
