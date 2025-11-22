import { Creator } from '../types/database';
import { Heart } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';

interface Props {
  creator: Creator;
  onClick?: () => void;
}

export default function CreatorCard({ creator, onClick }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!creator.card_image_url || !creator.avatar_url) return null;

  const cover = creator.card_image_url;
  const price = creator.subscription_price || 5;
  const favorited = isFavorite(creator.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(creator.id);
  };

  return (
    <button
      onClick={onClick}
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

        <div className="absolute bottom-0 p-4 text-left space-y-1">
          <p className="text-white text-lg font-semibold leading-tight">
            {creator.display_name || creator.name}
          </p>
          <p className="text-white/80 text-sm">{creator.handle}</p>

          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 text-[11px] bg-white/20 text-white rounded-full">
              {creator.category || 'Creator'}
            </span>
            {creator.is_priority && (
              <span className="px-2 py-0.5 text-[11px] bg-orange-500 text-white rounded-full">
                Featured
              </span>
            )}
          </div>
        </div>

        <div className="absolute top-3 left-3">
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

        <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
          <Heart className="w-3 h-3 text-pink-400" />
          <span>${price}/mo</span>
        </div>
      </div>
    </button>
  );
}
