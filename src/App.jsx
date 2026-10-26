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
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageWithdrawals from './pages/admin/ManageWithdrawals';
import ManagePackages from './pages/admin/ManagePackages';
import ManageTasks from './pages/admin/ManageTasks';
import AdminContact from './pages/admin/AdminContact';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReports from './pages/admin/AdminReports';
import ManageUpgrades from './pages/admin/ManageUpgrades';
import AdminTerms from './pages/admin/AdminTerms';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminHistory from './pages/admin/AdminHistory';
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

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
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
    );
  }

  return (
    <UserLayout>
      <LuxHeader />
      <Navbar />
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
