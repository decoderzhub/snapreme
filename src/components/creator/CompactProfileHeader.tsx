import { ArrowLeft, Users, Eye, FileText, Edit, Copy, CheckCircle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Creator } from '../../types/database';

interface CompactProfileHeaderProps {
  creator: Creator;
  isOwnProfile: boolean;
  isSubscribed: boolean;
  fansCount: number;
  viewsCount: number;
  postsCount: number;
  priceDollars: string;
  onBack: () => void;
  onCopyLink: () => void;
  copiedLink: boolean;
  onSubscribe: () => void;
  checkingSubscription: boolean;
}

export function CompactProfileHeader({
  creator,
  isOwnProfile,
  isSubscribed,
  fansCount,
  viewsCount,
  postsCount,
  priceDollars,
  onBack,
  onCopyLink,
  copiedLink,
  onSubscribe,
  checkingSubscription,
}: CompactProfileHeaderProps) {
  const displayName = (creator as any).display_name || (creator as any).name || 'Creator';
  const safeHandle = (creator as any).handle?.replace(/^@/, '') || '';
  const avatarUrl = creator.avatar_url;

  const formatCompact = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-b border-neutral-700/50 backdrop-blur-xl">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Back + Avatar + Info */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={onBack}
              className="flex-shrink-0 p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full ring-4 ring-purple-500/50 overflow-hidden bg-neutral-800">
                  {avatarUrl && (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white truncate">{displayName}</h1>
                <p className="text-sm text-neutral-400 truncate">{safeHandle}</p>
              </div>
            </div>
          </div>

          {/* Center: Stats */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">{formatCompact(fansCount)}</span>
              <span className="text-xs text-neutral-400">fans</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">{formatCompact(viewsCount)}</span>
              <span className="text-xs text-neutral-400">views</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-white">{postsCount}</span>
              <span className="text-xs text-neutral-400">posts</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isOwnProfile && !isSubscribed && (
              <button
                onClick={onSubscribe}
                disabled={checkingSubscription}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-purple-500/50 hover:brightness-110 transition-all disabled:opacity-50 text-sm"
              >
                Subscribe ${priceDollars}/mo
              </button>
            )}

            {!isOwnProfile && isSubscribed && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/50">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">Subscribed</span>
              </div>
            )}

            {isOwnProfile && (
              <Link
                to="/account/settings"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all shadow-lg text-sm"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit profile</span>
              </Link>
            )}

            {isOwnProfile && (
              <Link
                to="/dashboard/monetization"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-700 hover:bg-neutral-600 text-white font-semibold transition-all text-sm"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden lg:inline">Pricing</span>
              </Link>
            )}

            <button
              onClick={onCopyLink}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
              aria-label="Share profile"
            >
              {copiedLink ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Stats Row */}
        <div className="md:hidden flex items-center justify-center gap-6 mt-4 pt-4 border-t border-neutral-700/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Users className="w-3 h-3 text-purple-400" />
              <span className="text-sm font-bold text-white">{formatCompact(fansCount)}</span>
            </div>
            <span className="text-xs text-neutral-400">Fans</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Eye className="w-3 h-3 text-blue-400" />
              <span className="text-sm font-bold text-white">{formatCompact(viewsCount)}</span>
            </div>
            <span className="text-xs text-neutral-400">Views</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <FileText className="w-3 h-3 text-emerald-400" />
              <span className="text-sm font-bold text-white">{postsCount}</span>
            </div>
            <span className="text-xs text-neutral-400">Posts</span>
          </div>
        </div>
      </div>
    </header>
  );
}
