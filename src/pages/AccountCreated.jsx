import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AccountCreated = () => {
  const { user } = useContext(AuthContext);

  const rows = [
    { label: 'Name', value: user?.username },
    { label: 'Email', value: user?.email },
    { label: 'Phone', value: user?.phone || '—' },
    { label: 'Referral Code Used', value: user?.referred_by_code || 'None' },
    { label: 'Your Referral Code', value: user?.referral_code },
    { label: 'Account Status', value: 'Registered — plan not active yet' },
  ];

  return (
    <section className="flex items-center justify-center p-4 py-8">
      <section className="neon-card neon-card-glow p-1 w-full max-w-md">
        <section className="neon-card-inner p-8">
          <h1 className="text-2xl font-bold neon-gradient-text text-center mb-2">Account Created</h1>
          <p className="neon-subtitle text-sm text-center mb-6">
            Save these details. Choose a plan next. After payment, approval takes up to 5 hours.
          </p>
          <section className="space-y-3 mb-6">
            {rows.map((row) => (
              <section key={row.label} className="flex justify-between gap-3 text-sm border-b border-white/10 pb-2">
                <span className="text-white/50">{row.label}</span>
                <span className="text-white font-semibold text-right break-all">{row.value}</span>
              </section>
            ))}
          </section>
          <Link to="/package" className="neon-btn neon-btn-block py-3 font-semibold text-center">
            View Plans
          </Link>
          <Link to="/dashboard" className="block text-center text-sm text-white/50 mt-4">
            Go to dashboard
          </Link>
        </section>
      </section>
    </section>
  );
};

export default AccountCreated;
