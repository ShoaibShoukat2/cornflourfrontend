import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
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
  return `Rs ${value.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const taskMoney = (reward) => {
  const value = Number(reward || 0);
  const rupees = value >= 1 ? value : value * 100;
  return `Rs ${rupees.toFixed(0)}`;
};

const Dashboard = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const [wallet, setWallet] = useState(null);
  const [overview, setOverview] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [channels, setChannels] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const fetchData = async () => {
    setLoadError(false);
    try {
      const dashRes = await api.get('/auth/dashboard-stats/');
      setOverview(dashRes.data);
      setWallet(dashRes.data.wallet);
    } catch {
      setLoadError(true);
    }
    try {
      const taskRes = await api.get('/tasks/');
      setTasks(taskRes.data.tasks || []);
    } catch {
      setTasks([]);
    }
    try {
      const linkRes = await api.get('/admin/contact-links/');
      setChannels(linkRes.data);
    } catch {
      setChannels(null);
    }
  };

  if (!wallet) {
    return (
      <section className="lux-page">
        <div className="lux-empty">
          {loadError ? (
            <>
              <p>Dashboard load nahi hui</p>
              <button type="button" onClick={fetchData} className="lux-withdraw">Retry</button>
            </>
          ) : <p>Loading...</p>}
        </div>
      </section>
    );
  }

  const plan = overview?.plan;
  const hasPackage = plan?.status === 'approved' || user?.has_package;
  const channelUrl = channels?.whatsapp_channel_link || '/contact';
  const recent = tasks.slice(0, 3);

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

        <article className="lux-wallet-hero">
          <p className="lux-kicker">Your Balance</p>
          <p className="lux-wallet-amount">{money(wallet.main_balance)}</p>
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

        <article className="lux-channel">
          <img src={logo} alt="INSTOVA" className="lux-channel-logo" />
          <div>
            <h2>INSTOVA Official Channels</h2>
            <p>Stay updated, get latest news and support.</p>
          </div>
          <a href={channelUrl} target="_blank" rel="noreferrer" className="lux-join">Join Now ›</a>
          <div className="lux-channel-links">
            {channels?.whatsapp_channel_link && <a href={channels.whatsapp_channel_link} target="_blank" rel="noreferrer">WA</a>}
            {channels?.whatsapp_community_link && <a href={channels.whatsapp_community_link} target="_blank" rel="noreferrer">Chat</a>}
            <Link to="/contact">Web</Link>
          </div>
        </article>

        <article className="lux-member-card">
          <header>
            <div>
              <h2>Recent Tasks</h2>
            </div>
            <Link to="/tasks">View All</Link>
          </header>
          {recent.length === 0 && <p className="lux-member-empty">Tasks appear here after a package is active.</p>}
          {recent.map((task) => (
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
