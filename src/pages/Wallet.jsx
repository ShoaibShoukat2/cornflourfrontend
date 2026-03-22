import { useState, useEffect } from 'react';
import api from '../api/axios';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'jazzcash',
    payment_details: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, withdrawalsRes] = await Promise.all([
        api.get('/wallet/'),
        api.get('/wallet/withdrawals/')
      ]);
      setWallet(walletRes.data);
      setWithdrawals(withdrawalsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) / 100,  // convert Rs to decimal storage unit
      };
      await api.post('/wallet/withdraw/', payload);
      setMessage('✅ Money Request Sent! We will send money in 24 hours');
      setShowWithdrawForm(false);
      setFormData({ amount: '', payment_method: 'jazzcash', payment_details: '' });
      fetchData();
    } catch (error) {
      if (error.response?.data?.error === 'package_required') {
        setMessage('🔒 Buy the Corn Plan to withdraw money');
      } else {
        setMessage(error.response?.data?.error || 'Request failed');
      }
    }
  };

  if (!wallet) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Simple Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">💰 MY MONEY</h1>
          <p className="text-lg text-gray-600">Your Earnings • Withdraw Money</p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-100 border-2 border-green-400 text-green-800 px-6 py-4 rounded-2xl mb-6 text-center text-lg font-semibold shadow-lg">
            {message}
          </div>
        )}

        {/* Money Display - BIG and Clear */}
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-3xl shadow-2xl p-8 mb-8 text-white text-center">
          <h2 className="text-2xl mb-4 opacity-90">💵 Available Money</h2>
          <p className="text-6xl font-black mb-4">Rs {(wallet.main_balance * 100).toFixed(0)}</p>
          <p className="text-lg opacity-90">You can withdraw this money</p>
        </div>

        {/* Other Balances */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">🎁</div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Bonus Money</h3>
            <p className="text-2xl font-bold text-orange-600">Rs {(wallet.bonus_balance * 100).toFixed(0)}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Pending Money</h3>
            <p className="text-2xl font-bold text-blue-600">Rs {(wallet.pending_balance * 100).toFixed(0)}</p>
          </div>
        </div>

        {/* Withdraw Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">💸 GET YOUR MONEY</h2>
            <p className="text-gray-600">Minimum: Rs 500 • Maximum: Rs 50,000</p>
          </div>

          {!showWithdrawForm ? (
            <button
              onClick={() => setShowWithdrawForm(true)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-6 rounded-2xl font-bold text-xl hover:from-orange-600 hover:to-red-600 transition shadow-lg"
            >
              💰 WITHDRAW MONEY
            </button>
          ) : (
            <form onSubmit={handleWithdraw} className="space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-gray-700 mb-3 text-lg font-semibold">💵 How much money?</label>
                <input
                  type="number"
                  step="1"
                  min="500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount (Rs 500 minimum)"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 text-lg text-center"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-gray-700 mb-3 text-lg font-semibold">📱 How to receive money?</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 text-lg"
                >
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="bank">Bank Account</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {/* Payment Details */}
              <div>
                <label className="block text-gray-700 mb-3 text-lg font-semibold">
                  {formData.payment_method === 'jazzcash' && '📞 JazzCash Number'}
                  {formData.payment_method === 'easypaisa' && '📞 EasyPaisa Number'}
                  {formData.payment_method === 'bank' && '🏦 Bank Account Details'}
                  {formData.payment_method === 'paypal' && '📧 PayPal Email'}
                </label>
                <textarea
                  value={formData.payment_details}
                  onChange={(e) => setFormData({ ...formData, payment_details: e.target.value })}
                  placeholder={
                    formData.payment_method === 'jazzcash' ? 'Enter your JazzCash number (03xxxxxxxxx)' :
                    formData.payment_method === 'easypaisa' ? 'Enter your EasyPaisa number (03xxxxxxxxx)' :
                    formData.payment_method === 'bank' ? 'Enter bank name and account number' :
                    'Enter your PayPal email address'
                  }
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 text-lg"
                  rows="3"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShowWithdrawForm(false)}
                  className="bg-gray-300 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-400 transition"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition shadow-lg"
                >
                  SEND REQUEST
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Simple Withdrawal History */}
        {withdrawals.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">📋 Your Money Requests</h2>
            <div className="space-y-3">
              {withdrawals.slice(0, 10).map((withdrawal) => (
                <div key={withdrawal.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-lg">Rs {(withdrawal.amount * 100).toFixed(0)}</p>
                    <p className="text-sm text-gray-500 capitalize">{withdrawal.payment_method}</p>
                    <p className="text-xs text-gray-400">{new Date(withdrawal.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold block mb-1 ${
                      withdrawal.status === 'pending'  ? 'bg-yellow-100 text-yellow-800' :
                      withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                         'bg-red-100 text-red-800'
                    }`}>
                      {withdrawal.status === 'pending'  ? '⏳ Waiting' :
                       withdrawal.status === 'approved' ? '✅ Sent' : '❌ Rejected'}
                    </span>
                    {withdrawal.admin_note && (
                      <p className="text-xs text-gray-400">{withdrawal.admin_note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
