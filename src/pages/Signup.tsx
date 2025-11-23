import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validatePassword, getPasswordStrengthIndicator } from '../lib/passwordValidation';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isValidatingPassword, setIsValidatingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 'weak' as const, score: 0, color: 'red' });
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(getPasswordStrengthIndicator(formData.password));
    }
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordErrors([]);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsValidatingPassword(true);
    const validation = await validatePassword(formData.password);
    setIsValidatingPassword(false);

    if (!validation.isValid) {
      setPasswordErrors(validation.errors);
      setError('Please fix the password issues below');
      return;
    }

    setLoading(true);

    const { error } = await signUp(formData.email, formData.password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-transparent flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent)]" />

      <div className="relative max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              peak.boo
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Create your peak.boo account</h2>
          <p className="text-slate-600 mt-2">One account. One peak.booCard. Start sharing premium story-style content with your fans.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.1)] p-8 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
                placeholder="••••••••"
              />
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">Password strength:</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength.color === 'red' ? 'text-red-600' :
                      passwordStrength.color === 'orange' ? 'text-orange-600' :
                      passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.strength.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        passwordStrength.color === 'red' ? 'bg-red-600' :
                        passwordStrength.color === 'orange' ? 'bg-orange-600' :
                        passwordStrength.color === 'yellow' ? 'bg-yellow-600' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${(passwordStrength.score / 8) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-2">
                Must be at least 8 characters with uppercase, lowercase, numbers, and special characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {passwordErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 mb-1">Password requirements not met:</p>
                    <ul className="text-xs text-red-700 space-y-1">
                      {passwordErrors.map((err, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="mt-1">•</span>
                          <span>{err}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isValidatingPassword}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isValidatingPassword ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Validating password...
                </>
              ) : loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          By continuing, you agree to peak.boo's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
