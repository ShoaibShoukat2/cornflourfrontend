import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

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
  const [withdrawals, setWithdrawals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [packagePayment, setPackagePayment] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [loginConfirm, setLoginConfirm] = useState(false);

  useEffect(() => { fetchDetail(); }, [userId]);

  const fetchDetail = async () => {
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
      flash('✅ User updated'); fetchDetail();
    } catch (e) { flash(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };
  const doBlock = async () => { const r = prompt('Block reason:'); if (!r) return; await api.post(`/admin/block-user/${userId}/`, { reason: r }); flash('✅ Blocked'); fetchDetail(); };
  const doUnblock = async () => { await api.post(`/admin/unblock-user/${userId}/`); flash('✅ Unblocked'); fetchDetail(); };
  const doAdd = async () => {
    if (!addAmt || isNaN(addAmt)) return;
    const desc = addRemarks.trim() ? `Admin bonus: ${addRemarks}` : 'Admin bonus: Manual Addition';
    await api.post(`/admin/add-bonus/${userId}/`, { amount: parseFloat(addAmt) / 100, description: desc });
    flash(`✅ Rs ${addAmt} added`); setAddAmt(''); setAddRemarks(''); fetchDetail();
  };
  const doSub = async () => {
    if (!subAmt || isNaN(subAmt)) return;
    const newBal = Math.max(0, data.wallet.main_balance - parseFloat(subAmt) / 100);
    await api.post(`/admin/edit-user/${userId}/`, { balance: newBal });
    const desc = subRemarks.trim() ? `Admin deduct: ${subRemarks}` : 'Admin deduct: Manual Subtraction';
    await api.post(`/admin/add-bonus/${userId}/`, { amount: -(parseFloat(subAmt) / 100), description: desc }).catch(() => {});
    flash(`✅ Rs ${subAmt} deducted`); setSubAmt(''); setSubRemarks(''); fetchDetail();
  };
  const approvePkg = async (id) => { try { await api.post(`/admin/approve-package/${id}/`); flash('✅ Approved'); fetchDetail(); } catch (e) { flash(e.response?.data?.error || 'Failed'); } };
  const rejectPkg = async (id) => { const r = prompt('Reason:') || 'Rejected'; try { await api.post(`/admin/reject-package/${id}/`, { reason: r }); flash('✅ Rejected'); fetchDetail(); } catch (e) { flash('Failed'); } };
  const approveW = async (id) => { const n = prompt('Note (optional):') ?? ''; try { await api.post(`/admin/approve-withdrawal/${id}/`, { note: n }); flash('✅ Approved'); fetchDetail(); } catch (e) { flash(e.response?.data?.error || 'Failed'); } };
  const rejectW = async (id) => { const r = prompt('Reason:'); if (!r) return; try { await api.post(`/admin/reject-withdrawal/${id}/`, { reason: r }); flash('✅ Rejected'); fetchDetail(); } catch { flash('Failed'); } };
  const doLogin = async () => { await logout(); localStorage.setItem('prefill_email', data.email); navigate('/login'); };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!data) return <div className="text-center text-gray-400 py-10">User not found</div>;
  const w = data.wallet;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold">← Back</button>
        <h2 className="text-lg font-bold text-gray-800 truncate">{data.username} — {data.email}</h2>
      </div>
      {msg && <div className={`px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('✅') ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>{msg}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['💰 Balance', `Rs ${(w.main_balance*100).toFixed(0)}`, 'from-orange-500 to-red-500'],
          ['📥 Total Earned', `Rs ${(w.total_earned*100).toFixed(0)}`, 'from-blue-500 to-blue-600'],
          ['💸 Withdrawn', `Rs ${(w.total_withdrawn*100).toFixed(0)}`, 'from-purple-500 to-purple-600'],
          ['🔄 Transactions', data.transaction_count, 'from-green-500 to-green-600']
        ].map(([label, value, color], i) => (
          <div key={i} className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white`}>
            <p className="text-xs opacity-80 mb-1">{label}</p>
            <p className="text-xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-2">
        {data.is_active
          ? <button onClick={doBlock} className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition">🚫 Block</button>
          : <button onClick={doUnblock} className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition">✅ Unblock</button>}
        <button onClick={() => setLoginConfirm(true)} className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 transition">👤 Login as User</button>
        <span className={`px-3 py-2 rounded-xl text-xs font-semibold ${data.has_package ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>📦 {data.has_package ? 'Active' : 'No Package'}</span>
        <span className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600">👥 Team: {data.total_team}</span>
        <span className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600">🏷 Level: {data.level}</span>
        <span className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600">📅 {new Date(data.created_at).toLocaleDateString()}</span>
      </div>

      {/* Upliner / Referrer Info */}
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

      {packagePayment && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">📦 Package Payment</p>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${packagePayment.status==='pending'?'bg-yellow-100 text-yellow-700':packagePayment.status==='approved'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{packagePayment.status.toUpperCase()}</span>
              <p className="text-xs text-gray-400 mt-1">{new Date(packagePayment.submitted_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              {packagePayment.screenshot && <button onClick={() => setScreenshotPreview(packagePayment.screenshot)} className="text-xs text-blue-500 underline">View Screenshot</button>}
              {packagePayment.status === 'pending' && <>
                <button onClick={() => approvePkg(packagePayment.id)} className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600">✅ Approve</button>
                <button onClick={() => rejectPkg(packagePayment.id)} className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600">❌ Reject</button>
              </>}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">➕ Add Balance (Rs)</p>
          <div className="space-y-2">
            <input type="number" value={addAmt} onChange={e => setAddAmt(e.target.value)} placeholder="Amount in Rs" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400" />
            <input type="text" value={addRemarks} onChange={e => setAddRemarks(e.target.value)} placeholder="Remarks (e.g. Bonus...)" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400" />
            <button onClick={doAdd} className="w-full bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600">Add Balance</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">➖ Deduct Balance (Rs)</p>
          <div className="space-y-2">
            <input type="number" value={subAmt} onChange={e => setSubAmt(e.target.value)} placeholder="Amount in Rs" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400" />
            <input type="text" value={subRemarks} onChange={e => setSubRemarks(e.target.value)} placeholder="Remarks (e.g. Penalty...)" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400" />
            <button onClick={doSub} className="w-full bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600">Deduct Balance</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase">📜 Full Earning History ({transactions.length})</p>
        </div>
        {transactions.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No transactions yet</p> : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {transactions.map(tx => {
              const isPos = tx.amount >= 0;
              const colors = { task:'bg-blue-100 text-blue-700', referral:'bg-purple-100 text-purple-700', bonus:'bg-green-100 text-green-700', withdrawal:'bg-red-100 text-red-700' };
              return (
                <div key={tx.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors[tx.transaction_type]||'bg-gray-100 text-gray-600'}`}>{tx.transaction_type}</span>
                      <p className="text-xs text-gray-500 truncate">{tx.description}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                  <p className={`font-black text-sm flex-shrink-0 ${isPos?'text-green-600':'text-red-600'}`}>{isPos?'+':''}Rs {(tx.amount*100).toFixed(0)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">💸 Withdrawal History ({withdrawals.length})</p>
        {withdrawals.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No withdrawals yet</p> : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {withdrawals.map(wd => (
              <div key={wd.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-800">Rs {(wd.amount*100).toFixed(0)}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-lg capitalize">{wd.payment_method}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${wd.status==='approved'?'bg-green-100 text-green-700':wd.status==='pending'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{wd.status}</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 whitespace-pre-wrap">{wd.payment_details}</p>
                  <p className="text-xs text-gray-400">Requested: {new Date(wd.created_at).toLocaleString()}</p>
                  {wd.processed_at && <p className="text-xs text-gray-400">Processed: {new Date(wd.processed_at).toLocaleString()}</p>}
                  {wd.admin_note && <p className="text-xs text-blue-500 italic">Note: {wd.admin_note}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {wd.status === 'pending' ? <>
                    <button onClick={() => approveW(wd.id)} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600">✅</button>
                    <button onClick={() => rejectW(wd.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600">❌</button>
                  </> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-4">Edit User Info</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[['Username','username','text'],['Email','email','email'],['Phone','phone','text'],['Level','level','number'],['Balance (Rs)','balance','number'],['New Password','password','password']].map(([label,key,type]) => (
            <div key={key}>
              <label className="text-xs text-gray-500 mb-1 block font-semibold">{label}</label>
              <input type={type} value={form[key]||''} placeholder={key==='password'?'Leave blank to keep':''} onChange={e => setForm({...form,[key]:e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm" />
            </div>
          ))}
        </div>
        <button onClick={saveInfo} disabled={saving} className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {screenshotPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setScreenshotPreview(null)}>
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <img src={screenshotPreview} alt="screenshot" className="w-full rounded-xl object-contain max-h-96" />
            <button onClick={() => setScreenshotPreview(null)} className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-semibold">Close</button>
          </div>
        </div>
      )}

      {loginConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <p className="font-bold text-gray-800 text-lg">Login as User?</p>
              <p className="text-sm font-semibold text-blue-600 mt-2 bg-blue-50 px-3 py-2 rounded-xl">{data.email}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setLoginConfirm(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm">Cancel</button>
              <button onClick={doLogin} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-600">Yes, Go</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// -- Users List -----------------------------------------------------------------
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { setPage(1); }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchUsers(); }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const search = searchTerm.trim();
      const url = `/admin/users/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      const res = await api.get(url);
      if (res.data.users) {
        setUsers(res.data.users);
        setTotalPages(res.data.total_pages || 1);
        setTotal(res.data.total || 0);
      } else {
        setUsers(Array.isArray(res.data) ? res.data : []);
        setTotalPages(1);
        setTotal(Array.isArray(res.data) ? res.data.length : 0);
      }
    } catch { setMessage('Failed to load users'); }
    finally { setLoading(false); }
  };

  if (selectedUserId) {
    return <UserDetail userId={selectedUserId} onBack={() => { setSelectedUserId(null); fetchUsers(); }} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users ??</h1>
        <span className="text-sm text-gray-400">{total} total</span>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-xl text-sm font-semibold border bg-red-50 border-red-300 text-red-700">
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <input type="text" placeholder="?? Search by username or email..."
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:hidden divide-y divide-gray-100">
            {users.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No users found</p>
            ) : users.map(user => (
              <div key={user.id} className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50" onClick={() => setSelectedUserId(user.id)}>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{user.username}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  <p className="text-xs font-bold text-green-600 mt-0.5">Rs {(user.balance * 100).toFixed(0)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.is_active ? 'Active' : 'Blocked'}
                  </span>
                  <span className="text-gray-400">ï¿½</span>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
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
                {users.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
                ) : users.map(user => (
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
                      <button onClick={e => { e.stopPropagation(); setSelectedUserId(user.id); }}
                        className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-orange-600 transition">
                        View Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed">
            ? Previous
          </button>
          <span className="text-sm text-gray-600 font-semibold">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed">
            Next ?
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
