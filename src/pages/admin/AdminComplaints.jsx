import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminComplaints = () => {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/admin/complaints/')
      .then((res) => setRows(res.data.complaints || []))
      .catch(() => setMessage('Could not load complaints'));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Complaints & Feedback</h1>
      {message && <p className="text-sm text-red-600">{message}</p>}
      {rows.length === 0 && !message && <p className="text-center text-gray-400 py-8">No complaints yet</p>}
      {rows.map((row) => (
        <article key={row.id} className="bg-white rounded-xl p-4 shadow-sm text-sm">
          <p className="font-bold text-gray-800">{row.username} · User ID {row.user_id}</p>
          <p className="text-gray-500 text-xs">{row.email} · {new Date(row.created_at).toLocaleString()}</p>
          <p className="text-gray-700 mt-2 whitespace-pre-wrap">{row.message}</p>
        </article>
      ))}
    </div>
  );
};

export default AdminComplaints;
