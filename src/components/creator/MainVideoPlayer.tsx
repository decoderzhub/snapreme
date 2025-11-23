import { useState } from 'react';
import { Lock, Play, Pause, Heart, MessageCircle, DollarSign, MoreVertical } from 'lucide-react';
import { InfoTooltip } from '../InfoTooltip';
import { EmptyStateGuide } from './EmptyStateGuide';
import type { Post, Creator } from '../../types/database';

interface MainVideoPlayerProps {
  post: Post | null;
  creator: Creator;
  isSubscribed: boolean;
  isUnlocked: boolean;
  isOwnProfile?: boolean;
  onUnlock: (postId: string) => void;
  onLike?: (postId: string) => void;
  onTip?: (postId: string) => void;
}

export function MainVideoPlayer({
  post,
  creator,
  isSubscribed,
  isUnlocked,
  isOwnProfile = false,
  onUnlock,
  onLike,
  onTip,
}: MainVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTipPopover, setShowTipPopover] = useState(false);

  if (!post) {
    return (
      <div className="relative rounded-2xl overflow-hidden flex items-center justify-center h-[85vh]">
        <EmptyStateGuide isOwnProfile={isOwnProfile} />
      </div>
    );
  }

  const displayName = (creator as any).display_name || (creator as any).name || 'Creator';
  const avatarUrl = creator.avatar_url;
  const unlockPrice = post.unlock_price_cents / 100;

  const hashtags = post.caption?.match(/#[\w]+/g) || [];
  const captionText = post.caption?.replace(/#[\w]+/g, '').trim() || '';

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    if (onLike) onLike(post.id);
  };

  const handleTip = () => {
    setShowTipPopover(!showTipPopover);
    if (onTip) onTip(post.id);
  };

  return (
    <div className="relative rounded-2xl bg-black overflow-hidden flex items-center justify-center h-[85vh] shadow-2xl">
      {!isUnlocked ? (
        <>
          {post.thumbnail_url && (
            <img
              src={post.thumbnail_url}
              alt="Locked content"
              className="absolute inset-0 w-full h-full object-cover filter blur-2xl scale-110 opacity-40"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />

          <div className="relative z-10 text-center space-y-6 px-6 max-w-md">
            <div className="w-24 h-24 mx-auto rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Lock className="w-12 h-12 text-white" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Subscribe to unlock</h3>
              <p className="text-white/70 text-sm">
                Get access to exclusive content from {displayName}
              </p>
            </div>

            {post.unlock_price_cents > 0 ? (
              <button
                onClick={() => onUnlock(post.id)}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg shadow-xl hover:shadow-purple-500/50 hover:brightness-110 transition-all"
              >
                Unlock for ${unlockPrice.toFixed(2)}
              </button>
            ) : (
              <button
                onClick={() => onUnlock(post.id)}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg shadow-xl hover:shadow-purple-500/50 hover:brightness-110 transition-all"
              >
                Subscribe to unlock
              </button>
            )}

            <div className="pt-4">
              <p className="text-white/50 text-xs">
                {post.view_count.toLocaleString()} views • {post.like_count.toLocaleString()} likes
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          {post.post_type === 'video' && post.media_url ? (
            <video
              src={post.media_url}
              poster={post.thumbnail_url || undefined}
              className="w-full h-full object-contain"
              controls={false}
              loop
              playsInline
            />
          ) : post.media_url ? (
            <img
              src={post.media_url}
              alt={post.caption || 'Content'}
              className="w-full h-full object-contain"
            />
          ) : post.thumbnail_url ? (
            <img
              src={post.thumbnail_url}
              alt={post.caption || 'Content'}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
              <p className="text-white/40">No media available</p>
            </div>
          )}

          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all group"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" fill="white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              )}
            </div>
          </button>

          {/* Right Action Buttons */}
          <div className="absolute right-4 bottom-24 flex flex-col gap-4">
            <button
              onClick={handleLike}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all flex items-center justify-center group border border-white/20"
              aria-label="Like"
            >
              <Heart className="w-6 h-6 text-white group-hover:fill-red-500 group-hover:text-red-500 transition-all" />
            </button>
            <div className="text-center">
              <span className="text-xs text-white font-semibold">{post.like_count}</span>
            </div>

            <button
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all flex items-center justify-center border border-white/20"
              aria-label="Comments"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
            <div className="text-center">
              <span className="text-xs text-white font-semibold">{post.comment_count}</span>
            </div>

            <div className="relative">
              <button
                onClick={handleTip}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:brightness-110 transition-all flex items-center justify-center shadow-lg border border-white/20"
                aria-label="Send tip"
              >
                <DollarSign className="w-6 h-6 text-white" />
              </button>

              {showTipPopover && (
                <div className="absolute right-14 bottom-0 bg-neutral-900 rounded-xl shadow-2xl p-4 w-48 border border-white/10">
                  <p className="text-white text-xs font-semibold mb-3">Send a tip</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[5, 10, 25, 50].map((amount) => (
                      <button
                        key={amount}
                        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-purple-600 text-white text-sm font-semibold transition-all"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all flex items-center justify-center border border-white/20"
              aria-label="More options"
            >
              <MoreVertical className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Bottom Caption Area */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full ring-2 ring-purple-500/50 overflow-hidden flex-shrink-0">
                {avatarUrl && (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-sm mb-1">@{displayName}</p>
                {captionText && (
                  <p className="text-white/90 text-sm leading-relaxed line-clamp-3">{captionText}</p>
                )}
              </div>
            </div>

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.slice(0, 5).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs text-white border border-white/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
