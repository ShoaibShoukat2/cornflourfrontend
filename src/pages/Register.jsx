import { useState, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/tasklogo.jpeg';

const Register = () => {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', password2: '', phone: '', referral_code: refCode
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.username.trim()) return setError('Name is required');
    if (formData.username.length < 3) return setError('Name must be at least 3 characters long');
    if (!formData.email.trim()) return setError('Email is required');
    if (!formData.phone.trim()) return setError('Phone number is required');
    if (!formData.password) return setError('Password is required');
    if (formData.password !== formData.password2) return setError('Passwords do not match');

    try {
      await register(formData);
      navigate('/account-created');
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.username) setError(`Name: ${errorData.username[0]}`);
      else if (errorData?.email) setError(`Email: ${errorData.email[0]}`);
      else if (errorData?.phone) setError(`Phone: ${Array.isArray(errorData.phone) ? errorData.phone[0] : errorData.phone}`);
      else if (errorData?.referral_code) setError(`Referral code: ${errorData.referral_code[0]}`);
      else if (errorData?.password) setError(`Password: ${errorData.password[0]}`);
      else if (errorData?.error) setError(errorData.error);
      else setError('Registration failed. Please try again.');
    }
  };

  const PasswordField = ({ label, value, onChange, show, onToggle, placeholder }) => (
    <section>
      <label className="neon-label">{label}</label>
      <section className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange}
          placeholder={placeholder} className="neon-input pr-12" required />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {show ? (
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
  );

  return (
    <section className="flex items-center justify-center p-4 py-8">
      <section className="neon-card neon-card-glow p-1 w-full max-w-md animate-fadeIn">
        <section className="neon-card-inner p-8">
          <header className="text-center mb-6">
            <section className="neon-logo-ring w-20 h-20 mx-auto mb-4">
              <img src={logo} alt="INSTOVA" className="w-full h-full" />
            </section>
            <h1 className="text-2xl font-bold neon-gradient-text">INSTOVA</h1>
          </header>

          <h2 className="text-xl font-semibold text-center mb-6 text-white/90">Create Your Account</h2>
          {error && <section className="neon-alert neon-alert-error mb-4 text-sm">{error}</section>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <section>
              <label className="neon-label">Name</label>
              <input type="text" value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your name" className="neon-input" required />
            </section>
            <section>
              <label className="neon-label">Email</label>
              <input type="email" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email" className="neon-input" required />
            </section>
            <section>
              <label className="neon-label">Phone Number</label>
              <input type="tel" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number" className="neon-input" required />
            </section>
            <PasswordField label="Password" value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              show={showPassword} onToggle={() => setShowPassword(!showPassword)}
              placeholder="Create a password" />
            <PasswordField label="Confirm Password" value={formData.password2}
              onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
              show={showPassword2} onToggle={() => setShowPassword2(!showPassword2)}
              placeholder="Confirm your password" />
            <section>
              <label className="neon-label">Referral Code {refCode ? '' : <span className="text-white/40 font-normal">(optional)</span>}</label>
              <input type="text" value={formData.referral_code}
                onChange={(e) => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })}
                placeholder="Enter referral code" className="neon-input" readOnly={Boolean(refCode)} />
              {refCode && <p className="text-xs text-green-400 mt-1">Referral code from your invite link</p>}
            </section>
            <button type="submit" className="neon-btn neon-btn-block py-3 font-semibold mt-6">Create Account</button>
          </form>

          <p className="text-center mt-6 text-white/60 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="neon-gradient-text font-semibold hover:opacity-80">Sign In</Link>
          </p>
        </section>
      </section>
    </section>
  );
};

export default Register;
