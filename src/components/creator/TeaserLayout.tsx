import { useState } from 'react';
import { Lock, Eye, Heart, MessageCircle, DollarSign, MoreVertical, Play } from 'lucide-react';
import type { Post } from '../../types/database';
import { usePostAccess } from '../../hooks/useCreatorContent';

interface TeaserLayoutProps {
  posts: Post[];
  isSubscribed: boolean;
  fanId?: string;
  onUnlockPost: (postId: string) => void;
}

export function TeaserLayout({ posts, isSubscribed, fanId, onUnlockPost }: TeaserLayoutProps) {
  const [activePost, setActivePost] = useState<Post | null>(posts[0] || null);

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No content yet</p>
      </div>
    );
  }

  return (
    <div className="hidden xl:grid grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)_minmax(0,1.2fr)] gap-4 h-[80vh]">
      <RecentVideosSidebar
        posts={posts}
        activePost={activePost}
        onSelectPost={setActivePost}
        isSubscribed={isSubscribed}
      />

      <MainTeaserPlayer
        post={activePost}
        isSubscribed={isSubscribed}
        fanId={fanId}
        onUnlock={onUnlockPost}
      />

      <HighlightsPanel posts={posts} />
    </div>
  );
}

function RecentVideosSidebar({
  posts,
  activePost,
  onSelectPost,
  isSubscribed,
}: {
  posts: Post[];
  activePost: Post | null;
  onSelectPost: (post: Post) => void;
  isSubscribed: boolean;
}) {
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="rounded-2xl bg-neutral-950/80 backdrop-blur-sm p-3 space-y-3 overflow-y-auto">
      <h3 className="text-sm font-semibold text-white px-2">Most recent videos</h3>
      <div className="space-y-3">
        {posts.map((post) => {
          const isActive = activePost?.id === post.id;
          const isLocked = post.is_locked && !isSubscribed;

          return (
            <button
              key={post.id}
              onClick={() => onSelectPost(post)}
              className={`w-full rounded-xl overflow-hidden transition-all ${
                isActive ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-white/20'
              }`}
            >
              <div className="relative aspect-[9/16] bg-slate-800">
                {post.thumbnail_url ? (
                  <img
                    src={post.thumbnail_url}
                    alt={post.caption || ''}
                    className={`w-full h-full object-cover ${isLocked ? 'filter blur-sm' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
                )}

                {isLocked && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatCount(post.view_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatCount(post.like_count)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {post.caption && (
                <div className="p-2 bg-neutral-900/50">
                  <p className="text-xs text-white/80 truncate text-left">
                    {post.caption}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MainTeaserPlayer({
  post,
  isSubscribed,
  fanId,
  onUnlock,
}: {
  post: Post | null;
  isSubscribed: boolean;
  fanId?: string;
  onUnlock: (postId: string) => void;
}) {
  const { hasAccess } = usePostAccess(post, fanId, isSubscribed);

  if (!post) {
    return (
      <div className="relative h-full rounded-2xl bg-black flex items-center justify-center">
        <p className="text-white/60">Select a video to preview</p>
      </div>
    );
  }

  const showLocked = post.is_locked && !hasAccess;

  return (
    <div className="relative h-full rounded-2xl bg-black overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {post.media_url ? (
          <div className={`relative max-h-full aspect-[9/16] ${showLocked ? 'filter blur-lg' : ''}`}>
            <video
              src={post.media_url}
              poster={post.thumbnail_url || undefined}
              className="w-full h-full object-cover"
              controls={!showLocked}
            />
            {!showLocked && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[9/16] max-h-full w-full bg-gradient-to-br from-slate-700 to-slate-900" />
        )}
      </div>

      {showLocked && (
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/50 flex items-center justify-center">
          <div className="text-center px-6">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Subscribe or unlock this post to watch
            </h3>
            <p className="text-white/70 mb-6 text-sm">
              Get access to exclusive content
            </p>
            <button
              onClick={() => onUnlock(post.id)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:brightness-110 transition-all"
            >
              Unlock video ${(post.unlock_price_cents / 100).toFixed(2)}
            </button>
          </div>
        </div>
      )}

      {!showLocked && (
        <div className="absolute right-4 bottom-20 flex flex-col gap-4">
          <ActionButton icon={Heart} count={post.like_count} />
          <ActionButton icon={MessageCircle} count={post.comment_count} />
          <ActionButton icon={DollarSign} label="Tip" />
          <ActionButton icon={MoreVertical} />
        </div>
      )}

      {post.caption && !showLocked && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <p className="text-white text-sm">{post.caption}</p>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  count,
  label,
}: {
  icon: React.ElementType;
  count?: number;
  label?: string;
}) {
  const formatCount = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <button className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform">
      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      {count !== undefined && (
        <span className="text-xs font-semibold">{formatCount(count)}</span>
      )}
      {label && <span className="text-xs">{label}</span>}
    </button>
  );
}

function HighlightsPanel({ posts }: { posts: Post[] }) {
  const topPosts = [...posts]
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 6);

  return (
    <div className="rounded-2xl bg-neutral-950/80 backdrop-blur-sm p-3 space-y-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-white px-2">Highlights</h3>

      <div>
        <h4 className="text-xs text-white/60 px-2 mb-2">Best videos</h4>
        <div className="grid grid-cols-2 gap-2">
          {topPosts.map((post) => (
            <button
              key={post.id}
              className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-white/20 transition-all"
            >
              {post.thumbnail_url ? (
                <img
                  src={post.thumbnail_url}
                  alt={post.caption || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-1 text-white text-[10px]">
                  <Heart className="w-2.5 h-2.5" />
                  <span>{post.like_count}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
