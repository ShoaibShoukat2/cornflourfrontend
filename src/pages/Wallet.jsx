import { useState, useEffect } from 'react';
import api from '../api/axios';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'jazzcash',
    account_name: '',
    payment_details: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => { fetchData(); }, []);

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
        amount: parseFloat(formData.amount) / 100,
        payment_details: formData.account_name
          ? `Name: ${formData.account_name}\nNumber: ${formData.payment_details}`
          : formData.payment_details,
      };
      await api.post('/wallet/withdraw/', payload);
      setMessage('✅ Money Request Sent! We will send money in 24 hours');
      setShowWithdrawForm(false);
      setFormData({ amount: '', payment_method: 'jazzcash', account_name: '', payment_details: '' });
      fetchData();
    } catch (error) {
      if (error.response?.data?.error === 'package_required') {
        setMessage('🔒 Buy the Corn Plan to withdraw money');
      } else {
        setMessage(error.response?.data?.error || 'Request failed');
      }
    }
  };

  if (!wallet) return (
    <section className="neon-loading">
      <div className="neon-spinner" />
      <p className="neon-loading-text">Loading...</p>
    </section>
  );

  return (
    <section className="py-6">
      <section className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold neon-title mb-2">💰 MY MONEY</h1>
          <p className="text-lg neon-subtitle">Your Earnings • Withdraw Money</p>
        </header>

        {message && (
          <section className={`neon-alert mb-6 text-lg ${message.includes('✅') ? 'neon-alert-success' : 'neon-alert-error'}`}>
            {message}
          </section>
        )}

        <section className="neon-wallet-hero mb-8 relative z-10">
          <h2 className="text-2xl mb-4 opacity-90 relative z-10">💵 Available Money</h2>
          <p className="text-6xl font-black mb-4 relative z-10">Rs {(wallet.main_balance * 100).toFixed(0)}</p>
          <p className="text-lg opacity-90 relative z-10">You can withdraw this money</p>
        </section>

        <section className="grid grid-cols-2 gap-4 mb-8">
          <section className="neon-card p-6 text-center neon-delay-1">
            <span className="text-3xl mb-2 block">🎁</span>
            <h3 className="text-lg font-bold text-white mb-1">Bonus Money</h3>
            <p className="text-2xl font-bold neon-gradient-text">Rs {(wallet.bonus_balance * 100).toFixed(0)}</p>
          </section>
          <section className="neon-card p-6 text-center neon-delay-2">
            <span className="text-3xl mb-2 block">⏳</span>
            <h3 className="text-lg font-bold text-white mb-1">Pending Money</h3>
            <p className="text-2xl font-bold neon-gradient-text">Rs {(wallet.pending_balance * 100).toFixed(0)}</p>
          </section>
        </section>

        <section className="neon-card p-6 mb-8">
          <header className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">💸 GET YOUR MONEY</h2>
            <p className="neon-subtitle">First Withdrawal: Rs 50 • After that: Rs 500 minimum</p>
          </header>

          {!showWithdrawForm ? (
            <button onClick={() => setShowWithdrawForm(true)} className="neon-btn neon-btn-block text-xl py-6">
              💰 WITHDRAW MONEY
            </button>
          ) : (
            <form onSubmit={handleWithdraw} className="space-y-6">
              <section>
                <label className="neon-label">💵 How much money?</label>
                <input type="number" step="1" min="50" value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount (Rs 50 for first, Rs 500 after)"
                  className="neon-input text-lg text-center" required />
              </section>

              <section>
                <label className="neon-label">📱 How to receive money?</label>
                <select value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="neon-input text-lg">
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="bank">Bank Account</option>
                  <option value="paypal">PayPal</option>
                </select>
              </section>

              <section>
                <label className="neon-label">
                  {formData.payment_method === 'jazzcash' && '📞 JazzCash Details'}
                  {formData.payment_method === 'easypaisa' && '📞 EasyPaisa Details'}
                  {formData.payment_method === 'bank' && '🏦 Bank Account Details'}
                  {formData.payment_method === 'paypal' && '📧 PayPal Email'}
                </label>
                <input type="text" value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  placeholder="Account Holder Name" className="neon-input text-lg mb-3" required />
                <textarea value={formData.payment_details}
                  onChange={(e) => setFormData({ ...formData, payment_details: e.target.value })}
                  placeholder={
                    formData.payment_method === 'jazzcash' ? 'JazzCash Number (03xxxxxxxxx)' :
                    formData.payment_method === 'easypaisa' ? 'EasyPaisa Number (03xxxxxxxxx)' :
                    formData.payment_method === 'bank' ? 'Bank name and account number' :
                    'PayPal email address'
                  }
                  className="neon-input text-lg" rows="2" required />
              </section>

              <section className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setShowWithdrawForm(false)}
                  className="neon-btn-outline neon-btn py-4 text-lg">CANCEL</button>
                <button type="submit" className="neon-btn py-4 text-lg">SEND REQUEST</button>
              </section>
            </form>
          )}
        </section>

        {withdrawals.length > 0 && (
          <section className="neon-card p-6">
            <h2 className="text-xl font-bold text-white mb-4 text-center">📋 Your Money Requests</h2>
            <section className="space-y-3">
              {withdrawals.slice(0, 10).map((withdrawal) => (
                <section key={withdrawal.id} className="flex justify-between items-center p-4 rounded-xl border border-purple-500/20 bg-black/30">
                  <section>
                    <p className="font-bold text-lg text-white">Rs {(withdrawal.amount * 100).toFixed(0)}</p>
                    <p className="text-sm neon-subtitle capitalize">{withdrawal.payment_method}</p>
                    <p className="text-xs text-white/40">{new Date(withdrawal.created_at).toLocaleDateString()}</p>
                  </section>
                  <section className="text-right">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold block mb-1 ${
                      withdrawal.status === 'pending' ? 'neon-alert-warning' :
                      withdrawal.status === 'approved' ? 'neon-alert-success' :
                      'neon-alert-error'
                    }`}>
                      {withdrawal.status === 'pending' ? '⏳ Waiting' :
                       withdrawal.status === 'approved' ? '✅ Sent' : '❌ Rejected'}
                    </span>
                    {withdrawal.admin_note && (
                      <p className="text-xs text-white/40">{withdrawal.admin_note}</p>
                    )}
                  </section>
                </section>
              ))}
            </section>
          </section>
        )}
      </section>
    </section>
  );
};

export default Wallet;
