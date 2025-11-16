import { MessageCircle, BadgeCheck } from 'lucide-react';
import { Influencer } from '../types/influencer';

interface InfluencerCardProps {
  influencer: Influencer;
}

export default function InfluencerCard({ influencer }: InfluencerCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 hover:shadow-card-hover hover:-translate-y-1 hover:shadow-glow transition-all duration-300 ease-out overflow-hidden group">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={influencer.imageUrl}
          alt={influencer.name}
          className="w-full h-full object-cover"
        />
        {influencer.badge && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white shadow-lg">
              {influencer.badge}
            </span>
          </div>
        )}
        {influencer.verified && (
          <div className="absolute top-3 right-3">
            <BadgeCheck className="w-6 h-6 text-blue-600 fill-white" />
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{influencer.name}</h3>
            <p className="text-sm text-blue-600 font-medium">{influencer.title}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
          {influencer.description}
        </p>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Followers</p>
            <p className="text-lg font-semibold text-slate-900">{influencer.followers}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Starting At</p>
            <p className="text-lg font-semibold text-slate-900">{influencer.startingRate}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {influencer.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md">
            View Profile
          </button>
          <button className="p-2.5 border border-slate-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all duration-200 group">
            <MessageCircle className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
