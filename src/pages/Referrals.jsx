import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Referrals = () => {
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoadError(false);
    try {
      const [statsRes, refRes] = await Promise.allSettled([
        api.get('/referrals/stats/'),
        api.get('/referrals/list/')
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (refRes.status === 'fulfilled') setReferrals(refRes.value.data);
      if (statsRes.status !== 'fulfilled') setLoadError(true);
    } catch (error) {
      console.error(error);
      setLoadError(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(stats.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const message = `Join INSTOVA and earn money daily! Use my link: ${stats.referral_link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!stats) return (
    <section className="neon-loading">
      {loadError ? (
        <div className="text-center space-y-3 px-4">
          <p className="neon-loading-text">Data load nahi hui</p>
          <button onClick={fetchData} className="neon-btn text-sm px-5 py-2">Retry</button>
        </div>
      ) : (
        <>
          <div className="neon-spinner" />
          <p className="neon-loading-text">Loading...</p>
        </>
      )}
    </section>
  );

  return (
    <section className="py-6">
      <section className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold neon-title mb-2">👥 INVITE FRIENDS</h1>
          <p className="text-lg neon-subtitle">Share • Earn Money Together</p>
        </header>

        {stats.ads_locked ? (
          <section className="neon-card p-5 mb-6 border border-red-500/40 text-center">
            <p className="text-2xl mb-2">🔒</p>
            <h2 className="text-lg font-bold text-white mb-2">Ads Locked — Weekly Joining Required</h2>
            <p className="neon-subtitle text-sm mb-3">
              Is hafte: {stats.weekly_joinings}/{stats.weekly_joinings_required} joining.
              Kam az kam 1 member package activate karwayein taake ads unlock hon.
            </p>
            <Link to="/tasks" className="text-sm neon-gradient-text underline">Tasks page par jayein</Link>
          </section>
        ) : (
          <section className="neon-card p-4 mb-6 text-center border border-green-500/30">
            <p className="text-sm text-green-400 font-semibold">
              ✅ Is hafte {stats.weekly_joinings}/{stats.weekly_joinings_required} joining — Ads unlocked
            </p>
          </section>
        )}

        <section className="grid grid-cols-2 gap-4 mb-8">
          <section className="neon-wallet-hero p-6 neon-delay-1">
            <span className="text-3xl mb-2 block">👥</span>
            <h3 className="text-lg font-bold mb-1">Active Team</h3>
            <p className="text-3xl font-black">{stats.total_referrals}</p>
            <p className="text-xs opacity-70 mt-1">Package activated</p>
          </section>
          <section className="neon-wallet-hero p-6 neon-delay-2">
            <span className="text-3xl mb-2 block">💰</span>
            <h3 className="text-lg font-bold mb-1">Money Earned</h3>
            <p className="text-3xl font-black">Rs {(stats.total_earnings * 100).toFixed(0)}</p>
            <p className="text-xs opacity-70 mt-1">Total commission</p>
          </section>
        </section>

        <section className="neon-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">🔗 YOUR LINK</h2>
          <p className="text-center neon-subtitle mb-6 text-lg">
            Share this link • Get 25% Refer Commission when they complete Registration!
          </p>
          <section className="rounded-xl p-4 mb-6 border border-purple-500/30 bg-black/30">
            <p className="text-sm neon-subtitle mb-2">Your Link:</p>
            <p className="neon-gradient-text font-semibold break-all">{stats.referral_link}</p>
          </section>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={copyToClipboard} className="neon-btn py-4 text-lg">
              {copied ? '✅ COPIED!' : '📋 COPY LINK'}
            </button>
            <button onClick={shareWhatsApp} className="neon-btn py-4 text-lg">
              📱 SHARE WHATSAPP
                </button>
          </section>
        </section>

        <section className="neon-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">💡 HOW TO EARN</h2>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📤', title: '1. SHARE LINK', desc: 'Send your link to friends on WhatsApp, Facebook, etc.' },
              { icon: '👤', title: '2. FRIEND JOINS', desc: 'When they register, you will get 25%!' },
              { icon: '💰', title: '3. EARN MORE', desc: "When your Member invites a Member, you get 3%. When your Member's Member invites, you get 1%!" },
            ].map((step) => (
              <section key={step.title} className="text-center neon-stat p-4">
                <span className="text-3xl block mb-4">{step.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="neon-subtitle text-sm">{step.desc}</p>
              </section>
            ))}
          </section>
        </section>

        {referrals.length > 0 && (
          <section className="neon-card p-6">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">👥 MY TEAM ({referrals.length})</h2>
            <p className="text-center neon-subtitle text-sm mb-6">Only members who have activated their package</p>
            <section className="space-y-4">
              {referrals.map((ref) => (
                <section key={ref.id} className="rounded-2xl p-4 border border-purple-500/25 bg-black/30">
                  <section className="flex justify-between items-start mb-3">
                    <section className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm" style={{ background: 'var(--neon-gradient-btn)', width: '2.25rem', height: '2.25rem' }}>
                        {ref.username.charAt(0).toUpperCase()}
                      </span>
                      <section>
                        <p className="font-bold text-white">{ref.username}</p>
                        <p className="text-xs text-white/40">Joined: {new Date(ref.created_at).toLocaleDateString()}</p>
                      </section>
                    </section>
                    <section className="text-right">
                      <p className="text-xs neon-subtitle">You Earned</p>
                      <p className="text-lg font-black neon-gradient-text">Rs {(ref.commission_earned * 100).toFixed(0)}</p>
                    </section>
                  </section>
                  <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'Package', value: ref.package_name || '-', cls: 'capitalize' },
                      { label: 'Status', value: ref.is_active ? '🟢 Active' : '🔴 Blocked', cls: ref.is_active ? 'text-green-400' : 'text-red-400' },
                      { label: 'Level', value: `L${ref.level}`, cls: '' },
                      { label: 'Approved', value: ref.approved_at ? new Date(ref.approved_at).toLocaleDateString() : '-', cls: '' },
                    ].map((item) => (
                      <section key={item.label} className="neon-stat p-2">
                        <p className="text-xs neon-stat-label">{item.label}</p>
                        <p className={`font-bold text-xs text-white ${item.cls}`}>{item.value}</p>
                      </section>
                    ))}
                  </section>
                </section>
              ))}
            </section>
          </section>
        )}

        {referrals.length === 0 && (
          <section className="text-center py-12 neon-card">
            <span className="text-6xl block mb-4">👥</span>
            <h3 className="text-2xl font-bold text-white mb-2">No Active Team Members</h3>
            <p className="neon-subtitle">Members will appear here once they activate their package.</p>
          </section>
        )}
      </section>
    </section>
  );
};

export default Referrals;
