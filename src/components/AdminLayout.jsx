import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import logo from '../assets/logo.jpeg';

// ── Login As User Modal ────────────────────────────────────────────────────────
const LoginAsUserModal = ({ onClose, onConfirm }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api.get('/admin/users/').then(r => setAllUsers(r.data)).catch(() => {});
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(allUsers.filter(u =>
      u.email?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q)
    ).slice(0, 6));
  }, [query, allUsers]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-black text-base">👤 Login as User</p>
            <p className="text-blue-100 text-xs mt-0.5">Search and select a user</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition text-lg">×</button>
        </div>

        <div className="p-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); }}
            placeholder="Search by email or username..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
          />

          {results.length > 0 && !selected && (
            <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              {results.map(u => (
                <button key={u.id} onClick={() => { setSelected(u); setQuery(u.email); setResults([]); }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition text-left border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{u.username}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.is_active ? 'Active' : 'Blocked'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800 text-sm">{selected.username}</p>
                <p className="text-xs text-blue-600">{selected.email}</p>
              </div>
              <button onClick={() => { setSelected(null); setQuery(''); }}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
          )}

          <button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            className="mt-4 w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Login as {selected ? selected.username : 'User'}
          </button>
        </div>
      </div>
    </div>
  );
};

const navItems = [
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/admin/users',     icon: '👥', label: 'Users' },
  { path: '/admin/withdrawals', icon: '💸', label: 'Withdrawals' },
  { path: '/admin/packages',  icon: '📦', label: 'Packages' },
  { path: '/admin/tasks',     icon: '🎯', label: 'Tasks' },
];

// ── Pending Packages Slide Panel ───────────────────────────────────────────────
const PendingPackagesPanel = ({ onClose }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/package-payments/?status=pending');
      setPayments(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const approve = async (id, username) => {
    try {
      await api.post(`/admin/approve-package/${id}/`);
      flash(`✅ ${username} approved`);
      fetchPending();
    } catch { flash('Failed to approve'); }
  };

  const reject = async (id, username) => {
    const reason = prompt('Rejection reason (optional):') || 'Rejected by admin';
    try {
      await api.post(`/admin/reject-package/${id}/`, { reason });
      flash(`❌ ${username} rejected`);
      fetchPending();
    } catch { flash('Failed to reject'); }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full z-50 bg-white shadow-2xl flex flex-col"
        style={{ width: '100%', maxWidth: 420 }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-white font-black text-base">📦 Pending Packages</p>
            <p className="text-orange-100 text-xs mt-0.5">{payments.length} awaiting review</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition text-lg">
            ×
          </button>
        </div>

        {msg && (
          <div className={`mx-4 mt-3 px-4 py-2 rounded-xl text-sm font-semibold ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {msg}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && payments.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-gray-500 font-semibold">All caught up!</p>
              <p className="text-gray-400 text-sm mt-1">No pending packages</p>
            </div>
          )}

          {payments.map(p => (
            <div key={p.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              {/* User info */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-800">{p.username}</p>
                  <p className="text-xs text-gray-400">{p.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(p.submitted_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-orange-500 text-lg">Rs {p.amount}</p>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                    PENDING
                  </span>
                </div>
              </div>

              {/* Screenshot */}
              {p.screenshot && (
                <button
                  onClick={() => setPreview(p.screenshot)}
                  className="w-full mb-3 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-orange-400 transition"
                >
                  <img
                    src={p.screenshot}
                    alt="Payment proof"
                    className="w-full object-cover"
                    style={{ maxHeight: 160 }}
                  />
                  <p className="text-xs text-gray-400 py-1.5 text-center">Tap to enlarge</p>
                </button>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => approve(p.id, p.username)}
                  className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 transition"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => reject(p.id, p.username)}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screenshot fullscreen modal */}
      {preview && (
        <div
          className="fixed inset-0 z-[60] bg-black bg-opacity-80 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div className="bg-white rounded-2xl p-3 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <img src={preview} alt="Payment screenshot" className="w-full rounded-xl object-contain max-h-[70vh]" />
            <button onClick={() => setPreview(null)}
              className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-semibold">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ── Admin Layout ───────────────────────────────────────────────────────────────
const AdminLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [loginAsUserOpen, setLoginAsUserOpen] = useState(false);

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const res = await api.get('/admin/package-payments/?status=pending');
      setPendingCount(res.data.length);
    } catch { /* silent */ }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLoginAsUser = async (user) => {
    setLoginAsUserOpen(false);
    await logout();
    localStorage.setItem('prefill_email', user.email);
    navigate('/login');
  };

  const currentPage = navItems.find(n => n.path === location.pathname);

  const SidebarContent = () => (
    <div className="flex flex-col bg-gray-900 text-white w-60" style={{ height: '100%' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Corn Flour" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
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

        {/* Pending Packages Quick Action */}
        <button
          onClick={() => { setSidebarOpen(false); setPackagesOpen(true); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all mt-2"
        >
          <span className="text-base w-5 text-center">⏳</span>
          <span className="flex-1 text-left">Pending Approvals</span>
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {pendingCount}
            </span>
          )}
        </button>

        {/* Login as User */}
        <button
          onClick={() => { setSidebarOpen(false); setLoginAsUserOpen(true); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-blue-600 hover:text-white transition-all"
        >
          <span className="text-base w-5 text-center">👤</span>
          <span className="flex-1 text-left">Login as User</span>
        </button>
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
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0" style={{ height: '100vh' }}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden" style={{ display: 'flex' }}>
          <div style={{ flexShrink: 0 }}>
            <SidebarContent />
          </div>
          <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Login as User Modal */}
      {loginAsUserOpen && (
        <LoginAsUserModal
          onClose={() => setLoginAsUserOpen(false)}
          onConfirm={handleLoginAsUser}
        />
      )}

      {/* Pending Packages Panel */}
      {packagesOpen && (
        <PendingPackagesPanel
          onClose={() => { setPackagesOpen(false); fetchPendingCount(); }}
        />
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 flex-shrink-0"
          style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          <div className="flex items-center gap-3">
            {/* Login as User - navbar icon */}
            <button
              onClick={() => setLoginAsUserOpen(true)}
              title="Login as User"
              className="p-2 rounded-lg hover:bg-blue-50 transition group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            {/* Bell button — mobile quick access */}
            <button
              onClick={() => setPackagesOpen(true)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-lg">🔔</span>
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.username?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="pb-20 md:pb-0" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ maxWidth: '100%' }}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-40"
        style={{ display: 'flex' }}>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 4px', textDecoration: 'none' }}
              className={active ? 'text-orange-400' : 'text-gray-500'}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 9, marginTop: 2, fontWeight: 600 }}>{item.label}</span>
            </Link>
          );
        })}
        {/* Pending approvals in bottom nav */}
        <button
          onClick={() => setPackagesOpen(true)}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 4px', background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
          className="text-gray-500"
        >
          <span style={{ fontSize: 18 }}>⏳</span>
          {pendingCount > 0 && (
            <span style={{ position: 'absolute', top: 4, right: '50%', transform: 'translateX(8px)', backgroundColor: '#ef4444', color: 'white', fontSize: 9, fontWeight: 700, borderRadius: 999, padding: '0 4px', minWidth: 14, textAlign: 'center' }}>
              {pendingCount}
            </span>
          )}
          <span style={{ fontSize: 9, marginTop: 2, fontWeight: 600 }}>Approvals</span>
        </button>
        <button
          onClick={() => setLoginAsUserOpen(true)}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 4px', background: 'none', border: 'none', cursor: 'pointer' }}
          className="text-gray-500"
        >
          <span style={{ fontSize: 18 }}>👤</span>
          <span style={{ fontSize: 9, marginTop: 2, fontWeight: 600 }}>As User</span>
        </button>
        <button
          onClick={handleLogout}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 4px', background: 'none', border: 'none', cursor: 'pointer' }}
          className="text-gray-500"
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          <span style={{ fontSize: 9, marginTop: 2, fontWeight: 600 }}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminLayout;
