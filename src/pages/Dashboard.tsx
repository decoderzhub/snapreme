import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUserProfile } from '../lib/profileHelpers';
import type { Creator } from '../types/database';
import {
  Sparkles,
  Edit3,
  Trophy,
  TrendingUp,
  Star,
  Crown,
  Users,
  Eye,
  Heart,
  DollarSign,
  MessageSquare,
  Lock,
  Upload,
  Settings,
  ExternalLink,
  Copy,
  CheckCircle,
  BarChart3,
  Zap,
  Package,
} from 'lucide-react';
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
      gradient: 'from-emerald-600 to-teal-600',
      bgGradient: 'from-emerald-900/40 to-teal-900/40',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
    },
    Pro: {
      icon: Star,
      gradient: 'from-blue-600 to-cyan-600',
      bgGradient: 'from-blue-900/40 to-cyan-900/40',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
    },
    Elite: {
      icon: Crown,
      gradient: 'from-amber-600 to-orange-600',
      bgGradient: 'from-amber-900/40 to-orange-900/40',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
    },
  };
  return tiers[tier];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [stats, setStats] = useState({
    subscribers: 0,
    cardViews: 0,
    favorites: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    ppmEarnings: 0,
    tipsEarnings: 0,
    unlockEarnings: 0,
    postsCount: 0,
    lockedPosts: 0,
    bundlesCount: 0,
    messagesReceived: 0,
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

        // Get posts count
        const { count: postsCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', profile.id);

        // Get locked posts count
        const { count: lockedPostsCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', profile.id)
          .eq('is_locked', true);

        // Get bundles count
        const { count: bundlesCount } = await supabase
          .from('content_packages')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', profile.id);

        // Get messages received (PPM threads)
        const { count: messagesCount } = await supabase
          .from('ppm_messages')
          .select('*', { count: 'exact', head: true })
          .eq('thread_id', profile.id);

        // TODO: Get actual earnings from payments table when available
        // For now using placeholder calculations
        const subEarnings = (subscriberCount || 0) * ((profile as any).subscription_price || 9.99);

        setStats({
          subscribers: subscriberCount || 0,
          cardViews: profile.profile_views || 0,
          favorites: favoritesCount || 0,
          totalEarnings: subEarnings,
          monthlyEarnings: subEarnings,
          ppmEarnings: 0,
          tipsEarnings: 0,
          unlockEarnings: 0,
          postsCount: postsCount || 0,
          lockedPosts: lockedPostsCount || 0,
          bundlesCount: bundlesCount || 0,
          messagesReceived: messagesCount || 0,
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/creator/${handleSlug}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currentTier = calculateTierFromFollowers(profile?.followers || 0);
  const tierInfo = getTierInfo(currentTier);
  const TierIcon = tierInfo.icon;

  const tiers = [
    { name: 'Rising', min: 0, max: 99999, icon: TrendingUp },
    { name: 'Pro', min: 100000, max: 999999, icon: Star },
    { name: 'Elite', min: 1000000, max: null, icon: Crown },
  ];

  const currentFollowers = profile?.followers || 0;
  const nextTier = tiers.find((t) => currentFollowers < t.min);
  const followersNeeded = nextTier ? nextTier.min - currentFollowers : 0;

  const formatMoney = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const quickActions = [
    {
      icon: Upload,
      label: 'Upload Content',
      href: `/creator/${handleSlug}`,
      gradient: 'from-purple-600 to-blue-600',
    },
    {
      icon: Package,
      label: 'Create Bundle',
      href: '/dashboard/bundles',
      gradient: 'from-emerald-600 to-teal-600',
    },
    {
      icon: Settings,
      label: 'Monetization',
      href: '/dashboard/monetization',
      gradient: 'from-amber-600 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30">
              <span className="text-xs font-medium text-purple-300 flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                Creator Studio
              </span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}.
          </h1>
          <p className="text-white/60 text-sm sm:text-base">
            Manage your content, track earnings, and grow your audience.
          </p>
        </header>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-6 animate-pulse">
                <div className="h-6 w-1/3 bg-white/10 rounded mb-4" />
                <div className="h-4 w-2/3 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${action.gradient} text-white text-sm font-semibold shadow-lg hover:brightness-110 transition-all`}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </Link>
              ))}
            </div>

            {/* Tier Card */}
            <div className={`relative overflow-hidden bg-gradient-to-br ${tierInfo.bgGradient} rounded-3xl border ${tierInfo.borderColor} p-6`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_50%)]" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tierInfo.gradient} flex items-center justify-center shadow-lg`}>
                      <TierIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Your Tier</p>
                      <h2 className="text-2xl font-bold text-white">{currentTier}</h2>
                    </div>
                  </div>
                  <Link
                    to="/dashboard/tiers"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Learn more →
                  </Link>
                </div>

                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-white/70">Current Subscribers</span>
                    <span className="text-lg font-bold text-white">{stats.subscribers.toLocaleString()}</span>
                  </div>

                  {nextTier && (
                    <>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-2">
                        <div
                          className={`bg-gradient-to-r ${tierInfo.gradient} h-full rounded-full transition-all duration-500`}
                          style={{
                            width: `${Math.min((currentFollowers / nextTier.min) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span>{followersNeeded.toLocaleString()} more to {nextTier.name}</span>
                        <span>{nextTier.min.toLocaleString()}</span>
                      </div>
                    </>
                  )}

                  {currentTier === 'Elite' && (
                    <p className="text-sm text-white/70 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      You've reached the highest tier!
                    </p>
                  )}
                </div>

                {/* Tier Progress */}
                <div className="grid grid-cols-3 gap-3">
                  {tiers.map((tier) => {
                    const TierItemIcon = tier.icon;
                    const isCurrentTier = tier.name === currentTier;
                    const isPastTier = currentFollowers >= tier.min;
                    return (
                      <div
                        key={tier.name}
                        className={`rounded-xl p-3 text-center transition-all ${
                          isCurrentTier
                            ? 'bg-white/20 ring-2 ring-white/30'
                            : isPastTier
                            ? 'bg-white/10'
                            : 'bg-white/5 opacity-50'
                        }`}
                      >
                        <TierItemIcon className={`w-5 h-5 mx-auto mb-1 ${isCurrentTier ? 'text-white' : 'text-white/60'}`} />
                        <p className="text-xs font-semibold text-white mb-0.5">{tier.name}</p>
                        <p className="text-[10px] text-white/50">
                          {tier.min.toLocaleString()}+ fans
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Earnings Overview */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-emerald-900/20 to-teal-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Earnings Overview</h3>
                      <p className="text-xs text-white/50">Track your revenue streams</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard/earnings"
                    className="text-sm text-emerald-400 font-medium hover:text-emerald-300"
                  >
                    View details →
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {/* Total Earnings */}
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60 mb-1">Total Earnings</p>
                      <p className="text-3xl font-bold text-white">{formatMoney(stats.totalEarnings)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/60 mb-1">This Month</p>
                      <p className="text-xl font-bold text-emerald-400">{formatMoney(stats.monthlyEarnings)}</p>
                    </div>
                  </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-white/60">Subscriptions</span>
                    </div>
                    <p className="text-xl font-bold text-white">{formatMoney(stats.monthlyEarnings)}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-white/60">PPM Messages</span>
                    </div>
                    <p className="text-xl font-bold text-white">{formatMoney(stats.ppmEarnings)}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-white/60">Content Unlocks</span>
                    </div>
                    <p className="text-xl font-bold text-white">{formatMoney(stats.unlockEarnings)}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <span className="text-xs text-white/60">Tips & Gifts</span>
                    </div>
                    <p className="text-xl font-bold text-white">{formatMoney(stats.tipsEarnings)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content & Audience Stats */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Content Stats */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
                <div className="px-6 py-5 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Content Stats</h3>
                      <p className="text-xs text-white/50">Your content overview</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-white/70">Total Posts</span>
                    </div>
                    <span className="text-xl font-bold text-white">{stats.postsCount}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="text-white/70">Premium Content</span>
                    </div>
                    <span className="text-xl font-bold text-white">{stats.lockedPosts}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Package className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-white/70">Content Bundles</span>
                    </div>
                    <span className="text-xl font-bold text-white">{stats.bundlesCount}</span>
                  </div>
                </div>
              </div>

              {/* Audience Stats */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
                <div className="px-6 py-5 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Audience Stats</h3>
                      <p className="text-xs text-white/50">Growth and engagement</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-white/70">Active Subscribers</span>
                    </div>
                    <span className="text-xl font-bold text-white">{stats.subscribers}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-green-400" />
                      </div>
                      <span className="text-white/70">Profile Views</span>
                    </div>
                    <span className="text-xl font-bold text-white">{stats.cardViews.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-pink-400" />
                      </div>
                      <span className="text-white/70">Favorites</span>
                    </div>
                    <span className="text-xl font-bold text-white">{stats.favorites}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Card & Link */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Edit3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Your Public Profile</h3>
                    <p className="text-sm text-white/60 mb-3">
                      Share this link in your bio, stories, or DMs to get more subscribers.
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="px-3 py-1.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white/80 font-mono">
                        peak.boo/creator/{handleSlug}
                      </code>
                      <button
                        onClick={handleCopyLink}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        {copiedLink ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-white/60" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/creator/${handleSlug}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Profile
                  </Link>
                  <Link
                    to="/account/settings"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-3xl border border-purple-500/30 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Pro Tips to Grow</h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      Post consistently to keep subscribers engaged and attract new ones.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      Create premium content bundles to increase your average revenue per fan.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      Respond to PPM messages quickly to build stronger fan relationships.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
