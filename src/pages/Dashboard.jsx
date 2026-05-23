import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import tasklogo from '../assets/tasklogo.jpeg';

const Dashboard = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const [wallet, setWallet] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [packageStatus, setPackageStatus] = useState('none');
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('success');

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, refRes, tasksRes, pkgRes] = await Promise.all([
        api.get('/wallet/'),
        api.get('/referrals/stats/'),
        api.get('/tasks/my-tasks/'),
        api.get('/auth/package-status/'),
      ]);
      setWallet(walletRes.data);
      setReferralStats(refRes.data);
      const tasksData = tasksRes.data;
      if (tasksData?.total_completed !== undefined) {
        setCompletedTasksCount(tasksData.total_completed);
      } else if (Array.isArray(tasksData)) {
        setCompletedTasksCount(tasksData.filter(t => t.status === 'verified').length);
      }
      setPackageStatus(pkgRes.data.status || 'none');
    } catch (error) {
      console.error(error);
    }
  };

  const claimDailyBonus = async () => {
    try {
      const response = await api.post('/tasks/daily-bonus/');
      setMsgType('success');
      setMessage(`Daily Bonus Claimed! Rs ${(response.data.amount * 100).toFixed(0)} added to your wallet`);
      fetchData();
    } catch (error) {
      setMsgType('error');
      setMessage(error.response?.data?.error || 'Could not claim bonus, try again later');
    }
  };

  if (!wallet) return (
    <section className="neon-loading">
      <div className="neon-spinner" />
      <p className="neon-loading-text">Loading...</p>
    </section>
  );

  const hasPackage = packageStatus === 'approved' || user?.has_package;
  const isPending = packageStatus === 'pending';
  const completedTasks = completedTasksCount;

  const LockedOverlay = () => (
    <Link to="/package" className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center z-10 backdrop-blur-sm border border-purple-500/30">
      <span className="text-2xl">🔒</span>
      <span className="text-white text-xs font-bold mt-1 neon-gradient-text">Buy Package</span>
    </Link>
  );

  return (
    <section className="pb-8">
      <header className="neon-hero text-white px-4 pt-8 pb-16 relative z-10">
        <section className="max-w-lg mx-auto text-center">
          <section className="neon-logo-ring w-16 h-16 mx-auto mb-3">
            <img src={tasklogo} alt="INSTOVA" className="w-full h-full" />
          </section>
          <h1 className="text-xl font-bold text-white drop-shadow-lg">INSTOVA</h1>
          <p className="text-white/80 text-sm mt-1">Hello, {user?.username}!</p>
        </section>
      </header>

      <section className="max-w-lg mx-auto px-4 -mt-10 pb-8 relative z-10">
        <section className="neon-balance-card p-6 mb-4 text-center">
          <p className="neon-subtitle text-sm mb-1">Your Balance</p>
          <p className="neon-balance-amount mb-1">
            Rs {(wallet.main_balance * 100).toFixed(0)}
          </p>
          <p className="neon-subtitle text-xs mb-4">Available to withdraw</p>
          {hasPackage ? (
            <Link to="/wallet" className="neon-btn inline-block">
              Withdraw Money
            </Link>
          ) : (
            <Link to="/package" className="neon-btn-outline neon-btn inline-block opacity-60">
              🔒 Withdraw (Buy Package)
            </Link>
          )}
        </section>

        {!hasPackage && !isPending && (
          <Link to="/package" className="block neon-banner mb-4 hover:opacity-95 transition">
            <p className="font-black text-white text-base">📦 Buy INSTOVA Plan — Rs 1800</p>
            <p className="text-white/80 text-xs mt-1">Unlock tasks, withdrawals & full earning features</p>
          </Link>
        )}

        {isPending && (
          <section className="neon-alert neon-alert-warning mb-4">
            <p className="font-bold text-sm">⏳ Package Under Review</p>
            <p className="text-xs mt-1 opacity-80">Your payment is being verified. Features will unlock within 24 hours.</p>
          </section>
        )}

        {hasPackage && (
          <section className="neon-alert neon-alert-success mb-4">
            <p className="font-bold text-sm">✅ INSTOVA Plan Active — Full Access</p>
          </section>
        )}

        {message && (
          <section className={`neon-alert mb-4 ${msgType === 'success' ? 'neon-alert-success' : 'neon-alert-error'}`}>
            {message}
          </section>
        )}

        <section className="grid grid-cols-3 gap-3 mb-4">
          <section className="neon-stat neon-delay-1">
            <p className="neon-stat-value">Rs {(wallet.total_earned * 100).toFixed(0)}</p>
            <p className="neon-stat-label">Total Earned</p>
          </section>
          <section className="neon-stat neon-delay-2">
            <p className="neon-stat-value">{completedTasks}</p>
            <p className="neon-stat-label">Tasks Done</p>
          </section>
          <section className="neon-stat neon-delay-3">
            <p className="neon-stat-value">{referralStats?.total_referrals || 0}</p>
            <p className="neon-stat-label">Active Team</p>
          </section>
        </section>

        <section className="grid grid-cols-2 gap-3 mb-4">
          <section className="relative">
            <section className={`neon-action flex flex-col items-center justify-center py-6 ${hasPackage ? '' : 'opacity-60'}`}>
              <span className="text-3xl mb-2">🎯</span>
              <span className="font-bold text-white text-sm">Do Tasks</span>
              <span className="text-xs text-white/50 mt-1">Earn money</span>
            </section>
            {hasPackage ? <Link to="/tasks" className="absolute inset-0 rounded-2xl" /> : <LockedOverlay />}
          </section>

          <section className="relative">
            <section className={`neon-action neon-action-green flex flex-col items-center justify-center py-6 ${!hasPackage ? 'opacity-60' : ''}`}>
              <span className="text-3xl mb-2">💸</span>
              <span className="font-bold text-white text-sm">Withdraw</span>
              <span className="text-xs text-white/70 mt-1">Get your money</span>
            </section>
            {hasPackage ? <Link to="/wallet" className="absolute inset-0 rounded-2xl" /> : <LockedOverlay />}
          </section>
        </section>

        <section className="neon-banner">
          <p className="text-sm font-bold text-white">
            🎉 Invite 50 friends and earn Rs 5,000 bonus!
          </p>
        </section>
      </section>
    </section>
  );
};

export default Dashboard;
