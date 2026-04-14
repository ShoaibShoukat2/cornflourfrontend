import { useState, useEffect } from 'react';
import api from '../api/axios';

const Referrals = () => {
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, refRes] = await Promise.all([
        api.get('/referrals/stats/'),
        api.get('/referrals/list/')
      ]);
      setStats(statsRes.data);
      setReferrals(refRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(stats.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const message = `Join Corn Flour and earn money daily! Use my link: ${stats.referral_link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!stats) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Simple Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">👥 INVITE FRIENDS</h1>
          <p className="text-lg text-gray-600">Share • Earn Money Together</p>
        </div>

        {/* Earnings Display */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white text-center">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="text-lg font-bold mb-1">Total Friends</h3>
            <p className="text-3xl font-black">{stats.total_referrals}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-lg font-bold mb-1">Money Earned</h3>
            <p className="text-3xl font-black">Rs {(stats.total_earnings * 100).toFixed(0)}</p>
          </div>
        </div>

        {/* Share Link Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🔗 YOUR LINK</h2>
          <p className="text-center text-gray-600 mb-6 text-lg">
            Share this link • Get Rs 50 for each friend who joins!
          </p>
          
          {/* Link Display */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Link:</p>
            <p className="text-blue-600 font-semibold break-all">{stats.referral_link}</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={copyToClipboard}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
            >
              {copied ? '✅ COPIED!' : '📋 COPY LINK'}
            </button>
            
            <button
              onClick={shareWhatsApp}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition shadow-lg"
            >
              📱 SHARE WHATSAPP
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">💡 HOW TO EARN</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📤</span>
              </div>
              <h3 className="text-lg font-bold mb-2">1. SHARE LINK</h3>
              <p className="text-gray-600">Send your link to friends on WhatsApp, Facebook, etc.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-lg font-bold mb-2">2. FRIEND JOINS</h3>
              <p className="text-gray-600">When they register, you will get 25%!</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-lg font-bold mb-2">3. EARN MORE</h3>
              <p className="text-gray-600">When your Member invites a Member, you get 3%. When your Member's Member invites, you get 1%!</p>
            </div>
          </div>
        </div>

        {/* Friends List */}
        {referrals.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">👥 YOUR FRIENDS ({referrals.length})</h2>
            <div className="space-y-4">
              {referrals.slice(0, 10).map((ref) => (
                <div key={ref.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg text-gray-800">{ref.username}</p>
                      <p className="text-sm text-gray-600">Joined: {new Date(ref.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">You Earned:</p>
                      <p className="text-xl font-bold text-green-600">Rs {(ref.commission_earned * 100).toFixed(0)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Status</p>
                      <p className={`font-semibold ${ref.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                        {ref.is_active ? '🟢 Active' : '⚪ Inactive'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Their Balance</p>
                      <p className="font-semibold text-blue-600">Rs {(ref.main_balance * 100).toFixed(0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Total Earned</p>
                      <p className="font-semibold text-purple-600">Rs {(ref.total_earned * 100).toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Friends Message */}
        {referrals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No Friends Yet</h3>
            <p className="text-lg text-gray-500">Start sharing your link to earn money!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;
