import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ProfileAvatar from './ProfileAvatar';
import { NavIcon } from './NavIcons';

const tabs = [
  { path: '/dashboard', icon: 'home', label: 'Home' },
  { path: '/tasks', icon: 'tasks', label: 'Tasks' },
  { path: '/wallet', icon: 'wallet', label: 'Wallet', center: true },
  { path: '/referrals', icon: 'users', label: 'Team' },
  { path: '/settings', icon: null, label: 'Profile', isProfile: true },
];

const MobileBottomNav = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user || user.is_staff) return null;

  return (
    <nav className="ig-bottom-nav md:hidden" aria-label="Main navigation">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        const cls = `ig-bottom-nav-item${active ? ' ig-bottom-nav-item-active' : ''}${tab.center ? ' ig-bottom-nav-center' : ''}`;

        return (
          <Link key={tab.path} to={tab.path} className={cls} aria-label={tab.label}>
            {tab.isProfile ? (
              <span className="ig-bottom-nav-avatar">
                <ProfileAvatar size="sm" ring={false} />
              </span>
            ) : (
              <span className="ig-bottom-nav-icon">
                <NavIcon name={tab.icon} size={22} />
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
