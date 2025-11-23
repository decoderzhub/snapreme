import { useState, useEffect } from 'react';
import type { Post, ContentPackage, Creator } from '../../types/database';
import { RecentVideosSidebar } from './RecentVideosSidebar';
import { MainVideoPlayer } from './MainVideoPlayer';
import { HighlightsAndBundles } from './HighlightsAndBundles';

interface TikTokTeaserLayoutProps {
  posts: Post[];
  packages: ContentPackage[];
  creator: Creator;
  isSubscribed: boolean;
  fanId?: string;
  isOwnProfile?: boolean;
  unlockedPostIds: Set<string>;
  onUnlockPost: (postId: string) => void;
  onViewPackage: (pkg: ContentPackage) => void;
}

export function TikTokTeaserLayout({
  posts,
  packages,
  creator,
  isSubscribed,
  fanId,
  isOwnProfile = false,
  unlockedPostIds,
  onUnlockPost,
  onViewPackage,
}: TikTokTeaserLayoutProps) {
  const [activePost, setActivePost] = useState<Post | null>(posts[0] || null);

  useEffect(() => {
    if (posts.length > 0 && !activePost) {
      setActivePost(posts[0]);
    }
  }, [posts, activePost]);

  const isPostUnlocked = (post: Post) => {
    return !post.is_locked || isSubscribed || unlockedPostIds.has(post.id);
  };

  const handleSelectPost = (post: Post) => {
    setActivePost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="hidden lg:grid lg:grid-cols-[1.2fr_2fr_1.2fr] gap-6 min-h-[85vh] mt-6">
      <RecentVideosSidebar
        posts={posts}
        activePost={activePost}
        onSelectPost={handleSelectPost}
        isSubscribed={isSubscribed}
        unlockedPostIds={unlockedPostIds}
        isOwnProfile={isOwnProfile}
      />

      <MainVideoPlayer
        post={activePost}
        creator={creator}
        isSubscribed={isSubscribed}
        isUnlocked={activePost ? isPostUnlocked(activePost) : false}
        isOwnProfile={isOwnProfile}
        onUnlock={onUnlockPost}
      />

      <HighlightsAndBundles
        posts={posts}
        packages={packages}
        onSelectPost={handleSelectPost}
        onViewPackage={onViewPackage}
        isSubscribed={isSubscribed}
        unlockedPostIds={unlockedPostIds}
      />
    </div>
  );
}
