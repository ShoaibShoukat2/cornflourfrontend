import { useEffect, useState } from 'react';
import api from '../../api/axios';

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const rupees = (amount) => `Rs ${Number(amount || 0).toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;

const ManageUpgrades = () => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('pending');
  const [selectedDate, setSelectedDate] = useState(today);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async (nextStatus = status, nextDate = selectedDate, nextSearch = appliedSearch) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: nextStatus, date: nextDate });
      if (nextSearch) params.set('search', nextSearch);
      const response = await api.get(`/admin/upgrade-requests/?${params.toString()}`);
      setData(response.data);
      setMessage('');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Could not load upgrade requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load('pending', selectedDate, ''); }, [selectedDate]);

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

  const counts = data?.counts || { pending: 0, approved: 0, rejected: 0 };
  const overall = data?.overall || { pending: 0, approved: 0, rejected: 0 };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-black text-gray-800">Package Upgrade Requests</h1>
        <p className="text-sm text-gray-500">Requests submitted on the selected date</p>
      </header>

      {message && (
        <div role="status" className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
          {message}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl bg-pink-50 p-4">
          <p className="text-xs font-semibold text-pink-700">Receive Balance · selected date</p>
          <p className="mt-1 text-xl font-black text-pink-900">{rupees(data?.received_balance)}</p>
        </article>
        {['pending', 'approved', 'rejected'].map((item) => (
          <article key={item} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold capitalize text-gray-500">{item} · selected date</p>
            <p className="mt-1 text-xl font-black text-gray-800">{counts[item]}</p>
          </article>
        ))}
      </section>

      <p className="text-xs text-gray-500">
        All-time: {overall.pending} pending · {overall.approved} approved · {overall.rejected} rejected
      </p>

      <form
        className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          setAppliedSearch(search.trim());
          load(status, selectedDate, search.trim());
        }}
      >
        <label className="flex-1 text-xs font-semibold text-gray-500">
          Search requests
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, email or transaction ID"
            className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800"
          />
        </label>
        <label className="text-xs font-semibold text-gray-500">
          Date filter
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => {
              const nextDate = event.target.value || today();
              setSelectedDate(nextDate);
              load(status, nextDate, appliedSearch);
            }}
            className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800"
          />
        </label>
        <button type="submit" className="self-end rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white">
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => { setStatus(item); load(item); }}
            className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${status === item ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {item} {item !== 'all' ? `(${counts[item]})` : `(${data?.total || 0})`}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-500">Loading requests…</p>}
      <div className="space-y-3">
        {(data?.requests || []).map((row) => (
          <article key={row.id} className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-bold text-gray-800">{row.username}</p>
                <p className="text-xs text-gray-500">{row.email || `User ID ${row.user_id}`}</p>
                <p className="mt-1 text-sm text-gray-600">{row.from_label} → {row.to_label}</p>
                <p className="text-xs text-gray-400">{new Date(row.submitted_at).toLocaleString()} · {row.status}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-500">Paid Rs {Number(row.previous_paid).toFixed(0)}</p>
                <p className="font-black text-orange-500">Due {rupees(row.remaining_amount)}</p>
                <p className="text-xs text-gray-400">Txn {row.transaction_id}</p>
              </div>
            </div>
            {row.screenshot && (
              <button type="button" onClick={() => setPreview(row.screenshot)} className="mt-3 text-xs font-bold text-blue-600">
                View payment proof
              </button>
            )}
            {row.admin_note && <p className="mt-2 text-xs text-gray-500">{row.admin_note}</p>}
            {row.status === 'pending' && (
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => approve(row)} className="flex-1 rounded-xl bg-green-500 py-2.5 text-sm font-bold text-white">Approve</button>
                <button type="button" onClick={() => reject(row)} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white">Reject</button>
              </div>
            )}
          </article>
        ))}
        {data && !loading && data.requests.length === 0 && (
          <p className="py-8 text-center text-gray-400">No upgrade requests for this date and filter</p>
        )}
      </div>
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreview(null)}>
          <img src={preview} alt="Payment proof" className="max-h-[80vh] rounded-xl bg-white" />
        </div>
      )}
    </div>
  );
};

export default ManageUpgrades;
