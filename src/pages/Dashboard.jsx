import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import InstovaMark from '../components/InstovaMark';
import { NavIcon } from '../components/NavIcons';

const SHORTCUTS = [
  { to: '/tasks', icon: 'tasks', label: 'Task Room' },
  { to: '/wallet', icon: 'wallet', label: 'Wallet' },
  { to: '/referrals', icon: 'users', label: 'My Team' },
  { to: '/package', icon: 'package', label: 'Packages' },
  { to: '/levels', icon: 'upgrade', label: 'Levels' },
  { to: '/upgrade', icon: 'upgrade', label: 'Upgrade' },
  { to: '/transactions', icon: 'history', label: 'History' },
  { to: '/terms', icon: 'terms', label: 'Terms' },
  { to: '/complaint', icon: 'complaint', label: 'Complaint' },
];

const Dashboard = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const [wallet, setWallet] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [packageStatus, setPackageStatus] = useState('none');
  const [overview, setOverview] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const fetchData = async () => {
    setLoadError(false);
    try {
      const dashRes = await api.get('/auth/dashboard-stats/');
      const data = dashRes.data;
      setOverview(data);
      setWallet(data.wallet);
      setReferralStats({
        total_referrals: data.team?.direct || 0,
        total_earnings: data.commissions?.total || 0,
      });
      setCompletedTasksCount(data.stats?.completed_tasks || 0);
      setPackageStatus(data.plan?.status || 'none');
    } catch (error) {
      console.error(error);
      setLoadError(true);
    }
  };

  if (!wallet) {
    return (
      <section className="lux-page">
        {loadError ? (
          <div className="lux-empty">
            <p>Dashboard load nahi hui</p>
            <button type="button" onClick={fetchData} className="lux-withdraw">Retry</button>
          </div>
        ) : (
          <div className="lux-empty"><p>Loading...</p></div>
        )}
      </section>
    );
  }

  const hasPackage = packageStatus === 'approved' || user?.has_package;
  const isPending = packageStatus === 'pending';
  const isRejected = packageStatus === 'rejected';
  const balance = (wallet.main_balance * 100).toFixed(0);
  const totalEarned = (wallet.total_earned * 100).toFixed(0);
  const teamCount = overview?.team?.total ?? referralStats?.total_referrals ?? 0;
  const plan = overview?.plan;
  const level = overview?.level;
  const remainingText = (() => {
    const seconds = plan?.seconds_remaining || 0;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  })();

  return (
    <section className="lux-page">
      <div className="lux-wrap">
        <header className="lux-page-head">
          <InstovaMark size={54} crowned />
          <div>
            <h1>Dashboard</h1>
            <p>{user?.username} · Level {level?.current ?? user?.level ?? 0}</p>
          </div>
        </header>

        <section className="lux-balance">
          <span className="lux-balance-icon"><NavIcon name="wallet" size={22} /></span>
          <div>
            <p className="lux-kicker">Current Balance</p>
            <p className="lux-balance-amt">Rs {balance}</p>
          </div>
          <Link to={hasPackage ? '/wallet' : '/package'} className="lux-withdraw">
            {hasPackage ? 'Withdraw' : 'Buy plan'}
          </Link>
        </section>

        {isPending && (
          <p className="lux-status">
            Plan pending. {plan?.is_overdue ? 'Waiting for admin.' : `Time left ${remainingText}.`}
          </p>
        )}
        {isRejected && (
          <p className="lux-status lux-status-warn">
            Plan rejected{plan?.admin_note ? `: ${plan.admin_note}` : ''}.
          </p>
        )}
        {plan?.upgrade_status === 'pending' && (
          <p className="lux-status">Upgrade request is pending. Package stays the same until approval.</p>
        )}
        {hasPackage && (
          <p className="lux-status">
            {plan?.package_label || 'Plan'} active{plan?.amount ? ` · Rs ${plan.amount}` : ''}
          </p>
        )}

        <section className="lux-stats">
          <article><span className="lux-stat-icon"><NavIcon name="check" size={16} /></span><strong>{completedTasksCount}</strong><span>Tasks</span></article>
          <article><span className="lux-stat-icon"><NavIcon name="users" size={16} /></span><strong>{teamCount}</strong><span>Team</span></article>
          <article><span className="lux-stat-icon"><NavIcon name="upgrade" size={16} /></span><strong>{level?.current ?? user?.level ?? 0}</strong><span>Level</span></article>
          <article className="lux-stat-gold"><span className="lux-stat-icon"><NavIcon name="balance" size={16} /></span><strong>Rs {totalEarned}</strong><span>Earned</span></article>
        </section>

        <section className="lux-shortcuts">
          {SHORTCUTS.map((item) => (
            <Link key={item.label} to={item.to} className="lux-shortcut">
              <NavIcon name={item.icon} size={22} />
              <span>{item.label}</span>
            </Link>
          ))}
        </section>

        <section className="lux-done">
          <p>Account</p>
          <div><span>Direct team</span><strong>{overview?.team?.direct ?? 0}</strong></div>
          <div><span>Indirect team</span><strong>{overview?.team?.indirect ?? 0}</strong></div>
          <div><span>Withdrawable</span><strong>Rs {balance}</strong></div>
          <div><span>Next level</span><strong>{level?.next_level == null ? 'Max' : `${level.members_remaining} more`}</strong></div>
        </section>
      </div>
    </section>
  );
};

export default Dashboard;
