import { LayoutGrid, Lock, Package, Heart, Bookmark, MessageCircle } from 'lucide-react';

export type ContentTab = 'all' | 'locked' | 'bundles' | 'favorites' | 'messages';

interface ContentTabNavigationProps {
  activeTab: ContentTab;
  onTabChange: (tab: ContentTab) => void;
  isOwnProfile: boolean;
  counts: {
    all: number;
    locked: number;
    bundles: number;
    favorites?: number;
  };
}

export function ContentTabNavigation({
  activeTab,
  onTabChange,
  isOwnProfile,
  counts,
}: ContentTabNavigationProps) {
  const tabs = [
    {
      id: 'all' as ContentTab,
      icon: LayoutGrid,
      label: 'All',
      count: counts.all,
      showAlways: true,
    },
    {
      id: 'locked' as ContentTab,
      icon: Lock,
      label: 'Premium',
      count: counts.locked,
      showAlways: true,
    },
    {
      id: 'bundles' as ContentTab,
      icon: Package,
      label: 'Bundles',
      count: counts.bundles,
      showAlways: true,
    },
    {
      id: 'favorites' as ContentTab,
      icon: isOwnProfile ? Bookmark : Heart,
      label: isOwnProfile ? 'Saved' : 'Liked',
      count: counts.favorites || 0,
      showAlways: false,
    },
  ];

  // Filter tabs based on whether they should be shown
  const visibleTabs = tabs.filter(tab => tab.showAlways || isOwnProfile);

  return (
    <div className="border-b border-white/10 bg-neutral-950 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 max-w-[120px] flex flex-col items-center gap-1 py-3 px-4 relative transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? '' : ''}`} />
                  {tab.count > 0 && tab.id === 'locked' && !isOwnProfile && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-purple-600 text-[9px] font-bold text-white flex items-center justify-center">
                      {tab.count > 9 ? '9+' : tab.count}
                    </span>
                  )}
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
