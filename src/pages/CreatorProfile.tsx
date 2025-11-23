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
import { TeaserLayout } from '../components/creator/TeaserLayout';
import { SimplePostsFeed } from '../components/creator/SimplePostsFeed';
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
    <div className="min-h-screen bg-white">
      {/* Hero / cover */}
      <div className="relative">
        <div className="h-80 sm:h-96 overflow-hidden">
          <img
            src={coverUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80" />
        </div>

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/40 text-white text-xs hover:bg-black/60"
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </button>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isOwnProfile && (
            <Link
              to="/account/settings"
              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all flex items-center gap-2 shadow-lg text-xs font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit profile
            </Link>
          )}
          <button
            onClick={handleCopyLink}
            className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all flex items-center gap-1.5 shadow-lg text-xs font-medium"
          >
            {copiedLink ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-700" />
                <span className="text-slate-700">Share</span>
              </>
            )}
          </button>
        </div>

        {/* Avatar + basic info */}
        <div className="absolute inset-x-0 -bottom-16 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-200">
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          </div>
          <div className="mt-3 text-center text-white px-4">
            <h1 className="text-2xl sm:text-3xl font-bold">{displayName}</h1>
            {safeHandle && (
              <p className="text-sm text-white/80 mt-0.5">
                {/* No @ emphasis to prevent Snapchat handle confusion */}
                {safeHandle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        {/* Stats + subscribe */}
        <section className="bg-white rounded-3xl shadow-md border border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-8">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Fans</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <p className="text-lg font-semibold text-slate-900">
                    {formatCompact(fansCount)}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Profile views</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <p className="text-lg font-semibold text-slate-900">
                    {formatCompact(viewsCount)}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Posts</p>
                <p className="text-lg font-semibold text-slate-900">
                  {postsCount}
                </p>
              </div>
            </div>

            {/* Subscribe / QR unlock */}
            <div className="flex flex-col items-center sm:items-end gap-2">
              {!isOwnProfile && !isSubscribed && (
                <>
                  <button
                    onClick={handleUnlock}
                    disabled={checkingSubscription}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full
                               bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold
                               shadow-md hover:brightness-110 disabled:opacity-60"
                  >
                    <Lock className="w-4 h-4" />
                    {checkingSubscription
                      ? 'Checking subscription…'
                      : `Unlock Snapchat • $${priceDollars}/mo`}
                  </button>
                  <p className="text-[11px] text-slate-500 text-right max-w-xs">
                    Secure payments via Stripe. Snapreme takes a 10% platform fee. Cancel anytime.
                  </p>
                </>
              )}

              {isOwnProfile && (
                <div className="text-right space-y-1">
                  <Link
                    to="/dashboard/monetization"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full
                               bg-slate-900 text-white text-xs font-semibold shadow hover:bg-slate-800"
                  >
                    <Lock className="w-3 h-3" />
                    Manage pricing & payouts
                  </Link>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    This is how fans unlock your Snapchat premium access. Do not put your Snapchat username
                    in your profile – use the QR unlock only.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content & Monetization Section */}
        <section className="space-y-8">
          {/* TikTok-style teaser for desktop */}
          <TeaserLayout
            posts={posts}
            isSubscribed={isSubscribed}
            fanId={user?.id}
            onUnlockPost={handleUnlockPost}
          />

          {/* Simple feed for mobile */}
          <SimplePostsFeed
            posts={posts}
            isSubscribed={isSubscribed}
            fanId={user?.id}
            onUnlockPost={handleUnlockPost}
          />
        </section>

        {/* About + Monetization Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_minmax(0,1.1fr)] gap-6 md:gap-8">
          {/* Left: About + QR */}
          <div className="space-y-6">
            {/* About section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-6 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">About</h2>
              {bio ? (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {bio}
                </p>
              ) : (
                <p className="text-sm text-slate-500">
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
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-6 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="w-5 h-5 text-slate-800" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Premium Snapchat access
                </h2>
              </div>

              {!snapcodeUrl && isOwnProfile && (
                <div className="text-center text-xs text-slate-500">
                  <p className="mb-2">
                    Add your Snapchat QR code in your account settings so fans can unlock it here after subscribing.
                  </p>
                  <Link
                    to="/account/settings"
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold"
                  >
                    Add Snapchat QR
                  </Link>
                </div>
              )}

              {!isOwnProfile && !isSubscribed && (
                <div className="flex flex-col items-center justify-center flex-1 w-full">
                  <div className="w-40 h-40 rounded-3xl bg-slate-100 flex items-center justify-center mb-3">
                    <Lock className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 text-center max-w-xs">
                    Subscribe to unlock this creator&apos;s Snapchat QR code and access their premium content directly in Snapchat.
                  </p>
                </div>
              )}

              {(isSubscribed || isOwnProfile) && snapcodeUrl && (
                <div className="flex flex-col items-center w-full mt-1">
                  <div className="bg-slate-50 rounded-3xl p-4 flex items-center justify-center w-full">
                    <img
                      src={snapcodeUrl}
                      alt="Snapchat QR code"
                      className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 text-center mt-2">
                    Scan with Snapchat to connect. Do not share this publicly – it&apos;s reserved for paying fans.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Monetization sidebar */}
          <div className="space-y-6 lg:sticky lg:top-4 lg:self-start">
            {!isOwnProfile && (
              <>
                <ContentPackagesCard
                  packages={packages}
                  purchases={purchases}
                  onPurchase={handlePurchasePackage}
                />

                <PpmChatCard
                  threadId={thread?.id || null}
                  messages={messages}
                  balance={balance}
                  gifts={gifts}
                  currentUserId={user?.id}
                  onBuyCoins={() => setShowBuyCoins(true)}
                  onRefreshBalance={refetchBalance}
                />
              </>
            )}
          </div>
        </section>

        {/* Old About + QR section - DELETE */}
        <section className="hidden grid-cols-1 md:grid-cols-[1.6fr_minmax(0,1.1fr)] gap-6 md:gap-8">
          {/* About */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">About</h2>
            {bio ? (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {bio}
              </p>
            ) : (
              <p className="text-sm text-slate-500">
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
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-6 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="w-5 h-5 text-slate-800" />
              <h2 className="text-sm font-semibold text-slate-900">
                Premium Snapchat access
              </h2>
            </div>

            {!snapcodeUrl && isOwnProfile && (
              <div className="text-center text-xs text-slate-500">
                <p className="mb-2">
                  Add your Snapchat QR code in your account settings so fans can unlock it here after subscribing.
                </p>
                <Link
                  to="/account/settings"
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold"
                >
                  Add Snapchat QR
                </Link>
              </div>
            )}

            {!isOwnProfile && !isSubscribed && (
              <div className="flex flex-col items-center justify-center flex-1 w-full">
                <div className="w-40 h-40 rounded-3xl bg-slate-100 flex items-center justify-center mb-3">
                  <Lock className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 text-center max-w-xs">
                  Subscribe to unlock this creator&apos;s Snapchat QR code and access their premium content directly in Snapchat.
                </p>
              </div>
            )}

            {(isSubscribed || isOwnProfile) && snapcodeUrl && (
              <div className="flex flex-col items-center w-full mt-1">
                <div className="bg-slate-50 rounded-3xl p-4 flex items-center justify-center w-full">
                  <img
                    src={snapcodeUrl}
                    alt="Snapchat QR code"
                    className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
                  />
                </div>
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Scan with Snapchat to connect. Do not share this publicly – it&apos;s reserved for paying fans.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Related creators */}
        {relatedCreators.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              More creators like {displayName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedCreators.map((rc) => {
                const rcCover = (rc as any).card_image_url;
                const rcName = (rc as any).display_name || (rc as any).name;
                const rcHandle = ((rc as any).handle || '').replace(/^@/, '');

                if (!rcCover || !(rc as any).avatar_url) return null;

                return (
                  <Link
                    key={(rc as any).id}
                    to={`/creator/${rcHandle}`}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={rcCover}
                        alt={rcName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-0.5 line-clamp-1">{rcName}</h3>
                      {rcHandle && (
                        <p className="text-xs text-slate-500 mb-1 line-clamp-1">{rcHandle}</p>
                      )}
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {(rc as any).short_bio || 'Premium creator on Snapreme.'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {showBuyCoins && <BuyCoinsModal onClose={() => setShowBuyCoins(false)} />}
    </div>
  );
}
