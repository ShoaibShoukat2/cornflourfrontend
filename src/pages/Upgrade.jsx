import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Upgrade = () => {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = async () => {
    setLoadError(false);
    try {
      const res = await api.get('/auth/upgrade-options/');
      setData(res.data);
      setSelected(null);
    } catch {
      setLoadError(true);
    }
  };

  useEffect(() => { load(); }, []);

  const onFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!selected) return;
    setLoading(true);
    setMessage('');
    try {
      await api.post('/auth/upgrade-request/', {
        to_package: selected.key,
        transaction_id: transactionId,
        screenshot,
      });
      setMessage('Upgrade request submitted. Status: Pending.');
      setTransactionId('');
      setScreenshot('');
      setPreview('');
      load();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Could not submit the upgrade request.');
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <section className="neon-loading">
        {loadError ? (
          <div className="text-center space-y-3 px-4">
            <p className="neon-loading-text">Upgrade options load nahi hui</p>
            <button onClick={load} className="neon-btn text-sm px-5 py-2">Retry</button>
          </div>
        ) : (
          <>
            <span className="neon-spinner" />
            <p className="neon-loading-text">Loading...</p>
          </>
        )}
      </section>
    );
  }

  return (
    <section className="py-6 px-4">
      <section className="max-w-lg mx-auto space-y-4">
        <header className="text-center">
          <h1 className="text-2xl font-black neon-title">Upgrade Package</h1>
          <p className="neon-subtitle text-sm mt-1">
            {data.current_label
              ? `Current package: ${data.current_label}. Already paid: Rs ${Number(data.total_paid).toFixed(0)}`
              : 'An active package is required before an upgrade.'}
          </p>
        </header>

        {message && <section className="neon-alert neon-alert-warning text-sm">{message}</section>}

        {data.pending_request && (
          <section className="neon-card p-4 text-sm">
            <p className="font-bold text-white">Pending upgrade</p>
            <p className="text-white/70 mt-1">
              {data.pending_request.from_label} to {data.pending_request.to_label} · Remaining Rs {Number(data.pending_request.remaining_amount).toFixed(0)}
            </p>
            <p className="text-white/50 mt-1">Transaction {data.pending_request.transaction_id} · Status: Pending</p>
          </section>
        )}

        {!data.current_package && (
          <Link to="/package" className="neon-btn neon-btn-block text-center">Buy a plan first</Link>
        )}

        <section className="space-y-3">
          {data.packages.map((pkg) => (
            <button
              key={pkg.key}
              type="button"
              onClick={() => pkg.can_upgrade && setSelected(pkg)}
              className={`neon-card p-4 w-full text-left ${selected?.key === pkg.key ? 'border border-orange-400' : ''}`}
            >
              <section className="flex justify-between gap-3">
                <section>
                  <p className="font-bold text-white">{pkg.name}</p>
                  <p className="text-sm text-white/60">Price Rs {Number(pkg.price).toFixed(0)}</p>
                  {pkg.can_upgrade && (
                    <p className="text-sm text-green-400">Pay remaining Rs {Number(pkg.remaining).toFixed(0)}</p>
                  )}
                  {!pkg.can_upgrade && <p className="text-xs text-white/40">{pkg.reason}</p>}
                </section>
                {pkg.can_upgrade && <span className="text-xs font-bold text-orange-300">Upgrade</span>}
              </section>
            </button>
          ))}
        </section>

        {selected && (
          <section className="neon-card p-5 space-y-4">
            <h2 className="text-lg font-bold text-white text-center">Payment instructions</h2>
            <p className="text-center text-white">
              {selected.name}: Rs {Number(selected.price).toFixed(0)} − paid Rs {Number(data.total_paid).toFixed(0)} = <strong>Rs {Number(selected.remaining).toFixed(0)}</strong>
            </p>
            <ol className="space-y-3">
              {data.instructions.map((item, index) => (
                <li key={item.title} className="text-sm">
                  <p className="font-bold text-white">{index + 1}. {item.title}</p>
                  <p className="text-white/70">{item.detail}</p>
                </li>
              ))}
            </ol>

            <label className="block text-sm text-white/70">
              Transaction ID
              <input
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                className="neon-input mt-1"
                placeholder="Trade ID / Transaction ID"
              />
            </label>
            <label className="block text-sm text-white/70">
              Payment proof
              <input type="file" accept="image/*" onChange={onFile} className="mt-2 block w-full text-sm text-white/70" />
            </label>
            {preview && <img src={preview} alt="Payment proof" className="max-h-40 mx-auto rounded-xl" />}
            <button type="button" onClick={submit} disabled={loading} className="neon-btn neon-btn-block">
              {loading ? 'Submitting...' : `Submit upgrade · Rs ${Number(selected.remaining).toFixed(0)}`}
            </button>
          </section>
        )}
      </section>
    </section>
  );
};

export default Upgrade;
