import { Link } from 'react-router-dom';
import {
  Share2,
  Settings,
  Plus,
  ExternalLink,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import type { Creator } from '../../types/database';

interface TikTokProfileHeaderProps {
  creator: Creator;
  isOwnProfile: boolean;
  isSubscribed: boolean;
  subscriberCount: number;
  viewsCount: number;
  likesCount: number;
  postsCount: number;
  priceDollars: string;
  onSubscribe: () => void;
  onShare: () => void;
  onUpload: () => void;
  checkingSubscription: boolean;
}

export function TikTokProfileHeader({
  creator,
  isOwnProfile,
  isSubscribed,
  subscriberCount,
  viewsCount,
  likesCount,
  postsCount,
  priceDollars,
  onSubscribe,
  onShare,
  onUpload,
  checkingSubscription,
}: TikTokProfileHeaderProps) {
  const displayName = (creator as any).display_name || (creator as any).name || 'Creator';
  const handle = (creator as any).handle || '';
  const bio = (creator as any).bio || '';
  const avatarUrl = creator.avatar_url;
  const category = creator.category;
  const websiteUrl = (creator as any).website_url;

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="bg-neutral-950 pt-4 pb-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Top Actions Row */}
        <div className="flex items-center justify-between mb-6">
          {isOwnProfile ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium hover:bg-white/10 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Creator Studio
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onShare}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              aria-label="Share profile"
            >
              <Share2 className="w-4 h-4 text-white/70" />
            </button>
            {isOwnProfile && (
              <Link
                to="/account/settings"
                className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4 text-white/70" />
              </Link>
            )}
          </div>
        </div>

        {/* Avatar with Story Ring */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500">
              <div className="w-full h-full rounded-full bg-neutral-950 p-[2px]">
                <div className="w-full h-full rounded-full overflow-hidden bg-neutral-800">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/40">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Profile Button Overlay (Own Profile) */}
            {isOwnProfile && (
              <Link
                to="/account/settings"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-lg border-2 border-neutral-950 hover:scale-110 transition-transform"
              >
                <Plus className="w-4 h-4 text-white" />
              </Link>
            )}
          </div>

          {/* Username */}
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white">{displayName}</h1>
          </div>

          {/* Handle */}
          <p className="text-sm text-white/50 mb-4">{handle}</p>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-8 mb-5">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{formatNumber(subscriberCount)}</p>
              <p className="text-xs text-white/50">Subscribers</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{formatNumber(viewsCount)}</p>
              <p className="text-xs text-white/50">Views</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{formatNumber(likesCount)}</p>
              <p className="text-xs text-white/50">Likes</p>
            </div>
          </div>

          {/* Subscribe/Subscribed Button (Fan View) */}
          {!isOwnProfile && (
            <div className="w-full max-w-xs mb-4">
              {isSubscribed ? (
                <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/80 font-medium">Subscribed</span>
                </div>
              ) : (
                <button
                  onClick={onSubscribe}
                  disabled={checkingSubscription}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25"
                >
                  Subscribe · ${priceDollars}/mo
                </button>
              )}
            </div>
          )}

          {/* Upload Button (Own Profile) */}
          {isOwnProfile && (
            <button
              onClick={onUpload}
              className="w-full max-w-xs px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:brightness-110 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 mb-4"
            >
              <Plus className="w-5 h-5" />
              Upload Content
            </button>
          )}

          {/* Bio */}
          {bio ? (
            <p className="text-sm text-white/70 text-center max-w-sm leading-relaxed mb-3">
              {bio}
            </p>
          ) : isOwnProfile ? (
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors mb-3">
              <Plus className="w-4 h-4" />
              Add bio
            </button>
          ) : null}

          {/* Category Tag */}
          {category && (
            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium mb-3">
              {category}
            </span>
          )}

          {/* Website Link */}
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white/80 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {websiteUrl.replace(/^https?:\/\//, '').split('/')[0]}
            </a>
          )}

          {/* Quick Actions (Own Profile) */}
          {isOwnProfile && (
            <div className="flex items-center gap-3 mt-4">
              <Link
                to="/dashboard/monetization"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/30 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Monetization
              </Link>
              <Link
                to="/dashboard/analytics"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium hover:bg-blue-500/30 transition-colors"
              >
                Analytics
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
