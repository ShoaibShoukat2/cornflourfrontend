import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const navItems = [
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/admin/users',     icon: '👥', label: 'Users' },
  { path: '/admin/withdrawals', icon: '💸', label: 'Withdrawals' },
  { path: '/admin/packages',  icon: '📦', label: 'Packages' },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentPage = navItems.find(n => n.path === location.pathname);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900 text-white w-60">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
            🌽
          </div>
          <div>
            <p className="font-black text-white text-sm leading-none">Corn Flour</p>
            <p className="text-gray-400 text-xs mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-3 bg-gray-800 rounded-xl mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
            {user?.username?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.username || 'Admin'}</p>
            <p className="text-gray-400 text-xs">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>

      {/* Desktop Sidebar — always visible */}
      <div style={{ flexShrink: 0, display: 'flex' }} className="hidden md:flex">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <SidebarContent />
          <div className="flex-1 bg-black bg-opacity-60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <p className="font-bold text-gray-800 text-base">
              {currentPage?.icon} {currentPage?.label || 'Admin'}
            </p>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.username?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
