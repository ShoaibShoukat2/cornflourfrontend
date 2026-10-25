import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NavIcon } from './NavIcons';

const tabs = [
  { path: '/dashboard', icon: 'home', label: 'Dashboard' },
  { path: '/tasks', icon: 'tasks', label: 'Work' },
  { path: '/wallet', icon: 'wallet', label: 'Wallet' },
  { path: '/levels', icon: 'star', label: 'Levels' },
  { path: '/referrals', icon: 'users', label: 'My Team' },
];

const MobileBottomNav = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user || user.is_staff) return null;

  return (
    <nav className="lux-nav md:hidden" aria-label="Main navigation">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <Link key={tab.path} to={tab.path} className={`lux-nav-item${active ? ' lux-nav-item-active' : ''}`}>
            <NavIcon name={tab.icon} size={20} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
