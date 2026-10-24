import { useState, useEffect } from 'react';
import api from '../api/axios';
import logo from '../assets/tasklogo.jpeg';

const PACKAGES = [
  {
    key: 'normal',
    name: 'Normal',
    price: 700,
    emoji: '🌱',
    color: '#6B7280',
    gradient: 'linear-gradient(135deg, #833ab4 0%, #c13584 50%, #f77737 100%)',
    features: ['Daily Tasks', 'Referral Bonus', 'JazzCash / EasyPaisa'],
  },
  {
    key: 'super',
    name: 'SUPER',
    price: 1400,
    emoji: '⭐',
    color: '#F97316',
    gradient: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #f77737 100%)',
    badge: 'POPULAR',
    features: ['Daily Tasks', 'Rs 50 Referral Bonus', 'Daily Bonus', 'Withdrawals'],
  },
  {
    key: 'premium',
    name: 'Premium',
    price: 3200,
    emoji: '💎',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #405de6 0%, #833ab4 50%, #c13584 100%)',
    badge: 'PREMIUM',
    features: ['Unlimited Tasks', 'High Referral Bonus', 'Priority Withdrawals', 'Daily Bonus'],
  },
  {
    key: 'high_octane',
    name: 'High Octane',
    price: 4500,
    emoji: '🚀',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #c13584 0%, #f77737 50%, #fcaf45 100%)',
    badge: 'VIP',
    features: ['Unlimited Tasks', 'Max Referral Bonus', 'Instant Withdrawals', 'VIP Support'],
  },
];

const Package = () => {
  const [step, setStep] = useState('info');
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [account, setAccount] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusInfo, setStatusInfo] = useState(null);
  const [priceMap, setPriceMap] = useState({});

  useEffect(() => {
    fetchStatus();
    api.get('/auth/plans/').then((res) => {
      const next = {};
      (res.data || []).forEach((plan) => { next[plan.key] = Number(plan.price); });
      setPriceMap(next);
    }).catch(() => {});
  }, []);

  const packages = PACKAGES.map((pkg) => ({ ...pkg, price: priceMap[pkg.key] || pkg.price }));

  const fetchStatus = async () => {
    try {
      const res = await api.get('/auth/package-status/');
      setStatusInfo(res.data);
      if (res.data.status === 'pending') setStep('submitted');
      if (res.data.status === 'approved') setStep('active');
      if (res.data.status === 'rejected') setStep('rejected');
    } catch {}
  };

  const handleBuyClick = async (pkg) => {
    setError(''); setSelectedPkg(pkg);
    try {
      const res = await api.get('/auth/payment-account/');
      setAccount(res.data); setStep('payment');
    } catch { setError('Payment account not set up yet. Please contact admin.'); }
  };

  const handleScreenshot = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setScreenshot(reader.result); setScreenshotPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!screenshot) { setError('Please upload your payment screenshot'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/submit-payment/', { screenshot, package_name: selectedPkg.key });
      setStep('submitted');
    } catch (e) { setError(e.response?.data?.error || 'Submission failed'); }
    finally { setLoading(false); }
  };

  // ── ACTIVE ──
  if (step === 'active') return (
    <div className="flex items-center justify-center p-4 min-h-[70vh]">
      <div className="neon-card p-8 text-center max-w-sm w-full">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-black neon-gradient-text mb-2">Package Active!</h2>
        <p className="neon-subtitle">
          {statusInfo?.package_label || 'Your plan'} is approved
          {statusInfo?.amount ? ` · Rs ${statusInfo.amount}` : ''}. Tasks and withdrawals are open.
        </p>
      </div>
    </div>
  );

  // ── SUBMITTED ──
  if (step === 'submitted') return (
    <div className="flex items-center justify-center p-4 min-h-[70vh]">
      <div className="neon-card p-8 text-center max-w-sm w-full">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-black neon-gradient-text mb-2">Pending Approval</h2>
        <p className="neon-subtitle text-sm">
          Status: Pending. Review limit is <span className="font-bold text-orange-500">{statusInfo?.approval_hours || 5} hours</span>.
          {statusInfo?.is_overdue
            ? ' This request is past the limit and still waiting for admin.'
            : ` Time left: ${Math.floor((statusInfo?.seconds_remaining || 0) / 3600)}h ${Math.floor(((statusInfo?.seconds_remaining || 0) % 3600) / 60)}m.`}
        </p>
      </div>
    </div>
  );

  if (step === 'rejected') return (
    <div className="flex items-center justify-center p-4 min-h-[70vh]">
      <div className="neon-card p-8 text-center max-w-sm w-full">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-black neon-gradient-text mb-2">Rejected</h2>
        <p className="neon-subtitle text-sm mb-4">{statusInfo?.admin_note || 'Your payment was rejected. You can submit a new one.'}</p>
        <button onClick={() => setStep('info')} className="neon-btn neon-btn-block">Choose a plan again</button>
      </div>
    </div>
  );

  // ── PAYMENT ──
  if (step === 'payment' && account && selectedPkg) return (
    <div className="py-8 px-4">
      <div className="max-w-sm mx-auto space-y-4">
        {/* Header */}
        <div className="text-center text-white mb-6">
          <div className="text-4xl mb-2">{selectedPkg.emoji}</div>
          <h2 className="text-xl font-black">{selectedPkg.name} Package</h2>
          <p className="text-3xl font-black mt-1" style={{ color: selectedPkg.color }}>Rs {selectedPkg.price}</p>
        </div>

        {/* Bank Details */}
        <div className="bg-white bg-opacity-10 backdrop-blur rounded-3xl p-5 border border-white border-opacity-20">
          <p className="text-white text-xs font-semibold uppercase mb-3 opacity-70">Send Payment To</p>
          <div className="space-y-3">
            {[
              { label: 'Bank', value: account.bank_name },
              { label: 'Name', value: account.account_title },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-white text-opacity-60 text-sm opacity-60">{label}</span>
                <span className="text-white font-bold text-sm">{value}</span>
              </div>
            ))}
            <div className="bg-white bg-opacity-20 rounded-2xl p-3 text-center mt-2">
              <p className="text-white text-opacity-60 text-xs mb-1 opacity-60">Account Number</p>
              <p className="text-white font-black text-xl tracking-widest">{account.account_number}</p>
            </div>
            <div className="text-center">
              <p className="text-white text-opacity-60 text-xs opacity-60">Amount</p>
              <p className="font-black text-2xl" style={{ color: selectedPkg.color }}>Rs {selectedPkg.price}</p>
            </div>
          </div>
        </div>

        {/* Screenshot Upload */}
        <div className="bg-white bg-opacity-10 backdrop-blur rounded-3xl p-5 border border-white border-opacity-20">
          <p className="text-white text-sm font-bold text-center mb-3">Upload Payment Screenshot</p>
          <label className="block cursor-pointer">
            <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${screenshotPreview ? 'border-green-400' : 'border-white border-opacity-30'}`}>
              {screenshotPreview
                ? <img src={screenshotPreview} alt="ss" className="max-h-40 mx-auto rounded-xl object-contain" />
                : <><div className="text-3xl mb-2">📸</div><p className="text-white text-opacity-60 text-sm opacity-60">Tap to upload</p></>
              }
            </div>
            <input type="file" accept="image/*" onChange={handleScreenshot} className="hidden" />
          </label>
          {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
          <button onClick={handleSubmit} disabled={loading}
            className="mt-4 w-full text-white font-black py-4 rounded-2xl text-base shadow-lg transition disabled:opacity-60"
            style={{ background: selectedPkg.gradient }}>
            {loading ? 'Submitting...' : '✅ Submit Payment'}
          </button>
          <button onClick={() => setStep('info')} className="mt-2 w-full text-white text-opacity-50 text-sm py-2 opacity-50">← Back</button>
        </div>
      </div>
    </div>
  );

  // ── INFO ──
  return (
    <div className="py-8 px-4">
      <div className="max-w-sm mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="INSTOVA" className="w-20 h-20 rounded-3xl mx-auto mb-3 object-cover neon-task-logo border-2 border-purple-500/30" />
          <h1 className="text-2xl font-black neon-title">Choose Your Plan</h1>
          <p className="text-white text-opacity-60 text-sm mt-1 opacity-60">One time investment • Earn daily</p>
        </div>

        {error && <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-300 text-sm px-4 py-3 rounded-2xl text-center mb-4">{error}</div>}

        {/* Package Cards */}
        <div className="space-y-4">
          {packages.map(pkg => (
            <div key={pkg.key} className="relative rounded-3xl overflow-hidden shadow-2xl neon-card-glow animate-fadeIn"
              style={{ background: pkg.gradient }}>
              {pkg.badge && (
                <div className="absolute top-3 right-3 bg-white bg-opacity-25 text-white text-xs font-black px-3 py-1 rounded-full">
                  {pkg.badge}
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{pkg.emoji}</span>
                  <div>
                    <p className="text-white font-black text-lg leading-none">{pkg.name}</p>
                    <p className="text-white text-opacity-80 text-2xl font-black mt-0.5">Rs {pkg.price}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {pkg.features.map((f, i) => (
                    <span key={i} className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full font-medium">
                      ✓ {f}
                    </span>
                  ))}
                </div>
                <button onClick={() => handleBuyClick(pkg)}
                  className="w-full bg-white font-black py-3 rounded-2xl text-sm shadow-lg hover:opacity-90 transition"
                  style={{ color: pkg.color }}>
                  Buy Now — Rs {pkg.price}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-6 bg-white bg-opacity-10 rounded-3xl p-5 border border-white border-opacity-10">
          <p className="text-white font-bold text-center mb-4">How to Buy</p>
          <div className="space-y-3">
            {['Choose a package & tap Buy Now', 'Send payment via JazzCash / EasyPaisa', 'Upload your payment screenshot', 'Account activated within 24 hours'].map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
                <p className="text-white text-opacity-80 text-sm opacity-80">{t}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Package;
