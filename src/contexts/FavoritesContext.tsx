import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favorites: Set<string>;
  toggleFavorite: (creatorId: string) => Promise<void>;
  isFavorite: (creatorId: string) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites(new Set());
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('favorites')
      .select('creator_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setFavorites(new Set(data.map((f) => f.creator_id)));
    }
    setLoading(false);
  };

  const toggleFavorite = async (creatorId: string) => {
    if (!user) return;

    const isFav = favorites.has(creatorId);

    if (isFav) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('creator_id', creatorId);

      if (!error) {
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(creatorId);
          return next;
        });
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, creator_id: creatorId });

      if (!error) {
        setFavorites((prev) => new Set(prev).add(creatorId));
      }
    }
  };

  const isFavorite = (creatorId: string) => favorites.has(creatorId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
