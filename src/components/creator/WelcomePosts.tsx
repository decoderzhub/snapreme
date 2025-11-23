import type { Post } from '../../types/database';

export const WELCOME_POSTS: Post[] = [
  {
    id: 'welcome-video-1',
    creator_id: 'system',
    created_at: new Date().toISOString(),
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217',
    caption: '🎬 Welcome to Snapreme!\n\nThis is how your video content will look. Share vertical shorts, reels, and exclusive content with your fans.\n\n✨ Upload your first video\n💎 Set unlock prices\n🔒 Make content subscriber-only\n\n#WelcomeToSnapreme #GetStarted #ContentCreator',
    like_count: 1247,
    comment_count: 89,
    view_count: 15420,
    is_locked: false,
    unlock_price_cents: 0,
    post_type: 'video',
  },
  {
    id: 'welcome-2',
    creator_id: 'system',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_s5_both.jpg/300px-Elephants_Dream_s5_both.jpg',
    caption: '💰 Multiple Revenue Streams\n\nSnapreme helps you earn in different ways:\n\n📱 Monthly subscriptions from loyal fans\n🎁 One-time unlocks for premium posts\n📦 Bundles with exclusive collections\n💬 Direct messages from fans (PPM)\n💝 Tips and gifts\n\n#Monetization #CreatorEconomy #EarnOnline',
    like_count: 892,
    comment_count: 54,
    view_count: 8765,
    is_locked: false,
    unlock_price_cents: 0,
    post_type: 'video',
  },
  {
    id: 'welcome-3',
    creator_id: 'system',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    caption: '🎯 Pro Tips for Success\n\nGrow your Snapreme profile faster:\n\n1️⃣ Post 3-5 times per week\n2️⃣ Use trending hashtags\n3️⃣ Respond to fan messages (PPM)\n4️⃣ Create themed bundles\n5️⃣ Share your profile link everywhere\n6️⃣ Tease premium content with free samples\n\n#ProTips #CreatorSuccess #GrowthStrategy',
    like_count: 1534,
    comment_count: 112,
    view_count: 22100,
    is_locked: false,
    unlock_price_cents: 0,
    post_type: 'video',
  },
  {
    id: 'welcome-locked-example',
    creator_id: 'system',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    caption: '🔒 Premium Content Example\n\nThis is how locked content looks to fans. They can unlock it with a one-time payment.\n\nGreat for:\n🎥 Behind-the-scenes content\n📸 Exclusive photoshoots\n🎓 Tutorials and lessons\n💃 Performance videos\n\nSet your price and start earning!\n\n#PremiumContent #Exclusive #UnlockMe',
    like_count: 2341,
    comment_count: 178,
    view_count: 31250,
    is_locked: true,
    unlock_price_cents: 499,
    post_type: 'video',
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
