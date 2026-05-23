import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/tasklogo.jpeg';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await api.post('/auth/forgot-password/', { email });
      setMessage('✅ ' + response.data.message);
      setStep(2);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await api.post('/auth/reset-password/', { email, otp, new_password: newPassword });
      setMessage('✅ ' + response.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <section className="flex items-center justify-center p-4 min-h-[85vh]">
      <section className="neon-card neon-card-glow p-1 w-full max-w-md animate-fadeIn">
        <section className="neon-card-inner p-8">
          <header className="text-center mb-8">
            <section className="neon-logo-ring w-20 h-20 mx-auto mb-4">
              <img src={logo} alt="INSTOVA" className="w-full h-full" />
            </section>
            <h1 className="text-2xl font-bold neon-gradient-text">INSTOVA</h1>
          </header>

          <h2 className="text-xl font-semibold text-center mb-6 text-white/90">
            {step === 1 ? 'Reset Your Password' : 'Enter New Password'}
          </h2>

          {message && (
            <section className={`neon-alert mb-4 text-sm ${message.includes('✅') ? 'neon-alert-success' : 'neon-alert-error'}`}>
              {message}
            </section>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <p className="neon-subtitle text-sm mb-4">
                Enter your email address and we'll send you an OTP code to reset your password.
              </p>
              <section>
                <label className="neon-label">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" className="neon-input" required />
              </section>
              <button type="submit" className="neon-btn neon-btn-block py-3 font-semibold">Send OTP Code</button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <p className="neon-subtitle text-sm mb-4">
                Enter the OTP code sent to your email and your new password.
              </p>
              <section>
                <label className="neon-label">OTP Code</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP" className="neon-input" required maxLength="6" />
              </section>
              <section>
                <label className="neon-label">New Password</label>
                <section className="relative">
                  <input type={showNewPassword ? 'text' : 'password'} value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password" className="neon-input pr-12" required />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showNewPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
                </section>
              </section>
              <button type="submit" className="neon-btn neon-btn-block py-3 font-semibold">Reset Password</button>
              <button type="button" onClick={() => setStep(1)}
                className="neon-btn-outline neon-btn neon-btn-block py-3 font-semibold">Back</button>
            </form>
          )}

          <p className="text-center mt-6 text-white/60 text-sm">
            Remember your password?{' '}
            <Link to="/login" className="neon-gradient-text font-semibold hover:opacity-80">Sign In</Link>
          </p>
        </section>
      </section>
    </section>
  );
};

export default ForgotPassword;
