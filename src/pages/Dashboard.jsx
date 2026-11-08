import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api, { readCache } from '../api/axios';
import { NavIcon } from '../components/NavIcons';
import logo from '../assets/tasklogo.jpeg';

const TABS = [
  { to: '/dashboard', icon: 'home', label: 'Dashboard' },
  { to: '/tasks', icon: 'tasks', label: 'Work' },
  { to: '/wallet', icon: 'wallet', label: 'Wallet' },
  { to: '/levels', icon: 'star', label: 'Levels' },
  { to: '/referrals', icon: 'users', label: 'My Team' },
];

const money = (units) => {
  const value = Number(units || 0) * 100;
  const safe = Number.isFinite(value) ? value : 0;
  return `Rs ${safe.toFixed(2)}`;
};

const taskMoney = (reward) => {
  const value = Number(reward || 0);
  const rupees = value >= 1 ? value : value * 100;
  return `Rs ${rupees.toFixed(0)}`;
};

const safeChannelLink = (value) => {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

const Dashboard = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const cachedDash = readCache('/auth/dashboard-stats/');
  const [wallet, setWallet] = useState(cachedDash?.wallet || null);
  const [overview, setOverview] = useState(cachedDash);
  const [tasks, setTasks] = useState(() => {
    const cached = readCache('/tasks/');
    if (Array.isArray(cached?.tasks)) return cached.tasks;
    if (Array.isArray(cached)) return cached;
    return [];
  });
  const [channels, setChannels] = useState(readCache('/admin/contact-links/'));
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const fetchData = async () => {
    setLoadError(false);
    const [dashRes, taskRes, linkRes] = await Promise.allSettled([
      api.get('/auth/dashboard-stats/'),
      api.get('/tasks/'),
      api.get('/admin/contact-links/'),
    ]);
    if (dashRes.status === 'fulfilled') {
      setOverview(dashRes.value.data);
      setWallet(dashRes.value.data.wallet);
    } else if (!readCache('/auth/dashboard-stats/')) {
      setLoadError(true);
    }
    if (taskRes.status === 'fulfilled') {
      const incoming = taskRes.value.data;
      const list = Array.isArray(incoming?.tasks) ? incoming.tasks : (Array.isArray(incoming) ? incoming : []);
      setTasks(list);
    }
    if (linkRes.status === 'fulfilled') setChannels(linkRes.value.data);
  };

  const walletView = wallet || { main_balance: 0 };
  const plan = overview?.plan;
  const hasPackage = plan?.status === 'approved' || user?.has_package;
  const recent = (Array.isArray(tasks) ? tasks : []).slice(0, 3);

  return (
    <section className="lux-page lux-home">
      <div className="lux-wrap">
        <nav className="lux-top-tabs" aria-label="Sections">
          {TABS.map((tab) => (
            <Link key={tab.to} to={tab.to} className={tab.to === '/dashboard' ? 'is-active' : ''}>
              <NavIcon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </Link>
          ))}
        </nav>

        {loadError && !wallet && (
          <p className="lux-status lux-status-warn">
            Dashboard load nahi hui
            <button type="button" onClick={fetchData} className="lux-withdraw">Retry</button>
          </p>
        )}

        <article className="lux-wallet-hero">
          <p className="lux-kicker">Your Balance</p>
          <p className="lux-wallet-amount">{money(walletView.main_balance)}</p>
          <p className="lux-home-note">Available for withdrawal</p>
        </article>

        {(plan?.status === 'pending' || plan?.status === 'rejected' || plan?.upgrade_status === 'pending') && (
          <p className={`lux-status${plan?.status === 'rejected' ? ' lux-status-warn' : ''}`}>
            {plan?.status === 'pending' && 'Plan request is pending admin approval.'}
            {plan?.status === 'rejected' && `Plan rejected${plan.admin_note ? `: ${plan.admin_note}` : ''}.`}
            {plan?.upgrade_status === 'pending' && ' Upgrade request is pending.'}
          </p>
        )}

        <section className="lux-home-actions">
          <Link to="/wallet"><span><NavIcon name="withdraw" size={18} /></span><strong>Withdraw</strong><small>Get your earnings</small></Link>
          <Link to="/package"><span><NavIcon name="package" size={18} /></span><strong>Plan Details</strong><small>{hasPackage ? (plan?.package_label || 'View your plan') : 'View your plan'}</small></Link>
          <Link to="/referrals"><span><NavIcon name="users" size={18} /></span><strong>My Team</strong><small>Your referrals</small></Link>
          <Link to="/levels"><span><NavIcon name="star" size={18} /></span><strong>Levels</strong><small>Track progress</small></Link>
        </section>

        <section className="lux-official-channels" aria-label="Official channels">
          {[
            {
              key: 'channel',
              name: channels?.whatsapp_channel_name || 'Official WhatsApp Channel',
              purpose: channels?.whatsapp_channel_purpose || 'Official announcements and updates.',
              icon: channels?.whatsapp_channel_icon,
              url: safeChannelLink(channels?.whatsapp_channel_link),
            },
            {
              key: 'community',
              name: channels?.whatsapp_community_name || 'Official WhatsApp Community',
              purpose: channels?.whatsapp_community_purpose || 'Community support and discussion.',
              icon: channels?.whatsapp_community_icon,
              url: safeChannelLink(channels?.whatsapp_community_link),
            },
          ].map((channel) => (
            <article key={channel.key} className="lux-channel-card">
              <img src={channel.icon || logo} alt="" className="lux-channel-card-icon" />
              <h2>{channel.name}</h2>
              <p>{channel.purpose}</p>
              {channel.url && (
                <a href={channel.url} target="_blank" rel="noopener noreferrer" className="lux-join">
                  Join Now ›
                </a>
              )}
            </article>
          ))}
        </section>

        <article className="lux-member-card">
          <header>
            <div>
              <h2>Recent Tasks</h2>
            </div>
            <Link to="/tasks">View All</Link>
          </header>
          {recent.length === 0 && <p className="lux-member-empty">Tasks appear here after a package is active.</p>}
          {recent.map((task, index) => (
            <Link key={task.id} to="/tasks" className="lux-home-task">
              <span className={`lux-bloom ${['is-rose', 'is-lilac', 'is-blush'][index % 3]}`} aria-hidden="true" />
              <div>
                <strong>{task.title}</strong>
                <p>{task.description}</p>
                <small>{taskMoney(task.reward)} · Today</small>
              </div>
              <em className={task.is_completed ? 'is-done' : 'is-wait'}>{task.is_completed ? 'Completed' : 'Pending'}</em>
            </Link>
          ))}
        </article>

        <article className="lux-quote">
          <p>Small steps create big results</p>
          <strong>INSTOVA</strong>
          <span>Learn · Work · Grow</span>
        </article>
      </div>
    </section>
  );
};

export default Dashboard;
