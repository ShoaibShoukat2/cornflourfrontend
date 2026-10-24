import { useEffect, useState } from 'react';
import api from '../../api/axios';

const ManageUpgrades = () => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('pending');
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');

  const load = (next = status) => {
    api.get(`/admin/upgrade-requests/?status=${next}`)
      .then((res) => setData(res.data))
      .catch(() => setMessage('Could not load upgrade requests'));
  };

  useEffect(() => { load('pending'); }, []);

  const approve = async (row) => {
    const note = window.prompt('Approval note (optional):') ?? '';
    try {
      await api.post(`/admin/approve-upgrade/${row.id}/`, { note });
      setMessage(`${row.username} upgraded to ${row.to_label}`);
      load();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Approve failed');
    }
  };

  const reject = async (row) => {
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;
    try {
      await api.post(`/admin/reject-upgrade/${row.id}/`, { reason });
      setMessage(`${row.username} upgrade rejected`);
      load();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Reject failed');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-gray-800">Package Upgrade Requests</h1>
        <p className="text-sm text-gray-400">{data?.pending || 0} pending</p>
      </div>
      {message && <div className="px-4 py-3 rounded-xl text-sm font-semibold border bg-orange-50 border-orange-200 text-orange-700">{message}</div>}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((item) => (
          <button
            key={item}
            onClick={() => { setStatus(item); load(item); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${status === item ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {(data?.requests || []).map((row) => (
          <div key={row.id} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-bold text-gray-800">{row.username}</p>
                <p className="text-xs text-gray-400">User ID {row.user_id}</p>
                <p className="text-sm text-gray-600 mt-1">{row.from_label} → {row.to_label}</p>
                <p className="text-xs text-gray-400">{new Date(row.submitted_at).toLocaleString()} · {row.status}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-500">Paid Rs {Number(row.previous_paid).toFixed(0)}</p>
                <p className="font-black text-orange-500">Due Rs {Number(row.remaining_amount).toFixed(0)}</p>
                <p className="text-xs text-gray-400">Txn {row.transaction_id}</p>
              </div>
            </div>
            {row.screenshot && (
              <button onClick={() => setPreview(row.screenshot)} className="mt-3 text-xs font-bold text-blue-600">View payment proof</button>
            )}
            {row.admin_note && <p className="text-xs text-gray-500 mt-2">{row.admin_note}</p>}
            {row.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => approve(row)} className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm font-bold">Approve</button>
                <button onClick={() => reject(row)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold">Reject</button>
              </div>
            )}
          </div>
        ))}
        {data && data.requests.length === 0 && <p className="text-center text-gray-400 py-8">No upgrade requests</p>}
      </div>
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <img src={preview} alt="Payment proof" className="max-h-[80vh] rounded-xl bg-white" />
        </div>
      )}
    </div>
  );
};

export default ManageUpgrades;
