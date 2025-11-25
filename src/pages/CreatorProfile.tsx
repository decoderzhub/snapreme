import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Home, Compass, User, MessageCircle } from 'lucide-react';
import { Creator, Post } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useCreatorPosts, useContentPackages, usePostUnlocks, usePackagePurchases } from '../hooks/useCreatorContent';
import { usePpmThread, usePpmMessages, useGifts, useWalletBalance } from '../hooks/usePpmMessaging';
import { unlockPost, purchaseContentPackage } from '../lib/payments';

// New TikTok-style components
import { TikTokProfileHeader } from '../components/creator/TikTokProfileHeader';
import { ContentTabNavigation, ContentTab } from '../components/creator/ContentTabNavigation';
import { TikTokContentGrid } from '../components/creator/TikTokContentGrid';
import { UploadModal } from '../components/creator/UploadModal';
import { PpmChatCard } from '../components/creator/PpmChatCard';
import { BuyCoinsModal } from '../components/creator/BuyCoinsModal';

// Post Viewer Modal
function PostViewerModal({
  post,
  creator,
  isUnlocked,
  onClose,
  onUnlock,
}: {
  post: Post;
  creator: Creator;
  isUnlocked: boolean;
  onClose: () => void;
  onUnlock: () => void;
}) {
  const displayName = (creator as any).display_name || (creator as any).name || 'Creator';
  const avatarUrl = creator.avatar_url;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Content */}
      <div className="w-full h-full flex items-center justify-center">
        {isUnlocked ? (
          <div className="relative max-w-lg w-full h-full flex items-center justify-center">
            {post.post_type === 'video' && post.media_url ? (
              <video
                src={post.media_url}
                poster={post.thumbnail_url || undefined}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
                playsInline
              />
            ) : post.media_url ? (
              <img
                src={post.media_url}
                alt={post.caption || 'Content'}
                className="max-w-full max-h-full object-contain"
              />
            ) : post.thumbnail_url ? (
              <img
                src={post.thumbnail_url}
                alt={post.caption || 'Content'}
                className="max-w-full max-h-full object-contain"
              />
            ) : null}

            {/* Caption Overlay */}
            {post.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 flex-shrink-0">
                    {avatarUrl && (
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">@{displayName}</p>
                    <p className="text-white/80 text-sm">{post.caption}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Premium Content</h3>
            <p className="text-white/60 mb-6">Unlock this content to view</p>
            <button
              onClick={onUnlock}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:brightness-110 transition-all"
            >
              {post.unlock_price_cents > 0
                ? `Unlock for $${(post.unlock_price_cents / 100).toFixed(2)}`
                : 'Subscribe to unlock'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreatorProfile() {
  const { handle } = useParams<{ handle: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ContentTab>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPpmChat, setShowPpmChat] = useState(false);

  const { posts } = useCreatorPosts(creator?.id);
  const { packages } = useContentPackages(creator?.id);
  const { unlocks } = usePostUnlocks(user?.id);
  const unlockedPostIds = new Set(unlocks.map((u) => u.post_id));
  const { thread } = usePpmThread(creator?.id, user?.id);
  const { messages } = usePpmMessages(thread?.id);
  const { gifts } = useGifts();
  const { balance, refetch: refetchBalance } = useWalletBalance(user?.id);

  const searchParams = new URLSearchParams(location.search);
  const unlockedFromQuery = searchParams.get('unlocked') === 'true';

  // Fetch creator
  useEffect(() => {
    async function loadCreator() {
      setLoading(true);
      if (!handle) {
        setCreator(null);
        setLoading(false);
        return;
      }

      const handleWithAt = handle.startsWith('@') ? handle : `@${handle}`;
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('handle', handleWithAt)
        .maybeSingle();

      if (!error && data) {
        setCreator(data as Creator);
      } else {
        setCreator(null);
      }
      setLoading(false);
    }
    loadCreator();
  }, [handle]);

  // Increment profile views
  useEffect(() => {
    if (!creator) return;
    const isOwnProfile = user?.id === (creator as any).user_id || user?.id === (creator as any).id;
    if (isOwnProfile) return;

    async function incrementViews() {
      const creatorId = (creator as any).id;
      const { error: rpcError } = await supabase.rpc('increment_profile_views', {
        creator_id: creatorId
      });
      if (rpcError) {
        await supabase
          .from('creators')
          .update({ profile_views: ((creator as any).profile_views ?? 0) + 1 })
          .eq('id', creatorId);
      }
    }
    incrementViews();
  }, [creator?.id, user?.id]);

  // Check subscription
  useEffect(() => {
    if (!user || !creator) return;

    async function checkSub() {
      setCheckingSubscription(true);
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('id, is_active')
          .eq('fan_id', user.id)
          .eq('creator_id', (creator as any).id)
          .maybeSingle();

        if (!error && data && data.is_active) {
          setIsSubscribed(true);
        } else if (unlockedFromQuery) {
          setIsSubscribed(true);
        }
      } catch (err) {
        console.error('Error checking subscription', err);
      } finally {
        setCheckingSubscription(false);
      }
    }
    checkSub();
  }, [user, creator, unlockedFromQuery]);

  // Fetch subscriber count
  useEffect(() => {
    if (!creator) return;

    async function fetchSubscriberCount() {
      const { count, error } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', (creator as any).id)
        .eq('is_active', true);

      if (!error && count !== null) {
        setSubscriberCount(count);
      }
    }
    fetchSubscriberCount();
  }, [creator]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleSubscribe = async () => {
    if (!creator) return;

    if (!user) {
      navigate(`/signup?next=${encodeURIComponent(`/creator/${handle}`)}`);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ creatorId: (creator as any).id }),
        }
      );

      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      }
    } catch (err) {
      console.error('Error creating checkout session', err);
    }
  };

  const handleUnlockPost = async (postId: string) => {
    if (!user) {
      navigate(`/signup?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const result = await unlockPost(postId);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Failed to unlock post:', error);
    }
  };

  const handleUpload = (files: File[], options: any) => {
    console.log('Upload files:', files, options);
    // TODO: Implement actual upload logic
  };

  const isPostUnlocked = (post: Post) => {
    return !post.is_locked || isSubscribed || unlockedPostIds.has(post.id);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 animate-pulse mx-auto" />
          <p className="text-sm text-white/50">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!creator) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-white mb-2">Creator not found</h2>
          <p className="text-white/60 mb-6">
            This creator profile doesn't exist or has been removed.
          </p>
          <Link
            to="/network"
            className="inline-flex px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:brightness-110 transition-all"
          >
            Browse creators
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === (creator as any).user_id || user?.id === (creator as any).id;
  const avatarUrl = creator.avatar_url;
  const cardImageUrl = (creator as any).card_image_url;

  // Incomplete profile
  if (!avatarUrl || !cardImageUrl) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Profile Setup Incomplete</h2>
          <p className="text-white/60 mb-4">
            This creator has not finished setting up their peak.boo profile.
          </p>
          {isOwnProfile && (
            <Link
              to="/onboarding"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold"
            >
              Complete Setup
            </Link>
          )}
        </div>
      </div>
    );
  }

  const priceValue = (creator as any).subscription_price ?? 9.99;
  const priceDollars = Number(priceValue).toFixed(2);
  const viewsCount = (creator as any).profile_views ?? 0;
  const totalLikes = posts.reduce((sum, post) => sum + (post.like_count || 0), 0);
  const lockedPosts = posts.filter((p) => p.is_locked);

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Back Button - Mobile */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Panel - Profile Info */}
        <div className="w-[400px] flex-shrink-0 border-r border-white/10 overflow-y-auto">
          <TikTokProfileHeader
            creator={creator}
            isOwnProfile={isOwnProfile}
            isSubscribed={isSubscribed}
            subscriberCount={subscriberCount}
            viewsCount={viewsCount}
            likesCount={totalLikes}
            postsCount={posts.length}
            priceDollars={priceDollars}
            onSubscribe={handleSubscribe}
            onShare={handleShare}
            onUpload={() => setShowUploadModal(true)}
            checkingSubscription={checkingSubscription}
          />

          {/* PPM Chat on Desktop */}
          {!isOwnProfile && (
            <div className="p-4">
              <PpmChatCard
                threadId={thread?.id || null}
                messages={messages}
                balance={balance}
                gifts={gifts}
                currentUserId={user?.id}
                onBuyCoins={() => setShowBuyCoins(true)}
                onRefreshBalance={refetchBalance}
              />
            </div>
          )}
        </div>

        {/* Right Panel - Content Grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ContentTabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isOwnProfile={isOwnProfile}
            counts={{
              all: posts.length,
              locked: lockedPosts.length,
              bundles: packages.length,
            }}
          />

          <div className="flex-1 overflow-y-auto">
            <TikTokContentGrid
              posts={posts}
              packages={packages}
              activeTab={activeTab}
              isOwnProfile={isOwnProfile}
              isSubscribed={isSubscribed}
              unlockedPostIds={unlockedPostIds}
              onPostClick={setSelectedPost}
              onPackageClick={(pkg) => purchaseContentPackage(pkg.id)}
              onUpload={() => setShowUploadModal(true)}
              onUnlockPost={handleUnlockPost}
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <TikTokProfileHeader
          creator={creator}
          isOwnProfile={isOwnProfile}
          isSubscribed={isSubscribed}
          subscriberCount={subscriberCount}
          viewsCount={viewsCount}
          likesCount={totalLikes}
          postsCount={posts.length}
          priceDollars={priceDollars}
          onSubscribe={handleSubscribe}
          onShare={handleShare}
          onUpload={() => setShowUploadModal(true)}
          checkingSubscription={checkingSubscription}
        />

        <ContentTabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOwnProfile={isOwnProfile}
          counts={{
            all: posts.length,
            locked: lockedPosts.length,
            bundles: packages.length,
          }}
        />

        <div className="flex-1">
          <TikTokContentGrid
            posts={posts}
            packages={packages}
            activeTab={activeTab}
            isOwnProfile={isOwnProfile}
            isSubscribed={isSubscribed}
            unlockedPostIds={unlockedPostIds}
            onPostClick={setSelectedPost}
            onPackageClick={(pkg) => purchaseContentPackage(pkg.id)}
            onUpload={() => setShowUploadModal(true)}
            onUnlockPost={handleUnlockPost}
          />
        </div>

        {/* Mobile PPM Chat Button */}
        {!isOwnProfile && (
          <button
            onClick={() => setShowPpmChat(true)}
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 z-40"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        )}

        {/* Mobile PPM Chat Modal */}
        {showPpmChat && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-end">
            <div className="w-full max-h-[80vh] bg-neutral-900 rounded-t-3xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Message</h3>
                <button
                  onClick={() => setShowPpmChat(false)}
                  className="p-2 rounded-full hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
              <div className="p-4">
                <PpmChatCard
                  threadId={thread?.id || null}
                  messages={messages}
                  balance={balance}
                  gifts={gifts}
                  currentUserId={user?.id}
                  onBuyCoins={() => setShowBuyCoins(true)}
                  onRefreshBalance={refetchBalance}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />
      )}

      {showBuyCoins && (
        <BuyCoinsModal onClose={() => setShowBuyCoins(false)} />
      )}

      {selectedPost && (
        <PostViewerModal
          post={selectedPost}
          creator={creator}
          isUnlocked={isPostUnlocked(selectedPost)}
          onClose={() => setSelectedPost(null)}
          onUnlock={() => handleUnlockPost(selectedPost.id)}
        />
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          <Link
            to="/sneak-peak"
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">Feed</span>
          </Link>

          <Link
            to="/network"
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            <Compass className="w-6 h-6" />
            <span className="text-[10px] font-medium">Explore</span>
          </Link>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center gap-1 px-4 py-2 text-white transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </button>

          <Link
            to="/inbox"
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-[10px] font-medium">Inbox</span>
          </Link>
        </div>
      </div>

      {/* Bottom spacing for fixed nav */}
      <div className="h-16" />
    </div>
  );
}
