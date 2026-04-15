import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import logo from '../assets/tasklogo.jpeg';

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
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-black text-base">👤 Login as User</p>
            <p className="text-blue-100 text-xs mt-0.5">Search and select a user</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition text-lg">×</button>
        </div>
        <div className="p-4">
          <input ref={inputRef} type="text" value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); }}
            placeholder="Search by email or username..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
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
              <button onClick={() => { setSelected(null); setQuery(''); }} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
          )}
          <button onClick={() => selected && onConfirm(selected)} disabled={!selected}
            className="mt-4 w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
            Login as {selected ? selected.username : 'User'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Nav Items ──────────────────────────────────────────────────────────────────
const navItems = [
  { path: '/admin/dashboard',   icon: '📊', label: 'Dashboard',    desc: 'Overview & stats' },
  { path: '/admin/reports',     icon: '📋', label: 'Reports',      desc: 'Users & requests' },
  { path: '/admin/users',       icon: '👥', label: 'Users',        desc: 'Manage members' },
  { path: '/admin/withdrawals', icon: '💸', label: 'Withdrawals',  desc: 'Payout requests' },
  { path: '/admin/packages',    icon: '📦', label: 'Packages',     desc: 'Deposits & plans' },
  { path: '/admin/tasks',       icon: '🎯', label: 'Tasks',        desc: 'Manage tasks' },
  { path: '/admin/settings',    icon: '⚙️', label: 'Settings',     desc: 'Site configuration' },
  { path: '/admin/contact',     icon: '📩', label: 'Contact Us',   desc: 'Support links' },
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
    } catch { }
    finally { setLoading(false); }
  };

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const approve = async (id, username) => {
    try { await api.post(`/admin/approve-package/${id}/`); flash(`✅ ${username} approved`); fetchPending(); }
    catch { flash('Failed to approve'); }
  };

  const reject = async (id, username) => {
    const reason = prompt('Rejection reason (optional):') || 'Rejected by admin';
    try { await api.post(`/admin/reject-package/${id}/`, { reason }); flash(`❌ ${username} rejected`); fetchPending(); }
    catch { flash('Failed to reject'); }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 bg-white shadow-2xl flex flex-col" style={{ width: '100%', maxWidth: 420 }}>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-white font-black text-base">📦 Pending Packages</p>
            <p className="text-orange-100 text-xs mt-0.5">{payments.length} awaiting review</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition text-lg">×</button>
        </div>
        {msg && (
          <div className={`mx-4 mt-3 px-4 py-2 rounded-xl text-sm font-semibold ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>
        )}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}
          {!loading && payments.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-gray-500 font-semibold">All caught up!</p>
              <p className="text-gray-400 text-sm mt-1">No pending packages</p>
            </div>
          )}
          {payments.map(p => (
            <div key={p.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-800">{p.username}</p>
                  <p className="text-xs text-gray-400">{p.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(p.submitted_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-orange-500 text-lg">Rs {p.amount}</p>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">PENDING</span>
                </div>
              </div>
              {p.screenshot && (
                <button onClick={() => setPreview(p.screenshot)}
                  className="w-full mb-3 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-orange-400 transition">
                  <img src={p.screenshot} alt="Payment proof" loading="lazy" decoding="async" className="w-full object-cover" style={{ maxHeight: 160 }} />
                  <p className="text-xs text-gray-400 py-1.5 text-center">Tap to enlarge</p>
                </button>
              )}
              <div className="flex gap-2">
                <button onClick={() => approve(p.id, p.username)} className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 transition">✅ Approve</button>
                <button onClick={() => reject(p.id, p.username)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition">❌ Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {preview && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl p-3 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <img src={preview} alt="Payment screenshot" className="w-full rounded-xl object-contain max-h-[70vh]" />
            <button onClick={() => setPreview(null)} className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-semibold">Close</button>
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
  const [quickStats, setQuickStats] = useState(null);

  useEffect(() => {
    fetchPendingCount();
    fetchQuickStats();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const res = await api.get('/admin/package-payments/count/');
      setPendingCount(res.data.count);
    } catch { }
  };

  const fetchQuickStats = async () => {
    try {
      const res = await api.get('/admin/dashboard-stats/');
      setQuickStats(res.data);
    } catch { }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLoginAsUser = async (selectedUser) => {
    setLoginAsUserOpen(false);
    await logout();
    localStorage.setItem('prefill_email', selectedUser.email);
    navigate('/login');
  };

  const currentPage = navItems.find(n => n.path === location.pathname);

  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', width: 260 }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Corn Flour" className="w-10 h-10 rounded-xl object-cover shadow-lg flex-shrink-0" />
          <div>
            <p className="font-black text-white text-sm leading-tight">Corn Flour</p>
            <p className="text-slate-400 text-xs mt-0.5">Admin Panel</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="ml-auto text-slate-400 hover:text-white p-1">✕</button>
          )}
        </div>
      </div>

      {/* Quick Stats in Sidebar */}
      {quickStats && (
        <div className="px-4 py-3 border-b border-slate-700/50 flex-shrink-0">
          <p className="text-slate-500 text-xs font-semibold uppercase mb-2">Quick Stats</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/60 rounded-xl px-3 py-2">
              <p className="text-slate-400 text-xs">Total Users</p>
              <p className="text-white font-black text-base">{quickStats.users.total}</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl px-3 py-2">
              <p className="text-slate-400 text-xs">Approved</p>
              <p className="text-green-400 font-black text-base">{quickStats.users.approved}</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl px-3 py-2">
              <p className="text-slate-400 text-xs">Deposited</p>
              <p className="text-orange-400 font-black text-sm">Rs {Number(quickStats.financial.total_deposited).toFixed(0)}</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl px-3 py-2">
              <p className="text-slate-400 text-xs">Withdrawn</p>
              <p className="text-red-400 font-black text-sm">Rs {(quickStats.financial.total_withdrawals * 100).toFixed(0)}</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl px-3 py-2">
              <p className="text-slate-400 text-xs">Today W/D</p>
              <p className="text-yellow-400 font-black text-sm">Rs {(quickStats.financial.today_withdrawals * 100).toFixed(0)}</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl px-3 py-2">
              <p className="text-slate-400 text-xs">Referral Com.</p>
              <p className="text-purple-400 font-black text-sm">Rs {(quickStats.financial.total_referral_commission * 100).toFixed(0)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-slate-500 text-xs font-semibold uppercase px-3 mb-2">Navigation</p>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={() => onClose?.()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:bg-slate-700/60 hover:text-white'
              }`}>
              <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <p className="leading-tight">{item.label}</p>
                <p className={`text-xs leading-tight mt-0.5 ${active ? 'text-orange-100' : 'text-slate-500 group-hover:text-slate-400'}`}>{item.desc}</p>
              </div>
            </Link>
          );
        })}

        <div className="pt-2 border-t border-slate-700/50 mt-2 space-y-0.5">
          <p className="text-slate-500 text-xs font-semibold uppercase px-3 mb-2">Actions</p>

          {/* Pending Approvals */}
          <button onClick={() => { onClose?.(); setPackagesOpen(true); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-700/60 hover:text-white transition-all group">
            <span className="text-base w-5 text-center flex-shrink-0">⏳</span>
            <div className="flex-1 text-left min-w-0">
              <p className="leading-tight">Pending Approvals</p>
              <p className="text-xs text-slate-500 group-hover:text-slate-400 leading-tight mt-0.5">Package requests</p>
            </div>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Login as User */}
          <button onClick={() => { onClose?.(); setLoginAsUserOpen(true); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-blue-600/30 hover:text-blue-300 transition-all group">
            <span className="text-base w-5 text-center flex-shrink-0">👤</span>
            <div className="flex-1 text-left min-w-0">
              <p className="leading-tight">Login as User</p>
              <p className="text-xs text-slate-500 group-hover:text-blue-400 leading-tight mt-0.5">Switch to user view</p>
            </div>
          </button>
        </div>
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-3 border-t border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-800/60 rounded-xl mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0">
            {user?.username?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate leading-tight">{user?.username || 'Admin'}</p>
            <p className="text-slate-400 text-xs leading-tight">Administrator</p>
          </div>
          <button onClick={handleLogout} title="Logout"
            className="text-slate-400 hover:text-red-400 transition p-1 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>

      {/* Desktop Sidebar — always visible */}
      <div className="hidden md:flex flex-shrink-0" style={{ height: '100vh' }}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay — slide in from left */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="flex-shrink-0 shadow-2xl" style={{ height: '100vh' }}>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="flex-1 bg-black bg-opacity-60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Modals */}
      {loginAsUserOpen && (
        <LoginAsUserModal onClose={() => setLoginAsUserOpen(false)} onConfirm={handleLoginAsUser} />
      )}
      {packagesOpen && (
        <PendingPackagesPanel onClose={() => { setPackagesOpen(false); fetchPendingCount(); }} />
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 flex-shrink-0 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger — always show on mobile */}
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition mr-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <p className="font-bold text-gray-800 text-base leading-tight">
                {currentPage?.icon} {currentPage?.label || 'Admin Panel'}
              </p>
              <p className="text-gray-400 text-xs leading-tight hidden sm:block">{currentPage?.desc || 'Corn Flour Administration'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pending badge */}
            <button onClick={() => setPackagesOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-orange-50 transition group">
              <span className="text-lg">🔔</span>
              {pendingCount > 0 && (
                <>
                  <span className="text-sm font-bold text-orange-600 hidden sm:block">{pendingCount} pending</span>
                  <span className="absolute -top-0.5 -right-0.5 sm:hidden bg-red-500 text-white text-xs font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                </>
              )}
            </button>

            {/* Login as user */}
            <button onClick={() => setLoginAsUserOpen(true)} title="Login as User"
              className="p-2 rounded-xl hover:bg-blue-50 transition group">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-black">
                {user?.username?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user?.username}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="pb-5">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
