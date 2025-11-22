import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Creator } from '../types/database';
import CreatorCard from './CreatorCard';
import CreatorModal from './CreatorModal';

export default function InfluencerGrid() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreators() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('creators')
          .select('*')
          .order('followers', { ascending: false })
          .limit(6);

        if (error) throw error;
        setCreators((data || []) as Creator[]);
      } catch (err) {
        console.error('Error loading creators:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCreators();
  }, []);

  return (
    <>
      <section id="influencers" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
              Meet our Snapreme creators
            </h2>

            <p className="mt-3 text-base sm:text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
              Discover creators sharing premium, story-style content with their biggest fans.
              From fitness and lifestyle to gaming, beauty, and more — Snapreme makes it easy
              to find creators you actually connect with.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[420px] bg-slate-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : creators.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-600">No creators available yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {creators.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  onClick={() => setSelectedCreator(creator)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedCreator && (
        <CreatorModal
          creator={selectedCreator}
          onClose={() => setSelectedCreator(null)}
        />
      )}
    </>
  );
}
