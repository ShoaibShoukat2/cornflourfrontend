import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/tasklogo.jpeg';
import ProfileAvatar from './ProfileAvatar';
import { NavIcon } from './NavIcons';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `neon-nav-link ${isActive(path) ? 'neon-nav-link-active' : ''}`;

  const customerLinks = [
    { to: '/dashboard', icon: 'home', label: 'Home' },
    { to: '/tasks', icon: 'tasks', label: 'Tasks' },
    { to: '/referrals', icon: 'users', label: 'Referrals' },
    { to: '/wallet', icon: 'wallet', label: 'Wallet' },
    { to: '/package', icon: 'package', label: 'Package' },
    { to: '/settings', icon: 'settings', label: 'Profile' },
    { to: '/notifications', icon: 'offer', label: 'Alerts' },
    { to: '/transactions', icon: 'stats', label: 'History' },
    { to: '/contact', icon: 'contact', label: 'Support' },
  ];

  const NavLinkItem = ({ to, icon, label, onClick, className }) => (
    <Link to={to} onClick={onClick} className={className || linkClass(to)}>
      <NavIcon name={icon} size={16} className="neon-nav-link-icon" />
      <span>{label}</span>
    </Link>
  );

  const UserChip = () => (
    <section className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10">
      <ProfileAvatar size="md" ring={false} />
      <span className="text-sm font-semibold text-white/90">{user.username}</span>
    </section>
  );

  return (
    <nav className={`neon-nav sticky top-0 z-50${user && !user.is_staff ? ' neon-nav-app-mobile' : ''}`}>
      <section className="container mx-auto px-4">
        <section className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <section className="neon-logo-ring w-10 h-10">
              <img src={logo} alt="INSTOVA" className="w-full h-full" />
            </section>
            <span className="text-xl font-bold neon-gradient-text">INSTOVA</span>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white/80 hover:text-white focus:outline-none p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {user ? (
            <section className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {user.is_staff ? (
                <>
                  <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>📊 Dashboard</Link>
                  <Link to="/admin/users" className={linkClass('/admin/users')}>👥 Users</Link>
                  <Link to="/admin/withdrawals" className={linkClass('/admin/withdrawals')}>💸 Withdrawals</Link>
                  <Link to="/admin/packages" className={linkClass('/admin/packages')}>📦 Packages</Link>
                  <Link to="/admin/upgrades" className={linkClass('/admin/upgrades')}>⬆️ Upgrades</Link>
                  <Link to="/admin/contact" className={linkClass('/admin/contact')}>📩 Contact Us</Link>
                  <section className="h-6 w-px bg-white/20 mx-2" />
                  <UserChip />
                </>
              ) : (
                <>
                  {customerLinks.map((item) => (
                    <NavLinkItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
                  ))}
                  <section className="h-6 w-px bg-white/20 mx-2" />
                  <UserChip />
                </>
              )}
              <button onClick={handleLogout} className="ml-2 px-4 py-2 rounded-lg font-medium text-sm text-white bg-red-500/80 hover:bg-red-500 transition border border-red-400/30">
                Logout
              </button>
            </section>
          ) : (
            <section className="hidden md:flex items-center space-x-3">
              <Link to="/login" className="neon-nav-link">Login</Link>
              <Link to="/register" className="neon-btn text-sm" style={{ padding: '0.5rem 1.25rem' }}>Get Started</Link>
            </section>
          )}
        </section>

        {isOpen && (
          <section className="md:hidden pb-4 border-t border-purple-500/20 mt-2 pt-4">
            {user ? (
              <section className="flex flex-col space-y-2">
                <section className="flex items-center space-x-3 px-4 py-3 neon-card mb-2">
                  <ProfileAvatar size="md" ring={false} />
                  <section>
                    <p className="font-semibold text-white">{user.username}</p>
                    <p className="text-xs text-white/50">{user.is_staff ? 'Admin' : 'User'}</p>
                  </section>
                </section>

                {user.is_staff ? (
                  <>
                    <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">📊 Admin Dashboard</Link>
                    <Link to="/admin/users" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">👥 Manage Users</Link>
                    <Link to="/admin/withdrawals" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">💸 Manage Withdrawals</Link>
                    <Link to="/admin/packages" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">📦 Manage Packages</Link>
                    <Link to="/admin/upgrades" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">⬆️ Package Upgrades</Link>
                    <Link to="/admin/contact" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">📩 Contact Us</Link>
                  </>
                ) : (
                  <>
                    {customerLinks.map((item) => (
                      <NavLinkItem
                        key={item.to}
                        to={item.to}
                        icon={item.icon}
                        label={item.label}
                        onClick={() => setIsOpen(false)}
                        className={`neon-nav-link px-4 py-3${isActive(item.to) ? ' neon-nav-link-active' : ''}`}
                      />
                    ))}
                  </>
                )}
                <button onClick={handleLogout} className="mt-2 px-4 py-3 bg-red-500/80 text-white rounded-lg font-medium">
                  Logout
                </button>
              </section>
            ) : (
              <section className="flex flex-col space-y-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3 text-center">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="neon-btn neon-btn-block">Get Started</Link>
              </section>
            )}
          </section>
        )}
      </section>
    </nav>
  );
};

export default Navbar;
