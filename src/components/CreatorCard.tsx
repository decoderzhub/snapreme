import { Creator } from '../types/database';
import { Heart, TrendingUp, Star, Crown } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  creator: Creator;
  onClick?: () => void;
}

export default function CreatorCard({ creator, onClick }: Props) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  if (!creator.card_image_url || !creator.avatar_url) return null;

  const cover = creator.card_image_url;
  const price = creator.subscription_price || 5;
  const favorited = isFavorite(creator.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(creator.id);
  };

  const getTierStyle = (tier: 'Rising' | 'Pro' | 'Elite') => {
    const styles = {
      Rising: {
        icon: TrendingUp,
        gradient: 'from-emerald-500 to-teal-500',
        iconColor: 'text-emerald-300'
      },
      Pro: {
        icon: Star,
        gradient: 'from-blue-500 to-cyan-500',
        iconColor: 'text-blue-300'
      },
      Elite: {
        icon: Crown,
        gradient: 'from-amber-500 to-orange-500',
        iconColor: 'text-amber-300'
      }
    };
    return styles[tier];
  };

  const tierStyle = getTierStyle(creator.tier);
  const TierIcon = tierStyle.icon;

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      const cleanHandle = creator.handle?.replace('@', '') || '';
      if (cleanHandle) {
        navigate(`/creator/${cleanHandle}`);
      }
    }
  };

  return (
    <button
      onClick={handleCardClick}
      className="w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden
                 hover:shadow-md transition-all active:scale-[0.99]"
    >
      <div className="relative h-[420px] w-full">
        <img
          src={cover}
          alt={creator.display_name}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

        <div className={`absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r ${tierStyle.gradient} rounded-full flex items-center gap-1.5 shadow-lg`}>
          <TierIcon className="w-3.5 h-3.5 text-white" />
          <span className="text-white text-xs font-semibold">{creator.tier}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
          <div className="text-left space-y-1 flex-1">
            <p className="text-white text-lg font-semibold leading-tight">
              {creator.display_name || creator.name}
            </p>
            <p className="text-white/80 text-sm">{creator.handle}</p>

            <div className="flex items-center flex-wrap gap-2 mt-1">
              <span className="px-2 py-0.5 text-[11px] bg-white/20 text-white rounded-full">
                {creator.category || 'Creator'}
              </span>
              {creator.is_priority && (
                <span className="px-2 py-0.5 text-[11px] bg-orange-500 text-white rounded-full">
                  Featured
                </span>
              )}
              {creator.niches?.slice(0, 3).map((niche) => (
                <span key={niche} className="px-2 py-0.5 text-[11px] bg-blue-500/80 text-white rounded-full">
                  {niche}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 ml-3">
            <img
              src={creator.avatar_url}
              alt={creator.name}
              className="w-16 h-16 rounded-full border-2 border-white shadow-lg object-cover"
            />
          </div>
        </div>

        {user && (
          <div className="absolute top-14 left-3">
            <button
              onClick={handleFavoriteClick}
              className="p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
              aria-label="Toggle favorite"
            >
              <Heart
                className={`w-4 h-4 ${favorited ? 'fill-pink-500 text-pink-500' : 'text-white'}`}
              />
            </button>
          </div>
        )}

        <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
          <Heart className="w-3 h-3 text-pink-400" />
          <span>${price}/mo</span>
        </div>
      </div>
    </button>
  );
}
