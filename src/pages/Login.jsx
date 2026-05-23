import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/tasklogo.jpeg';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const prefill = localStorage.getItem('prefill_email');
    if (prefill) {
      setFormData(f => ({ ...f, email: prefill }));
      localStorage.removeItem('prefill_email');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(formData.email, formData.password);
      if (data.user.is_staff) navigate('/admin/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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

          <h2 className="text-xl font-semibold text-center mb-6 text-white/90">Login To Your Account</h2>

          {error && <section className="neon-alert neon-alert-error mb-4 text-sm">{error}</section>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <section>
              <label className="neon-label">Email</label>
              <input type="email" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email" className="neon-input" required />
            </section>

            <section>
              <label className="neon-label">Password</label>
              <section className="relative">
                <input type={showPassword ? 'text' : 'password'} value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password" className="neon-input pr-12" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
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

            <section className="flex items-center justify-between text-sm">
              <label className="flex items-center text-white/60">
                <input type="checkbox" className="mr-2 rounded accent-purple-500" />
                Remember me
              </label>
              <Link to="/forgot-password" className="neon-gradient-text font-medium hover:opacity-80">Forgot password?</Link>
            </section>

            <button type="submit" className="neon-btn neon-btn-block py-3 font-semibold">Sign In</button>
          </form>

          <p className="text-center mt-6 text-white/60 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="neon-gradient-text font-semibold hover:opacity-80">Create Account</Link>
          </p>
        </section>
      </section>
    </section>
  );
};

export default Login;
