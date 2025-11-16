import { influencers } from '../data/influencers';
import InfluencerCard from './InfluencerCard';

export default function InfluencerGrid() {
  return (
    <section id="influencers" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
            Meet Our Snapreme Creators
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Discover verified Snapchat creators ready to boost your brand, drive traffic, and grow loyal communities.
            Every creator is vetted for quality, consistency, and audience fit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {influencers.map((influencer) => (
            <InfluencerCard key={influencer.id} influencer={influencer} />
          ))}
        </div>
      </div>
    </section>
  );
}
