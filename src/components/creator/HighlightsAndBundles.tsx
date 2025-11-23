import { Sparkles, Package, Tag } from 'lucide-react';
import { InfoTooltip } from '../InfoTooltip';
import type { Post, ContentPackage } from '../../types/database';

interface HighlightsAndBundlesProps {
  posts: Post[];
  packages: ContentPackage[];
  onSelectPost: (post: Post) => void;
  onViewPackage: (pkg: ContentPackage) => void;
  isSubscribed: boolean;
  unlockedPostIds: Set<string>;
}

export function HighlightsAndBundles({
  posts,
  packages,
  onSelectPost,
  onViewPackage,
  isSubscribed,
  unlockedPostIds,
}: HighlightsAndBundlesProps) {
  const topPosts = [...posts]
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 6);

  const extractHashtags = (posts: Post[]): string[] => {
    const tags = new Set<string>();
    posts.forEach((post) => {
      if (post.caption) {
        const matches = post.caption.match(/#[\w]+/g);
        if (matches) {
          matches.forEach((tag) => tags.add(tag.toLowerCase()));
        }
      }
    });
    return Array.from(tags).slice(0, 10);
  };

  const hashtags = extractHashtags(posts);

  const isPostUnlocked = (post: Post) => {
    return !post.is_locked || isSubscribed || unlockedPostIds.has(post.id);
  };

  return (
    <div className="h-[85vh] overflow-y-auto rounded-2xl bg-neutral-950/70 backdrop-blur-lg p-4 space-y-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
      {/* Highlights Section */}
      {topPosts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-white">Highlights</h3>
            <InfoTooltip content="Your most-liked content. This helps fans discover your best work first." />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {topPosts.map((post) => {
              const isUnlocked = isPostUnlocked(post);

              return (
                <button
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className="relative aspect-[9/16] rounded-lg overflow-hidden group hover:scale-105 transition-transform"
                >
                  {post.thumbnail_url ? (
                    <img
                      src={post.thumbnail_url}
                      alt={post.caption || 'Highlight'}
                      className={`w-full h-full object-cover ${
                        !isUnlocked ? 'filter blur-sm' : ''
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
                  )}

                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                    <div className="flex items-center justify-between text-white text-xs">
                      <span className="font-semibold">
                        {post.like_count >= 1000
                          ? `${(post.like_count / 1000).toFixed(1)}K`
                          : post.like_count}
                      </span>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/20 transition-all" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Popular Themes Section */}
      {hashtags.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Tag className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Popular themes</h3>
            <InfoTooltip content="Hashtags from your posts. Use consistent tags to help fans find specific content types." />
          </div>

          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, idx) => (
              <button
                key={idx}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-white text-xs font-medium hover:from-purple-600/40 hover:to-blue-600/40 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Bundles & Deals Section */}
      {packages.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Package className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Bundles & Deals</h3>
            <InfoTooltip content="Package multiple posts together at a discounted price. Great for selling themed collections or premium content sets." />
          </div>

          <div className="space-y-3">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => onViewPackage(pkg)}
                className="w-full rounded-xl overflow-hidden bg-neutral-900/50 border border-white/10 hover:border-purple-500/50 transition-all group"
              >
                {pkg.cover_image_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={pkg.cover_image_url}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}

                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white text-left line-clamp-1">
                      {pkg.title}
                    </h4>
                    <span className="text-sm font-bold text-purple-400 flex-shrink-0">
                      ${(pkg.price_cents / 100).toFixed(2)}
                    </span>
                  </div>

                  {pkg.description && (
                    <p className="text-xs text-white/60 text-left line-clamp-2">
                      {pkg.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">
                      {pkg.items_count} {pkg.items_count === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-xs text-purple-400 font-medium group-hover:text-purple-300">
                      View details →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {topPosts.length === 0 && hashtags.length === 0 && packages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white/30" />
            </div>
            <p className="text-white/50 text-sm">No highlights yet</p>
          </div>
        </div>
      )}
    </div>
  );
}
