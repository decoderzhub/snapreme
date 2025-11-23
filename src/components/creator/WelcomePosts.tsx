import type { Post } from '../../types/database';

export const WELCOME_POSTS: Post[] = [
  {
    id: 'welcome-1',
    creator_id: 'system',
    created_at: new Date().toISOString(),
    media_url: null,
    thumbnail_url: '/assets/snapreme_icon.png',
    caption: '👋 Welcome to Snapreme!\n\nThis is your content feed. Upload videos and images to share with your fans. Each post can be:\n\n✨ Free for all subscribers\n💎 Unlocked with a one-time payment\n🔒 Exclusive for paid subscribers\n\n#WelcomeToSnapreme #GetStarted',
    like_count: 0,
    comment_count: 0,
    view_count: 0,
    is_locked: false,
    unlock_price_cents: 0,
    post_type: 'image',
  },
  {
    id: 'welcome-2',
    creator_id: 'system',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    media_url: null,
    thumbnail_url: '/assets/snapreme_icon.png',
    caption: '💰 Monetize Your Content\n\nSnapreme gives you multiple ways to earn:\n\n📱 Monthly subscriptions\n🎁 One-time post unlocks\n📦 Content bundles\n💬 Pay-per-message (PPM) chat\n💝 Tips from fans\n\n#Monetization #CreatorEconomy',
    like_count: 0,
    comment_count: 0,
    view_count: 0,
    is_locked: false,
    unlock_price_cents: 0,
    post_type: 'image',
  },
  {
    id: 'welcome-3',
    creator_id: 'system',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    media_url: null,
    thumbnail_url: '/assets/snapreme_icon.png',
    caption: '🎯 Pro Tips for Success\n\n1️⃣ Post consistently (3-5 times/week)\n2️⃣ Use hashtags to get discovered\n3️⃣ Engage with your fans via PPM\n4️⃣ Create bundles for premium content\n5️⃣ Share your profile on social media\n\n#ProTips #CreatorSuccess',
    like_count: 0,
    comment_count: 0,
    view_count: 0,
    is_locked: false,
    unlock_price_cents: 0,
    post_type: 'image',
  },
];

export function shouldShowWelcomePosts(userPosts: Post[]): boolean {
  return userPosts.length === 0;
}

export function getPostsWithWelcome(userPosts: Post[]): Post[] {
  if (shouldShowWelcomePosts(userPosts)) {
    return WELCOME_POSTS;
  }
  return userPosts;
}
