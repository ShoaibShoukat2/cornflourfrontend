import { useEffect, useState } from 'react';
import api from '../api/axios';

const TYPE_LABELS = {
  task: 'Task reward',
  referral: 'Referral commission',
  commission: 'Commission',
  bonus: 'Bonus',
  withdrawal: 'Withdrawal',
};

const rs = (amount) => `Rs ${Math.round(Number(amount) * 100)}`;

const Transactions = () => {
  const [rows, setRows] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loadError, setLoadError] = useState(false);

  const load = async (type = filter) => {
    setLoadError(false);
    try {
      const [txRes, earnRes] = await Promise.all([
        api.get(`/wallet/transactions/${type === 'all' ? '' : `?type=${type}`}`),
        api.get('/referrals/earnings/'),
      ]);
      setRows(txRes.data || []);
      setEarnings(earnRes.data || []);
    } catch {
      setLoadError(true);
    }
  };

  useEffect(() => { load('all'); }, []);

  return (
    <section className="py-6">
      <section className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold neon-title mb-2">Transaction History</h1>
          <p className="neon-subtitle">Every bonus, commission, task reward, and withdrawal</p>
        </header>

        <section className="flex flex-wrap gap-2 justify-center mb-6">
          {['all', 'commission', 'bonus', 'task', 'withdrawal', 'referral'].map((type) => (
            <button
              key={type}
              onClick={() => { setFilter(type); load(type); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${filter === type ? 'neon-btn' : 'border-white/20 text-white/70'}`}
            >
              {type}
            </button>
          ))}
        </section>

        {loadError && <button onClick={() => load(filter)} className="neon-btn mb-4">Retry</button>}

        <section className="space-y-3 mb-8">
          {rows.map((row) => (
            <section key={row.id} className="neon-card p-4">
              <section className="flex justify-between gap-3">
                <section>
                  <p className="font-bold text-white">{TYPE_LABELS[row.transaction_type] || row.transaction_type}</p>
                  <p className="text-sm text-white/70">{row.description}</p>
                  <p className="text-xs text-white/40 mt-1">{row.reference} · {new Date(row.created_at).toLocaleString()}</p>
                </section>
                <p className={`font-black ${Number(row.amount) < 0 ? 'text-red-400' : 'text-green-400'}`}>{rs(row.amount)}</p>
              </section>
            </section>
          ))}
          {rows.length === 0 && <p className="text-center neon-subtitle py-8">No transactions for this filter</p>}
        </section>

        <section className="neon-card p-5">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Commission Sources</h2>
          <section className="space-y-3">
            {earnings.filter((row) => Number(row.amount) > 0).map((row) => (
              <section key={row.id} className="flex justify-between gap-3 text-sm border-b border-white/10 pb-2">
                <section>
                  <p className="text-white font-semibold">{row.source_label}</p>
                  <p className="text-white/50">From {row.referred_user_username} · {row.reference}</p>
                  <p className="text-xs text-white/40">{new Date(row.created_at).toLocaleString()}</p>
                </section>
                <p className="text-green-400 font-bold">{rs(row.amount)}</p>
              </section>
            ))}
            {earnings.filter((row) => Number(row.amount) > 0).length === 0 && (
              <p className="text-center neon-subtitle">No commission yet</p>
            )}
          </section>
        </section>
      </section>
    </section>
  );
};

export default Transactions;