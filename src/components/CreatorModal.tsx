import { useState, useEffect } from 'react';
import { X, Lock, MessageCircle, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Creator } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Props {
  creator: Creator;
  onClose: () => void;
}

export default function CreatorModal({ creator, onClose }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  const cover =
    creator.cover_url ||
    creator.avatar_url ||
    'https://images.pexels.com/photos/3348748/pexels-photo-3348748.jpeg';

  const price = creator.subscription_price || 5;

  const snapcodeUrl = creator.snapcode_url || 'https://images.pexels.com/photos/6858618/pexels-photo-6858618.jpeg?auto=compress&cs=tinysrgb&w=400';

  useEffect(() => {
    async function checkSubscription() {
      if (!user) {
        setCheckingSubscription(false);
        return;
      }

      const { data } = await supabase
        .from('subscriptions')
        .select('is_active')
        .eq('fan_id', user.id)
        .eq('creator_id', creator.id)
        .maybeSingle();

      if (data?.is_active) {
        setIsUnlocked(true);
      }

      setCheckingSubscription(false);
    }

    checkSubscription();
  }, [user, creator.id]);

  useEffect(() => {
    if (searchParams.get('unlocked') === 'true') {
      setIsUnlocked(true);
    }
  }, [searchParams]);

  const handleUnlock = async () => {
    if (!user) {
      navigate(`/signup?next=${encodeURIComponent(`/creator/${creator.handle}`)}`);
      return;
    }

    if (!creator.is_stripe_connected) {
      alert('This creator has not set up payments yet. Please try again later.');
      return;
    }

    setUnlocking(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creatorId: creator.id }),
      });

      const json = await res.json();

      if (json.url) {
        window.location.href = json.url;
      } else {
        throw new Error(json.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      alert('Failed to start checkout. Please try again.');
      setUnlocking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2 z-10 shadow-lg"
        >
          <X className="w-5 h-5 text-slate-900" />
        </button>

        <div className="relative h-60">
          <img src={cover} alt={creator.display_name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />

          <div className="absolute bottom-3 left-4">
            <p className="text-xl text-white font-semibold">
              {creator.display_name || creator.name}
            </p>
            <p className="text-white/80 text-sm">{creator.handle}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {creator.profile_views ?? 0}
              </p>
              <p className="text-xs text-slate-500">Views</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {creator.subscribers ?? 0}
              </p>
              <p className="text-xs text-slate-500">Fans</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {creator.posts ?? 0}
              </p>
              <p className="text-xs text-slate-500">Posts</p>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {creator.bio || 'This creator has not added a bio yet.'}
          </p>

          {creator.category && (
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-2 py-1 bg-blue-600/10 text-blue-600 rounded-full">
                {creator.category}
              </span>
            </div>
          )}

          <div className="relative bg-slate-50 rounded-2xl p-4 flex items-center justify-center">
            <img
              src={snapcodeUrl}
              alt="Snapcode"
              className={`w-32 h-32 object-contain transition-all duration-300 ${
                isUnlocked ? '' : 'blur-xl'
              }`}
            />
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>

          {checkingSubscription ? (
            <div className="w-full flex items-center justify-center py-3">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : !isUnlocked ? (
            <button
              onClick={handleUnlock}
              disabled={unlocking}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-full shadow-md hover:brightness-105 transition-all font-semibold disabled:opacity-60"
            >
              {unlocking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Unlock all content — ${price.toFixed(2)}/month
                </>
              )}
            </button>
          ) : (
            <button className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-full shadow-md font-semibold">
              <MessageCircle className="w-4 h-4" />
              Message on Snapchat
            </button>
          )}

          {isUnlocked && (
            <p className="text-xs text-center text-slate-500">
              Scan the Snapcode above to add {creator.display_name || creator.name} on Snapchat
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
