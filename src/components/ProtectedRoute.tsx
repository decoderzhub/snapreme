import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Creator } from '../types/database';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [creatorProfile, setCreatorProfile] = useState<Creator | null>(null);
  const [checkingCreator, setCheckingCreator] = useState(true);

  useEffect(() => {
    async function loadCreatorProfile() {
      if (!user) {
        setCreatorProfile(null);
        setCheckingCreator(false);
        return;
      }

      const { data } = await supabase
        .from('creators')
        .select('id, onboarding_complete')
        .eq('user_id', user.id)
        .maybeSingle();

      setCreatorProfile((data as Creator) || null);
      setCheckingCreator(false);
    }

    loadCreatorProfile();
  }, [user]);

  if (loading || checkingCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50/60 to-transparent">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const needsOnboarding =
    creatorProfile && creatorProfile.onboarding_complete === false;

  if (
    needsOnboarding &&
    location.pathname !== '/onboarding' &&
    location.pathname !== '/account/settings'
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
