import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUserProfile } from '../lib/profileHelpers';
import type { Creator } from '../types/database';
import { Sparkles, Edit3, Eye } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { profile } = await getCurrentUserProfile();
      setProfile(profile);
      setLoading(false);
    }
    load();
  }, []);

  const handleSlug =
    (profile?.handle || '')
      .replace(/^@/, '')
      .trim() || 'your-handle';

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-[0.2em] mb-2">
            Creator dashboard
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Welcome{profile?.display_name ? `, ${profile.display_name}` : user?.email ? `, ${user.email}` : ''}.
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            This is your home base for Snapreme. Complete your SnapremeCard, set your price, and start sharing
            premium content with your fans.
          </p>
        </header>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 animate-pulse">
            <div className="h-6 w-1/3 bg-slate-200 rounded mb-4" />
            <div className="h-4 w-2/3 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-1/2 bg-slate-200 rounded" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Complete your SnapremeCard</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Add a display name, handle, bio, cover image, and your main categories so fans know what to expect.
                  </p>
                </div>
              </div>

              <Link
                to="/account/settings"
                className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit SnapremeCard
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Your public profile link</h2>
                <p className="text-sm text-slate-600 mt-1">
                  This is what you'll share in your bio, stories, or DMs so fans can subscribe to your premium content.
                </p>
                <p className="text-xs text-slate-500 mt-3">
                  <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                    /creator/{handleSlug}
                  </span>
                </p>
              </div>

              <Link
                to={`/creator/${handleSlug}`}
                className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-300 text-xs font-medium text-slate-800 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View public profile
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Coming soon</h2>
              <p className="text-sm text-slate-600">
                Earnings, subscriber count, and content performance will appear here as we roll out more creator tools.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
