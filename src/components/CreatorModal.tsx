import { X, CreditCard, MessageSquare, Lock, Sparkles, TrendingUp, Eye, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Creator } from '../types/database';

interface Props {
  creator: Creator;
  onClose: () => void;
}

export default function CreatorModal({ creator, onClose }: Props) {
  if (!creator.card_image_url || !creator.avatar_url) return null;

  const navigate = useNavigate();
  const cover = creator.card_image_url || creator.cover_url || '/assets/snapreme-default-banner.svg';
  const price = creator.subscription_price || 5;

  // Generate mock revenue data based on creator stats
  const baseRevenue = (creator.subscribers || 100) * price * 0.85;
  const revenueStreams = [
    {
      icon: CreditCard,
      label: 'Subscriptions',
      value: baseRevenue,
      percentage: 45,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-600',
    },
    {
      icon: MessageSquare,
      label: 'Pay-Per-Message',
      value: baseRevenue * 0.35,
      percentage: 28,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600',
    },
    {
      icon: Lock,
      label: 'Exclusive Content',
      value: baseRevenue * 0.25,
      percentage: 18,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-600',
    },
    {
      icon: Sparkles,
      label: 'Tips & Gifts',
      value: baseRevenue * 0.15,
      percentage: 9,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600',
    },
  ];

  const totalRevenue = revenueStreams.reduce((sum, stream) => sum + stream.value, 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const handleViewProfile = () => {
    onClose();
    navigate(`/creator/${creator.handle?.replace('@', '')}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2 z-10 shadow-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-900" />
        </button>

        {/* Cover image */}
        <div className="relative h-48">
          <img src={cover} alt={creator.display_name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

          {/* Creator info overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xl text-white font-bold">
                  {creator.display_name || creator.name}
                </p>
                <p className="text-white/70 text-sm">{creator.handle}</p>
              </div>
              {creator.category && (
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                  {creator.category}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Eye className="w-4 h-4 text-slate-400" />
                <p className="text-lg font-bold text-slate-900">
                  {(creator.profile_views || 0).toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-slate-500">Views</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-slate-400" />
                <p className="text-lg font-bold text-slate-900">
                  {(creator.subscribers || 0).toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-slate-500">Fans</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <FileText className="w-4 h-4 text-slate-400" />
                <p className="text-lg font-bold text-slate-900">
                  {(creator.posts || 0).toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-slate-500">Posts</p>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {creator.bio || 'This creator has not added a bio yet.'}
          </p>

          {/* Revenue Analytics */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-slate-700">Monthly Revenue</span>
              </div>
              <span className="text-lg font-bold text-slate-900">{formatCurrency(totalRevenue)}</span>
            </div>

            {/* Revenue bars */}
            <div className="space-y-3">
              {revenueStreams.map((stream) => (
                <div key={stream.label} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg ${stream.bgColor} flex items-center justify-center`}>
                        <stream.icon className={`w-3.5 h-3.5 ${stream.textColor}`} />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{stream.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{formatCurrency(stream.value)}</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stream.color} rounded-full transition-all duration-500 group-hover:brightness-110`}
                      style={{ width: `${stream.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleViewProfile}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3.5 rounded-full shadow-lg hover:shadow-xl hover:brightness-105 transition-all font-semibold"
          >
            View Full Profile
          </button>
        </div>
      </div>
    </div>
  );
}
