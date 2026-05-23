import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import tasklogo from '../assets/tasklogo.jpeg';

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const StatsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 19V5M4 19h16M8 19V11M12 19V7M16 19V14" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const OfferIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8 5.7 21l2.3-7-6-4.6h7.6L12 2z" strokeLinejoin="round" />
  </svg>
);

const HIGHLIGHTS = [
  { to: '/tasks', emoji: '🎯', label: 'Tasks' },
  { to: '/wallet', emoji: '💰', label: 'Wallet' },
  { to: '/referrals', emoji: '👥', label: 'Team' },
  { to: '/package', emoji: '📦', label: 'Package' },
  { to: '/contact', emoji: '📩', label: 'Contact' },
  { to: '/settings', emoji: '⚙️', label: 'Settings' },
];

const GRID_ITEMS = [
  { to: '/tasks', icon: '🎯', label: 'Tasks', needsPackage: true },
  { to: '/wallet', icon: '💸', label: 'Withdraw', needsPackage: true },
  { to: '/referrals', icon: '👥', label: 'Referrals', needsPackage: false },
  { to: '/package', icon: '📦', label: 'Package', needsPackage: false },
  { to: '/contact', icon: '📩', label: 'Contact', needsPackage: false },
  { to: '/settings', icon: '⚙️', label: 'Settings', needsPackage: false },
  { to: '/wallet', icon: '💵', label: 'Balance', needsPackage: false },
  { to: '/tasks', icon: '✅', label: 'Earn', needsPackage: true },
  { to: '/referrals', icon: '🔗', label: 'Invite', needsPackage: false },
];

const Dashboard = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const [wallet, setWallet] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [packageStatus, setPackageStatus] = useState('none');
  const [activeTab, setActiveTab] = useState('grid');

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, refRes, tasksRes, pkgRes] = await Promise.all([
        api.get('/wallet/'),
        api.get('/referrals/stats/'),
        api.get('/tasks/my-tasks/'),
        api.get('/auth/package-status/'),
      ]);
      setWallet(walletRes.data);
      setReferralStats(refRes.data);
      const tasksData = tasksRes.data;
      if (tasksData?.total_completed !== undefined) {
        setCompletedTasksCount(tasksData.total_completed);
      } else if (Array.isArray(tasksData)) {
        setCompletedTasksCount(tasksData.filter(t => t.status === 'verified').length);
      }
      setPackageStatus(pkgRes.data.status || 'none');
    } catch (error) {
      console.error(error);
    }
  };

  if (!wallet) {
    return (
      <section className="neon-loading">
        <span className="neon-spinner" />
        <p className="neon-loading-text">Loading...</p>
      </section>
    );
  }

  const hasPackage = packageStatus === 'approved' || user?.has_package;
  const isPending = packageStatus === 'pending';
  const balance = (wallet.main_balance * 100).toFixed(0);
  const totalEarned = (wallet.total_earned * 100).toFixed(0);
  const teamCount = referralStats?.total_referrals || 0;

  return (
    <section className="ig-profile">
      {/* IG-style username header */}
      <header className="ig-profile-header">
        <span className="ig-profile-header-lock" aria-hidden="true">🔒</span>
        <h1 className="ig-profile-header-title">{user?.username}</h1>
        <Link to="/settings" className="ig-profile-header-menu" aria-label="Menu">☰</Link>
      </header>

      {/* Avatar + stats row (posts / followers / following layout) */}
      <section className="ig-profile-top">
        <section className="ig-profile-avatar-wrap">
          <img src={tasklogo} alt={user?.username} />
        </section>
        <section className="ig-profile-stats">
          <section>
            <span className="ig-profile-stat-value">Rs {balance}</span>
            <span className="ig-profile-stat-label">Balance</span>
          </section>
          <section>
            <span className="ig-profile-stat-value">{completedTasksCount}</span>
            <span className="ig-profile-stat-label">Tasks</span>
          </section>
          <section>
            <span className="ig-profile-stat-value">{teamCount}</span>
            <span className="ig-profile-stat-label">Team</span>
          </section>
        </section>
      </section>

      {/* Bio */}
      <section className="ig-profile-bio">
        <p className="ig-profile-bio-name">{user?.username}</p>
        <p className="ig-profile-bio-text">
          Level {user?.level ?? 0} · INSTOVA Member
          <br />
          Rs {balance} available to withdraw
        </p>
        {referralStats?.referral_link && (
          <p className="ig-profile-bio-link mt-1 truncate">{referralStats.referral_link}</p>
        )}
      </section>

      {/* Action buttons */}
      <section className="ig-profile-actions">
        {hasPackage ? (
          <Link to="/wallet" className="ig-profile-btn">Withdraw</Link>
        ) : (
          <Link to="/package" className="ig-profile-btn">Buy Plan</Link>
        )}
        {hasPackage ? (
          <Link to="/tasks" className="ig-profile-btn ig-profile-btn-primary">Do Tasks</Link>
        ) : (
          <Link to="/package" className="ig-profile-btn ig-profile-btn-primary">Unlock Tasks</Link>
        )}
      </section>

      {/* Story highlights */}
      <section className="ig-highlights">
        {HIGHLIGHTS.map((h) => (
          <Link key={h.label} to={h.to} className="ig-highlight">
            <span className="ig-highlight-ring">{h.emoji}</span>
            <span className="ig-highlight-label">{h.label}</span>
          </Link>
        ))}
      </section>

      {/* Alerts */}
      {!hasPackage && !isPending && (
        <Link to="/package" className="block neon-banner mb-3 text-center text-sm py-3">
          📦 Buy INSTOVA Plan — Rs 1800
        </Link>
      )}
      {isPending && (
        <section className="neon-alert neon-alert-warning mb-3 text-sm">⏳ Package under review (24h)</section>
      )}
      {hasPackage && (
        <section className="neon-alert neon-alert-success mb-3 text-sm">✅ INSTOVA Plan Active</section>
      )}

      {/* Tab bar */}
      <section className="ig-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'grid'}
          className={`ig-tab${activeTab === 'grid' ? ' ig-tab-active' : ''}`}
          onClick={() => setActiveTab('grid')}
        >
          <GridIcon />
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'stats'}
          className={`ig-tab${activeTab === 'stats' ? ' ig-tab-active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <StatsIcon />
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'offers'}
          className={`ig-tab${activeTab === 'offers' ? ' ig-tab-active' : ''}`}
          onClick={() => setActiveTab('offers')}
        >
          <OfferIcon />
        </button>
      </section>

      {/* Tab panels */}
      {activeTab === 'grid' && (
        <section className="ig-grid" role="tabpanel">
          {GRID_ITEMS.map((item, i) => {
            const locked = item.needsPackage && !hasPackage;
            const content = (
              <>
                <span className="ig-grid-item-icon">{item.icon}</span>
                <span>{item.label}</span>
              </>
            );
            if (locked) {
              return (
                <Link key={`${item.label}-${i}`} to="/package" className="ig-grid-item ig-grid-item-locked">
                  {content}
                </Link>
              );
            }
            return (
              <Link key={`${item.label}-${i}`} to={item.to} className="ig-grid-item">
                {content}
              </Link>
            );
          })}
        </section>
      )}

      {activeTab === 'stats' && (
        <section className="ig-stats-list" role="tabpanel">
          {[
            { label: 'Available Balance', value: `Rs ${balance}` },
            { label: 'Total Earned', value: `Rs ${totalEarned}` },
            { label: 'Bonus Balance', value: `Rs ${(wallet.bonus_balance * 100).toFixed(0)}` },
            { label: 'Pending Balance', value: `Rs ${(wallet.pending_balance * 100).toFixed(0)}` },
            { label: 'Tasks Completed', value: completedTasksCount },
            { label: 'Active Team', value: teamCount },
            { label: 'Referral Earnings', value: `Rs ${((referralStats?.total_earnings || 0) * 100).toFixed(0)}` },
            { label: 'Account Level', value: `Level ${user?.level ?? 0}` },
          ].map((row) => (
            <section key={row.label} className="ig-stats-row">
              <span className="ig-stats-row-label">{row.label}</span>
              <span className="ig-stats-row-value">{row.value}</span>
            </section>
          ))}
        </section>
      )}

      {activeTab === 'offers' && (
        <section className="ig-offers-panel" role="tabpanel">
          <section className="neon-banner mb-4 text-center py-4">
            <p className="font-bold text-white text-sm">🎉 Invite 50 friends</p>
            <p className="text-white/80 text-xs mt-1">Earn Rs 5,000 bonus!</p>
          </section>
          <Link to="/referrals" className="ig-profile-btn ig-profile-btn-primary block text-center mb-3">
            Share Referral Link
          </Link>
          <Link to="/package" className="ig-profile-btn block text-center">
            View Plans
          </Link>
        </section>
      )}
    </section>
  );
};

export default Dashboard;
