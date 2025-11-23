import { useState, useEffect, useMemo } from 'react';
import { Search, Flame, Star, ChevronLeft, ChevronRight, Heart, TrendingUp, Sparkles, MessageCircle, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Creator } from '../types/database';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import TipModal from '../components/TipModal';

export default function Network() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'for-you' | 'trending' | 'new' | 'rising' | 'favorites'>('for-you');
  const [loading, setLoading] = useState(true);
  const [activeCreatorIndex, setActiveCreatorIndex] = useState(0);
  const [mobileView, setMobileView] = useState<'uploaded' | 'center' | 'featured'>('center');
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [tipModalCreator, setTipModalCreator] = useState<Creator | null>(null);

  useEffect(() => {
    async function fetchCreators() {
      setLoading(true);
      try {
        const { data: creatorsData, error } = await supabase
          .from('creators')
          .select('*')
          .order('followers', { ascending: false });

        if (error) throw error;

        setCreators((creatorsData || []) as Creator[]);
      } catch (err) {
        console.error('Error loading creators:', err);
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

    if (activeCategory === 'favorites') {
      list = list.filter((creator) => favorites.has(creator.id));
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (creator) =>
          creator.name.toLowerCase().includes(s) ||
          creator.handle.toLowerCase().includes(s) ||
          creator.display_name?.toLowerCase().includes(s)
      );
    }

    switch (activeCategory) {
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
  }, [completeCreators, search, activeCategory, favorites]);

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

          {/* Category Filters */}
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
                    setActiveCategory(chip.id as any);
                    setActiveCreatorIndex(0);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCategory === chip.id
                      ? 'bg-white text-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
          </div>
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
            {/* Left Column: Uploaded Content */}
            <div className="space-y-3 overflow-y-auto max-h-[85vh]">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Recently Uploaded
              </h2>
              {uploadedCreators.map((creator) => (
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

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {getBadge(creator, 'new')}
                  </div>

                  {/* Favorite Button */}
                  {user && (
                    <button
                      onClick={(e) => handleFavoriteClick(e, creator.id)}
                      className="absolute top-3 left-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
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

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={creator.avatar_url}
                        alt={creator.display_name || creator.name}
                        className="w-8 h-8 rounded-full border-2 border-white"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {creator.display_name || creator.name}
                        </p>
                        <p className="text-slate-300 text-xs truncate">@{creator.handle.replace(/^@/, '')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Center Column: Main Creator */}
            <div className="relative">
              {activeCreator && (
                <div className="sticky top-6">
                  <div className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
                    <img
                      src={(activeCreator as any).card_image_url}
                      alt={activeCreator.display_name || activeCreator.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                    {/* Right Side Action Buttons */}
                    {user && (
                      <div className="absolute right-4 bottom-32 flex flex-col gap-4 z-10">
                        <button
                          onClick={(e) => handleFavoriteClick(e, activeCreator.id)}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors flex items-center justify-center">
                            <Heart
                              className={`w-6 h-6 ${
                                isFavorite(activeCreator.id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-white'
                              }`}
                            />
                          </div>
                          <span className="text-white text-xs font-semibold">
                            {activeCreator.followers > 1000
                              ? `${Math.floor(activeCreator.followers / 1000)}K`
                              : activeCreator.followers}
                          </span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Message creator');
                          }}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-white text-xs font-semibold">
                            {Math.floor(Math.random() * 200) + 50}
                          </span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTipModalCreator(activeCreator);
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
                          src={activeCreator.avatar_url}
                          alt={activeCreator.display_name || activeCreator.name}
                          className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h2 className="text-white font-bold text-2xl mb-1 truncate">
                            {activeCreator.display_name || activeCreator.name}
                          </h2>
                          <p className="text-slate-300 text-sm mb-3">@{activeCreator.handle.replace(/^@/, '')}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-300">
                            <div>
                              <span className="font-semibold text-white">{activeCreator.followers.toLocaleString()}</span> followers
                            </div>
                            <div>
                              <span className="font-semibold text-white">{(activeCreator.engagement_rate * 100).toFixed(1)}%</span> engagement
                            </div>
                          </div>
                        </div>
                      </div>

                      {activeCreator.bio && (
                        <p className="text-white/90 text-sm mb-4 line-clamp-2">{activeCreator.bio}</p>
                      )}

                      <button
                        onClick={() => handleCreatorClick(activeCreator)}
                        className="w-full py-3 bg-white text-black font-semibold rounded-full hover:bg-slate-100 transition-colors"
                      >
                        View Profile
                      </button>
                    </div>

                    {/* Navigation Arrows */}
                    {activeCreatorIndex > 0 && (
                      <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                    )}
                    {activeCreatorIndex < filteredCreators.length - 1 && (
                      <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 mt-4">
                    {filteredCreators.slice(Math.max(0, activeCreatorIndex - 2), Math.min(filteredCreators.length, activeCreatorIndex + 3)).map((_, idx) => {
                      const actualIndex = Math.max(0, activeCreatorIndex - 2) + idx;
                      return (
                        <button
                          key={actualIndex}
                          onClick={() => setActiveCreatorIndex(actualIndex)}
                          className={`h-1.5 rounded-full transition-all ${
                            actualIndex === activeCreatorIndex
                              ? 'w-8 bg-white'
                              : 'w-1.5 bg-slate-700 hover:bg-slate-600'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
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

                      {/* Badge */}
                      <div className="absolute top-3 right-3">
                        {getBadge(creator, 'featured')}
                      </div>

                      {/* Favorite Button */}
                      {user && (
                        <button
                          onClick={(e) => handleFavoriteClick(e, creator.id)}
                          className="absolute top-3 left-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
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

                      {/* Badge */}
                      <div className="absolute top-3 right-3">
                        {getBadge(creator, 'trending')}
                      </div>

                      {/* Favorite Button */}
                      {user && (
                        <button
                          onClick={(e) => handleFavoriteClick(e, creator.id)}
                          className="absolute top-3 left-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
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

          {/* Mobile: Swipeable View */}
          <div className="lg:hidden">
            {/* Mobile Navigation */}
            <div className="flex border-b border-slate-800 bg-slate-950">
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

            <div className="p-4">
              {mobileView === 'center' && activeCreator && (
                <div className="space-y-4">
                  <div className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
                    <img
                      src={(activeCreator as any).card_image_url}
                      alt={activeCreator.display_name || activeCreator.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                    {/* Right Side Action Buttons */}
                    {user && (
                      <div className="absolute right-4 bottom-32 flex flex-col gap-3 z-10">
                        <button
                          onClick={(e) => handleFavoriteClick(e, activeCreator.id)}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                            <Heart
                              className={`w-6 h-6 ${
                                isFavorite(activeCreator.id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-white'
                              }`}
                            />
                          </div>
                          <span className="text-white text-xs font-semibold">
                            {activeCreator.followers > 1000
                              ? `${Math.floor(activeCreator.followers / 1000)}K`
                              : activeCreator.followers}
                          </span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Message creator');
                          }}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-white text-xs font-semibold">
                            {Math.floor(Math.random() * 200) + 50}
                          </span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTipModalCreator(activeCreator);
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
                          src={activeCreator.avatar_url}
                          alt={activeCreator.display_name || activeCreator.name}
                          className="w-14 h-14 rounded-full border-3 border-white shadow-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h2 className="text-white font-bold text-xl mb-1 truncate">
                            {activeCreator.display_name || activeCreator.name}
                          </h2>
                          <p className="text-slate-300 text-sm mb-2">@{activeCreator.handle.replace(/^@/, '')}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-300">
                            <div>
                              <span className="font-semibold text-white">{activeCreator.followers.toLocaleString()}</span> followers
                            </div>
                            <div>
                              <span className="font-semibold text-white">{(activeCreator.engagement_rate * 100).toFixed(1)}%</span> engagement
                            </div>
                          </div>
                        </div>
                      </div>

                      {activeCreator.bio && (
                        <p className="text-white/90 text-sm mb-4 line-clamp-2">{activeCreator.bio}</p>
                      )}

                      <button
                        onClick={() => handleCreatorClick(activeCreator)}
                        className="w-full py-3 bg-white text-black font-semibold rounded-full"
                      >
                        View Profile
                      </button>
                    </div>

                    {activeCreatorIndex > 0 && (
                      <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                    )}
                    {activeCreatorIndex < filteredCreators.length - 1 && (
                      <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1.5">
                    {filteredCreators.slice(Math.max(0, activeCreatorIndex - 2), Math.min(filteredCreators.length, activeCreatorIndex + 3)).map((_, idx) => {
                      const actualIndex = Math.max(0, activeCreatorIndex - 2) + idx;
                      return (
                        <button
                          key={actualIndex}
                          onClick={() => setActiveCreatorIndex(actualIndex)}
                          className={`h-1.5 rounded-full transition-all ${
                            actualIndex === activeCreatorIndex
                              ? 'w-8 bg-white'
                              : 'w-1.5 bg-slate-700'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {mobileView === 'uploaded' && (
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Recently Uploaded
                  </h2>
                  {uploadedCreators.map((creator) => (
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

                      {/* Badge */}
                      <div className="absolute top-3 right-3">
                        {getBadge(creator, 'new')}
                      </div>

                      {/* Favorite Button */}
                      {user && (
                        <button
                          onClick={(e) => handleFavoriteClick(e, creator.id)}
                          className="absolute top-3 left-3 p-2 rounded-full bg-black/50 backdrop-blur-sm"
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

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={creator.avatar_url}
                            alt={creator.display_name || creator.name}
                            className="w-8 h-8 rounded-full border-2 border-white"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">
                              {creator.display_name || creator.name}
                            </p>
                            <p className="text-slate-300 text-xs truncate">@{creator.handle.replace(/^@/, '')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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

                          {/* Badge */}
                          <div className="absolute top-3 right-3">
                            {getBadge(creator, 'featured')}
                          </div>

                          {/* Favorite Button */}
                          {user && (
                            <button
                              onClick={(e) => handleFavoriteClick(e, creator.id)}
                              className="absolute top-3 left-3 p-2 rounded-full bg-black/50 backdrop-blur-sm"
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

                          {/* Badge */}
                          <div className="absolute top-3 right-3">
                            {getBadge(creator, 'trending')}
                          </div>

                          {/* Favorite Button */}
                          {user && (
                            <button
                              onClick={(e) => handleFavoriteClick(e, creator.id)}
                              className="absolute top-3 left-3 p-2 rounded-full bg-black/50 backdrop-blur-sm"
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
    </div>
  );
}
