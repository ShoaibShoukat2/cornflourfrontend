import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import tasklogo from '../assets/tasklogo.jpeg';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [wallet, setWallet] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [packageStatus, setPackageStatus] = useState('none'); // none | pending | approved | rejected
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('success');

  useEffect(() => { fetchData(); }, []);

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
      // Handle both old array format and new object format
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
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-medium">Loading...</p>
    </div>
  );

  const hasPackage = packageStatus === 'approved' || user?.has_package;
  const isPending = packageStatus === 'pending';
  const completedTasks = completedTasksCount;

  // Locked feature overlay
  const LockedOverlay = () => (
    <Link to="/package" className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl flex flex-col items-center justify-center z-10">
      <span className="text-2xl">🔒</span>
      <span className="text-white text-xs font-bold mt-1">Buy Package</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 pt-8 pb-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-14 h-14 bg-white rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
            <img src={tasklogo} alt="Corn Flour" className="w-14 h-14 rounded-full object-cover" />
          </div>
          <h1 className="text-xl font-bold">Corn Flour</h1>
          <p className="text-orange-100 text-sm mt-1">Hello, {user?.username}!</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-10 pb-8">

        {/* Balance Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-4 text-center border border-gray-100">
          <p className="text-gray-500 text-sm mb-1">Your Balance</p>
          <p className="text-5xl font-black text-gray-800 mb-1">
            Rs {(wallet.main_balance * 100).toFixed(0)}
          </p>
          <p className="text-gray-400 text-xs mb-4">Available to withdraw</p>
          {hasPackage ? (
            <Link
              to="/wallet"
              className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-10 py-3 rounded-full text-base shadow-md hover:opacity-90 transition"
            >
              Withdraw Money
            </Link>
          ) : (
            <Link
              to="/package"
              className="inline-block bg-gray-200 text-gray-500 font-bold px-10 py-3 rounded-full text-base"
            >
              🔒 Withdraw (Buy Package)
            </Link>
          )}
        </div>

        {/* Package Status Banner */}
        {!hasPackage && !isPending && (
          <Link to="/package" className="block bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 mb-4 text-center shadow-sm hover:opacity-90 transition">
            <p className="font-black text-white text-base">📦 Buy Corn Plan — Rs 1800</p>
            <p className="text-orange-100 text-xs mt-1">Unlock tasks, withdrawals & full earning features</p>
          </Link>
        )}

        {isPending && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-4 mb-4 text-center">
            <p className="font-bold text-yellow-700 text-sm">⏳ Package Under Review</p>
            <p className="text-yellow-600 text-xs mt-1">Your payment is being verified. Features will unlock within 24 hours.</p>
          </div>
        )}

        {hasPackage && (
          <div className="bg-green-50 border border-green-300 rounded-2xl p-4 mb-4 text-center">
            <p className="font-bold text-green-700 text-sm">✅ Corn Plan Active — Full Access</p>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-2xl text-center text-sm font-semibold mb-4 ${
            msgType === 'success'
              ? 'bg-green-50 border border-green-300 text-green-700'
              : 'bg-red-50 border border-red-300 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center border border-gray-100">
            <p className="text-xl font-black text-orange-500">Rs {(wallet.total_earned * 100).toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1">Total Earned</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center border border-gray-100">
            <p className="text-xl font-black text-blue-500">{completedTasks}</p>
            <p className="text-xs text-gray-400 mt-1">Tasks Done</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center border border-gray-100">
            <p className="text-xl font-black text-purple-500">{referralStats?.total_referrals || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Active Team</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">

          {/* Tasks — locked without package */}
          <div className="relative">
            <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center py-6 transition ${hasPackage ? 'hover:shadow-md' : 'opacity-60'}`}>
              <span className="text-3xl mb-2">🎯</span>
              <span className="font-bold text-gray-700 text-sm">Do Tasks</span>
              <span className="text-xs text-gray-400 mt-1">Earn money</span>
            </div>
            {hasPackage
              ? <Link to="/tasks" className="absolute inset-0 rounded-2xl" />
              : <LockedOverlay />
            }
          </div>

          {/* Withdraw — locked without package */}
          <div className="relative">
            <div className={`bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-sm flex flex-col items-center justify-center py-6 transition ${!hasPackage ? 'opacity-60' : 'hover:opacity-90'}`}>
              <span className="text-3xl mb-2">💸</span>
              <span className="font-bold text-white text-sm">Withdraw</span>
              <span className="text-xs text-green-100 mt-1">Get your money</span>
            </div>
            {hasPackage
              ? <Link to="/wallet" className="absolute inset-0 rounded-2xl" />
              : <LockedOverlay />
            }
          </div>

        </div>

        {/* Offer Banner */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 text-center">
          <p className="text-sm font-bold text-white">
            🎉 Invite 50 friends and earn Rs 5,000 bonus!
          </p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
