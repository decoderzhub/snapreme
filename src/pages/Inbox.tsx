import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Heart,
  Bell,
  Camera,
  ChevronRight,
  Plus,
  Coins,
  Lock,
  MessageCircle,
  Sparkles,
  Crown,
  Check,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { demoCreators } from '../data/demoCreators';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Demo data for inbox
const demoStories = demoCreators.slice(0, 6).map((creator, i) => ({
  id: creator.id,
  name: creator.display_name || creator.name,
  avatar: creator.avatar_url,
  hasNewStory: i < 3,
  isLive: i === 1,
}));

const demoNotifications = {
  followers: {
    count: 3,
    preview: 'Luna Cosplay started following you.',
    icon: Users,
    color: 'bg-blue-500',
  },
  activity: {
    count: 12,
    preview: 'Marcus Fit and 11 others liked your post.',
    icon: Heart,
    color: 'bg-pink-500',
  },
  system: {
    count: 2,
    preview: 'Your payout of $127.50 is processing.',
    icon: Bell,
    color: 'bg-slate-600',
    hasUnread: true,
  },
};

const demoChats = [
  {
    id: 'chat-1',
    creator: demoCreators[0],
    lastMessage: 'Thanks for subscribing! What fitness goals are you working on?',
    timestamp: '2m',
    unread: true,
    ppmRate: 2.50,
    isAI: true,
  },
  {
    id: 'chat-2',
    creator: demoCreators[2],
    lastMessage: 'Love the outfit inspiration! Can you do more casual looks?',
    timestamp: '1h',
    unread: true,
    ppmRate: 1.99,
    isAI: false,
  },
  {
    id: 'chat-3',
    creator: demoCreators[4],
    lastMessage: 'The cosplay tutorial was amazing 🔥',
    timestamp: '3h',
    unread: false,
    ppmRate: 3.00,
    isAI: true,
  },
  {
    id: 'chat-4',
    creator: demoCreators[6],
    lastMessage: 'Your resume feedback helped so much!',
    timestamp: '1d',
    unread: false,
    ppmRate: 4.99,
    isAI: false,
  },
  {
    id: 'chat-5',
    creator: demoCreators[8],
    lastMessage: 'New brush pack dropping tomorrow!',
    timestamp: '2d',
    unread: false,
    ppmRate: 2.00,
    isAI: true,
  },
];

// Story circle component
function StoryCircle({
  story,
  isCreate = false,
  onClick,
}: {
  story?: typeof demoStories[0];
  isCreate?: boolean;
  onClick: () => void;
}) {
  if (isCreate) {
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-1.5 min-w-[72px]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center">
            <Plus className="w-6 h-6 text-slate-400" />
          </div>
        </div>
        <span className="text-xs text-slate-400 truncate w-16 text-center">Create</span>
      </button>
    );
  }

  if (!story) return null;

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 min-w-[72px]">
      <div className="relative">
        <div className={`w-16 h-16 rounded-full p-[2px] ${
          story.hasNewStory
            ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500'
            : 'bg-slate-700'
        }`}>
          <div className="w-full h-full rounded-full bg-neutral-950 p-[2px]">
            <img
              src={story.avatar}
              alt={story.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
        {story.isLive && (
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-red-500 rounded text-[10px] font-bold text-white">
            LIVE
          </div>
        )}
      </div>
      <span className="text-xs text-white truncate w-16 text-center">{story.name?.split(' ')[0]}</span>
    </button>
  );
}

// Notification row component
function NotificationRow({
  type,
  data,
  onClick,
}: {
  type: string;
  data: typeof demoNotifications.followers;
  onClick: () => void;
}) {
  const Icon = data.icon;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors"
    >
      <div className={`w-12 h-12 rounded-full ${data.color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-white font-semibold capitalize">{type === 'followers' ? 'New followers' : type}</p>
        <p className="text-slate-400 text-sm truncate">{data.preview}</p>
      </div>
      <div className="flex items-center gap-2">
        {data.hasUnread && (
          <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
        )}
        <ChevronRight className="w-5 h-5 text-slate-500" />
      </div>
    </button>
  );
}

// Chat row component
function ChatRow({
  chat,
  onClick,
}: {
  chat: typeof demoChats[0];
  onClick: () => void;
}) {
  const creator = chat.creator;
  const displayName = creator.display_name || creator.name;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 hover:bg-slate-800/50 transition-colors"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-full overflow-hidden">
          <img
            src={creator.avatar_url}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>
        {chat.isAI && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center border-2 border-neutral-950">
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        {creator.is_verified && !chat.isAI && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-neutral-950">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <p className={`font-semibold truncate ${chat.unread ? 'text-white' : 'text-slate-300'}`}>
            {displayName}
          </p>
          {creator.tier === 'Elite' && (
            <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          )}
        </div>
        <p className={`text-sm truncate ${chat.unread ? 'text-slate-300' : 'text-slate-500'}`}>
          {chat.lastMessage}
        </p>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-xs text-slate-500">{chat.timestamp}</span>
        {chat.unread ? (
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
        ) : (
          <div className="flex items-center gap-1 text-slate-500">
            <Coins className="w-3 h-3" />
            <span className="text-xs">${chat.ppmRate.toFixed(2)}</span>
          </div>
        )}
      </div>
    </button>
  );
}

export default function Inbox() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');
  const [coinBalance] = useState(47.50);
  const [creatorHandle, setCreatorHandle] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchCreatorHandle() {
      const { data } = await supabase
        .from('creators')
        .select('handle')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.handle) {
        setCreatorHandle(data.handle.replace('@', ''));
      }
    }

    fetchCreatorHandle();
  }, [user]);

  const handleBack = () => {
    navigate(`/creator/${creatorHandle}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4">
          {/* Top Row */}
          <div className="flex items-center justify-between h-14">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">Inbox</h1>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>

            <button className="p-2 -mr-2 hover:bg-white/5 rounded-full transition-colors">
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Coin Balance Bar */}
          <div className="flex items-center justify-between py-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-semibold text-sm">${coinBalance.toFixed(2)}</span>
              </div>
              <span className="text-slate-500 text-xs">Message credits</span>
            </div>
            <button
              onClick={() => navigate('/buy-coins')}
              className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-full hover:brightness-110 transition-all"
            >
              Add Coins
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Stories Row */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <StoryCircle isCreate onClick={() => {}} />
            {demoStories.map((story) => (
              <StoryCircle
                key={story.id}
                story={story}
                onClick={() => navigate(`/creator/${story.name?.toLowerCase().replace(' ', '_')}`)}
              />
            ))}
          </div>
        </div>

        {/* Notifications Section */}
        <div className="border-b border-white/10">
          {Object.entries(demoNotifications).map(([type, data]) => (
            <NotificationRow
              key={type}
              type={type}
              data={data}
              onClick={() => {}}
            />
          ))}
        </div>

        {/* Messages Section */}
        <div>
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
                activeTab === 'messages' ? 'text-white' : 'text-slate-500'
              }`}
            >
              Messages
              {activeTab === 'messages' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
                activeTab === 'requests' ? 'text-white' : 'text-slate-500'
              }`}
            >
              Requests
              <span className="ml-1.5 px-1.5 py-0.5 bg-pink-500 text-white text-[10px] font-bold rounded-full">
                3
              </span>
              {activeTab === 'requests' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full" />
              )}
            </button>
          </div>

          {/* Chat List */}
          {activeTab === 'messages' ? (
            <div>
              {demoChats.map((chat) => (
                <ChatRow
                  key={chat.id}
                  chat={chat}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-white font-semibold mb-2">Message Requests</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Non-subscribers who want to chat with you. Accept to start a PPM conversation.
              </p>
            </div>
          )}
        </div>

        {/* PPM Info Banner */}
        <div className="m-4 p-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl border border-purple-500/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">Pay-Per-Message</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Each message you send costs coins based on the creator's rate.
                AI-assisted creators (marked with <Sparkles className="w-3 h-3 inline text-purple-400" />) respond faster!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/network')}
            className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium text-sm">Find Creators</p>
              <p className="text-slate-500 text-xs">Discover new content</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/sneak-peak')}
            className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium text-sm">Sneak Peak</p>
              <p className="text-slate-500 text-xs">Browse the feed</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
