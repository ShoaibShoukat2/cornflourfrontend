import { useEffect, useState } from 'react';
import api from '../api/axios';

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loadError, setLoadError] = useState(false);

  const load = async () => {
    setLoadError(false);
    try {
      const res = await api.get('/auth/notifications/');
      setItems(res.data.notifications || []);
      setUnread(res.data.unread || 0);
    } catch {
      setLoadError(true);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = async () => {
    await api.post('/auth/notifications/read/', { all: true });
    load();
  };

  if (loadError && items.length === 0) {
    return (
      <section className="neon-loading">
        <div className="text-center space-y-3 px-4">
          <p className="neon-loading-text">Notifications load nahi hui</p>
          <button onClick={load} className="neon-btn text-sm px-5 py-2">Retry</button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      <section className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold neon-title mb-2">Notifications</h1>
          <p className="neon-subtitle">{unread} unread</p>
        </header>
        {unread > 0 && (
          <button onClick={markRead} className="neon-btn neon-btn-block mb-4">Mark all read</button>
        )}
        <section className="space-y-3">
          {items.map((item) => (
            <section key={item.id} className="neon-card p-4">
              <section className="flex justify-between gap-3 mb-1">
                <p className="font-bold text-white">{item.title}</p>
                <span className="text-xs uppercase text-white/40">{item.category}</span>
              </section>
              <p className="text-sm text-white/70">{item.message}</p>
              <p className="text-xs text-white/40 mt-2">{new Date(item.created_at).toLocaleString()}</p>
            </section>
          ))}
          {items.length === 0 && <p className="text-center neon-subtitle py-10">No notifications yet</p>}
        </section>
      </section>
    </section>
  );
};

export default Notifications;
