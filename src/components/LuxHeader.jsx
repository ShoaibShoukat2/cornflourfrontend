import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import logo from '../assets/tasklogo.jpeg';
import { NavIcon } from './NavIcons';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tasks', label: 'Task Room' },
  { to: '/wallet', label: 'Wallet' },
  { to: '/package', label: 'Packages' },
  { to: '/upgrade', label: 'Upgrade Package' },
  { to: '/levels', label: 'Levels' },
  { to: '/referrals', label: 'My Team' },
  { to: '/transactions', label: 'History' },
  { to: '/notifications', label: 'Alerts' },
  { to: '/terms', label: 'Terms & Conditions' },
  { to: '/complaint', label: 'Complaint Box' },
  { to: '/contact', label: 'Support' },
  { to: '/settings', label: 'Profile' },
];

const LuxHeader = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user || user.is_staff) return;
    api.get('/auth/notifications/')
      .then((res) => setUnread(res.data.unread || 0))
      .catch(() => setUnread(0));
  }, [user]);

  if (!user || user.is_staff) return null;

  const signOut = async () => {
    await logout();
    setOpen(false);
    navigate('/login');
  };

  return (
    <header className="lux-header md:hidden">
      <button type="button" className="lux-icon-btn" aria-label="Menu" onClick={() => setOpen(true)}>
        <NavIcon name="menu" size={20} />
      </button>
      <Link to="/dashboard" className="lux-brand">
        <img src={logo} alt="INSTOVA" className="lux-brand-logo" />
        <span>
          <span className="lux-brand-name">INSTOVA</span>
          <span className="lux-brand-tag">Grow · Work · Earn</span>
        </span>
      </Link>
      <span className="lux-header-actions">
        <Link to="/notifications" className="lux-icon-btn" aria-label="Alerts">
          <NavIcon name="bell" size={18} />
          {unread > 0 && <span className="lux-badge">{unread > 9 ? '9+' : unread}</span>}
        </Link>
        <Link to="/settings" className="lux-icon-btn" aria-label="Profile">
          <NavIcon name="user" size={18} />
        </Link>
      </span>
      {open && (
        <div className="lux-drawer-backdrop" onClick={() => setOpen(false)}>
          <nav className="lux-drawer" onClick={(event) => event.stopPropagation()}>
            <p className="lux-drawer-title">INSTOVA</p>
            {LINKS.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="lux-drawer-link">
                {item.label}
              </Link>
            ))}
            <button type="button" onClick={signOut} className="lux-drawer-link lux-drawer-logout">Logout</button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default LuxHeader;
