import { demoCreators } from './demoCreators';

export interface FeedPost {
  id: string;
  creator_id: string;
  creator: typeof demoCreators[0];
  type: 'video' | 'image';
  media_url: string;
  thumbnail_url?: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  is_locked: boolean;
  created_at: string;
}

// High-quality stock video/image URLs for demo content
const demoMedia = {
  fitness: [
    'https://images.pexels.com/photos/4162485/pexels-photo-4162485.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6455927/pexels-photo-6455927.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  fashion: [
    'https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1755385/pexels-photo-1755385.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  cosplay: [
    'https://images.pexels.com/photos/6976943/pexels-photo-6976943.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/7241342/pexels-photo-7241342.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8107206/pexels-photo-8107206.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  art: [
    'https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1579708/pexels-photo-1579708.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3817676/pexels-photo-3817676.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  coaching: [
    'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3184299/pexels-photo-3184299.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  lifestyle: [
    'https://images.pexels.com/photos/3771836/pexels-photo-3771836.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
};

const captions = {
  fitness: [
    'New leg day routine that changed everything 🔥 Full breakdown in my exclusive content!',
    'Morning stretch routine to start your day right ✨ Save this one!',
    '5 exercises to build core strength - no equipment needed 💪',
    'The workout that got me here. Link in bio for full program!',
  ],
  fashion: [
    'Fall outfit inspo 🍂 Which look is your fave? Comment below!',
    'How to style one blazer 5 different ways 👔 Full video dropping soon!',
    'Thrift haul reveal! Got all of this for under $50 🛍️',
    'Capsule wardrobe essentials everyone needs ✨',
  ],
  cosplay: [
    'Transformation complete! 🎭 Swipe for the before photo',
    'Behind the scenes of my latest build 🔧 Tutorial coming soon!',
    'Convention ready! Who else is going to be there? 🎪',
    'Wig styling tips that changed my game 💇‍♀️',
  ],
  art: [
    'New piece finished! 🎨 Time-lapse in my exclusive content',
    'Brush techniques that level up your digital art ✨',
    'Commission reveal for an amazing client! 💜',
    'Color theory breakdown - save this for later 🌈',
  ],
  coaching: [
    '3 mindset shifts that changed my career 🚀',
    'How I landed my dream job (story time) 💼',
    'Resume tips that actually work - recruiters hate this 😂',
    'Morning routine for maximum productivity ⚡',
  ],
  lifestyle: [
    'Day in my life vlog ☀️ More on my page!',
    'Self-care Sunday essentials 🧖‍♀️',
    'Room makeover reveal! Before & after 🏠',
    'Weekly reset routine that keeps me organized ✨',
  ],
};

// Helper to get random item from array
const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate demo posts from demo creators
export const demoFeedPosts: FeedPost[] = [
  // Marcus Fit - Fitness
  {
    id: 'feed-1',
    creator_id: 'demo-1',
    creator: demoCreators[0],
    type: 'image',
    media_url: demoMedia.fitness[0],
    caption: captions.fitness[0],
    likes: 1842,
    comments: 156,
    shares: 89,
    bookmarks: 234,
    is_locked: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  // Sophia Style - Fashion
  {
    id: 'feed-2',
    creator_id: 'demo-3',
    creator: demoCreators[2],
    type: 'image',
    media_url: demoMedia.fashion[0],
    caption: captions.fashion[0],
    likes: 2156,
    comments: 234,
    shares: 167,
    bookmarks: 456,
    is_locked: false,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  // Luna Cosplay - Cosplay
  {
    id: 'feed-3',
    creator_id: 'demo-5',
    creator: demoCreators[4],
    type: 'image',
    media_url: demoMedia.cosplay[0],
    caption: captions.cosplay[0],
    likes: 3421,
    comments: 312,
    shares: 245,
    bookmarks: 567,
    is_locked: false,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  // Maya Art - Art
  {
    id: 'feed-4',
    creator_id: 'demo-9',
    creator: demoCreators[8],
    type: 'image',
    media_url: demoMedia.art[0],
    caption: captions.art[0],
    likes: 2789,
    comments: 198,
    shares: 134,
    bookmarks: 423,
    is_locked: false,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  // Victoria Careers - Coaching
  {
    id: 'feed-5',
    creator_id: 'demo-7',
    creator: demoCreators[6],
    type: 'image',
    media_url: demoMedia.coaching[0],
    caption: captions.coaching[0],
    likes: 1567,
    comments: 245,
    shares: 312,
    bookmarks: 567,
    is_locked: false,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  // Jade Yoga - Fitness
  {
    id: 'feed-6',
    creator_id: 'demo-2',
    creator: demoCreators[1],
    type: 'image',
    media_url: demoMedia.fitness[1],
    caption: captions.fitness[1],
    likes: 1234,
    comments: 89,
    shares: 56,
    bookmarks: 178,
    is_locked: false,
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  // Derek Dapper - Fashion
  {
    id: 'feed-7',
    creator_id: 'demo-4',
    creator: demoCreators[3],
    type: 'image',
    media_url: demoMedia.fashion[1],
    caption: captions.fashion[1],
    likes: 987,
    comments: 67,
    shares: 45,
    bookmarks: 134,
    is_locked: false,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  // Alex Armor - Cosplay
  {
    id: 'feed-8',
    creator_id: 'demo-6',
    creator: demoCreators[5],
    type: 'image',
    media_url: demoMedia.cosplay[1],
    caption: captions.cosplay[1],
    likes: 1456,
    comments: 134,
    shares: 89,
    bookmarks: 234,
    is_locked: true,
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
  },
  // Tanya HIIT - Fitness
  {
    id: 'feed-9',
    creator_id: 'demo-11',
    creator: demoCreators[10],
    type: 'image',
    media_url: demoMedia.fitness[2],
    caption: captions.fitness[2],
    likes: 2345,
    comments: 178,
    shares: 123,
    bookmarks: 345,
    is_locked: false,
    created_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
  },
  // Priya Chic - Fashion
  {
    id: 'feed-10',
    creator_id: 'demo-13',
    creator: demoCreators[12],
    type: 'image',
    media_url: demoMedia.fashion[2],
    caption: captions.fashion[2],
    likes: 876,
    comments: 56,
    shares: 34,
    bookmarks: 123,
    is_locked: false,
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  // Nate Photo - Art
  {
    id: 'feed-11',
    creator_id: 'demo-14',
    creator: demoCreators[13],
    type: 'image',
    media_url: demoMedia.art[1],
    caption: captions.art[1],
    likes: 1678,
    comments: 145,
    shares: 98,
    bookmarks: 287,
    is_locked: false,
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  // Ryan Strength - Fitness
  {
    id: 'feed-12',
    creator_id: 'demo-12',
    creator: demoCreators[11],
    type: 'image',
    media_url: demoMedia.fitness[3],
    caption: captions.fitness[3],
    likes: 2123,
    comments: 189,
    shares: 145,
    bookmarks: 398,
    is_locked: true,
    created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
];
