import { Heart, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function FanOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completing, setCompleting] = useState(false);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'username' | 'payment'>('username');

  useEffect(() => {
    async function checkPaymentSetup() {
      if (!user) return;

      const { data } = await supabase
        .from('fan_profiles')
        .select('payment_method_setup, stripe_customer_id, username')
        .eq('id', user.id)
        .maybeSingle();

      if (data?.username) {
        setStep('payment');
        setUsername(data.username);
      }

      if (data?.payment_method_setup || data?.stripe_customer_id) {
        setHasPaymentMethod(true);
      }
    }

    checkPaymentSetup();
  }, [user]);

  const handleFinishOnboarding = async () => {
    if (!user) return;
    setCompleting(true);

    try {
      await supabase
        .from('fan_profiles')
        .update({ onboarding_complete: true })
        .eq('id', user.id);

      navigate('/network');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const handleSkipPayment = async () => {
    if (!user) return;
    setCompleting(true);

    try {
      await supabase
        .from('fan_profiles')
        .update({ onboarding_complete: true })
        .eq('id', user.id);

      navigate('/network');
    } catch (err) {
      console.error('Error skipping payment:', err);
      alert('Failed to continue. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!user) return;
    setError('');

    const trimmedUsername = username.trim().toLowerCase().replace(/^@+/, '');

    if (!trimmedUsername) {
      setError('Username is required');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setCompleting(true);

    try {
      const { error: updateError } = await supabase
        .from('fan_profiles')
        .update({ username: trimmedUsername })
        .eq('id', user.id);

      if (updateError) {
        if (updateError.code === '23505') {
          setError('Username already taken. Please choose another.');
        } else {
          setError(updateError.message);
        }
        setCompleting(false);
        return;
      }

      setStep('payment');
    } catch (err) {
      console.error('Error saving username:', err);
      setError('Failed to save username. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  if (step === 'username') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50/60 to-transparent py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-pink-600 uppercase tracking-wide">Step 1 of 2</p>
                <h1 className="text-2xl font-bold text-slate-900">Choose your username</h1>
              </div>
            </div>

            <p className="text-slate-600 mb-6">
              Pick a unique username that represents you. You can use letters, numbers, and underscores.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-l-lg text-slate-700 font-medium">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500"
                  placeholder="username"
                  maxLength={30}
                  disabled={completing}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                3-30 characters. Letters, numbers, and underscores only.
              </p>
            </div>

            <button
              onClick={handleSaveUsername}
              disabled={completing || !username.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {completing ? 'Saving...' : 'Continue'}
              {!completing && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/60 to-transparent py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-pink-600 uppercase tracking-wide">Step 2 of 2</p>
              <h1 className="text-2xl font-bold text-slate-900">Welcome, @{username}!</h1>
            </div>
          </div>

          <p className="text-slate-600 mb-8">
            You're all set to discover amazing creators. Add a payment method now to unlock content instantly, or skip and add it later.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-green-50 border border-green-100">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 text-sm">Browse creators</p>
                <p className="text-sm text-green-700">Explore thousands of creators and find your favorites</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-green-50 border border-green-100">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 text-sm">Save favorites</p>
                <p className="text-sm text-green-700">Build your collection and get personalized recommendations</p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-4 rounded-2xl border ${hasPaymentMethod ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-200'}`}>
              {hasPaymentMethod ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CreditCard className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold text-sm ${hasPaymentMethod ? 'text-green-900' : 'text-slate-700'}`}>
                  {hasPaymentMethod ? 'Payment method added' : 'Add payment method (optional)'}
                </p>
                <p className={`text-sm ${hasPaymentMethod ? 'text-green-700' : 'text-slate-600'}`}>
                  {hasPaymentMethod
                    ? 'You can now subscribe to creators instantly'
                    : 'Subscribe to creators with one click. You can add this later in settings.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {!hasPaymentMethod ? (
              <>
                <button
                  onClick={() => navigate('/account/settings?tab=payment')}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-colors"
                >
                  <CreditCard className="w-5 h-5" />
                  Add payment method
                </button>
                <button
                  onClick={handleSkipPayment}
                  disabled={completing}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60"
                >
                  Skip for now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleFinishOnboarding}
                disabled={completing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-colors disabled:opacity-60"
              >
                {completing ? 'Finishing setup...' : 'Start exploring'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-6 text-center">
            You can always manage your payment methods in Account Settings
          </p>
        </div>
      </div>
    </div>
  );
}
