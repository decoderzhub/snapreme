import { useState } from 'react';
import { demoCreators } from '../data/demoCreators';
import CreatorCard from './CreatorCard';
import CreatorModal from './CreatorModal';

export default function InfluencerGrid() {
  const [selectedCreator, setSelectedCreator] = useState<typeof demoCreators[0] | null>(null);

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

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {demoCreators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onClick={() => setSelectedCreator(creator)}
              />
            ))}
          </div>
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
