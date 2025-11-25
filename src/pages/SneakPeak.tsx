import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, Share2, Lock, ChevronUp, ChevronDown, Home, Users, Plus, MessageSquare, User, Play } from 'lucide-react';
import { demoFeedPosts, FeedPost } from '../data/demoFeedPosts';
import { useAuth } from '../contexts/AuthContext';

// Format numbers like TikTok (1.2K, 1.5M)
function formatCount(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

// Single Feed Item Component
function FeedItem({
  post,
  isActive,
  onProfileClick,
  onLike,
  onComment,
  onBookmark,
  onShare,
}: {
  post: FeedPost;
  isActive: boolean;
  onProfileClick: () => void;
  onLike: () => void;
  onComment: () => void;
  onBookmark: () => void;
  onShare: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmarks);

  const handleLike = () => {
    if (liked) {
      setLikeCount((c) => c - 1);
    } else {
      setLikeCount((c) => c + 1);
    }
    setLiked(!liked);
    onLike();
  };

  const handleBookmark = () => {
    if (bookmarked) {
      setBookmarkCount((c) => c - 1);
    } else {
      setBookmarkCount((c) => c + 1);
    }
    setBookmarked(!bookmarked);
    onBookmark();
  };

  const creator = post.creator;
  const displayName = creator.display_name || creator.name || 'Creator';
  const handle = creator.handle || '@creator';

  return (
    <div className="relative w-full h-full bg-black">
      {/* Background Image/Video */}
      <div className="absolute inset-0">
        {post.is_locked ? (
          // Locked content - blurred preview
          <div className="relative w-full h-full">
            <img
              src={post.media_url}
              alt=""
              className="w-full h-full object-cover blur-xl scale-110"
            />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/20">
                <Lock className="w-10 h-10 text-white/80" />
              </div>
              <p className="text-white font-semibold text-lg mb-2">Exclusive Content</p>
              <p className="text-white/60 text-sm mb-4">Subscribe to unlock</p>
              <button
                onClick={onProfileClick}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:brightness-110 transition-all"
              >
                View Profile
              </button>
            </div>
          </div>
        ) : (
          <img
            src={post.media_url}
            alt={post.caption}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 pointer-events-none" />

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
        {/* Creator Avatar */}
        <button
          onClick={onProfileClick}
          className="relative mb-2"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
            <img
              src={creator.avatar_url}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center border-2 border-black">
            <Plus className="w-3 h-3 text-white" />
          </div>
        </button>

        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${liked ? 'bg-pink-500/20' : 'bg-white/10 backdrop-blur-sm'}`}>
            <Heart className={`w-6 h-6 ${liked ? 'text-pink-500 fill-pink-500' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-semibold">{formatCount(likeCount)}</span>
        </button>

        {/* Comments */}
        <button onClick={onComment} className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-semibold">{formatCount(post.comments)}</span>
        </button>

        {/* Bookmark */}
        <button onClick={handleBookmark} className="flex flex-col items-center gap-1">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${bookmarked ? 'bg-yellow-500/20' : 'bg-white/10 backdrop-blur-sm'}`}>
            <Bookmark className={`w-6 h-6 ${bookmarked ? 'text-yellow-500 fill-yellow-500' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-semibold">{formatCount(bookmarkCount)}</span>
        </button>

        {/* Share */}
        <button onClick={onShare} className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-semibold">{formatCount(post.shares)}</span>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-20 left-0 right-16 p-4 z-10">
        {/* Creator Info */}
        <button onClick={onProfileClick} className="flex items-center gap-2 mb-3">
          <span className="text-white font-bold text-base">{displayName}</span>
          {creator.is_verified && (
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>

        {/* Caption */}
        <p className="text-white text-sm leading-relaxed line-clamp-3">
          {post.caption}
        </p>

        {/* Category Tag */}
        {creator.category && (
          <div className="mt-3">
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium">
              {creator.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Top Navigation Tabs
function FeedTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: 'following' | 'foryou';
  onTabChange: (tab: 'following' | 'foryou') => void;
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 pt-12 pb-3">
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => onTabChange('following')}
          className={`text-base font-semibold transition-all ${
            activeTab === 'following' ? 'text-white' : 'text-white/50'
          }`}
        >
          Following
        </button>
        <div className="w-px h-4 bg-white/30" />
        <button
          onClick={() => onTabChange('foryou')}
          className={`text-base font-semibold transition-all ${
            activeTab === 'foryou' ? 'text-white' : 'text-white/50'
          }`}
        >
          For You
        </button>
      </div>
      {/* Active indicator */}
      <div className="flex justify-center mt-2">
        <div
          className={`w-8 h-0.5 bg-white rounded-full transition-transform duration-300 ${
            activeTab === 'following' ? '-translate-x-12' : 'translate-x-8'
          }`}
        />
      </div>
    </div>
  );
}

// Bottom Navigation (Mobile-style)
function BottomNav({ activeTab, onNavigate }: { activeTab: string; onNavigate: (path: string) => void }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/90 backdrop-blur-sm border-t border-white/10">
      <div className="flex items-center justify-around py-2">
        <button
          onClick={() => onNavigate('/')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 ${activeTab === 'home' ? 'text-white' : 'text-white/50'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => onNavigate('/network')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 ${activeTab === 'network' ? 'text-white' : 'text-white/50'}`}
        >
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-medium">Explore</span>
        </button>

        <button
          onClick={() => onNavigate('/sneak-peak')}
          className="flex items-center justify-center -mt-4"
        >
          <div className="w-12 h-8 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('/messages')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 ${activeTab === 'messages' ? 'text-white' : 'text-white/50'}`}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium">Inbox</span>
        </button>

        <button
          onClick={() => onNavigate('/account/settings')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 ${activeTab === 'profile' ? 'text-white' : 'text-white/50'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
}

export default function SneakPeak() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'following' | 'foryou'>('foryou');
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const posts = demoFeedPosts;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'k') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        setCurrentIndex((prev) => Math.min(posts.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [posts.length]);

  // Handle touch/swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < posts.length - 1) {
        // Swipe up - next
        setCurrentIndex((prev) => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down - previous
        setCurrentIndex((prev) => prev - 1);
      }
    }

    setTouchStart(null);
  };

  // Handle scroll wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 50 && currentIndex < posts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (e.deltaY < -50 && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleProfileClick = (creatorHandle: string) => {
    const handle = creatorHandle.replace('@', '');
    navigate(`/creator/${handle}`);
  };

  const currentPost = posts[currentIndex];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Navigation Hints */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 opacity-30 hover:opacity-60 transition-opacity">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm disabled:opacity-30"
        >
          <ChevronUp className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => Math.min(posts.length - 1, prev + 1))}
          disabled={currentIndex === posts.length - 1}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm disabled:opacity-30"
        >
          <ChevronDown className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1">
        {posts.slice(0, Math.min(posts.length, 8)).map((_, idx) => (
          <div
            key={idx}
            className={`w-1 rounded-full transition-all ${
              idx === currentIndex
                ? 'h-6 bg-white'
                : 'h-1 bg-white/30'
            }`}
          />
        ))}
        {posts.length > 8 && (
          <span className="text-white/50 text-[10px] mt-1">+{posts.length - 8}</span>
        )}
      </div>

      {/* Feed Tabs */}
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Current Post */}
      <div className="w-full h-full">
        <FeedItem
          post={currentPost}
          isActive={true}
          onProfileClick={() => handleProfileClick(currentPost.creator.handle || '')}
          onLike={() => {}}
          onComment={() => {}}
          onBookmark={() => {}}
          onShare={() => {
            navigator.clipboard.writeText(window.location.href);
          }}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="feed"
        onNavigate={(path) => navigate(path)}
      />

      {/* peak.boo branding */}
      <div className="absolute top-12 left-4 z-20">
        <div className="flex items-center gap-2">
          <img
            src="/assets/snapreme_icon.png"
            alt="peak.boo"
            className="w-7 h-7 object-contain"
          />
          <span className="text-white font-bold text-lg">Sneak Peak</span>
        </div>
      </div>
    </div>
  );
}
