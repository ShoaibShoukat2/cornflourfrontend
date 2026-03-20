import { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManagePackages = () => {
  const [payments, setPayments] = useState([]);
  const [account, setAccount] = useState({ account_title: '', account_number: '', bank_name: '', instructions: '' });
  const [accountSaved, setAccountSaved] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAll();
  }, [filter]);

  const fetchAll = async () => {
    try {
      const [paymentsRes, accountRes] = await Promise.all([
        api.get(`/admin/package-payments/?status=${filter}`),
        api.get('/admin/payment-account/'),
      ]);
      setPayments(paymentsRes.data);
      if (accountRes.data && accountRes.data.bank_name) setAccount(accountRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const saveAccount = async () => {
    try {
      await api.post('/admin/payment-account/', account);
      setAccountSaved(true);
      setTimeout(() => setAccountSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const approve = async (id) => {
    try {
      await api.post(`/admin/approve-package/${id}/`);
      setMessage('Approved');
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const reject = async (id) => {
    const reason = prompt('Rejection reason (optional):') || 'Rejected by admin';
    try {
      await api.post(`/admin/reject-package/${id}/`, { reason });
      setMessage('Rejected');
      fetchAll();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">📦 Manage Packages</h1>

        {message && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl text-sm font-semibold">
            ✅ {message}
          </div>
        )}

        {/* Payment Account Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-700 mb-4">Bank Account Details (shown to users)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Bank Name</label>
              <input
                value={account.bank_name}
                onChange={e => setAccount({ ...account, bank_name: e.target.value })}
                placeholder="e.g. JazzCash"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Account Title</label>
              <input
                value={account.account_title}
                onChange={e => setAccount({ ...account, account_title: e.target.value })}
                placeholder="e.g. Muhammad Ali"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Account Number</label>
              <input
                value={account.account_number}
                onChange={e => setAccount({ ...account, account_number: e.target.value })}
                placeholder="e.g. 03001234567"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Instructions (optional)</label>
              <input
                value={account.instructions}
                onChange={e => setAccount({ ...account, instructions: e.target.value })}
                placeholder="e.g. Send Rs 1800 and upload screenshot"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
              />
            </div>
          </div>
          <button
            onClick={saveAccount}
            className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition"
          >
            {accountSaved ? '✅ Saved!' : 'Save Account Details'}
          </button>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-bold text-gray-700">Payment Submissions</h2>
            <div className="flex gap-2">
              {['pending', 'approved', 'rejected', 'all'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition ${filter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {payments.length === 0 && (
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
                    <p className="text-sm font-bold text-orange-500 mt-1">Rs {p.amount}</p>
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
                    <button
                      onClick={() => setPreview(p.screenshot)}
                      className="text-xs text-blue-500 underline"
                    >
                      View Screenshot
                    </button>
                    {p.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => approve(p.id)} className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition">
                          Approve
                        </button>
                        <button onClick={() => reject(p.id)} className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition">
                          Reject
                        </button>
                      </div>
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
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setPreview(null)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <img src={preview} alt="Payment screenshot" className="w-full rounded-xl object-contain max-h-96" />
            <button onClick={() => setPreview(null)} className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-semibold">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePackages;
