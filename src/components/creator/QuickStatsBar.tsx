import { useState, useEffect } from 'react';
import { Users, Eye, FileText, DollarSign, TrendingUp, Heart } from 'lucide-react';

interface QuickStatsBarProps {
  subscriberCount: number;
  viewsCount: number;
  postsCount: number;
  likesCount?: number;
  earningsThisMonth?: number;
  growthPercent?: number;
  isOwnProfile: boolean;
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
}

function AnimatedNumber({ value, duration = 1500, formatter }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(easeOutQuart * value);

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  const format = formatter || ((n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  });

  return <span>{format(displayValue)}</span>;
}

export function QuickStatsBar({
  subscriberCount,
  viewsCount,
  postsCount,
  likesCount = 0,
  earningsThisMonth = 0,
  growthPercent = 0,
  isOwnProfile,
}: QuickStatsBarProps) {
  const fanStats = [
    {
      icon: Users,
      value: subscriberCount,
      label: 'Subscribers',
      color: 'text-purple-400',
      bgColor: 'from-purple-600/20 to-purple-600/10',
      borderColor: 'border-purple-500/30',
    },
    {
      icon: Eye,
      value: viewsCount,
      label: 'Profile Views',
      color: 'text-blue-400',
      bgColor: 'from-blue-600/20 to-blue-600/10',
      borderColor: 'border-blue-500/30',
    },
    {
      icon: FileText,
      value: postsCount,
      label: 'Posts',
      color: 'text-emerald-400',
      bgColor: 'from-emerald-600/20 to-emerald-600/10',
      borderColor: 'border-emerald-500/30',
    },
    {
      icon: Heart,
      value: likesCount,
      label: 'Total Likes',
      color: 'text-pink-400',
      bgColor: 'from-pink-600/20 to-pink-600/10',
      borderColor: 'border-pink-500/30',
    },
  ];

  const creatorStats = [
    ...fanStats,
    {
      icon: DollarSign,
      value: earningsThisMonth,
      label: 'This Month',
      color: 'text-amber-400',
      bgColor: 'from-amber-600/20 to-amber-600/10',
      borderColor: 'border-amber-500/30',
      formatter: (n: number) => `$${n.toFixed(0)}`,
    },
    {
      icon: TrendingUp,
      value: growthPercent,
      label: 'Growth',
      color: growthPercent >= 0 ? 'text-emerald-400' : 'text-red-400',
      bgColor: growthPercent >= 0 ? 'from-emerald-600/20 to-emerald-600/10' : 'from-red-600/20 to-red-600/10',
      borderColor: growthPercent >= 0 ? 'border-emerald-500/30' : 'border-red-500/30',
      formatter: (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(0)}%`,
    },
  ];

  const stats = isOwnProfile ? creatorStats : fanStats;

  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-2">
      <div className="flex gap-3 min-w-max px-1">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r ${stat.bgColor} border ${stat.borderColor} backdrop-blur-sm hover:scale-105 transition-transform cursor-default`}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-white leading-tight">
                <AnimatedNumber
                  value={stat.value}
                  formatter={(stat as any).formatter}
                />
              </p>
              <p className="text-[10px] text-white/50 uppercase tracking-wide font-medium">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
