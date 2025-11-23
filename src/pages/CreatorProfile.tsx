import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  Eye,
  QrCode,
  Lock,
  Copy,
  CheckCircle,
  Edit,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { Creator } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useCreatorPosts, useContentPackages, usePostUnlocks, usePackagePurchases } from '../hooks/useCreatorContent';
import { usePpmThread, usePpmMessages, useGifts, useWalletBalance } from '../hooks/usePpmMessaging';
import { TikTokTeaserLayout } from '../components/creator/TikTokTeaserLayout';
import { MobileTeaserView } from '../components/creator/MobileTeaserView';
import { CompactProfileHeader } from '../components/creator/CompactProfileHeader';
import { ContentPackagesCard } from '../components/creator/ContentPackagesCard';
import { PpmChatCard } from '../components/creator/PpmChatCard';
import { BuyCoinsModal } from '../components/creator/BuyCoinsModal';
import { unlockPost, purchaseContentPackage } from '../lib/payments';

export default function CreatorProfile() {
  const { handle } = useParams<{ handle: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [relatedCreators, setRelatedCreators] = useState<Creator[]>([]);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [showBuyCoins, setShowBuyCoins] = useState(false);

  const { posts } = useCreatorPosts(creator?.id);
  const { packages } = useContentPackages(creator?.id);
  const { unlocks } = usePostUnlocks(user?.id);
  const unlockedPostIds = new Set(unlocks.map((u) => u.post_id));
  const { purchases } = usePackagePurchases(user?.id);
  const { thread } = usePpmThread(creator?.id, user?.id);
  const { messages } = usePpmMessages(thread?.id);
  const { gifts } = useGifts();
  const { balance, refetch: refetchBalance } = useWalletBalance(user?.id);

  const searchParams = new URLSearchParams(location.search);
  const unlockedFromQuery = searchParams.get('unlocked') === 'true';

  // Fetch creator from Supabase instead of mock data
  useEffect(() => {
    async function loadCreator() {
      setLoading(true);

      if (!handle) {
        setCreator(null);
        setLoading(false);
        return;
      }

      // Try to match with @ prefix first, then without
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

  // Subscription check – fan subscribed to this creator?
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
          // Optimistic unlock right after Stripe redirect
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleUnlock = async () => {
    if (!creator) return;

    if (!user) {
      navigate(
        `/signup?next=${encodeURIComponent(`/creator/${handle}`)}`
      );
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
          body: JSON.stringify({
            creatorId: (creator as any).id,
          }),
        }
      );

      const json = await res.json();
      if (json.error) {
        console.error('Checkout error:', json.error);
        alert(`Failed to create checkout: ${json.error}`);
        return;
      }

      if (json.url) {
        window.location.href = json.url;
      }
    } catch (err) {
      console.error('Error creating checkout session', err);
      alert('Failed to create checkout session. Please try again.');
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
      alert(error instanceof Error ? error.message : 'Failed to unlock post');
    }
  };

  const handlePurchasePackage = async (packageId: string) => {
    if (!user) {
      navigate(`/signup?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const result = await purchaseContentPackage(packageId);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Failed to purchase package:', error);
      alert(error instanceof Error ? error.message : 'Failed to purchase package');
    }
  };

  // Load related creators by category
  useEffect(() => {
    async function loadRelated() {
      if (!creator?.category) {
        setRelatedCreators([]);
        return;
      }

      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .neq('id', (creator as any).id)
        .eq('category', creator.category)
        .limit(6);

      if (!error && data) {
        const completeProfiles = (data as Creator[]).filter(
          (rc) => rc.avatar_url && (rc as any).card_image_url && (rc as any).onboarding_complete
        );

        setRelatedCreators(completeProfiles);
      }
    }

    loadRelated();
  }, [creator]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 animate-pulse mx-auto" />
          <p className="text-sm text-slate-500">Loading creator profile…</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Creator not found</h2>
          <p className="text-slate-600 mb-6">
            This creator profile doesn't exist or has been removed.
          </p>
          <Link
            to="/network"
            className="inline-flex px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-full hover:from-blue-700 hover:to-indigo-600 transition-all"
          >
            Browse creators
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === (creator as any).user_id || user?.id === (creator as any).id;

  const coverUrl = creator.cover_url || '/assets/snapreme-default-banner.svg';
  const avatarUrl = creator.avatar_url;
  const cardImageUrl = (creator as any).card_image_url;

  if (!avatarUrl || !cardImageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Profile Setup Incomplete</h2>
          <p className="text-slate-600 mb-4">
            This creator has not finished setting up their Snapreme profile.
          </p>
          {isOwnProfile && (
            <Link
              to="/onboarding"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full font-semibold"
            >
              Complete Setup
            </Link>
          )}
        </div>
      </div>
    );
  }

  const displayName = (creator as any).display_name || (creator as any).name || 'Creator';
  const safeHandle = (creator as any).handle?.replace(/^@/, '') || '';

  const fansCount = (creator as any).subscribers ?? 0;
  const viewsCount = (creator as any).profile_views ?? 0;
  const postsCount = (creator as any).posts ?? 0;

  const priceCents = (creator as any).subscription_price ?? 999;
  const priceDollars = (priceCents / 100).toFixed(2);

  const snapcodeUrl = (creator as any).snapcode_url || null;

  // Soft enforcement: warn if bio looks like it has Snapchat username attempts
  const bio = (creator as any).bio || '';
  const looksLikeSnapBypass = /snap(chat)?|sc:|add me on sc|snap me/i.test(bio);

  const formatCompact = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Compact Header */}
      <CompactProfileHeader
        creator={creator}
        isOwnProfile={isOwnProfile}
        isSubscribed={isSubscribed}
        fansCount={fansCount}
        viewsCount={viewsCount}
        postsCount={postsCount}
        priceDollars={priceDollars}
        onBack={() => navigate(-1)}
        onCopyLink={handleCopyLink}
        copiedLink={copiedLink}
        onSubscribe={handleUnlock}
        checkingSubscription={checkingSubscription}
      />

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Desktop: TikTok 3-Column Layout */}
        <TikTokTeaserLayout
          posts={posts}
          packages={packages}
          creator={creator}
          isSubscribed={isSubscribed}
          fanId={user?.id}
          unlockedPostIds={unlockedPostIds}
          onUnlockPost={handleUnlockPost}
          onViewPackage={handlePurchasePackage}
        />

        {/* Mobile: Vertical Layout */}
        <MobileTeaserView
          posts={posts}
          packages={packages}
          creator={creator}
          isSubscribed={isSubscribed}
          unlockedPostIds={unlockedPostIds}
          onUnlockPost={handleUnlockPost}
          onViewPackage={handlePurchasePackage}
        />

        {/* About + QR Section - Mobile Only */}
        <section className="lg:hidden mt-8 space-y-6">
          {/* About section */}
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-5 space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">About</h2>
            {bio ? (
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {bio}
              </p>
            ) : (
              <p className="text-sm text-neutral-500">
                This creator hasn&apos;t added a bio yet.
              </p>
            )}

            {isOwnProfile && looksLikeSnapBypass && (
              <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-800">
                  It looks like you might be mentioning Snapchat directly in your bio. To keep Snapreme as
                  the secure middle layer, please avoid putting your Snapchat username or &quot;add me on SC&quot; here.
                  Fans should only get access via the unlock + QR flow.
                </p>
              </div>
            )}
          </div>

          {/* Snapchat QR section */}
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-5 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="w-5 h-5 text-neutral-800" />
              <h2 className="text-sm font-semibold text-neutral-900">
                Premium Snapchat access
              </h2>
            </div>

            {!snapcodeUrl && isOwnProfile && (
              <div className="text-center text-xs text-neutral-500">
                <p className="mb-2">
                  Add your Snapchat QR code in your account settings so fans can unlock it here after subscribing.
                </p>
                <Link
                  to="/account/settings"
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-semibold"
                >
                  Add Snapchat QR
                </Link>
              </div>
            )}

            {!isOwnProfile && !isSubscribed && (
              <div className="flex flex-col items-center justify-center flex-1 w-full">
                <div className="w-40 h-40 rounded-3xl bg-neutral-100 flex items-center justify-center mb-3">
                  <Lock className="w-10 h-10 text-neutral-400" />
                </div>
                <p className="text-xs text-neutral-500 text-center max-w-xs">
                  Subscribe to unlock this creator&apos;s Snapchat QR code and access their premium content directly in Snapchat.
                </p>
              </div>
            )}

            {(isSubscribed || isOwnProfile) && snapcodeUrl && (
              <div className="flex flex-col items-center w-full mt-1">
                <div className="bg-neutral-50 rounded-3xl p-4 flex items-center justify-center w-full">
                  <img
                    src={snapcodeUrl}
                    alt="Snapchat QR code"
                    className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 text-center mt-2">
                  Scan with Snapchat to connect. Do not share this publicly – it&apos;s reserved for paying fans.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Monetization Cards - Mobile Only */}
        {!isOwnProfile && (
          <section className="lg:hidden mt-8 space-y-6">
            <PpmChatCard
              threadId={thread?.id || null}
              messages={messages}
              balance={balance}
              gifts={gifts}
              currentUserId={user?.id}
              onBuyCoins={() => setShowBuyCoins(true)}
              onRefreshBalance={refetchBalance}
            />
          </section>
        )}

      </div>

      {showBuyCoins && <BuyCoinsModal onClose={() => setShowBuyCoins(false)} />}
    </div>
  );
}
