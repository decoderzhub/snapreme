import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, FileText, TrendingUp } from 'lucide-react';
import StatsBar from '../components/StatsBar';
import FiltersBar from '../components/FiltersBar';
import CreatorCard from '../components/CreatorCard';
import CreatorModal from '../components/CreatorModal';
import CampaignCard from '../components/CampaignCard';
import { supabase } from '../lib/supabase';
import { Creator, Campaign, FilterState } from '../types/database';

export default function Network() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    niche: searchParams.get('niche') || 'All',
    tier: searchParams.get('tier') || 'Any',
    region: searchParams.get('region') || 'Global',
    minFollowers: searchParams.get('minFollowers') || 'Any',
  });

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.niche !== 'All') params.niche = filters.niche;
    if (filters.tier !== 'Any') params.tier = filters.tier;
    if (filters.region !== 'Global') params.region = filters.region;
    if (filters.minFollowers !== 'Any') params.minFollowers = filters.minFollowers;

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: creatorsData, error: creatorsError } = await supabase
          .from('creators')
          .select('*')
          .order('followers', { ascending: false });

        if (creatorsError) throw creatorsError;

        const creatorsWithNiches = await Promise.all(
          (creatorsData || []).map(async (creator) => {
            const { data: niches } = await supabase
              .from('creator_niches')
              .select('niche')
              .eq('creator_id', creator.id);

            return {
              ...creator,
              niches: niches?.map((n) => n.niche) || [],
            };
          })
        );

        setCreators(creatorsWithNiches);

        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('is_active', true)
          .order('deadline', { ascending: true });

        if (campaignsError) throw campaignsError;

        const campaignsWithDetails = await Promise.all(
          (campaignsData || []).map(async (campaign) => {
            const { data: niches } = await supabase
              .from('campaign_niches')
              .select('niche')
              .eq('campaign_id', campaign.id);

            const { data: regions } = await supabase
              .from('campaign_regions')
              .select('region')
              .eq('campaign_id', campaign.id);

            return {
              ...campaign,
              niches: niches?.map((n) => n.niche) || [],
              regions: regions?.map((r) => r.region) || [],
            };
          })
        );

        setCampaigns(campaignsWithDetails);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          creator.name.toLowerCase().includes(searchLower) ||
          creator.handle.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.niche !== 'All') {
        if (!creator.niches?.includes(filters.niche)) return false;
      }

      if (filters.tier !== 'Any') {
        if (creator.tier !== filters.tier) return false;
      }

      if (filters.region !== 'Global') {
        if (creator.region !== filters.region) return false;
      }

      if (filters.minFollowers !== 'Any') {
        const minFollowers = parseInt(filters.minFollowers.replace(/\D/g, '')) * 1000;
        if (creator.followers < minFollowers) return false;
      }

      return true;
    });
  }, [creators, filters]);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-12 md:py-16 bg-gradient-to-b from-blue-50/60 to-transparent overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
              Snapreme Network
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Connect with verified Snapchat creators, discover new collaborations, and showcase your premium stories in a professional profile built for brands.
            </p>
          </div>

          <StatsBar />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FiltersBar filters={filters} onFilterChange={setFilters} />

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)] gap-8">
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-2xl h-[600px] animate-pulse" />
                ))}
              </div>
            ) : filteredCreators.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No creators found</h3>
                <p className="text-slate-600">Try adjusting your filters to see more results</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCreators.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    onClick={() => setSelectedCreator(creator)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="xl:sticky xl:top-24 xl:self-start">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Live Brand Campaigns</h2>
                <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
                  View All
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Browse active campaigns and apply with your Snapreme Network profile.
              </p>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-slate-100 rounded-xl h-48 animate-pulse" />
                  ))}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-600">No active campaigns</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="mt-16 py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why creators love Snapreme Network
            </h2>
            <p className="text-slate-600 mb-12">
              Join thousands of creators who are building successful partnerships
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Be discoverable by serious brands
                </h3>
                <p className="text-sm text-slate-600">
                  Get found by brands actively looking for creators in your niche
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Centralize your Snapchat pitch
                </h3>
                <p className="text-sm text-slate-600">
                  One professional profile for all your brand collaborations
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  See your collab history and performance
                </h3>
                <p className="text-sm text-slate-600">
                  Track your earnings and showcase successful partnerships
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/apply"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
              >
                Apply as a Creator
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Already a member? Log in
              </Link>
            </div>
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
