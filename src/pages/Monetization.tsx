import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CreditCard, ExternalLink, DollarSign, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Monetization() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState(5);
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [savingPrice, setSavingPrice] = useState(false);
  const [subscribers, setSubscribers] = useState(0);
  const [creatorId, setCreatorId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('creators')
        .select('id, subscription_price, is_stripe_connected, subscribers')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setCreatorId(data.id);
        setPrice(data.subscription_price ?? 5);
        setIsConnected(!!data.is_stripe_connected);
        setSubscribers(data.subscribers ?? 0);
      }
      setLoading(false);
    }

    load();
  }, [user]);

  useEffect(() => {
    if (searchParams.get('connected') === 'true' && creatorId && !isConnected) {
      supabase
        .from('creators')
        .update({ is_stripe_connected: true })
        .eq('id', creatorId)
        .then(() => {
          setIsConnected(true);
        });
    }
  }, [searchParams, creatorId, isConnected]);

  const handleConnectStripe = async () => {
    if (!user) return;
    setConnecting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-onboarding`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        throw new Error(json.error || 'Failed to create onboarding link');
      }
    } catch (err) {
      console.error('Error connecting Stripe:', err);
      alert('Failed to connect Stripe. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const handleSavePrice = async () => {
    if (!user || !creatorId) return;
    setSavingPrice(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      // Call edge function to create/update product on connected account
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-creator-product`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price }),
      });

      const json = await res.json();

      if (json.success) {
        alert('Price updated successfully! Product created in your Stripe account.');
      } else {
        throw new Error(json.error || 'Failed to update price');
      }
    } catch (err) {
      console.error('Error updating price:', err);
      alert(err.message || 'Failed to update price. Please try again.');
    } finally {
      setSavingPrice(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const estimatedMonthly = subscribers * price * 0.9;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-[0.2em] mb-2">
            Monetization
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
            Get paid for your Snapreme content
          </h1>
          <p className="text-sm text-slate-600">
            Connect Stripe, choose your monthly price, and start earning from fans who unlock your Snapchat QR.
          </p>
        </header>

        {isConnected && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-medium text-slate-500">Active Subscribers</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{subscribers}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <p className="text-xs font-medium text-slate-500">Monthly Revenue</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">${estimatedMonthly.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">After 10% platform fee</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-violet-600" />
                <p className="text-xs font-medium text-slate-500">Your Price</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">${price.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">per month</p>
            </div>
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-slate-900 mb-1">Stripe payouts</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Stripe handles your payouts, tax forms, and compliance. Snapreme takes a 10% platform fee. You receive 90% of all subscription revenue directly to your bank account.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Connection Status</p>
              {isConnected ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-semibold text-green-700">Connected</p>
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-900">Not connected</p>
              )}
            </div>
            <button
              onClick={handleConnectStripe}
              disabled={connecting || loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                         bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 transition-colors"
            >
              {isConnected ? (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Manage in Stripe
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  {connecting ? 'Connecting…' : 'Connect Stripe'}
                </>
              )}
            </button>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-slate-900 mb-1">Subscription price</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Fans will see this price when they tap "Unlock all content". You can change this anytime. Most creators charge between $4.99 and $19.99 per month.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <select
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              >
                <option value={4.99}>$4.99 / month</option>
                <option value={5}>$5.00 / month</option>
                <option value={9.99}>$9.99 / month</option>
                <option value={14.99}>$14.99 / month</option>
                <option value={19.99}>$19.99 / month</option>
                <option value={24.99}>$24.99 / month</option>
              </select>
              <button
                onClick={handleSavePrice}
                disabled={savingPrice || loading}
                className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold disabled:opacity-60 hover:bg-slate-800 transition-colors"
              >
                {savingPrice ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </section>

        {!isConnected && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-900 mb-1">Connect Stripe to start earning</h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Your profile is ready to go, but fans won't be able to unlock your content until you connect your Stripe account. This only takes a few minutes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
