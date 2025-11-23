import { useEffect, useState } from 'react';
import { Users, Sparkles, Video, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NetworkStats } from '../types/database';

export default function StatsBar() {
  const [stats, setStats] = useState<NetworkStats>({
    totalCreators: 0,
    activeBrands: 0,
    monthlyCollabs: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: creatorsCount } = await supabase
          .from('creators')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalCreators: creatorsCount || 0,
          activeBrands: 1280,
          monthlyCollabs: 342,
          averageRating: 4.8,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statItems = [
    {
      icon: Users,
      label: 'Creators on peak.boo',
      value: `${stats.totalCreators.toLocaleString()}+`,
    },
    {
      icon: Sparkles,
      label: 'Active members',
      value: stats.activeBrands.toLocaleString(),
    },
    {
      icon: Video,
      label: 'Premium posts this month',
      value: stats.monthlyCollabs.toLocaleString(),
    },
    {
      icon: Star,
      label: 'Avg creator rating',
      value: `${stats.averageRating.toFixed(1)}/5`,
    },
  ];

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.08)] px-6 py-4 animate-pulse">
        <div className="h-16 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.08)] px-6 py-4">
      <div className="flex flex-wrap gap-6 justify-center md:justify-between">
        {statItems.map((stat, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <stat.icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
