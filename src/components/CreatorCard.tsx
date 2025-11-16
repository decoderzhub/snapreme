import { MessageCircle, UserPlus, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Creator } from '../types/database';
import { useAuth } from '../contexts/AuthContext';

interface CreatorCardProps {
  creator: Creator;
  onClick: () => void;
}

export default function CreatorCard({ creator, onClick }: CreatorCardProps) {
  const { user } = useAuth();
  const isOwnProfile = user?.id === creator.user_id;

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Elite':
        return 'bg-yellow-500/90 text-white';
      case 'Pro':
        return 'bg-blue-600/90 text-white';
      case 'Rising':
        return 'bg-orange-500/90 text-white';
      default:
        return 'bg-slate-600/90 text-white';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.06)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(15,23,42,0.12)] transition-all duration-300 ease-out overflow-hidden group cursor-pointer">
      <div className="relative aspect-[4/5] overflow-hidden" onClick={onClick}>
        <img
          src={creator.cover_url || 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={creator.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${getTierColor(creator.tier)}`}>
            {creator.tier} Creator
          </span>
          {isOwnProfile && (
            <span className="px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm bg-green-500/90 text-white">
              Your Profile
            </span>
          )}
        </div>

        <button
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <UserPlus className="w-4 h-4 text-blue-600" />
        </button>

        {creator.avatar_url && (
          <div className="absolute bottom-3 left-3">
            <img
              src={creator.avatar_url}
              alt={creator.name}
              className="h-14 w-14 rounded-full border-4 border-white shadow-lg"
            />
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-slate-900">{creator.name}</h3>
          <p className="text-sm text-blue-600 font-medium">{creator.handle}</p>
        </div>

        {creator.bio && (
          <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
            {creator.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {creator.niches?.slice(0, 3).map((niche) => (
            <span
              key={niche}
              className="inline-flex rounded-full bg-blue-50 text-blue-600 px-3 py-1 text-xs font-medium"
            >
              {niche}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Followers</p>
            <p className="text-lg font-semibold text-slate-900">{formatFollowers(creator.followers)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Engagement</p>
            <p className="text-lg font-semibold text-slate-900">{creator.engagement_rate}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Starting At</p>
            <p className="text-lg font-semibold text-slate-900">{formatPrice(creator.starting_rate)}</p>
          </div>
        </div>

        {creator.region && (
          <p className="text-xs text-slate-500 mb-4">
            <span className="font-medium">Region:</span> {creator.region}
          </p>
        )}

        <div className="flex items-center gap-2">
          {isOwnProfile ? (
            <Link
              to="/account/settings"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md text-center flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Link>
          ) : (
            <>
              <Link
                to={`/creator/${creator.handle.replace('@', '')}`}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md text-center"
              >
                View Profile
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="p-2.5 border border-slate-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all duration-200 group"
              >
                <MessageCircle className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
