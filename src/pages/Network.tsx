import { useState, useEffect, useMemo } from 'react';
import { Search, Flame, Star, TrendingUp, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Creator } from '../types/database';
import CreatorCard from '../components/CreatorCard';
import CreatorModal from '../components/CreatorModal';
import { useFavorites } from '../contexts/FavoritesContext';

export default function Network() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'for-you' | 'trending' | 'new' | 'rising' | 'favorites'>('for-you');
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

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

  const topCreators = useMemo(
    () => [...completeCreators].sort((a, b) => b.followers - a.followers).slice(0, 5),
    [completeCreators]
  );

  const risingCreators = useMemo(
    () => [...completeCreators].sort((a, b) => b.engagement_rate - a.engagement_rate).slice(0, 5),
    [completeCreators]
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <section className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Explore creators
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Discover premium Snapreme creators, trending profiles, and rising talent.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search creators by name or @handle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-full bg-white border border-slate-200 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'for-you', label: 'For you' },
                { id: 'trending', label: 'Trending' },
                { id: 'new', label: 'New' },
                { id: 'rising', label: 'Rising' },
                { id: 'favorites', label: 'Favorites' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setActiveCategory(chip.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                    activeCategory === chip.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-[420px] bg-white rounded-3xl shadow-sm animate-pulse" />
                  ))}
                </div>
              ) : filteredCreators.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-dashed border-slate-200">
                  <p className="text-sm text-slate-600">
                    No creators match your filters yet. Try clearing your search or changing categories.
                  </p>
                </div>
              ) : (
                filteredCreators.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    onClick={() => setSelectedCreator(creator)}
                  />
                ))
              )}
            </div>

            <aside className="hidden lg:block space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h2 className="text-sm font-semibold text-slate-900">
                      Featured & priority creators
                    </h2>
                  </div>
                  <span className="text-[11px] text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full">
                    Promoted
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4">
                  Creators highlighted here get extra visibility across Snapreme. Later you can turn this into a paid promotion slot.
                </p>

                <div className="space-y-3">
                  {topCreators.slice(0, 3).map((creator) => (
                    <button
                      key={creator.id}
                      onClick={() => setSelectedCreator(creator)}
                      className="w-full flex items-center gap-3 text-left hover:bg-slate-50 rounded-2xl px-2 py-2.5"
                    >
                      <img
                        src={creator.avatar_url || (creator as any).card_image_url || '/assets/snapreme-default-banner.svg'}
                        alt={creator.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {creator.display_name || creator.name}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {creator.handle}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {creator.followers.toLocaleString()} fans
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 space-y-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h2 className="text-sm font-semibold text-slate-900">Trending now</h2>
                </div>

                <div className="space-y-3">
                  {risingCreators.map((creator) => (
                    <div
                      key={creator.id}
                      className="w-full flex items-center gap-3 hover:bg-slate-50 rounded-2xl px-2 py-2.5"
                    >
                      <button
                        onClick={() => setSelectedCreator(creator)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <img
                          src={creator.avatar_url || (creator as any).card_image_url || '/assets/snapreme-default-banner.svg'}
                          alt={creator.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                            {creator.display_name || creator.name}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            High engagement • {creator.engagement_rate.toFixed(1)}%
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(creator.id);
                        }}
                        className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                        aria-label="Toggle favorite"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isFavorite(creator.id)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>

      {selectedCreator && (
        <CreatorModal
          creator={selectedCreator}
          onClose={() => setSelectedCreator(null)}
        />
      )}
    </div>
  );
}
