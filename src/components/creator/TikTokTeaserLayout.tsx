import { useState, useEffect, ReactNode } from 'react';
import type { Post, ContentPackage, Creator } from '../../types/database';
import { RecentVideosSidebar } from './RecentVideosSidebar';
import { MainVideoPlayer } from './MainVideoPlayer';
import { HighlightsAndBundles } from './HighlightsAndBundles';
import { getPostsWithWelcome } from './WelcomePosts';

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
  ppmCard?: ReactNode;
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
  ppmCard,
}: TikTokTeaserLayoutProps) {
  const displayPosts = isOwnProfile ? getPostsWithWelcome(posts) : posts;
  const [activePost, setActivePost] = useState<Post | null>(displayPosts[0] || null);

  useEffect(() => {
    if (displayPosts.length > 0 && !activePost) {
      setActivePost(displayPosts[0]);
    }
  }, [displayPosts, activePost]);

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
        posts={displayPosts}
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

      <div className="space-y-6">
        <HighlightsAndBundles
          posts={displayPosts}
          packages={packages}
          onSelectPost={handleSelectPost}
          onViewPackage={onViewPackage}
          isSubscribed={isSubscribed}
          unlockedPostIds={unlockedPostIds}
        />
        {ppmCard}
      </div>
    </div>
  );
}
