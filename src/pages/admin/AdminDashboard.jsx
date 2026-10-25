import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  UsersIcon,
  UserGroupIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  FlagIcon,
  Cog6ToothIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  ChevronRightIcon,
  UserPlusIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import DashboardCharts from '../../components/admin/DashboardCharts';

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
  const [addRemarks, setAddRemarks] = useState('');
  const [subAmt, setSubAmt] = useState('');
  const [subRemarks, setSubRemarks] = useState('');
  const [loginConfirm, setLoginConfirm] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [packagePayment, setPackagePayment] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  useEffect(() => { load(); }, [userId]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/user-full/${userId}/`);
      const { detail, withdrawals: wds, transactions: txs, package_payment } = res.data;
      setData(detail);
      setWithdrawals(wds);
      setTransactions(txs);
      setPackagePayment(package_payment);
      setForm({
        username: detail.username,
        email: detail.email,
        phone: detail.phone || '',
        level: detail.level,
        password: '',
        balance: (detail.wallet.main_balance * 100).toFixed(0),
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
    const desc = addRemarks.trim() ? `Admin bonus: ${addRemarks}` : 'Admin bonus: Manual Addition';
    await api.post(`/admin/add-bonus/${userId}/`, { amount: parseFloat(addAmt) / 100, description: desc });
    flash(`✅ Rs ${addAmt} added`); setAddAmt(''); setAddRemarks(''); load();
  };

  const doSub = async () => {
    if (!subAmt || isNaN(subAmt)) return;
    const newBal = Math.max(0, data.wallet.main_balance - parseFloat(subAmt) / 100);
    await api.post(`/admin/edit-user/${userId}/`, { balance: newBal });
    const desc = subRemarks.trim() ? `Admin deduct: ${subRemarks}` : 'Admin deduct: Manual Subtraction';
    await api.post(`/admin/add-bonus/${userId}/`, { amount: -(parseFloat(subAmt) / 100), description: desc }).catch(() => {});
    flash(`✅ Rs ${subAmt} deducted`); setSubAmt(''); setSubRemarks(''); load();
  };

  const approvePkg = async (id) => {
    try {
      await api.post(`/admin/approve-package/${id}/`);
      flash('✅ Package approved'); load();
    } catch (e) { flash(e.response?.data?.error || 'Failed'); }
  };

  const rejectPkg = async (id) => {
    const reason = prompt('Rejection reason:') || 'Rejected by admin';
    try {
      await api.post(`/admin/reject-package/${id}/`, { reason });
      flash('✅ Package rejected'); load();
    } catch (e) { flash(e.response?.data?.error || 'Failed'); }
  };

  const doLoginAsUser = async () => {
    await logout();
    localStorage.setItem('prefill_email', data.email);
    navigate('/login');
  };

  const approveW = async (id) => {
    const note = prompt('Approve note (optional):') ?? '';
    if (note === null) return;
    try {
      await api.post(`/admin/approve-withdrawal/${id}/`, { note });
      flash('✅ Withdrawal approved');
      const res = await api.get(`/admin/user-withdrawals/${userId}/`);
      setWithdrawals(res.data);
      load();
    } catch (e) { flash(e.response?.data?.error || 'Failed'); }
  };

  const rejectW = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try {
      await api.post(`/admin/reject-withdrawal/${id}/`, { reason });
      flash('✅ Withdrawal rejected');
      const res = await api.get(`/admin/user-withdrawals/${userId}/`);
      setWithdrawals(res.data);
      load();
    } catch (e) { flash(e.response?.data?.error || 'Failed'); }
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
          👤 Login as User
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

      {/* Upliner Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">🔗 Upliner (Referred By)</p>
        {data.referred_by ? (
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {data.referred_by.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-800 text-sm">{data.referred_by.username}</p>
              <p className="text-xs text-gray-500">{data.referred_by.email}</p>
              <p className="text-xs text-blue-500 mt-0.5">Code: {data.referred_by.referral_code}</p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-semibold">Upliner</span>
          </div>
        ) : (
          <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-3">No upliner — Direct registration</p>
        )}
      </div>

      {/* Package Payment Status */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">📦 Package Payment</p>
        {!packagePayment ? (
          <p className="text-sm text-gray-400">No package payment submitted</p>
        ) : (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                packagePayment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                packagePayment.status === 'approved' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {packagePayment.status.toUpperCase()}
              </span>
              <p className="text-xs text-gray-400 mt-1">{new Date(packagePayment.submitted_at).toLocaleString()}</p>
              {packagePayment.admin_note && <p className="text-xs text-gray-500 italic mt-0.5">Note: {packagePayment.admin_note}</p>}
            </div>
            <div className="flex items-center gap-2">
              {packagePayment.screenshot && (
                <button onClick={() => setScreenshotPreview(packagePayment.screenshot)}
                  className="text-xs text-blue-500 underline">View Screenshot</button>
              )}
              {packagePayment.status === 'pending' && (
                <>
                  <button onClick={() => approvePkg(packagePayment.id)}
                    className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition">
                    ✅ Approve
                  </button>
                  <button onClick={() => rejectPkg(packagePayment.id)}
                    className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition">
                    ❌ Reject
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add / Deduct */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">➕ Add Balance (Rs)</p>
          <div className="space-y-2">
            <input type="number" value={addAmt} onChange={e => setAddAmt(e.target.value)} placeholder="Amount in Rs"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-green-400" />
            <input type="text" value={addRemarks} onChange={e => setAddRemarks(e.target.value)} placeholder="Remarks (e.g. Bonus, Compensation...)"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-green-400" />
            <button onClick={doAdd} className="w-full bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition">Add Balance</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">➖ Deduct Balance (Rs)</p>
          <div className="space-y-2">
            <input type="number" value={subAmt} onChange={e => setSubAmt(e.target.value)} placeholder="Amount in Rs"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-red-400" />
            <input type="text" value={subRemarks} onChange={e => setSubRemarks(e.target.value)} placeholder="Remarks (e.g. Penalty, Correction...)"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-red-400" />
            <button onClick={doSub} className="w-full bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition">Deduct Balance</button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">📜 Full Earning History</p>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No transactions yet</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {transactions.map(tx => {
              const isPositive = tx.amount >= 0;
              const typeColors = {
                task: 'bg-blue-100 text-blue-700',
                referral: 'bg-purple-100 text-purple-700',
                bonus: 'bg-green-100 text-green-700',
                withdrawal: 'bg-red-100 text-red-700',
                commission: 'bg-orange-100 text-orange-700',
              };
              return (
                <div key={tx.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${typeColors[tx.transaction_type] || 'bg-gray-100 text-gray-600'}`}>
                        {tx.transaction_type}
                      </span>
                      <p className="text-xs text-gray-500 truncate">{tx.description}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                  <p className={`font-black text-sm flex-shrink-0 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}Rs {(tx.amount * 100).toFixed(0)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdrawals */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Withdrawal History</p>
        {withdrawals.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No withdrawals yet</p>
        ) : (
          <div className="space-y-2">
            {withdrawals.map(w => (
              <div key={w.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-800">Rs {(w.amount * 100).toFixed(0)}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-lg capitalize">{w.payment_method}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{w.payment_details}</p>
                  <p className="text-xs text-gray-400">{new Date(w.created_at).toLocaleDateString()}</p>
                  {w.admin_note && <p className="text-xs text-gray-400 italic">Note: {w.admin_note}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {w.status === 'pending' ? (
                    <>
                      <button onClick={() => approveW(w.id)}
                        className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition">
                        ✅ Approve
                      </button>
                      <button onClick={() => rejectW(w.id)}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition">
                        ❌ Reject
                      </button>
                    </>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      w.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {w.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 text-sm" />
            </div>
          ))}
        </div>
        <button onClick={saveInfo} disabled={saving}
          className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Screenshot Modal */}
      {screenshotPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setScreenshotPreview(null)}>
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <img src={screenshotPreview} alt="Payment screenshot" className="w-full rounded-xl object-contain max-h-96" />
            <button onClick={() => setScreenshotPreview(null)}
              className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-semibold">
              Close
            </button>
          </div>
        </div>
      )}

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

// ── Dashboard UI helpers ───────────────────────────────────────────────────────
const StatCard = ({ to, icon: Icon, label, value, sub, accent }) => (
  <Link
    to={to}
    className={`group block bg-gradient-to-br ${accent} rounded-2xl p-4 text-white shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all duration-200`}
  >
    <div className="flex items-start justify-between gap-2 mb-3">
      <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition">
        <Icon className="w-6 h-6" />
      </div>
      <span className="flex items-center gap-0.5 text-xs font-semibold bg-white/20 group-hover:bg-white/30 px-2.5 py-1 rounded-lg transition">
        View all
        <ChevronRightIcon className="w-3.5 h-3.5" />
      </span>
    </div>
    <p className="text-xs opacity-90 font-medium">{label}</p>
    <p className="text-2xl font-black mt-0.5">{value}</p>
    {sub && <p className="text-xs opacity-75 mt-2">{sub}</p>}
  </Link>
);

const InfoCard = ({ to, icon: Icon, label, value, color, bg, badge }) => (
  <Link
    to={to}
    className={`${bg} rounded-2xl p-4 border border-transparent hover:border-gray-200 hover:shadow-md transition-all group block`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className={`w-9 h-9 rounded-xl ${color} bg-white/80 flex items-center justify-center shadow-sm`}>
        <Icon className="w-5 h-5" />
      </div>
      {badge != null && badge > 0 && (
        <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full animate-pulse">
          {badge}
        </span>
      )}
      <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
    </div>
    <p className="text-xs text-gray-500 font-medium">{label}</p>
    <p className={`text-xl font-black mt-0.5 ${color}`}>{value}</p>
  </Link>
);

const QuickAction = ({ to, icon: Icon, label, desc, color }) => (
  <Link
    to={to}
    className="flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-gray-100 p-4 hover:border-orange-300 hover:shadow-md hover:bg-orange-50/50 transition-all group text-center min-h-[100px]"
  >
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-bold text-gray-800">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
    </div>
  </Link>
);

const AlertChip = ({ to, icon: Icon, label, count, urgent }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:shadow-sm ${
      urgent && count > 0
        ? 'bg-red-50 border-red-200 hover:bg-red-100'
        : count > 0
          ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
          : 'bg-green-50 border-green-200 hover:bg-green-100'
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
      urgent && count > 0 ? 'bg-red-500' : count > 0 ? 'bg-amber-500' : 'bg-green-500'
    }`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-800">{label}</p>
      <p className="text-xs text-gray-500">
        {count > 0 ? `${count} needs action` : 'All clear'}
      </p>
    </div>
    <div className="flex items-center gap-1 flex-shrink-0">
      <span className={`text-lg font-black ${count > 0 ? (urgent ? 'text-red-600' : 'text-amber-600') : 'text-green-600'}`}>
        {count}
      </span>
      <ChevronRightIcon className="w-4 h-4 text-gray-400" />
    </div>
  </Link>
);

// ── User Search Widget ────────────────────────────────────────────────────────
const UserSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/admin/users/?search=${encodeURIComponent(query.trim())}`);
        const users = res.data.users ?? (Array.isArray(res.data) ? res.data : []);
        setResults(users.slice(0, 8));
      } catch { }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setResults([]); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search user by email or username..."
          className="flex-1 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none"
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
  const [recent, setRecent] = useState(null);
  const [pendingPackages, setPendingPackages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chartRefresh, setChartRefresh] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const [statsRes, recentRes, pkgRes] = await Promise.allSettled([
        api.get('/admin/dashboard-stats/'),
        api.get('/admin/recent-activities/'),
        api.get('/admin/package-payments/count/'),
      ]);
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
        setChartRefresh((t) => t + 1);
      }
      if (recentRes.status === 'fulfilled') setRecent(recentRes.value.data);
      if (pkgRes.status === 'fulfilled') setPendingPackages(pkgRes.value.data.count || 0);
      if (statsRes.status !== 'fulfilled') {
        setError('Dashboard data load nahi hui. Internet check karke Retry dabain.');
      }
    } catch (e) {
      console.error(e);
      setError('Dashboard data load nahi hui. Retry karein.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (selectedUserId) {
    return <UserDetail userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
  }

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 gap-3">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading dashboard...</p>
    </div>
  );

  if (!stats) return (
    <div className="text-center py-20 space-y-3">
      <p className="text-gray-500">{error || 'No data available'}</p>
      <button
        onClick={() => fetchData()}
        className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
      >
        Retry
      </button>
    </div>
  );

  const statCards = [
    { label: 'Total Users', value: stats.users.total, sub: `+${stats.users.new_today || 0} new today · ${stats.users.today_approved || 0} approved today`, accent: 'from-blue-500 to-blue-600', icon: UsersIcon, to: '/admin/users' },
    { label: 'Approved Members', value: stats.users.approved, sub: `Today deposited: Rs ${Number(stats.users.today_deposited || 0).toFixed(0)}`, accent: 'from-green-500 to-green-600', icon: CheckCircleIcon, to: '/admin/reports' },
    { label: 'Pending Accounts', value: stats.users.pending || 0, sub: `Rejected ${stats.users.rejected || 0}`, accent: 'from-amber-500 to-orange-500', icon: ClipboardDocumentListIcon, to: '/admin/packages' },
    { label: 'Active / Inactive', value: stats.users.active, sub: `Inactive ${stats.users.inactive || 0} · Team ${stats.users.team || 0}`, accent: 'from-teal-500 to-cyan-600', icon: UserGroupIcon, to: '/admin/users' },
    { label: 'Total Deposited', value: `Rs ${Number(stats.financial.total_deposited).toFixed(0)}`, sub: 'All approved packages', accent: 'from-orange-500 to-red-500', icon: ArrowDownTrayIcon, to: '/admin/packages' },
    { label: 'Referral Commission', value: `Rs ${(stats.financial.total_referral_commission * 100).toFixed(0)}`, sub: 'Level 1 + 2 + 3', accent: 'from-purple-500 to-purple-600', icon: UserGroupIcon, to: '/admin/reports' },
    { label: "Today's Withdrawals", value: `Rs ${(stats.financial.today_withdrawals * 100).toFixed(0)}`, sub: `${stats.financial.pending_count} pending requests`, accent: 'from-yellow-500 to-amber-600', icon: ArrowUpTrayIcon, to: '/admin/withdrawals' },
    { label: 'Total Withdrawn', value: `Rs ${(stats.financial.total_withdrawals * 100).toFixed(0)}`, sub: `Pending: Rs ${(stats.financial.pending_withdrawals * 100).toFixed(0)}`, accent: 'from-red-500 to-red-600', icon: CurrencyDollarIcon, to: '/admin/withdrawals' },
  ];

  const quickActions = [
    { label: 'Users', desc: 'Manage all', to: '/admin/users', icon: UsersIcon, color: 'bg-blue-500' },
    { label: 'Withdrawals', desc: 'Approve payouts', to: '/admin/withdrawals', icon: BanknotesIcon, color: 'bg-red-500' },
    { label: 'Packages', desc: 'Deposits', to: '/admin/packages', icon: CubeIcon, color: 'bg-orange-500' },
    { label: 'Reports', desc: 'Requests', to: '/admin/reports', icon: ClipboardDocumentListIcon, color: 'bg-green-500' },
    { label: 'Tasks', desc: 'Manage tasks', to: '/admin/tasks', icon: FlagIcon, color: 'bg-purple-500' },
    { label: 'Settings', desc: 'Site config', to: '/admin/settings', icon: Cog6ToothIcon, color: 'bg-slate-600' },
    { label: 'Contact', desc: 'Support links', to: '/admin/contact', icon: EnvelopeIcon, color: 'bg-teal-500' },
    { label: 'Complaints', desc: 'Feedback box', to: '/admin/complaints', icon: EnvelopeIcon, color: 'bg-rose-500' },
    { label: 'History', desc: 'Date filters', to: '/admin/history', icon: ClipboardDocumentListIcon, color: 'bg-sky-600' },
    { label: 'Terms', desc: 'Edit policies', to: '/admin/terms', icon: Cog6ToothIcon, color: 'bg-slate-500' },
    { label: 'Analytics', desc: 'Full reports', to: '/admin/reports', icon: ChartBarIcon, color: 'bg-indigo-500' },
  ];

  const todayLabel = new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-orange-500" />
            <h1 className="text-xl font-black text-gray-800">Admin Overview</h1>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{todayLabel}</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-orange-300 transition disabled:opacity-60"
        >
          <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* User Search */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
          <MagnifyingGlassIcon className="w-3.5 h-3.5" />
          Quick user lookup
        </p>
        <UserSearch onSelect={setSelectedUserId} />
      </div>

      {/* Needs attention */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
          <BoltIcon className="w-3.5 h-3.5 text-amber-500" />
          Needs your attention — tap to open
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <AlertChip to="/admin/withdrawals" icon={ClockIcon} label="Pending Withdrawals" count={stats.financial.pending_count} urgent />
          <AlertChip to="/admin/packages" icon={CubeIcon} label="Pending Packages" count={pendingPackages} urgent />
          <AlertChip to="/admin/users" icon={XCircleIcon} label="Blocked Users" count={stats.users.blocked} urgent={false} />
          <AlertChip to="/admin/reports" icon={ShieldExclamationIcon} label="Fraud Alerts" count={stats.security.fraud_alerts} urgent />
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Quick actions — one tap</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {quickActions.map((a) => (
            <QuickAction key={a.label} {...a} />
          ))}
        </div>
      </div>

      {/* Stat Cards — full card clickable */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Key metrics — tap any card</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>

      {/* Live charts — profit, users, packages */}
      <DashboardCharts refreshToken={chartRefresh} />

      {/* Info + Task row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <InfoCard to="/admin/users" icon={UserPlusIcon} label="New Users Today" value={stats.users.new_today} color="text-blue-600" bg="bg-blue-50" badge={stats.users.new_today} />
        <InfoCard to="/admin/users" icon={XCircleIcon} label="Blocked Users" value={stats.users.blocked} color="text-red-600" bg="bg-red-50" badge={stats.users.blocked} />
        <InfoCard to="/admin/reports" icon={ShieldExclamationIcon} label="Fraud Alerts" value={stats.security.fraud_alerts} color="text-amber-600" bg="bg-amber-50" badge={stats.security.fraud_alerts} />
        <InfoCard to="/admin/withdrawals" icon={BanknotesIcon} label="Pending Amount" value={`Rs ${(stats.financial.pending_withdrawals * 100).toFixed(0)}`} color="text-purple-600" bg="bg-purple-50" badge={stats.financial.pending_count} />
      </div>

      {/* Tasks summary */}
      {stats.tasks && (
        <Link to="/admin/tasks" className="block bg-white rounded-2xl border border-gray-100 p-4 hover:border-orange-300 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <FlagIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Tasks Overview</p>
                <p className="text-xs text-gray-500">{stats.tasks.active} active · {stats.tasks.completed_today} done today</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500">Total completed</p>
                <p className="font-black text-purple-600">{stats.tasks.total_completed}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-orange-500 group-hover:gap-2 transition-all">
                Manage tasks <ChevronRightIcon className="w-4 h-4" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Earnings Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-orange-500" />
            Earnings Breakdown
          </h2>
          <Link to="/admin/reports" className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
            Full reports <ChevronRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { label: 'Task Earnings', value: `Rs ${(stats.earnings_breakdown.task_earnings * 100).toFixed(0)}`, color: 'text-green-700', bg: 'bg-green-50', to: '/admin/tasks' },
            { label: 'Manual Additions', value: `Rs ${(stats.earnings_breakdown.manual_additions * 100).toFixed(0)}`, color: 'text-blue-700', bg: 'bg-blue-50', to: '/admin/users' },
            { label: 'Manual Deductions', value: `Rs ${(stats.earnings_breakdown.manual_subtractions * 100).toFixed(0)}`, color: 'text-red-700', bg: 'bg-red-50', to: '/admin/users' },
            { label: 'Net Manual', value: `Rs ${(stats.earnings_breakdown.net_manual * 100).toFixed(0)}`, color: stats.earnings_breakdown.net_manual >= 0 ? 'text-green-700' : 'text-red-700', bg: 'bg-gray-50', to: '/admin/reports' },
          ].map((c) => (
            <Link key={c.label} to={c.to} className={`${c.bg} rounded-2xl p-4 hover:shadow-md transition group block`}>
              <p className="text-xs text-gray-500 mb-1">{c.label}</p>
              <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
              <p className="text-xs text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
                View <ChevronRightIcon className="w-3 h-3" />
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <UserPlusIcon className="w-4 h-4 text-blue-500" />
                Recent Signups
              </h3>
              <Link to="/admin/users" className="text-xs font-semibold text-orange-500 flex items-center gap-0.5 hover:gap-1 transition-all">
                View all <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(recent.recent_users || []).slice(0, 6).map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className="w-full flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 hover:border-orange-200 border border-transparent transition text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {u.username?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{u.username}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.is_active ? 'Active' : 'Blocked'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
              {(!recent.recent_users || recent.recent_users.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-6">No recent signups</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <BanknotesIcon className="w-4 h-4 text-red-500" />
                Recent Withdrawals
              </h3>
              <Link to="/admin/withdrawals" className="text-xs font-semibold text-orange-500 flex items-center gap-0.5 hover:gap-1 transition-all">
                View all <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(recent.recent_withdrawals || []).slice(0, 6).map((w) => (
                <Link
                  key={w.id}
                  to="/admin/withdrawals"
                  className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{w.user__username}</p>
                    <p className="text-xs text-gray-400 capitalize">{w.payment_method}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-gray-800 text-sm">Rs {(w.amount * 100).toFixed(0)}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      w.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      w.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                </Link>
              ))}
              {(!recent.recent_withdrawals || recent.recent_withdrawals.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-6">No recent withdrawals</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
