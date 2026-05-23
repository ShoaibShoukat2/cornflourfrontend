import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '' });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/auth/change-password/', passwordData);
      setMessage('✅ Password changed successfully!');
      setPasswordData({ old_password: '', new_password: '' });
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to change password');
    }
  };

  const EyeIcon = ({ show }) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {show ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      )}
    </svg>
  );

  return (
    <section className="py-6">
      <section className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold neon-title mb-2">⚙️ SETTINGS</h1>
          <p className="text-lg neon-subtitle">Your Account • Profile Settings</p>
        </header>

        {message && (
          <section className={`neon-alert mb-6 text-lg ${message.includes('✅') ? 'neon-alert-success' : 'neon-alert-error'}`}>
            {message}
          </section>
        )}

        <section className="neon-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">👤 YOUR PROFILE</h2>
          <section className="space-y-4">
            {[
              { label: 'Username', value: user?.username },
              { label: 'Email', value: user?.email },
              { label: 'Level', value: `Level ${user?.level}`, highlight: true },
              { label: 'Points', value: `${user?.points} points`, highlight: true },
            ].map((row) => (
              <section key={row.label} className="rounded-xl p-4 flex justify-between items-center border border-purple-500/20 bg-black/30">
                <span className="neon-subtitle font-semibold">{row.label}:</span>
                <span className={`font-bold text-lg ${row.highlight ? 'neon-gradient-text' : 'text-white'}`}>{row.value}</span>
              </section>
            ))}
          </section>
        </section>

        <section className="neon-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">🔒 CHANGE PASSWORD</h2>
          <form onSubmit={handleChangePassword} className="space-y-6">
            {[
              { key: 'old_password', label: 'Current Password', show: showOldPassword, toggle: () => setShowOldPassword(!showOldPassword), placeholder: 'Enter your current password' },
              { key: 'new_password', label: 'New Password', show: showNewPassword, toggle: () => setShowNewPassword(!showNewPassword), placeholder: 'Enter your new password' },
            ].map((field) => (
              <section key={field.key}>
                <label className="neon-label text-lg">{field.label}</label>
                <section className="relative">
                  <input
                    type={field.show ? 'text' : 'password'}
                    value={passwordData[field.key]}
                    onChange={(e) => setPasswordData({ ...passwordData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="neon-input text-lg pr-12"
                    required
                  />
                  <button type="button" onClick={field.toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    <EyeIcon show={field.show} />
                  </button>
                </section>
              </section>
            ))}
            <button type="submit" className="neon-btn neon-btn-block text-lg py-4">🔒 CHANGE PASSWORD</button>
          </form>
        </section>

        <section className="neon-card p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">📊 ACCOUNT INFO</h2>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="neon-stat p-6">
              <span className="text-3xl block mb-2">📅</span>
              <p className="neon-subtitle font-semibold mb-1">Member Since</p>
              <p className="text-xl font-bold neon-gradient-text">{new Date(user?.created_at).toLocaleDateString()}</p>
            </section>
            <section className="neon-stat p-6">
              <span className="text-3xl block mb-2">🔗</span>
              <p className="neon-subtitle font-semibold mb-1">Referral Code</p>
              <p className="text-xl font-bold neon-gradient-text">{user?.referral_code}</p>
            </section>
          </section>
        </section>
      </section>
    </section>
  );
};

export default Settings;
