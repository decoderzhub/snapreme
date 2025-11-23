import { Lock, Heart, Eye, MessageCircle, Play } from 'lucide-react';
import type { Post } from '../../types/database';
import { usePostAccess } from '../../hooks/useCreatorContent';

interface SimplePostsFeedProps {
  posts: Post[];
  isSubscribed: boolean;
  fanId?: string;
  onUnlockPost: (postId: string) => void;
}

export function SimplePostsFeed({ posts, isSubscribed, fanId, onUnlockPost }: SimplePostsFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
        <p className="text-slate-500">No content yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 xl:hidden">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isSubscribed={isSubscribed}
          fanId={fanId}
          onUnlock={onUnlockPost}
        />
      ))}
    </div>
  );
}

function PostCard({
  post,
  isSubscribed,
  fanId,
  onUnlock,
}: {
  post: Post;
  isSubscribed: boolean;
  fanId?: string;
  onUnlock: (postId: string) => void;
}) {
  const { hasAccess } = usePostAccess(post, fanId, isSubscribed);
  const showLocked = post.is_locked && !hasAccess;

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-slate-900">
        {post.thumbnail_url ? (
          <img
            src={post.thumbnail_url}
            alt={post.caption || ''}
            className={`w-full h-full object-cover ${showLocked ? 'filter blur-md' : ''}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
        )}

        {!showLocked && post.media_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        )}

        {showLocked && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 text-center">
              Unlock to watch
            </h3>
            <p className="text-white/70 text-sm mb-4 text-center">
              Subscribe or unlock this post
            </p>
            <button
              onClick={() => onUnlock(post.id)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:brightness-110 transition-all text-sm"
            >
              Unlock ${(post.unlock_price_cents / 100).toFixed(2)}
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        {post.caption && (
          <p className="text-sm text-slate-700 mb-3">{post.caption}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            {formatCount(post.view_count)}
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="w-4 h-4" />
            {formatCount(post.like_count)}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            {formatCount(post.comment_count)}
          </span>
        </div>
      </div>
    </div>
  );
}
