import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Upgrade = () => {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
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
    if (!screenshot) { setMessage('Please upload payment screenshot.'); return; }
    setLoading(true);
    setMessage('');
    try {
      await api.post('/auth/upgrade-request/', {
        to_package: selected.key,
        transaction_id: '',
        screenshot,
      });
      setMessage('Upgrade request submitted. Status: Pending.');
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
      <section className="lux-page">
        {loadError && (
          <div className="lux-empty">
            <p>Upgrade options load nahi hui</p>
            <button type="button" onClick={load} className="lux-withdraw">Retry</button>
          </div>
        )}
      </section>
    );
  }

  // ── Level 3 Locked ──────────────────────────────────────────────────────────
  if (data.level3_locked) {
    return (
      <section className="py-6 px-4">
        <section className="max-w-lg mx-auto space-y-4">
          <header className="text-center">
            <h1 className="text-2xl font-black neon-title">Upgrade Package</h1>
          </header>
          <section className="neon-card p-6 text-center space-y-4">
            <div className="text-5xl">🔒</div>
            <h2 className="text-lg font-bold text-white">Plan Upgrade Not Available</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              You have reached <span className="text-orange-400 font-bold">Level {data.user_level}</span>. Plan upgrades are only allowed before Level 3 is unlocked.
            </p>
            <p className="text-white/50 text-xs">
              Upgrade was available before Level 3. Once Level 3 is unlocked, this option is permanently closed.
            </p>
            <Link to="/levels" className="neon-btn neon-btn-block text-center">View My Level</Link>
          </section>
        </section>
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
          {data.user_level !== undefined && (
            <p className="text-xs text-green-400 mt-1">
              Your Level: {data.user_level} — Upgrade available before Level 3
            </p>
          )}
        </header>

        {message && <section className="neon-alert neon-alert-warning text-sm">{message}</section>}

        {data.pending_request && (
          <section className="neon-card p-4 text-sm">
            <p className="font-bold text-white">Pending upgrade</p>
            <p className="text-white/70 mt-1">
              {data.pending_request.from_label} to {data.pending_request.to_label} · Remaining Rs {Number(data.pending_request.remaining_amount).toFixed(0)}
            </p>
            <p className="text-white/50 mt-1">Status: Pending</p>
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

            {/* Transaction ID removed — only screenshot required */}
            <label className="block text-sm text-white/70">
              Payment screenshot <span className="text-red-400">*</span>
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
