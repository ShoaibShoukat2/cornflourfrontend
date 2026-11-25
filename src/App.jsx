import { Component, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Wallet from './pages/Wallet';
import Referrals from './pages/Referrals';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const ManageWithdrawals = lazy(() => import('./pages/admin/ManageWithdrawals'));
const ManagePackages = lazy(() => import('./pages/admin/ManagePackages'));
const ManageTasks = lazy(() => import('./pages/admin/ManageTasks'));
const AdminContact = lazy(() => import('./pages/admin/AdminContact'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const ManageUpgrades = lazy(() => import('./pages/admin/ManageUpgrades'));
const AdminTerms = lazy(() => import('./pages/admin/AdminTerms'));
const AdminComplaints = lazy(() => import('./pages/admin/AdminComplaints'));
const AdminHistory = lazy(() => import('./pages/admin/AdminHistory'));
import Package from './pages/Package';
import Upgrade from './pages/Upgrade';
import Contact from './pages/Contact';
import AccountCreated from './pages/AccountCreated';
import Notifications from './pages/Notifications';
import Transactions from './pages/Transactions';
import Terms from './pages/Terms';
import Complaint from './pages/Complaint';
import Levels from './pages/Levels';
import MobileBottomNav from './components/MobileBottomNav';
import LuxHeader from './components/LuxHeader';
import NetworkBanner from './components/NetworkBanner';

class PageBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.failed) {
      return (
        <section className="lux-page">
          <div className="lux-empty">
            <p>This page could not open.</p>
            <button type="button" className="lux-withdraw" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <PageBoundary key={location.pathname}>
      <Suspense fallback={null}>
      <Routes>
        <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminLayout><ManageUsers /></AdminLayout></AdminRoute>} />
        <Route path="/admin/withdrawals" element={<AdminRoute><AdminLayout><ManageWithdrawals /></AdminLayout></AdminRoute>} />
        <Route path="/admin/packages" element={<AdminRoute><AdminLayout><ManagePackages /></AdminLayout></AdminRoute>} />
        <Route path="/admin/upgrades" element={<AdminRoute><AdminLayout><ManageUpgrades /></AdminLayout></AdminRoute>} />
        <Route path="/admin/tasks" element={<AdminRoute><AdminLayout><ManageTasks /></AdminLayout></AdminRoute>} />
        <Route path="/admin/contact" element={<AdminRoute><AdminLayout><AdminContact /></AdminLayout></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminLayout><AdminReports /></AdminLayout></AdminRoute>} />
        <Route path="/admin/terms" element={<AdminRoute><AdminLayout><AdminTerms /></AdminLayout></AdminRoute>} />
        <Route path="/admin/complaints" element={<AdminRoute><AdminLayout><AdminComplaints /></AdminLayout></AdminRoute>} />
        <Route path="/admin/history" element={<AdminRoute><AdminLayout><AdminHistory /></AdminLayout></AdminRoute>} />
      </Routes>
      </Suspense>
      </PageBoundary>
    );
  }

  return (
    <UserLayout>
      <LuxHeader />
      <Navbar />
      <PageBoundary key={location.pathname}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/account-created" element={<PrivateRoute><AccountCreated /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
        <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
        <Route path="/referrals" element={<PrivateRoute><Referrals /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/package" element={<PrivateRoute><Package /></PrivateRoute>} />
        <Route path="/upgrade" element={<PrivateRoute><Upgrade /></PrivateRoute>} />
        <Route path="/contact" element={<PrivateRoute><Contact /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
        <Route path="/terms" element={<PrivateRoute><Terms /></PrivateRoute>} />
        <Route path="/complaint" element={<PrivateRoute><Complaint /></PrivateRoute>} />
        <Route path="/levels" element={<PrivateRoute><Levels /></PrivateRoute>} />
      </Routes>
      </PageBoundary>
      <MobileBottomNav />
    </UserLayout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NetworkBanner />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
