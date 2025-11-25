import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Upload,
  Settings,
  Zap,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

interface CreatorDashboardBannerProps {
  subscriberCount: number;
  viewsCount: number;
  postsCount: number;
  estimatedEarnings?: number;
}

const rolodexPhrases = [
  'grow your audience',
  'monetize your content',
  'connect with fans',
  'build your brand',
  'earn consistently',
];

export function CreatorDashboardBanner({
  subscriberCount,
  viewsCount,
  postsCount,
  estimatedEarnings = 0,
}: CreatorDashboardBannerProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % rolodexPhrases.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  const quickStats = [
    {
      icon: Users,
      value: formatNumber(subscriberCount),
      label: 'Subscribers',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      icon: Eye,
      value: formatNumber(viewsCount),
      label: 'Profile Views',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      icon: BarChart3,
      value: postsCount.toString(),
      label: 'Posts',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
    },
    {
      icon: DollarSign,
      value: `$${estimatedEarnings.toFixed(0)}`,
      label: 'This Month',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
    },
  ];

  const quickActions = [
    {
      icon: Upload,
      label: 'Upload Content',
      href: '/dashboard/content',
      gradient: 'from-purple-600 to-blue-600',
    },
    {
      icon: Settings,
      label: 'Monetization',
      href: '/dashboard/monetization',
      gradient: 'from-emerald-600 to-teal-600',
    },
    {
      icon: TrendingUp,
      label: 'Analytics',
      href: '/dashboard/analytics',
      gradient: 'from-amber-600 to-orange-600',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 p-6 lg:p-8 mb-6">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(124,58,237,0.2),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(59,130,246,0.2),transparent_50%)]" />

      <div className="relative z-10">
        {/* Header with animated text */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="text-xs font-medium text-white/90 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Creator Dashboard
                </span>
              </div>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Your tools to{' '}
              <span className="relative inline-block h-[1.2em] overflow-hidden align-bottom">
                <span
                  className={`inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent transition-all duration-300 ${
                    isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                  }`}
                >
                  {rolodexPhrases[currentPhraseIndex]}
                </span>
              </span>
            </h2>
            <p className="text-white/70 text-sm lg:text-base max-w-md">
              Track your growth, manage content, and maximize your earnings all in one place.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r ${action.gradient} text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all group`}
              >
                <action.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{action.label}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
              <p className="text-xs text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bottom tip */}
        <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-sm text-white/70 flex-1">
            <span className="text-white font-medium">Pro tip:</span> Consistent posting and engaging with fans through PPM messages can increase your earnings by up to 40%.
          </p>
          <Link
            to="/dashboard/tips"
            className="text-xs text-purple-400 font-medium hover:text-purple-300 whitespace-nowrap"
          >
            Learn more
          </Link>
        </div>
      </div>
    </div>
  );
}
