import { useState } from 'react';
import { Eye, Heart, Lock, Play, Sparkles, Package } from 'lucide-react';
import type { Post, ContentPackage, Creator } from '../../types/database';
import { getPostsWithWelcome } from './WelcomePosts';

interface MobileTeaserViewProps {
  posts: Post[];
  packages: ContentPackage[];
  creator: Creator;
  isSubscribed: boolean;
  isOwnProfile?: boolean;
  unlockedPostIds: Set<string>;
  onUnlockPost: (postId: string) => void;
  onViewPackage: (pkg: ContentPackage) => void;
}

export function MobileTeaserView({
  posts,
  packages,
  creator,
  isSubscribed,
  isOwnProfile = false,
  unlockedPostIds,
  onUnlockPost,
  onViewPackage,
}: MobileTeaserViewProps) {
  const displayPosts = isOwnProfile ? getPostsWithWelcome(posts) : posts;
  const [activePost, setActivePost] = useState<Post | null>(displayPosts[0] || null);

  const isPostUnlocked = (post: Post) => {
    return !post.is_locked || isSubscribed || unlockedPostIds.has(post.id);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const displayName = (creator as any).display_name || (creator as any).name || 'Creator';
  const avatarUrl = creator.avatar_url;

  const topPosts = [...displayPosts]
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 6);

  return (
    <div className="lg:hidden space-y-6">
      {/* Main Player First */}
      {activePost ? (
        <div className="relative rounded-2xl bg-black overflow-hidden h-[70vh] shadow-2xl">
          {!isPostUnlocked(activePost) ? (
            <>
              {activePost.thumbnail_url && (
                <img
                  src={activePost.thumbnail_url}
                  alt="Locked content"
                  className="absolute inset-0 w-full h-full object-cover filter blur-2xl scale-110 opacity-40"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
              <div className="relative z-10 h-full flex items-center justify-center text-center space-y-6 px-6">
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Subscribe to unlock</h3>
                    <p className="text-white/70 text-sm">
                      Get access to exclusive content from {displayName}
                    </p>
                  </div>
                  <button
                    onClick={() => onUnlockPost(activePost.id)}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-xl hover:brightness-110 transition-all"
                  >
                    {activePost.unlock_price_cents > 0
                      ? `Unlock for $${(activePost.unlock_price_cents / 100).toFixed(2)}`
                      : 'Subscribe to unlock'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {activePost.post_type === 'video' && activePost.media_url ? (
                <video
                  src={activePost.media_url}
                  poster={activePost.thumbnail_url || undefined}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                />
              ) : activePost.media_url ? (
                <img
                  src={activePost.media_url}
                  alt={activePost.caption || 'Content'}
                  className="w-full h-full object-contain"
                />
              ) : activePost.thumbnail_url ? (
                <img
                  src={activePost.thumbnail_url}
                  alt={activePost.caption || 'Content'}
                  className="w-full h-full object-contain"
                />
              ) : null}

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full ring-2 ring-purple-500/50 overflow-hidden flex-shrink-0">
                    {avatarUrl && (
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm mb-1">@{displayName}</p>
                    {activePost.caption && (
                      <p className="text-white/90 text-sm line-clamp-2">{activePost.caption}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-neutral-950 h-[70vh] flex items-center justify-center backdrop-blur-lg border border-white/5">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
              <Play className="w-8 h-8 text-white/40" />
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-1">No content yet</h3>
              <p className="text-white/60 text-sm">Follow to get notified</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Videos Grid */}
      {displayPosts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-neutral-900 px-1">Recent videos</h3>
          <div className="grid grid-cols-3 gap-2">
            {displayPosts.map((post) => {
              const isUnlocked = isPostUnlocked(post);
              const isActive = activePost?.id === post.id;

              return (
                <button
                  key={post.id}
                  onClick={() => setActivePost(post)}
                  className={`relative aspect-[9/16] rounded-lg overflow-hidden ${
                    isActive ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  {post.thumbnail_url ? (
                    <img
                      src={post.thumbnail_url}
                      alt={post.caption || 'Video'}
                      className={`w-full h-full object-cover ${!isUnlocked ? 'filter blur-sm' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900" />
                  )}

                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-between text-white text-[10px]">
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5" />
                        {formatCount(post.view_count)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Heart className="w-2.5 h-2.5" />
                        {formatCount(post.like_count)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Highlights */}
      {topPosts.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-neutral-900">Highlights</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {topPosts.map((post) => (
              <button
                key={post.id}
                onClick={() => setActivePost(post)}
                className="relative aspect-[9/16] rounded-lg overflow-hidden"
              >
                {post.thumbnail_url ? (
                  <img
                    src={post.thumbnail_url}
                    alt="Highlight"
                    className={`w-full h-full object-cover ${
                      !isPostUnlocked(post) ? 'filter blur-sm' : ''
                    }`}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900" />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                  <span className="text-white text-xs font-semibold">{formatCount(post.like_count)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Packages */}
      {packages.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-neutral-900">Bundles & Deals</h3>
          </div>
          <div className="space-y-3">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => onViewPackage(pkg)}
                className="w-full rounded-xl overflow-hidden bg-neutral-50 border border-neutral-200 hover:border-purple-300 transition-all text-left"
              >
                {pkg.cover_image_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={pkg.cover_image_url}
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-neutral-900 line-clamp-1">
                      {pkg.title}
                    </h4>
                    <span className="text-sm font-bold text-purple-600 flex-shrink-0">
                      ${(pkg.price_cents / 100).toFixed(2)}
                    </span>
                  </div>
                  {pkg.description && (
                    <p className="text-xs text-neutral-600 line-clamp-2">{pkg.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
