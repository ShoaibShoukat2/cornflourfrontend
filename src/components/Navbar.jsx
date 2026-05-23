import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/tasklogo.jpeg';

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

  return (
    <nav className={`neon-nav sticky top-0 z-50${user && !user.is_staff ? ' neon-nav-app-mobile' : ''}`}>
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="neon-logo-ring w-10 h-10">
              <img src={logo} alt="INSTOVA" className="w-full h-full" />
            </div>
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
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {user.is_staff ? (
                <>
                  <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>📊 Dashboard</Link>
                  <Link to="/admin/users" className={linkClass('/admin/users')}>👥 Users</Link>
                  <Link to="/admin/withdrawals" className={linkClass('/admin/withdrawals')}>💸 Withdrawals</Link>
                  <Link to="/admin/packages" className={linkClass('/admin/packages')}>📦 Packages</Link>
                  <Link to="/admin/contact" className={linkClass('/admin/contact')}>📩 Contact Us</Link>
                  <div className="h-6 w-px bg-white/20 mx-2" />
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm neon-btn" style={{ padding: 0, borderRadius: '9999px', width: '2rem', height: '2rem' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-white/90">{user.username}</span>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className={linkClass('/dashboard')}>🏠 Home</Link>
                  <Link to="/tasks" className={linkClass('/tasks')}>🎯 Tasks</Link>
                  <Link to="/referrals" className={linkClass('/referrals')}>👥 Referrals</Link>
                  <Link to="/wallet" className={linkClass('/wallet')}>💰 Wallet</Link>
                  <Link to="/package" className={linkClass('/package')}>📦 Package</Link>
                  <Link to="/settings" className={linkClass('/settings')}>⚙️ Settings</Link>
                  <Link to="/contact" className={linkClass('/contact')}>📩 Contact</Link>
                  <div className="h-6 w-px bg-white/20 mx-2" />
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--neon-gradient-btn)' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-white/90">{user.username}</span>
                  </div>
                </>
              )}
              <button onClick={handleLogout} className="ml-2 px-4 py-2 rounded-lg font-medium text-sm text-white bg-red-500/80 hover:bg-red-500 transition border border-red-400/30">
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link to="/login" className="neon-nav-link">Login</Link>
              <Link to="/register" className="neon-btn text-sm" style={{ padding: '0.5rem 1.25rem' }}>Get Started</Link>
            </div>
          )}
        </div>

        {isOpen && (
          <section className="md:hidden pb-4 border-t border-purple-500/20 mt-2 pt-4">
            {user ? (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3 px-4 py-3 neon-card mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'var(--neon-gradient-btn)' }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.username}</p>
                    <p className="text-xs text-white/50">{user.is_staff ? 'Admin' : 'User'}</p>
                  </div>
                </div>

                {user.is_staff ? (
                  <>
                    <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">📊 Admin Dashboard</Link>
                    <Link to="/admin/users" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">👥 Manage Users</Link>
                    <Link to="/admin/withdrawals" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">💸 Manage Withdrawals</Link>
                    <Link to="/admin/packages" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">📦 Manage Packages</Link>
                    <Link to="/admin/contact" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">📩 Contact Us</Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">🏠 Home</Link>
                    <Link to="/tasks" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">🎯 Tasks</Link>
                    <Link to="/referrals" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">👥 Referrals</Link>
                    <Link to="/wallet" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">💰 Wallet</Link>
                    <Link to="/package" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">📦 Package</Link>
                    <Link to="/settings" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">⚙️ Settings</Link>
                    <Link to="/contact" onClick={() => setIsOpen(false)} className="neon-nav-link px-4 py-3">📩 Contact</Link>
                  </>
                )}
                <button onClick={handleLogout} className="mt-2 px-4 py-3 bg-red-500/80 text-white rounded-lg font-medium">
                  Logout
                </button>
              </div>
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
