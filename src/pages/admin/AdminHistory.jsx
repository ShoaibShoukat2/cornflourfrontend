import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminHistory = () => {
  const [range, setRange] = useState('7d');
  const [kind, setKind] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState([]);
  const [activities, setActivities] = useState([]);
  const [message, setMessage] = useState('');

  const query = () => {
    const params = new URLSearchParams({ range, kind });
    if (range === 'custom') {
      if (from) params.set('from', from);
      if (to) params.set('to', to);
    }
    return params.toString();
  };

  const load = async () => {
    setMessage('');
    try {
      const [historyRes, activityRes] = await Promise.all([
        api.get(`/admin/history/?${query()}`),
        api.get('/admin/activity/'),
      ]);
      setRows(historyRes.data.rows || []);
      setActivities(activityRes.data.activities || []);
    } catch {
      setMessage('Could not load history');
    }
  };

  useEffect(() => { load(); }, [range, kind]);

  const download = async () => {
    const res = await api.get(`/admin/history/?export=csv&${query()}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'instova-history.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Complete History</h1>
        <button type="button" onClick={download} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold">
          Export CSV
        </button>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select value={range} onChange={(event) => setRange(event.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="today">Today</option>
          <option value="7d">7 Days</option>
          <option value="month">This month</option>
          <option value="custom">Custom dates</option>
        </select>
        <select value={kind} onChange={(event) => setKind(event.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="all">All records</option>
          <option value="joining">Joining</option>
          <option value="approval">Approvals</option>
          <option value="withdrawal">Withdrawals</option>
          <option value="transaction">Transactions</option>
          <option value="complaint">Complaints</option>
        </select>
        {range === 'custom' && (
          <>
            <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
            <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
            <button type="button" onClick={load} className="sm:col-span-2 bg-gray-800 text-white py-2 rounded-lg text-sm">Apply dates</button>
          </>
        )}
      </div>
      {message && <p className="text-sm text-red-600">{message}</p>}
      <div className="bg-white rounded-xl shadow-sm divide-y">
        {rows.length === 0 && <p className="text-center text-gray-400 py-8">No records in this range</p>}
        {rows.map((row, index) => (
          <div key={`${row.kind}-${row.user_id}-${index}`} className="p-4 text-sm">
            <p className="font-bold text-gray-800">{row.username} · ID {row.user_id}</p>
            <p className="text-gray-600">{row.kind} · {row.detail}</p>
            <p className="text-xs text-gray-400">{row.status}{row.amount !== '' ? ` · ${row.amount}` : ''} · {new Date(row.when).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-2">Admin activity</h2>
        {activities.length === 0 && <p className="text-sm text-gray-400">No setting changes logged yet</p>}
        {activities.map((row) => (
          <p key={row.id} className="text-sm text-gray-600 py-1">{row.action} · {row.detail} · {row.admin}</p>
        ))}
      </div>
    </div>
  );
};

export default AdminHistory;
