import { Search, X } from 'lucide-react';
import { FilterState } from '../types/database';

interface FiltersBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const NICHES = [
  'All',
  'Beauty',
  'Fitness',
  'Lifestyle',
  'Gaming',
  'Travel',
  'Couples',
  'Business',
  'Food',
  'Comedy',
  'Fashion',
  'Wellness',
  'Tech',
];

const TIERS = ['Any', 'Rising', 'Pro', 'Elite'];

const REGIONS = [
  'Global',
  'North America',
  'Europe',
  'LATAM',
  'Asia-Pacific',
  'Middle East',
];

const FOLLOWERS_RANGES = ['Any', '10k+', '50k+', '100k+', '250k+'];

export default function FiltersBar({ filters, onFilterChange }: FiltersBarProps) {
  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      niche: 'All',
      tier: 'Any',
      region: 'Global',
      minFollowers: 'Any',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.niche !== 'All' ||
    filters.tier !== 'Any' ||
    filters.region !== 'Global' ||
    filters.minFollowers !== 'Any';

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-2xl px-4 py-4 sm:px-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Search Creators
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Search by name or @handle..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Niche
          </label>
          <select
            value={filters.niche}
            onChange={(e) => onFilterChange({ ...filters, niche: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors text-sm bg-white"
          >
            {NICHES.map((niche) => (
              <option key={niche} value={niche}>
                {niche}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Tier
          </label>
          <select
            value={filters.tier}
            onChange={(e) => onFilterChange({ ...filters, tier: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors text-sm bg-white"
          >
            {TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Region
          </label>
          <select
            value={filters.region}
            onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors text-sm bg-white"
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Minimum Followers
          </label>
          <select
            value={filters.minFollowers}
            onChange={(e) => onFilterChange({ ...filters, minFollowers: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors text-sm bg-white"
          >
            {FOLLOWERS_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
