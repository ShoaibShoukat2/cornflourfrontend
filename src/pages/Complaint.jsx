import { useEffect, useState } from 'react';
import api from '../api/axios';

const Complaint = () => {
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [rows, setRows] = useState([]);
  const [sending, setSending] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/auth/complaints/');
      setRows(res.data.complaints || []);
    } catch {
      setRows([]);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    setNotice('');
    try {
      const res = await api.post('/auth/complaints/', { message });
      setNotice(res.data.message || 'Your feedback submitted successfully!');
      setMessage('');
      load();
    } catch (error) {
      setNotice(error.response?.data?.error || 'Could not submit feedback.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="py-6 px-4">
      <section className="max-w-lg mx-auto space-y-4">
        <header className="text-center">
          <h1 className="text-2xl font-black neon-title">Complaint Box</h1>
          <p className="neon-subtitle text-sm mt-1">Write feedback, a complaint, or an account issue.</p>
        </header>
        {notice && <section className="neon-alert neon-alert-success text-sm">{notice}</section>}
        <form onSubmit={submit} className="neon-card p-4 space-y-3">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
            className="neon-input w-full"
            placeholder="Describe the issue, payment, withdrawal, or feedback"
          />
          <button type="submit" disabled={sending} className="neon-btn neon-btn-block">
            {sending ? 'Submitting...' : 'Submit feedback'}
          </button>
        </form>
        {rows.map((row) => (
          <article key={row.id} className="neon-card p-4 text-sm">
            <p className="text-white/80">{row.message}</p>
            <p className="text-white/40 mt-2">{new Date(row.created_at).toLocaleString()}</p>
          </article>
        ))}
      </section>
    </section>
  );
};

export default Complaint;
