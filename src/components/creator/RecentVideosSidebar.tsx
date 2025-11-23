import { Eye, Heart, Lock, FileText } from 'lucide-react';
import { InfoTooltip } from '../InfoTooltip';
import type { Post } from '../../types/database';

interface RecentVideosSidebarProps {
  posts: Post[];
  activePost: Post | null;
  onSelectPost: (post: Post) => void;
  isSubscribed: boolean;
  unlockedPostIds: Set<string>;
  isOwnProfile?: boolean;
}

export function RecentVideosSidebar({
  posts,
  activePost,
  onSelectPost,
  isSubscribed,
  unlockedPostIds,
  isOwnProfile = false,
}: RecentVideosSidebarProps) {
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const isPostUnlocked = (post: Post) => {
    return !post.is_locked || isSubscribed || unlockedPostIds.has(post.id);
  };

  if (posts.length === 0) {
    return (
      <div className="h-[85vh] rounded-2xl bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-neutral-950 backdrop-blur-lg p-6 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
            <FileText className="w-8 h-8 text-white/40" />
          </div>
          <p className="text-white/70 text-sm font-medium">No content yet</p>
          <p className="text-white/40 text-xs">Follow to get notified</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[85vh] overflow-y-auto rounded-2xl bg-neutral-950/70 backdrop-blur-lg p-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
      <h3 className="text-sm font-semibold text-white px-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span>Most recent videos</span>
          <InfoTooltip content="Your newest content appears here. Click any thumbnail to preview it in the center player. Fans see this chronological feed when they visit your profile." />
        </div>
        <span className="text-xs text-neutral-400 font-normal">{posts.length}</span>
      </h3>

      <div className="space-y-3">
        {posts.map((post) => {
          const isActive = activePost?.id === post.id;
          const isUnlocked = isPostUnlocked(post);

          return (
            <button
              key={post.id}
              onClick={() => onSelectPost(post)}
              className={`w-full rounded-xl overflow-hidden transition-all group ${
                isActive
                  ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20'
                  : 'hover:ring-2 hover:ring-white/30 hover:scale-[1.02]'
              }`}
            >
              <div className="relative aspect-[9/16] bg-neutral-900">
                {post.thumbnail_url ? (
                  <img
                    src={post.thumbnail_url}
                    alt={post.caption || 'Video thumbnail'}
                    className={`w-full h-full object-cover transition-all ${
                      !isUnlocked ? 'filter blur-md scale-105' : 'group-hover:scale-105'
                    }`}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
                )}

                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      {post.unlock_price_cents > 0 && (
                        <p className="text-xs text-white/80 font-medium">
                          ${(post.unlock_price_cents / 100).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatCount(post.view_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatCount(post.like_count)}
                      </span>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
