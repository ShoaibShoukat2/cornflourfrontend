import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const [loadError, setLoadError] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoadError(false);
    try {
      const [walletRes, withdrawalsRes] = await Promise.allSettled([
        api.get('/wallet/'),
        api.get('/wallet/withdrawals/')
      ]);
      if (walletRes.status === 'fulfilled') setWallet(walletRes.value.data);
      if (withdrawalsRes.status === 'fulfilled') setWithdrawals(withdrawalsRes.value.data);
      if (walletRes.status !== 'fulfilled') setLoadError(true);
    } catch (error) {
      console.error(error);
      setLoadError(true);
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
      setMessage('✅ Withdrawal request is pending. The reference is in the list below.');
      setShowWithdrawForm(false);
      setFormData({ amount: '', payment_method: 'jazzcash', account_name: '', payment_details: '' });
      fetchData();
    } catch (error) {
      if (error.response?.data?.error === 'package_required') {
        setMessage('🔒 Buy the INSTOVA Plan to withdraw money');
      } else {
        setMessage(error.response?.data?.error || 'Request failed');
      }
    }
  };

  if (!wallet) return (
    <section className="neon-loading">
      {loadError ? (
        <div className="text-center space-y-3 px-4">
          <p className="neon-loading-text">Wallet load nahi hui</p>
          <button onClick={fetchData} className="neon-btn text-sm px-5 py-2">Retry</button>
        </div>
      ) : (
        <>
          <div className="neon-spinner" />
          <p className="neon-loading-text">Loading...</p>
        </>
      )}
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
          {[
            ['Total Earnings', wallet.total_earned],
            ['Withdrawable', wallet.withdrawable_balance ?? wallet.main_balance],
            ['Pending', wallet.pending_balance],
            ['Withdrawn', wallet.total_withdrawn],
            ['Bonus Balance', wallet.bonus_balance],
          ].map(([label, amount]) => (
            <section key={label} className="neon-card p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-1">{label}</h3>
              <p className="text-2xl font-bold neon-gradient-text">Rs {(Number(amount) * 100).toFixed(0)}</p>
            </section>
          ))}
        </section>

        <section className="neon-card p-6 mb-8">
          <header className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">💸 GET YOUR MONEY</h2>
            <p className="neon-subtitle">
              {wallet.is_first_withdrawal ? 'First' : 'Next'} minimum: Rs {(
                Number(wallet.is_first_withdrawal ? wallet.minimum_withdrawal_first : wallet.minimum_withdrawal) * 100
              ).toFixed(0)}
            </p>
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

        <Link to="/transactions" className="neon-btn neon-btn-block mb-6 text-center">Full transaction history</Link>

        {withdrawals.length > 0 && (
          <section className="neon-card p-6">
            <h2 className="text-xl font-bold text-white mb-4 text-center">📋 Your Money Requests</h2>
            <section className="space-y-3">
              {withdrawals.slice(0, 10).map((withdrawal) => (
                <section key={withdrawal.id} className="flex justify-between items-center p-4 rounded-xl border border-purple-500/20 bg-black/30">
                  <section>
                    <p className="font-bold text-lg text-white">Rs {(withdrawal.amount * 100).toFixed(0)}</p>
                    <p className="text-sm neon-subtitle capitalize">{withdrawal.payment_method}</p>
                    <p className="text-xs text-white/40">{withdrawal.reference || `WD${String(withdrawal.id).padStart(6, '0')}`} · {new Date(withdrawal.created_at).toLocaleString()}</p>
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
