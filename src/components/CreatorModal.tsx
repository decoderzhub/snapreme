import { useEffect } from 'react';
import { X, Copy, Send, MapPin, TrendingUp, Eye, Users } from 'lucide-react';
import { Creator } from '../types/database';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CreatorModalProps {
  creator: Creator;
  onClose: () => void;
}

export default function CreatorModal({ creator, onClose }: CreatorModalProps) {
  const { user } = useAuth();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    if (user) {
      supabase.from('profile_views').insert({
        creator_id: creator.id,
        viewer_id: user.id,
      });
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, creator.id, user]);

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/creators/${creator.handle.replace('@', '')}`;
    navigator.clipboard.writeText(url);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Elite':
        return 'bg-yellow-500 text-white';
      case 'Pro':
        return 'bg-blue-600 text-white';
      case 'Rising':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="max-w-3xl w-full bg-white rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.4)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <div className="relative h-48 sm:h-64 overflow-hidden rounded-t-3xl">
            <img
              src={creator.cover_url || 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=1200'}
              alt={creator.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-slate-900" />
            </button>

            <div className="absolute bottom-4 left-6 flex items-end gap-4">
              {creator.avatar_url && (
                <img
                  src={creator.avatar_url}
                  alt={creator.name}
                  className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
                />
              )}
              <div className="pb-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{creator.name}</h2>
                <p className="text-blue-200 font-medium">{creator.handle}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getTierColor(creator.tier)}`}>
                {creator.tier} Creator
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Followers</p>
                <p className="text-xl font-bold text-slate-900">{formatFollowers(creator.followers)}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Engagement</p>
                <p className="text-xl font-bold text-slate-900">{creator.engagement_rate}%</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <Eye className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Avg Views</p>
                <p className="text-xl font-bold text-slate-900">{formatFollowers(Math.floor(creator.followers * (creator.engagement_rate / 100)))}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Region</p>
                <p className="text-sm font-bold text-slate-900">{creator.region || 'Global'}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">About</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  {creator.bio || 'Premium Snapchat creator available for brand collaborations and sponsored content.'}
                </p>

                {creator.niches && creator.niches.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Content Niches</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.niches.map((niche) => (
                        <span
                          key={niche}
                          className="inline-flex rounded-full bg-blue-50 text-blue-600 px-3 py-1 text-xs font-medium"
                        >
                          {niche}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Collaboration Options</p>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li>• Story takeovers & features</li>
                    <li>• Product reviews & unboxings</li>
                    <li>• Brand partnerships & sponsorships</li>
                    <li>• Giveaway collaborations</li>
                    <li>• Custom content creation</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Snapcode</h3>
                <div className="bg-slate-50 rounded-xl p-6 text-center">
                  <div className="w-48 h-48 mx-auto mb-3 bg-white rounded-xl flex items-center justify-center border-2 border-slate-200">
                    {creator.snapcode_url ? (
                      <img
                        src={creator.snapcode_url}
                        alt={`${creator.name} Snapcode`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-2 bg-yellow-400 rounded-2xl flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">{creator.name.charAt(0)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">Scan to add on Snapchat</p>
                </div>

                <div className="mt-4 bg-blue-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-slate-900 mb-1">Starting Rate</p>
                  <p className="text-3xl font-bold text-blue-600">{formatPrice(creator.starting_rate)}</p>
                  <p className="text-xs text-slate-600 mt-1">per story post</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Request Collaboration
              </button>
              <button
                onClick={handleCopyLink}
                className="px-6 py-3 border-2 border-slate-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-slate-700 hover:text-blue-600"
              >
                <Copy size={20} />
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
