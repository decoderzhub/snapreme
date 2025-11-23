import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MoreVertical, CheckCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import type { Creator } from '../types/database';

interface HorizontalCreatorCardProps {
  creators: Creator[];
  title: string;
  showPromoTag?: boolean;
  description?: string;
}

export function HorizontalCreatorCard({ creators, title, showPromoTag, description }: HorizontalCreatorCardProps) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    updateScrollButtons();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', updateScrollButtons);
      return () => ref.removeEventListener('scroll', updateScrollButtons);
    }
  }, [creators]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });

    const cardWidth = scrollRef.current.clientWidth * 0.8;
    const newIndex = direction === 'left'
      ? Math.max(0, currentIndex - 1)
      : Math.min(creators.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
  };

  const goToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
    setCurrentIndex(index);
  };

  if (creators.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            {title}
          </h2>
          {showPromoTag && (
            <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full">
              PROMOTED
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-1.5 rounded-full transition-all ${
              canScrollLeft
                ? 'hover:bg-slate-100 text-slate-700'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-1.5 rounded-full transition-all ${
              canScrollRight
                ? 'hover:bg-slate-100 text-slate-700'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {description && (
        <p className="text-xs text-slate-500 mb-4">{description}</p>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {creators.map((creator) => {
          const cleanHandle = creator.handle?.replace('@', '') || '';
          const coverImage = (creator as any).card_image_url || creator.cover_url || '/assets/snapreme-default-banner.svg';
          const isFree = (creator as any).subscription_price === 0;

          return (
            <div
              key={creator.id}
              className="flex-shrink-0 w-[85%] snap-center"
            >
              <div className="relative w-full h-36 rounded-2xl overflow-hidden group">
                <button
                  onClick={() => cleanHandle && navigate(`/creator/${cleanHandle}`)}
                  className="w-full h-full"
                >
                  <img
                    src={coverImage}
                    alt={creator.display_name || creator.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {isFree && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-emerald-500 rounded text-white text-[10px] font-bold">
                      Free
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full ring-3 ring-white/80 overflow-hidden flex-shrink-0">
                      <img
                        src={creator.avatar_url || '/assets/snapreme_icon.png'}
                        alt={creator.display_name || creator.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1">
                        <h3 className="text-white font-semibold text-sm truncate">
                          {creator.display_name || creator.name}
                        </h3>
                        {creator.is_verified && (
                          <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-white/80 text-xs truncate">
                        {creator.handle}
                      </p>
                    </div>
                  </div>
                </button>

                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(creator.id);
                    }}
                    className="w-7 h-7 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition-colors z-10"
                    aria-label={isFavorite(creator.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={`w-4 h-4 transition-all ${
                        isFavorite(creator.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-white'
                      }`}
                    />
                  </button>
                  <button className="w-6 h-6 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
                    <MoreVertical className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-4">
        {creators.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex
                ? 'w-6 bg-slate-700'
                : 'w-1.5 bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
