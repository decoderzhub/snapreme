import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Floating peak.boo icons animation
function FloatingIcons() {
  const [icons, setIcons] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    speed: number;
    swayOffset: number;
    swaySpeed: number;
  }>>([]);

  useEffect(() => {
    const initialIcons = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      opacity: 0.1 + Math.random() * 0.2,
      speed: 0.1 + Math.random() * 0.2,
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: 0.02 + Math.random() * 0.03,
    }));
    setIcons(initialIcons);

    const interval = setInterval(() => {
      setIcons(prev => prev.map(icon => {
        let newY = icon.y - icon.speed;
        let newOpacity = icon.opacity;

        if (newY < -10) {
          return {
            ...icon,
            y: 110,
            x: Math.random() * 100,
            opacity: 0.1 + Math.random() * 0.2,
            rotation: Math.random() * 360,
          };
        }

        if (newY < 20) {
          newOpacity = icon.opacity * 0.98;
        }

        return {
          ...icon,
          y: newY,
          x: icon.x + Math.sin(icon.y * icon.swaySpeed + icon.swayOffset) * 0.15,
          rotation: icon.rotation + icon.rotationSpeed,
          opacity: newOpacity,
        };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(icon => (
        <img
          key={icon.id}
          src="/assets/snapreme_icon.png"
          alt=""
          className="absolute w-6 h-6 object-contain"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            transform: `translate(-50%, -50%) rotate(${icon.rotation}deg)`,
            opacity: icon.opacity,
          }}
        />
      ))}
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/network');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating Icons */}
      <FloatingIcons />

      <div className="relative z-10 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/assets/snapreme_icon.png" alt="peak.boo" className="w-10 h-10 object-contain" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              peak.boo
            </h1>
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-4 border border-purple-500/30">
            <Sparkles className="w-4 h-4" />
            Welcome Back
          </div>

          <h2 className="text-2xl font-bold text-white">Sign in to your account</h2>
          <p className="text-slate-400 mt-2">Access your creator dashboard and content</p>
        </div>

        {/* Form Card */}
        <div className="relative">
          {/* Glow behind form */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-2xl" />

          <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${focusedField === 'email' ? 'ring-2 ring-purple-500/50' : ''}`}>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${focusedField === 'password' ? 'ring-2 ring-purple-500/50' : ''}`}>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all duration-300 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          By continuing, you agree to peak.boo's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
