import { useState } from 'react';
import { Play, Lock, Eye, DollarSign, Plus, Image as ImageIcon, Sparkles } from 'lucide-react';
import type { Post, ContentPackage } from '../../types/database';
import { ContentTab } from './ContentTabNavigation';

interface TikTokContentGridProps {
  posts: Post[];
  packages: ContentPackage[];
  activeTab: ContentTab;
  isOwnProfile: boolean;
  isSubscribed: boolean;
  unlockedPostIds: Set<string>;
  onPostClick: (post: Post) => void;
  onPackageClick: (pkg: ContentPackage) => void;
  onUpload: () => void;
  onUnlockPost: (postId: string) => void;
}

export function TikTokContentGrid({
  posts,
  packages,
  activeTab,
  isOwnProfile,
  isSubscribed,
  unlockedPostIds,
  onPostClick,
  onPackageClick,
  onUpload,
  onUnlockPost,
}: TikTokContentGridProps) {
  const isPostUnlocked = (post: Post) => {
    return !post.is_locked || isSubscribed || unlockedPostIds.has(post.id);
  };

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  // Filter posts based on active tab
  const filteredPosts = posts.filter((post) => {
    switch (activeTab) {
      case 'locked':
        return post.is_locked;
      case 'favorites':
        return false; // Would need favorites data
      default:
        return true;
    }
  });

  // Empty State Component
  const EmptyState = ({ tab }: { tab: ContentTab }) => {
    if (isOwnProfile && tab === 'all' && posts.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-dashed border-white/20">
            <ImageIcon className="w-10 h-10 text-white/30" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Share your first content</h3>
          <p className="text-white/50 text-sm text-center max-w-xs mb-6">
            Upload photos and videos to start building your fanbase and earning money.
          </p>
          <button
            onClick={onUpload}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:brightness-110 transition-all shadow-lg"
          >
            Upload
          </button>
        </div>
      );
    }

    if (tab === 'locked' && filteredPosts.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {isOwnProfile ? 'No premium content yet' : 'No premium content'}
          </h3>
          <p className="text-white/50 text-sm text-center max-w-xs">
            {isOwnProfile
              ? 'Create exclusive content that subscribers or paying fans can unlock.'
              : 'This creator hasn\'t posted premium content yet.'}
          </p>
        </div>
      );
    }

    if (tab === 'bundles' && packages.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {isOwnProfile ? 'Create content bundles' : 'No bundles available'}
          </h3>
          <p className="text-white/50 text-sm text-center max-w-xs">
            {isOwnProfile
              ? 'Package multiple posts together and sell them at a special price.'
              : 'This creator hasn\'t created any content bundles yet.'}
          </p>
        </div>
      );
    }

    if (!isOwnProfile && posts.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-white/30" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No content yet</h3>
          <p className="text-white/50 text-sm text-center max-w-xs">
            This creator hasn't posted any content yet. Check back later!
          </p>
        </div>
      );
    }

    return null;
  };

  // Render bundles tab
  if (activeTab === 'bundles') {
    if (packages.length === 0) {
      return (
        <div className="min-h-[50vh]">
          <EmptyState tab="bundles" />
        </div>
      );
    }

    return (
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {packages.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => onPackageClick(pkg)}
            className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all group text-left"
          >
            {pkg.cover_image_url && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={pkg.cover_image_url}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-bold text-white">{pkg.title}</h3>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold flex-shrink-0">
                  ${(pkg.price_cents / 100).toFixed(2)}
                </span>
              </div>
              {pkg.description && (
                <p className="text-white/60 text-sm line-clamp-2 mb-3">{pkg.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">
                  {pkg.items_count} {pkg.items_count === 1 ? 'item' : 'items'} included
                </span>
                <span className="text-xs text-purple-400 font-medium group-hover:text-purple-300">
                  View bundle →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  // Render posts grid
  return (
    <div className="min-h-[50vh]">
      {(filteredPosts.length === 0 || (activeTab === 'all' && posts.length === 0)) ? (
        <EmptyState tab={activeTab} />
      ) : (
        <div className="grid grid-cols-3 gap-0.5">
          {filteredPosts.map((post) => {
            const isUnlocked = isPostUnlocked(post);
            const isLocked = post.is_locked && !isUnlocked;

            return (
              <button
                key={post.id}
                onClick={() => {
                  if (isLocked && !isOwnProfile) {
                    onUnlockPost(post.id);
                  } else {
                    onPostClick(post);
                  }
                }}
                className="relative aspect-[9/16] bg-neutral-900 overflow-hidden group"
              >
                {/* Thumbnail */}
                {post.thumbnail_url ? (
                  <img
                    src={post.thumbnail_url}
                    alt={post.caption || 'Post'}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      isLocked ? 'blur-lg scale-110' : ''
                    }`}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
                )}

                {/* Locked Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2 border border-white/20">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    {post.unlock_price_cents > 0 && (
                      <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold">
                        ${(post.unlock_price_cents / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                )}

                {/* Video indicator */}
                {post.post_type === 'video' && !isLocked && (
                  <div className="absolute top-2 right-2">
                    <Play className="w-4 h-4 text-white drop-shadow-lg" fill="white" />
                  </div>
                )}

                {/* Stats overlay (bottom) */}
                {!isLocked && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(post.view_count)}
                      </span>
                      {post.is_locked && isUnlocked && (
                        <span className="flex items-center gap-1 text-purple-400">
                          <DollarSign className="w-3 h-3" />
                          Unlocked
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Premium badge */}
                {post.is_locked && isUnlocked && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full bg-purple-600/80 text-white text-[10px] font-bold">
                      PREMIUM
                    </span>
                  </div>
                )}
              </button>
            );
          })}

          {/* Add content button for own profile */}
          {isOwnProfile && filteredPosts.length > 0 && (
            <button
              onClick={onUpload}
              className="aspect-[9/16] bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:bg-white/10 hover:border-white/30 transition-all"
            >
              <Plus className="w-8 h-8 text-white/40" />
              <span className="text-xs text-white/40">Add more</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
