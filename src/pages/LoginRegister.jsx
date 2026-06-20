import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Brain, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 💜');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-scale-in">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🧠</div>
            <h1 className="font-display font-bold text-2xl gradient-text mb-1">Welcome Back</h1>
            <p className="text-gray-500 text-sm">Sign in to continue your wellness journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Email</label>
              <input type="email" placeholder="your@email.com" className="input-field"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} placeholder="••••••••" className="input-field pr-10"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account? {' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">Create one free</Link>
          </p>

          <div className="mt-6 p-3 rounded-xl text-xs text-center text-rose-400" style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)' }}>
            In crisis? Call iCall: <strong>9152987821</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', university: '', department: '', yearOfStudy: 1 });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Welcome to MindBridge! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-scale-in">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🌱</div>
            <h1 className="font-display font-bold text-2xl gradient-text mb-1">Start Your Journey</h1>
            <p className="text-gray-500 text-sm">Free · Private · Secure · Made for students</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Full Name *</label>
                <input className="input-field" placeholder="Your name" {...f('name')} required />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Email *</label>
                <input type="email" className="input-field" placeholder="your@email.com" {...f('email')} required />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Password *</label>
              <input type="password" className="input-field" placeholder="Min. 6 characters" {...f('password')} required />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">University</label>
              <input className="input-field" placeholder="e.g. Parul University, VIT, IIT..." {...f('university')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Department</label>
                <input className="input-field" placeholder="e.g. CSE, MBA, MBBS" {...f('department')} />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Year of Study</label>
                <select className="input-field" value={form.yearOfStudy} onChange={e => setForm(p => ({ ...p, yearOfStudy: Number(e.target.value) }))}>
                  {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create My Account 🚀'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? {' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">Sign in</Link>
          </p>

          <p className="text-center text-xs text-gray-600 mt-4">
            By creating an account you agree that your data stays private and is never sold.
          </p>
        </div>
      </div>
    </div>
  );
}

// Default exports for routing
export default Login;
