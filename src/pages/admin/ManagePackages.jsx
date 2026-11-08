import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

const ManagePackages = () => {
  const [payments, setPayments] = useState([]);
  const [account, setAccount] = useState({ account_title: '', account_number: '', bank_name: '', instructions: '' });
  const [accountSaved, setAccountSaved] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editScreenshot, setEditScreenshot] = useState(null);
  const [plans, setPlans] = useState([
    { key: 'normal', name: 'Normal' },
    { key: 'super', name: 'Super' },
    { key: 'premium', name: 'Premium' },
    { key: 'high_octane', name: 'High Octane' },
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch account only once on mount
  useEffect(() => {
    api.get('/admin/payment-account/').then(res => {
      if (res.data?.bank_name) setAccount(res.data);
    }).catch(() => {});
    api.get('/auth/plans/').then(res => {
      if (Array.isArray(res.data) && res.data.length) setPlans(res.data);
    }).catch(() => {});
  }, []);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/package-payments/?status=${filter}`);
      setPayments(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filter]);

  // Fetch payments when filter changes
  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const saveAccount = async () => {
    try {
      await api.post('/admin/payment-account/', account);
      setAccountSaved(true);
      setTimeout(() => setAccountSaved(false), 2000);
    } catch (e) { console.error(e); }
  };

  const approve = async (id) => {
    try {
      await api.post(`/admin/approve-package/${id}/`);
      setMessage('✅ Approved');
      fetchPayments();
    } catch (e) { console.error(e); }
  };

  const reject = async (id) => {
    const reason = prompt('Rejection reason (optional):') || 'Rejected by admin';
    try {
      await api.post(`/admin/reject-package/${id}/`, { reason });
      setMessage('✅ Rejected');
      fetchPayments();
    } catch (e) { console.error(e); }
  };

  const beginEdit = (payment) => {
    setEditing({
      ...payment,
      package_name: payment.package_name || 'normal',
      amount: String(payment.amount ?? ''),
      sender_name: payment.sender_name || '',
      sender_number: payment.sender_number || '',
    });
    setEditScreenshot(null);
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editing) return;
    try {
      const payload = {
        package_name: editing.package_name,
        amount: editing.amount,
        sender_name: editing.sender_name,
        sender_number: editing.sender_number,
      };
      if (editScreenshot) payload.screenshot = editScreenshot;
      await api.post(`/admin/package-payments/${editing.id}/edit/`, payload);
      setEditing(null);
      setEditScreenshot(null);
      setMessage('✅ Payment request updated. Final saved details will be used on approval.');
      fetchPayments();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Could not save payment request');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">📦 Manage Packages</h1>

        {message && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl text-sm font-semibold">
            {message}
          </div>
        )}

        {/* Bank Account Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-700 mb-4">Bank Account Details (shown to users)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Bank Name</label>
              <input value={account.bank_name}
                onChange={e => setAccount({ ...account, bank_name: e.target.value })}
                placeholder="e.g. JazzCash"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Account Title</label>
              <input value={account.account_title}
                onChange={e => setAccount({ ...account, account_title: e.target.value })}
                placeholder="e.g. Muhammad Ali"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Account Number</label>
              <input value={account.account_number}
                onChange={e => setAccount({ ...account, account_number: e.target.value })}
                placeholder="e.g. 03001234567"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Instructions (optional)</label>
              <input value={account.instructions}
                onChange={e => setAccount({ ...account, instructions: e.target.value })}
                placeholder="e.g. Send Rs 1800 and upload screenshot"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm" />
            </div>
          </div>
          <button onClick={saveAccount}
            className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition">
            {accountSaved ? '✅ Saved!' : 'Save Account Details'}
          </button>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-bold text-gray-700">Payment Submissions</h2>
            <div className="flex gap-2">
              {['pending', 'approved', 'rejected', 'all'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition ${filter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {payments.length === 0 && !loading && (
            <p className="text-center text-gray-400 py-8">No payments found</p>
          )}

          <div className="space-y-4">
            {payments.map(p => (
              <div key={p.id} className="border border-gray-100 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-bold text-gray-800">{p.username}</p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(p.submitted_at).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">Plan: {plans.find(plan => plan.key === p.package_name)?.name || p.package_name}</p>
                    <p className="text-sm font-bold text-orange-500 mt-1">Rs {p.amount}</p>
                    {p.sender_name && <p className="text-xs text-gray-500 mt-1">Sender: {p.sender_name} · {p.sender_number}</p>}
                    {p.admin_note && <p className="text-xs text-gray-500 mt-1">Note: {p.admin_note}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      p.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                    {p.screenshot && (
                      <button onClick={() => setPreview(p.screenshot)}
                        className="text-xs text-blue-500 underline">
                        View Screenshot
                      </button>
                    )}
                    {p.status !== 'approved' && (
                      <button type="button" onClick={() => beginEdit(p)}
                        className="rounded-lg bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100">
                        Edit Details
                      </button>
                    )}
                    {p.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => approve(p.id)}
                          className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition">
                          Approve
                        </button>
                        <button onClick={() => reject(p.id)}
                          className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition">
                          Reject
                        </button>
                      </div>
                    )}
                    {p.status === 'rejected' && (
                      <button type="button" onClick={() => approve(p.id)}
                        className="rounded-lg bg-green-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-green-600">
                        Re-Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Screenshot Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <img src={preview} alt="Payment screenshot" className="w-full rounded-xl object-contain max-h-96" />
            <button onClick={() => setPreview(null)}
              className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-semibold">
              Close
            </button>
          </div>
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={saveEdit} onClick={event => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-black text-gray-800">Edit Payment Request</h2>
            <label className="block text-xs font-semibold text-gray-500">
              Selected Plan
              <select value={editing.package_name}
                onChange={event => setEditing({ ...editing, package_name: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800">
                {plans.map(plan => <option key={plan.key} value={plan.key}>{plan.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-gray-500">
              Payment Amount (Rs)
              <input type="number" min="0.01" step="0.01" required value={editing.amount}
                onChange={event => setEditing({ ...editing, amount: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800" />
            </label>
            <label className="block text-xs font-semibold text-gray-500">
              Sender Name
              <input value={editing.sender_name}
                onChange={event => setEditing({ ...editing, sender_name: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800" />
            </label>
            <label className="block text-xs font-semibold text-gray-500">
              Sender Number
              <input value={editing.sender_number}
                onChange={event => setEditing({ ...editing, sender_number: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800" />
            </label>
            {editing.screenshot && <img src={editScreenshot || editing.screenshot} alt="Current payment proof" className="max-h-44 rounded-xl object-contain" />}
            <label className="block text-xs font-semibold text-gray-500">
              Replace Payment Screenshot (optional)
              <input type="file" accept="image/*" className="mt-2 block w-full text-sm"
                onChange={event => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) {
                    setMessage('Screenshot must be 2MB or smaller');
                    event.target.value = '';
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => setEditScreenshot(reader.result);
                  reader.onerror = () => setMessage('Could not read screenshot');
                  reader.readAsDataURL(file);
                }} />
            </label>
            <p className="text-xs text-amber-700">Edits are saved before approval and retained in the request history. Approved requests cannot be edited.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-bold text-gray-700">Cancel</button>
              <button type="submit" className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ManagePackages;
