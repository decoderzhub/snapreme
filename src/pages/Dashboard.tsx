import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUserProfile } from '../lib/profileHelpers';
import type { Creator } from '../types/database';
import { Sparkles, Edit3, Trophy, TrendingUp, Star, Crown, Users, Eye, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

function calculateTierFromFollowers(followers: number): 'Rising' | 'Pro' | 'Elite' {
  if (followers >= 1000000) return 'Elite';
  if (followers >= 100000) return 'Pro';
  return 'Rising';
}

function getTierInfo(tier: 'Rising' | 'Pro' | 'Elite') {
  const tiers = {
    Rising: {
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-500'
    },
    Pro: {
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-cyan-500'
    },
    Elite: {
      icon: Crown,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-orange-500'
    },
  };
  return tiers[tier];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    subscribers: 0,
    cardViews: 0,
    favorites: 0,
  });

  useEffect(() => {
    async function load() {
      const { profile } = await getCurrentUserProfile();
      setProfile(profile);

      if (profile) {
        // Get subscriber count
        const { count: subscriberCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', profile.id)
          .eq('is_active', true);

        // Get favorites count
        const { count: favoritesCount } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', profile.id);

        setStats({
          subscribers: subscriberCount || 0,
          cardViews: profile.profile_views || 0,
          favorites: favoritesCount || 0,
        });
      }

      setLoading(false);
    }
    load();
  }, []);

  const handleSlug =
    (profile?.handle || '')
      .replace(/^@/, '')
      .trim() || 'your-handle';

  const currentTier = calculateTierFromFollowers(profile?.followers || 0);
  const tierInfo = getTierInfo(currentTier);
  const TierIcon = tierInfo.icon;

  const tiers = [
    { name: 'Rising', min: 0, max: 99999, icon: TrendingUp },
    { name: 'Pro', min: 100000, max: 999999, icon: Star },
    { name: 'Elite', min: 1000000, max: null, icon: Crown },
  ];

  const currentFollowers = profile?.followers || 0;
  const nextTier = tiers.find(t => currentFollowers < t.min);
  const followersNeeded = nextTier ? nextTier.min - currentFollowers : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-[0.2em] mb-2">
            Creator dashboard
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Welcome{profile?.display_name ? `, ${profile.display_name}` : user?.email ? `, ${user.email}` : ''}.
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            This is your home base for Snapreme. Complete your SnapremeCard, set your price, and start sharing
            premium content with your fans.
          </p>
        </header>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 animate-pulse">
            <div className="h-6 w-1/3 bg-slate-200 rounded mb-4" />
            <div className="h-4 w-2/3 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-1/2 bg-slate-200 rounded" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`bg-gradient-to-br ${tierInfo.gradientFrom} ${tierInfo.gradientTo} rounded-2xl shadow-lg p-6 text-white`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TierIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Your Creator Tier</p>
                  <h2 className="text-2xl font-bold">{currentTier}</h2>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-90">Current Fans</span>
                  <span className="font-bold">{currentFollowers.toLocaleString()}</span>
                </div>

                {nextTier && (
                  <>
                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-white h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((currentFollowers / nextTier.min) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="opacity-75">{followersNeeded.toLocaleString()} more fans to {nextTier.name}</span>
                      <span className="font-semibold">{nextTier.min.toLocaleString()}</span>
                    </div>
                  </>
                )}

                {currentTier === 'Elite' && (
                  <p className="text-sm opacity-90">🎉 You've reached the highest tier!</p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {tiers.map((tier) => {
                  const TierItemIcon = tier.icon;
                  const isCurrentTier = tier.name === currentTier;
                  const isPastTier = currentFollowers >= tier.min;
                  return (
                    <div
                      key={tier.name}
                      className={`rounded-lg p-3 text-center transition-all ${
                        isCurrentTier
                          ? 'bg-white/30 backdrop-blur-sm ring-2 ring-white/50'
                          : isPastTier
                          ? 'bg-white/10 backdrop-blur-sm'
                          : 'bg-white/5 opacity-60'
                      }`}
                    >
                      <TierItemIcon className={`w-5 h-5 mx-auto mb-1 ${
                        isCurrentTier ? 'text-white' : 'text-white/70'
                      }`} />
                      <p className="text-xs font-semibold mb-0.5">{tier.name}</p>
                      <p className="text-[10px] opacity-75">
                        {tier.min.toLocaleString()}+ {tier.max ? `- ${tier.max.toLocaleString()}` : 'fans'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Complete your SnapremeCard</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Add a display name, handle, bio, cover image, and your main categories so fans know what to expect.
                  </p>
                </div>
              </div>

              <Link
                to="/account/settings"
                className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit SnapremeCard
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Your public profile link</h2>
                <p className="text-sm text-slate-600 mt-1">
                  This is what you'll share in your bio, stories, or DMs so fans can subscribe to your premium content.
                </p>
                <p className="text-xs text-slate-500 mt-3">
                  <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                    /creator/{handleSlug}
                  </span>
                </p>
              </div>

            </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">Audience Stats</h2>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Track your growth and engagement across the platform.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 border border-slate-100 rounded-xl bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Subscribers</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats.subscribers.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Active fans</p>
                </div>

                <div className="p-5 border border-slate-100 rounded-xl bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Card Views</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats.cardViews.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Total impressions</p>
                </div>

                <div className="p-5 border border-slate-100 rounded-xl bg-gradient-to-br from-pink-50 to-white hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-pink-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Favorites</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats.favorites.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Users favorited you</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
