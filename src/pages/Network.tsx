import { useState, useEffect, useMemo } from 'react';
import { Search, Flame, Star, ChevronLeft, ChevronRight, Heart, TrendingUp, Sparkles, MessageCircle, DollarSign, Crown, Dumbbell, Shirt, Palette, Briefcase, Camera, Gamepad2, Play, Lock, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Creator, Post } from '../types/database';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import TipModal from '../components/TipModal';
import CommentsModal from '../components/CommentsModal';
import { demoCreators } from '../data/demoCreators';

// Category definitions
const CATEGORIES = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'Fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'Fashion', label: 'Fashion', icon: Shirt },
  { id: 'Art', label: 'Art & Design', icon: Palette },
  { id: 'Coaching', label: 'Coaching', icon: Briefcase },
  { id: 'Cosplay', label: 'Cosplay', icon: Gamepad2 },
];

export default function Network() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'for-you' | 'trending' | 'new' | 'rising' | 'favorites'>('for-you');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeCreatorIndex, setActiveCreatorIndex] = useState(0);
  const [mobileView, setMobileView] = useState<'uploaded' | 'center' | 'featured'>('center');
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [tipModalCreator, setTipModalCreator] = useState<Creator | null>(null);
  const [commentsModalCreator, setCommentsModalCreator] = useState<Creator | null>(null);
  const [activeCreatorPosts, setActiveCreatorPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    async function fetchCreators() {
      setLoading(true);
      try {
        const { data: creatorsData, error } = await supabase
          .from('creators')
          .select('*')
          .order('followers', { ascending: false });

        if (error) throw error;

        // Combine real creators with demo creators
        const realCreators = (creatorsData || []) as Creator[];

        // Filter demo creators to avoid duplicates (by handle)
        const realHandles = new Set(realCreators.map(c => c.handle.toLowerCase()));
        const uniqueDemoCreators = demoCreators.filter(
          demo => !realHandles.has(demo.handle.toLowerCase())
        );

        setCreators([...realCreators, ...uniqueDemoCreators]);
      } catch (err) {
        console.error('Error loading creators:', err);
        // If error, still show demo creators
        setCreators(demoCreators);
      } finally {
        setLoading(false);
      }
    }

    fetchCreators();
  }, []);

  const completeCreators = useMemo(
    () =>
      creators.filter(
        (creator) =>
          creator.avatar_url &&
          (creator as any).card_image_url &&
          (creator as any).onboarding_complete
      ),
    [creators]
  );

  const filteredCreators = useMemo(() => {
    let list = [...completeCreators];

    // Filter by category first
    if (activeCategory !== 'all') {
      list = list.filter((creator) => creator.category === activeCategory);
    }

    // Filter by favorites
    if (activeFilter === 'favorites') {
      list = list.filter((creator) => favorites.has(creator.id));
    }

    // Filter by search
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (creator) =>
          creator.name.toLowerCase().includes(s) ||
          creator.handle.toLowerCase().includes(s) ||
          creator.display_name?.toLowerCase().includes(s) ||
          creator.category?.toLowerCase().includes(s)
      );
    }

    // Sort by filter type
    switch (activeFilter) {
      case 'trending':
        list.sort((a, b) => b.followers - a.followers);
        break;
      case 'new':
        list.sort((a, b) => {
          const aDate = (a as any).created_at ? new Date((a as any).created_at).getTime() : 0;
          const bDate = (b as any).created_at ? new Date((b as any).created_at).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case 'rising':
        list.sort((a, b) => b.engagement_rate - a.engagement_rate);
        break;
      case 'favorites':
        break;
      case 'for-you':
      default:
        list.sort((a, b) => {
          const scoreA = a.followers * 0.7 + a.engagement_rate * 1000 * 0.3;
          const scoreB = b.followers * 0.7 + b.engagement_rate * 1000 * 0.3;
          return scoreB - scoreA;
        });
        break;
    }

    return list;
  }, [completeCreators, search, activeFilter, activeCategory, favorites]);

  const featuredCreators = useMemo(
    () => [...completeCreators].sort((a, b) => b.followers - a.followers).slice(0, 10),
    [completeCreators]
  );

  const trendingCreators = useMemo(
    () => [...completeCreators].sort((a, b) => b.engagement_rate - a.engagement_rate).slice(0, 10),
    [completeCreators]
  );

  const uploadedCreators = useMemo(
    () => [...completeCreators].sort((a, b) => {
      const aDate = (a as any).created_at ? new Date((a as any).created_at).getTime() : 0;
      const bDate = (b as any).created_at ? new Date((b as any).created_at).getTime() : 0;
      return bDate - aDate;
    }).slice(0, 10),
    [completeCreators]
  );

  const activeCreator = filteredCreators[activeCreatorIndex] || null;

  // Fetch posts for the active creator
  useEffect(() => {
    async function fetchActiveCreatorPosts() {
      if (!activeCreator) {
        setActiveCreatorPosts([]);
        return;
      }

      // Check if it's a demo creator (demo creators have UUIDs starting with 'demo-')
      if (activeCreator.id.startsWith('demo-')) {
        // Generate demo posts for demo creators
        const demoPosts: Post[] = Array.from({ length: 6 }, (_, i) => ({
          id: `demo-post-${activeCreator.id}-${i}`,
          creator_id: activeCreator.id,
          post_type: i % 3 === 0 ? 'video' : 'image',
          media_url: (activeCreator as any).card_image_url,
          thumbnail_url: (activeCreator as any).card_image_url,
          caption: `Post ${i + 1} from ${activeCreator.display_name || activeCreator.name}`,
          is_locked: i < 2,
          unlock_price_cents: i < 2 ? 499 : 0,
          view_count: Math.floor(Math.random() * 10000),
          like_count: Math.floor(Math.random() * 1000),
          created_at: new Date(Date.now() - i * 86400000).toISOString(),
        } as Post));
        setActiveCreatorPosts(demoPosts);
        return;
      }

      setLoadingPosts(true);
      try {
        const { data: posts, error } = await supabase
          .from('posts')
          .select('*')
          .eq('creator_id', activeCreator.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setActiveCreatorPosts(posts || []);
      } catch (err) {
        console.error('Error fetching creator posts:', err);
        setActiveCreatorPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    }

    fetchActiveCreatorPosts();
  }, [activeCreator?.id]);

  const handleNext = () => {
    if (activeCreatorIndex < filteredCreators.length - 1) {
      setActiveCreatorIndex(activeCreatorIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeCreatorIndex > 0) {
      setActiveCreatorIndex(activeCreatorIndex - 1);
    }
  };

  const handleCreatorClick = (creator: Creator) => {
    navigate(`/creator/${creator.handle.replace(/^@/, '')}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent, creatorId: string) => {
    e.stopPropagation();
    if (user) {
      toggleFavorite(creatorId);
    }
  };

  const getBadge = (creator: Creator, type: 'featured' | 'trending' | 'new' | null) => {
    if (type === 'featured') {
      return (
        <div className="px-2 py-1 bg-amber-400 text-black text-xs font-bold rounded-full flex items-center gap-1">
          <Star className="w-3 h-3" />
          Featured
        </div>
      );
    }
    if (type === 'trending') {
      return (
        <div className="px-2 py-1 bg-orange-400 text-black text-xs font-bold rounded-full flex items-center gap-1">
          <Flame className="w-3 h-3" />
          Hot
        </div>
      );
    }
    if (type === 'new') {
      return (
        <div className="px-2 py-1 bg-blue-400 text-black text-xs font-bold rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          New
        </div>
      );
    }
    return null;
  };

  const getTierBadge = (tier: 'Rising' | 'Pro' | 'Elite') => {
    const styles = {
      Rising: {
        icon: TrendingUp,
        gradient: 'from-emerald-500 to-teal-500',
      },
      Pro: {
        icon: Star,
        gradient: 'from-blue-500 to-cyan-500',
      },
      Elite: {
        icon: Crown,
        gradient: 'from-amber-500 to-orange-500',
      },
    };
    const style = styles[tier];
    const TierIcon = style.icon;
    return (
      <div className={`px-2 py-1 bg-gradient-to-r ${style.gradient} rounded-full flex items-center gap-1 shadow-lg`}>
        <TierIcon className="w-3 h-3 text-white" />
        <span className="text-white text-xs font-semibold">{tier}</span>
      </div>
    );
  };

  const getPriceBadge = (price: number) => (
    <div className="px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
      <Heart className="w-3 h-3 text-pink-400" />
      <span>${price}/mo</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header with Search */}
      <div className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white hidden sm:block">Explore</h1>
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search creators..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-full bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 mt-3 no-scrollbar">
            {[
              { id: 'for-you', label: 'For you' },
              { id: 'trending', label: 'Trending' },
              { id: 'new', label: 'New' },
              { id: 'rising', label: 'Rising' },
              { id: 'favorites', label: 'Favorites', requiresAuth: true },
            ]
              .filter((chip) => !chip.requiresAuth || user)
              .map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => {
                    setActiveFilter(chip.id as any);
                    setActiveCreatorIndex(0);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeFilter === chip.id
                      ? 'bg-white text-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 mt-3 no-scrollbar">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setActiveCreatorIndex(0);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Tabs - Inside sticky header */}
        <div className="flex border-t border-slate-800 lg:hidden">
          <button
            onClick={() => setMobileView('uploaded')}
            className={`flex-1 py-3 text-xs font-medium transition-colors ${
              mobileView === 'uploaded'
                ? 'text-white border-b-2 border-white'
                : 'text-slate-400'
            }`}
          >
            Uploaded
          </button>
          <button
            onClick={() => setMobileView('center')}
            className={`flex-1 py-3 text-xs font-medium transition-colors ${
              mobileView === 'center'
                ? 'text-white border-b-2 border-white'
                : 'text-slate-400'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setMobileView('featured')}
            className={`flex-1 py-3 text-xs font-medium transition-colors ${
              mobileView === 'featured'
                ? 'text-white border-b-2 border-white'
                : 'text-slate-400'
            }`}
          >
            Featured
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Loading creators...</p>
          </div>
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center px-4">
            <p className="text-slate-400 text-sm">No creators found. Try adjusting your filters.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop: 3-Column Layout */}
          <div className="hidden lg:grid lg:grid-cols-[1.2fr_2fr_1.2fr] gap-6 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[85vh]">
            {/* Left Column: Active Creator's Content */}
            <div className="space-y-3 overflow-y-auto max-h-[85vh]">
              <div className="flex items-center gap-2 mb-3">
                {activeCreator && (
                  <img
                    src={activeCreator.avatar_url}
                    alt={activeCreator.display_name || activeCreator.name}
                    className="w-6 h-6 rounded-full border border-white/30"
                  />
                )}
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  {activeCreator ? `${activeCreator.display_name || activeCreator.name}'s Content` : 'Recently Uploaded'}
                </h2>
              </div>

              {loadingPosts ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-slate-700 border-t-white rounded-full animate-spin" />
                </div>
              ) : activeCreatorPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                    <ImageIcon className="w-6 h-6 text-slate-500" />
                  </div>
                  <p className="text-slate-500 text-sm">No content yet</p>
                  <p className="text-slate-600 text-xs mt-1">This creator hasn't posted anything</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {activeCreatorPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => activeCreator && handleCreatorClick(activeCreator)}
                      className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer bg-slate-900"
                    >
                      {post.thumbnail_url ? (
                        <img
                          src={post.thumbnail_url}
                          alt={post.caption || 'Post'}
                          className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                            post.is_locked ? 'blur-md scale-110' : ''
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                      )}

                      {/* Locked overlay */}
                      {post.is_locked && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2 border border-white/20">
                            <Lock className="w-5 h-5 text-white" />
                          </div>
                          {post.unlock_price_cents > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                              ${(post.unlock_price_cents / 100).toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Video indicator */}
                      {post.post_type === 'video' && !post.is_locked && (
                        <div className="absolute top-2 right-2">
                          <Play className="w-4 h-4 text-white drop-shadow-lg" fill="white" />
                        </div>
                      )}

                      {/* Stats overlay */}
                      {!post.is_locked && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2 text-white text-[10px]">
                            <span>{post.view_count?.toLocaleString() || 0} views</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Center Column: Scrollable Creator Cards */}
            <div className="overflow-y-auto max-h-[85vh] space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {filteredCreators.map((creator, index) => {
                const isActive = index === activeCreatorIndex;
                return (
                  <div
                    key={creator.id}
                    onClick={() => setActiveCreatorIndex(index)}
                    className={`relative aspect-[9/16] rounded-3xl overflow-hidden bg-slate-900 cursor-pointer transition-all ${
                      isActive ? 'ring-2 ring-purple-500 shadow-2xl shadow-purple-500/20' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={(creator as any).card_image_url}
                      alt={creator.display_name || creator.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                    {/* Right Side Action Buttons */}
                    {user && (
                      <div className="absolute right-4 bottom-32 flex flex-col gap-4 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteClick(e, creator.id);
                          }}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors flex items-center justify-center">
                            <Heart
                              className={`w-6 h-6 ${
                                isFavorite(creator.id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-white'
                              }`}
                            />
                          </div>
                          <span className="text-white text-xs font-semibold">
                            {creator.followers > 1000
                              ? `${Math.floor(creator.followers / 1000)}K`
                              : creator.followers}
                          </span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCommentsModalCreator(creator);
                          }}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-white text-xs font-semibold">
                            Chat
                          </span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTipModalCreator(creator);
                          }}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:brightness-110 transition-all flex items-center justify-center shadow-lg">
                            <DollarSign className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-white text-xs font-semibold">Tip</span>
                        </button>
                      </div>
                    )}

                    {/* Creator Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={creator.avatar_url}
                          alt={creator.display_name || creator.name}
                          className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h2 className="text-white font-bold text-2xl mb-1 truncate">
                            {creator.display_name || creator.name}
                          </h2>
                          <p className="text-slate-300 text-sm mb-3">@{creator.handle.replace(/^@/, '')}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-300">
                            <div>
                              <span className="font-semibold text-white">{creator.followers.toLocaleString()}</span> followers
                            </div>
                            <div>
                              <span className="font-semibold text-white">{(creator.engagement_rate * 100).toFixed(1)}%</span> engagement
                            </div>
                          </div>
                        </div>
                      </div>

                      {creator.bio && (
                        <p className="text-white/90 text-sm mb-4 line-clamp-2">{creator.bio}</p>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreatorClick(creator);
                        }}
                        className="w-full py-3 bg-white text-black font-semibold rounded-full hover:bg-slate-100 transition-colors"
                      >
                        View Profile
                      </button>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold">
                          Viewing
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Featured & Trending */}
            <div className="space-y-6 overflow-y-auto max-h-[85vh]">
              {/* Featured */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Featured Priority
                  </h2>
                </div>
                <div className="space-y-3">
                  {featuredCreators.slice(0, 5).map((creator) => (
                    <div
                      key={creator.id}
                      onClick={() => handleCreatorClick(creator)}
                      className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer"
                    >
                      <img
                        src={(creator as any).card_image_url}
                        alt={creator.display_name || creator.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Top Left: Tier Badge & Favorite */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {creator.tier && getTierBadge(creator.tier)}
                        {user && (
                          <button
                            onClick={(e) => handleFavoriteClick(e, creator.id)}
                            className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors w-fit"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isFavorite(creator.id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-white'
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Top Right: Price & Status Badge */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        {getPriceBadge((creator as any).subscription_price || 5)}
                        {getBadge(creator, 'featured')}
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={creator.avatar_url}
                            alt={creator.display_name || creator.name}
                            className="w-8 h-8 rounded-full border-2 border-white"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">
                              {creator.display_name || creator.name}
                            </p>
                            <p className="text-slate-300 text-xs truncate">
                              {creator.followers.toLocaleString()} followers
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Trending Now
                  </h2>
                </div>
                <div className="space-y-3">
                  {trendingCreators.slice(0, 5).map((creator) => (
                    <div
                      key={creator.id}
                      onClick={() => handleCreatorClick(creator)}
                      className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer"
                    >
                      <img
                        src={(creator as any).card_image_url}
                        alt={creator.display_name || creator.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Top Left: Tier Badge & Favorite */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {creator.tier && getTierBadge(creator.tier)}
                        {user && (
                          <button
                            onClick={(e) => handleFavoriteClick(e, creator.id)}
                            className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors w-fit"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isFavorite(creator.id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-white'
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Top Right: Price & Status Badge */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        {getPriceBadge((creator as any).subscription_price || 5)}
                        {getBadge(creator, 'trending')}
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={creator.avatar_url}
                            alt={creator.display_name || creator.name}
                            className="w-8 h-8 rounded-full border-2 border-white"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">
                              {creator.display_name || creator.name}
                            </p>
                            <p className="text-slate-300 text-xs truncate">
                              {(creator.engagement_rate * 100).toFixed(1)}% engagement
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Scrollable View */}
          <div className="lg:hidden">
            <div className="p-4">
              {mobileView === 'center' && (
                <div className="space-y-4">
                  {filteredCreators.map((creator, index) => {
                    const isActive = index === activeCreatorIndex;
                    return (
                      <div
                        key={creator.id}
                        onClick={() => setActiveCreatorIndex(index)}
                        className={`relative aspect-[9/16] rounded-3xl overflow-hidden bg-slate-900 cursor-pointer transition-all ${
                          isActive ? 'ring-2 ring-purple-500 shadow-2xl shadow-purple-500/20' : 'opacity-80'
                        }`}
                      >
                        <img
                          src={(creator as any).card_image_url}
                          alt={creator.display_name || creator.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                        {/* Right Side Action Buttons */}
                        {user && (
                          <div className="absolute right-4 bottom-32 flex flex-col gap-3 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFavoriteClick(e, creator.id);
                              }}
                              className="flex flex-col items-center gap-1"
                            >
                              <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <Heart
                                  className={`w-6 h-6 ${
                                    isFavorite(creator.id)
                                      ? 'fill-red-500 text-red-500'
                                      : 'text-white'
                                  }`}
                                />
                              </div>
                              <span className="text-white text-xs font-semibold">
                                {creator.followers > 1000
                                  ? `${Math.floor(creator.followers / 1000)}K`
                                  : creator.followers}
                              </span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCommentsModalCreator(creator);
                              }}
                              className="flex flex-col items-center gap-1"
                            >
                              <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-white" />
                              </div>
                              <span className="text-white text-xs font-semibold">
                                Chat
                              </span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTipModalCreator(creator);
                              }}
                              className="flex flex-col items-center gap-1"
                            >
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                                <DollarSign className="w-6 h-6 text-white" />
                              </div>
                              <span className="text-white text-xs font-semibold">Tip</span>
                            </button>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <img
                              src={creator.avatar_url}
                              alt={creator.display_name || creator.name}
                              className="w-14 h-14 rounded-full border-3 border-white shadow-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h2 className="text-white font-bold text-xl mb-1 truncate">
                                {creator.display_name || creator.name}
                              </h2>
                              <p className="text-slate-300 text-sm mb-2">@{creator.handle.replace(/^@/, '')}</p>
                              <div className="flex items-center gap-3 text-xs text-slate-300">
                                <div>
                                  <span className="font-semibold text-white">{creator.followers.toLocaleString()}</span> followers
                                </div>
                                <div>
                                  <span className="font-semibold text-white">{(creator.engagement_rate * 100).toFixed(1)}%</span> engagement
                                </div>
                              </div>
                            </div>
                          </div>

                          {creator.bio && (
                            <p className="text-white/90 text-sm mb-4 line-clamp-2">{creator.bio}</p>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreatorClick(creator);
                            }}
                            className="w-full py-3 bg-white text-black font-semibold rounded-full"
                          >
                            View Profile
                          </button>
                        </div>

                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold">
                              Viewing
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {mobileView === 'uploaded' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    {activeCreator && (
                      <img
                        src={activeCreator.avatar_url}
                        alt={activeCreator.display_name || activeCreator.name}
                        className="w-6 h-6 rounded-full border border-white/30"
                      />
                    )}
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                      {activeCreator ? `${activeCreator.display_name || activeCreator.name}'s Content` : 'Recently Uploaded'}
                    </h2>
                  </div>

                  {loadingPosts ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-2 border-slate-700 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : activeCreatorPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                        <ImageIcon className="w-6 h-6 text-slate-500" />
                      </div>
                      <p className="text-slate-500 text-sm">No content yet</p>
                      <p className="text-slate-600 text-xs mt-1">This creator hasn't posted anything</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {activeCreatorPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => activeCreator && handleCreatorClick(activeCreator)}
                          className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer bg-slate-900"
                        >
                          {post.thumbnail_url ? (
                            <img
                              src={post.thumbnail_url}
                              alt={post.caption || 'Post'}
                              className={`w-full h-full object-cover ${
                                post.is_locked ? 'blur-md scale-110' : ''
                              }`}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                          )}

                          {/* Locked overlay */}
                          {post.is_locked && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2 border border-white/20">
                                <Lock className="w-5 h-5 text-white" />
                              </div>
                              {post.unlock_price_cents > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                                  ${(post.unlock_price_cents / 100).toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Video indicator */}
                          {post.post_type === 'video' && !post.is_locked && (
                            <div className="absolute top-2 right-2">
                              <Play className="w-4 h-4 text-white drop-shadow-lg" fill="white" />
                            </div>
                          )}

                          {/* Stats overlay */}
                          {!post.is_locked && (
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                              <div className="flex items-center gap-2 text-white text-[10px]">
                                <span>{post.view_count?.toLocaleString() || 0} views</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {mobileView === 'featured' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-amber-400" />
                      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                        Featured Priority
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {featuredCreators.slice(0, 5).map((creator) => (
                        <div
                          key={creator.id}
                          onClick={() => handleCreatorClick(creator)}
                          className="relative aspect-[9/16] rounded-2xl overflow-hidden"
                        >
                          <img
                            src={(creator as any).card_image_url}
                            alt={creator.display_name || creator.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Top Left: Tier Badge & Favorite */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {creator.tier && getTierBadge(creator.tier)}
                            {user && (
                              <button
                                onClick={(e) => handleFavoriteClick(e, creator.id)}
                                className="p-2 rounded-full bg-black/50 backdrop-blur-sm w-fit"
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    isFavorite(creator.id)
                                      ? 'fill-red-500 text-red-500'
                                      : 'text-white'
                                  }`}
                                />
                              </button>
                            )}
                          </div>

                          {/* Top Right: Price & Status Badge */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                            {getPriceBadge((creator as any).subscription_price || 5)}
                            {getBadge(creator, 'featured')}
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={creator.avatar_url}
                                alt={creator.display_name || creator.name}
                                className="w-8 h-8 rounded-full border-2 border-white"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm truncate">
                                  {creator.display_name || creator.name}
                                </p>
                                <p className="text-slate-300 text-xs truncate">
                                  {creator.followers.toLocaleString()} followers
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                        Trending Now
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {trendingCreators.slice(0, 5).map((creator) => (
                        <div
                          key={creator.id}
                          onClick={() => handleCreatorClick(creator)}
                          className="relative aspect-[9/16] rounded-2xl overflow-hidden"
                        >
                          <img
                            src={(creator as any).card_image_url}
                            alt={creator.display_name || creator.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Top Left: Tier Badge & Favorite */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {creator.tier && getTierBadge(creator.tier)}
                            {user && (
                              <button
                                onClick={(e) => handleFavoriteClick(e, creator.id)}
                                className="p-2 rounded-full bg-black/50 backdrop-blur-sm w-fit"
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    isFavorite(creator.id)
                                      ? 'fill-red-500 text-red-500'
                                      : 'text-white'
                                  }`}
                                />
                              </button>
                            )}
                          </div>

                          {/* Top Right: Price & Status Badge */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                            {getPriceBadge((creator as any).subscription_price || 5)}
                            {getBadge(creator, 'trending')}
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={creator.avatar_url}
                                alt={creator.display_name || creator.name}
                                className="w-8 h-8 rounded-full border-2 border-white"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm truncate">
                                  {creator.display_name || creator.name}
                                </p>
                                <p className="text-slate-300 text-xs truncate">
                                  {(creator.engagement_rate * 100).toFixed(1)}% engagement
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tipModalCreator && (
        <TipModal
          creator={tipModalCreator}
          onClose={() => setTipModalCreator(null)}
        />
      )}

      {commentsModalCreator && (
        <CommentsModal
          creator={commentsModalCreator}
          currentUserId={user?.id}
          onClose={() => setCommentsModalCreator(null)}
        />
      )}
    </div>
  );
}
