import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { readCache } from '../api/axios';
import { NavIcon } from '../components/NavIcons';

const rupees = (units) => {
  const value = Number(units || 0) * 100;
  return `Rs ${value.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Wallet = () => {
  const [wallet, setWallet] = useState(readCache('/wallet/'));
  const [withdrawals, setWithdrawals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'jazzcash',
    account_name: '',
    payment_details: '',
  });
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoadError(false);
    try {
      const [walletRes, withdrawalsRes, txRes] = await Promise.allSettled([
        api.get('/wallet/'),
        api.get('/wallet/withdrawals/'),
        api.get('/wallet/transactions/'),
      ]);
      if (walletRes.status === 'fulfilled') setWallet(walletRes.value.data);
      if (withdrawalsRes.status === 'fulfilled') setWithdrawals(withdrawalsRes.value.data || []);
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data || []);
      if (walletRes.status !== 'fulfilled') setLoadError(true);
    } catch {
      setLoadError(true);
    }
  };

  const handleWithdraw = async (event) => {
    event.preventDefault();
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
      setMessage('Withdrawal request is pending.');
      setShowWithdrawForm(false);
      setFormData({ amount: '', payment_method: 'jazzcash', account_name: '', payment_details: '' });
      fetchData();
    } catch (error) {
      if (error.response?.data?.error === 'package_required') {
        setMessage('Buy a package before you withdraw.');
      } else {
        setMessage(error.response?.data?.error || 'Request failed');
      }
    }
  };

  const summary = useMemo(() => {
    const totals = { ads: 0, tasks: 0, level: 0, referral: 0 };
    transactions.forEach((row) => {
      const amount = Number(row.amount || 0);
      if (amount <= 0) return;
      const text = `${row.description || ''} ${row.transaction_type || ''}`.toLowerCase();
      if (row.transaction_type === 'task' && /ad|watch/.test(text)) totals.ads += amount;
      else if (row.transaction_type === 'task') totals.tasks += amount;
      else if (row.transaction_type === 'bonus' && text.includes('level')) totals.level += amount;
      else if (row.transaction_type === 'referral' || row.transaction_type === 'commission') totals.referral += amount;
      else if (row.transaction_type === 'bonus') totals.level += amount;
    });
    return totals;
  }, [transactions]);

  const pendingUnits = withdrawals.filter((row) => row.status === 'pending').reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const rejectedUnits = withdrawals.filter((row) => row.status === 'rejected').reduce((sum, row) => sum + Number(row.amount || 0), 0);

  if (!wallet) {
    return (
      <section className="lux-page">
        <div className="lux-empty">
          {loadError ? (
            <>
              <p>Wallet load nahi hui</p>
              <button type="button" onClick={fetchData} className="lux-withdraw">Retry</button>
            </>
          ) : <p>Loading...</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="lux-page">
      <div className="lux-wrap">
        <header className="lux-page-head">
          <span className="lux-balance-icon"><NavIcon name="wallet" size={22} /></span>
          <div>
            <h1>My Wallet</h1>
            <p>Manage your balance and earnings</p>
          </div>
        </header>

        {message && <p className="lux-status">{message}</p>}

        <article className="lux-wallet-hero">
          <p className="lux-kicker">Current Balance</p>
          <p className="lux-wallet-amount">{rupees(wallet.main_balance)}</p>
        </article>

        <section className="lux-wallet-actions">
          <button type="button" onClick={() => setShowWithdrawForm(true)}>
            <NavIcon name="withdraw" size={16} /> Withdraw
          </button>
          <Link to="/package">
            <NavIcon name="package" size={16} /> Deposit
          </Link>
        </section>

        {showWithdrawForm && (
          <form onSubmit={handleWithdraw} className="lux-link-card lux-withdraw-form">
            <p className="lux-progress-title">Withdraw</p>
            <p className="lux-level-caption">
              Minimum Rs {(
                Number(wallet.is_first_withdrawal ? wallet.minimum_withdrawal_first : wallet.minimum_withdrawal) * 100
              ).toFixed(0)}
            </p>
            <input type="number" min="1" value={formData.amount} onChange={(event) => setFormData({ ...formData, amount: event.target.value })} placeholder="Amount in Rs" className="lux-input" required />
            <select value={formData.payment_method} onChange={(event) => setFormData({ ...formData, payment_method: event.target.value })} className="lux-input">
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">EasyPaisa</option>
              <option value="bank">Bank Account</option>
              <option value="paypal">PayPal</option>
            </select>
            <input value={formData.account_name} onChange={(event) => setFormData({ ...formData, account_name: event.target.value })} placeholder="Account holder name" className="lux-input" required />
            <textarea value={formData.payment_details} onChange={(event) => setFormData({ ...formData, payment_details: event.target.value })} placeholder="Account number" className="lux-input" rows="2" required />
            <div className="lux-wallet-actions">
              <button type="button" onClick={() => setShowWithdrawForm(false)}>Cancel</button>
              <button type="submit">Send request</button>
            </div>
          </form>
        )}

        <section className="lux-wallet-split">
          <Link to="#withdraw-history" className="lux-mini-card">
            <span>Pending Withdrawal</span>
            <strong>{rupees(pendingUnits)}</strong>
          </Link>
          <Link to="#withdraw-history" className="lux-mini-card">
            <span>Rejected</span>
            <strong>{rupees(rejectedUnits)}</strong>
          </Link>
        </section>

        <article className="lux-summary-card">
          <header>
            <h2>Earning Summary</h2>
            <Link to="/transactions">View Details</Link>
          </header>
          <div>
            <p><strong>{rupees(summary.ads)}</strong><span>Ads Watching</span></p>
            <p><strong>{rupees(summary.tasks)}</strong><span>Task Rewards</span></p>
            <p><strong>{rupees(summary.level)}</strong><span>Level Bonus</span></p>
            <p><strong>{rupees(summary.referral)}</strong><span>Referral Income</span></p>
          </div>
        </article>

        <article className="lux-wallet-hero">
          <p className="lux-kicker">Total Approved Withdrawals</p>
          <p className="lux-wallet-amount">{rupees(wallet.total_withdrawn)}</p>
        </article>

        <section className="lux-shortcuts">
          <Link to="/package" className="lux-shortcut"><NavIcon name="package" size={20} /><span>Deposit</span></Link>
          <button type="button" className="lux-shortcut" onClick={() => setShowWithdrawForm(true)}><NavIcon name="withdraw" size={20} /><span>Withdraw</span></button>
          <Link to="/transactions" className="lux-shortcut"><NavIcon name="history" size={20} /><span>History</span></Link>
          <a href="#withdraw-history" className="lux-shortcut"><NavIcon name="terms" size={20} /><span>W. History</span></a>
        </section>

        <article id="withdraw-history" className="lux-member-card">
          <header>
            <div>
              <h2>Withdrawal History</h2>
              <p>Your money requests</p>
            </div>
          </header>
          {withdrawals.length === 0 && <p className="lux-member-empty">No withdrawal requests yet.</p>}
          {withdrawals.slice(0, 12).map((row) => (
            <div key={row.id} className="lux-member">
              <span className="lux-member-avatar">W</span>
              <div>
                <strong>{rupees(row.amount)}</strong>
                <p>{row.payment_method} · {new Date(row.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`lux-member-status ${row.status === 'approved' ? 'is-active' : row.status === 'pending' ? 'is-pending' : ''}`}>
                {row.status}
              </span>
            </div>
          ))}
        </article>
      </div>
    </section>
  );
};

export default Wallet;
