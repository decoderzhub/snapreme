import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MoreHorizontal,
  Flag,
  Send,
  Image,
  Mic,
  Smile,
  Play,
  Sparkles,
  Coins,
  Lock,
  Heart,
  ThumbsUp,
  Flame,
  Crown,
  Check,
  Clock,
  Zap,
} from 'lucide-react';
import { demoCreators } from '../data/demoCreators';
import { useAuth } from '../contexts/AuthContext';

// Demo messages for the conversation
const generateDemoMessages = (creatorId: string) => {
  const creator = demoCreators.find(c => c.id === creatorId) || demoCreators[0];
  const displayName = creator.display_name || creator.name;

  return [
    {
      id: 'msg-1',
      senderId: creatorId,
      type: 'text' as const,
      content: `Hey! Thanks for subscribing 💜 I'm so excited to connect with you!`,
      timestamp: new Date(Date.now() - 86400000 * 2),
      isAI: true,
      reactions: [],
    },
    {
      id: 'msg-2',
      senderId: 'user',
      type: 'text' as const,
      content: `Hi ${displayName}! Love your content, especially the recent posts!`,
      timestamp: new Date(Date.now() - 86400000 * 2 + 3600000),
      reactions: [{ emoji: '❤️', count: 1 }],
    },
    {
      id: 'msg-3',
      senderId: creatorId,
      type: 'media' as const,
      content: 'Check out this exclusive behind the scenes! 🎬',
      mediaUrl: creator.card_image_url,
      mediaType: 'image',
      timestamp: new Date(Date.now() - 86400000),
      isAI: false,
      isExclusive: true,
      reactions: [],
    },
    {
      id: 'msg-4',
      senderId: 'user',
      type: 'text' as const,
      content: `This is amazing! How long did it take you to create?`,
      timestamp: new Date(Date.now() - 86400000 + 1800000),
      reactions: [],
    },
    {
      id: 'msg-5',
      senderId: creatorId,
      type: 'text' as const,
      content: `About 3 hours of shooting and another 2 for editing! It's a labor of love 💪`,
      timestamp: new Date(Date.now() - 86400000 + 3600000),
      isAI: true,
      reactions: [{ emoji: '🔥', count: 1 }],
    },
    {
      id: 'msg-6',
      senderId: creatorId,
      type: 'text' as const,
      content: `I'm working on something special for my subscribers. Stay tuned! ✨`,
      timestamp: new Date(Date.now() - 3600000),
      isAI: true,
      reactions: [],
    },
  ];
};

// Quick reactions
const quickReactions = ['❤️', '😂', '👍', '🔥', '👏', '😍'];

// Message bubble component
function MessageBubble({
  message,
  isOwn,
  creator,
  onReact,
  showTimestamp,
}: {
  message: ReturnType<typeof generateDemoMessages>[0];
  isOwn: boolean;
  creator: typeof demoCreators[0];
  onReact: (emoji: string) => void;
  showTimestamp: boolean;
}) {
  const [showReactions, setShowReactions] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="px-4">
      {showTimestamp && (
        <div className="text-center py-4">
          <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
            {formatDate(message.timestamp)}, {formatTime(message.timestamp)}
          </span>
        </div>
      )}

      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}>
        {/* Avatar for creator messages */}
        {!isOwn && (
          <Link to={`/creator/${creator.handle?.replace('@', '') || creator.id}`} className="flex-shrink-0 mr-2">
            <img
              src={creator.avatar_url}
              alt={creator.display_name || creator.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          </Link>
        )}

        <div className={`max-w-[75%] relative ${isOwn ? 'order-1' : ''}`}>
          {/* AI indicator */}
          {!isOwn && message.isAI && (
            <div className="flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] text-purple-400">AI-assisted response</span>
            </div>
          )}

          {/* Message content */}
          {message.type === 'text' ? (
            <div
              className={`px-4 py-2.5 rounded-2xl ${
                isOwn
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-md'
                  : 'bg-slate-800 text-white rounded-bl-md'
              }`}
              onLongPress={() => setShowReactions(true)}
              onClick={() => setShowReactions(!showReactions)}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden">
              {message.isExclusive && (
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-black/60 rounded-full">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] text-amber-400 font-medium">Exclusive</span>
                </div>
              )}
              <img
                src={message.mediaUrl}
                alt="Shared media"
                className="w-full max-w-[250px] rounded-2xl"
              />
              {message.mediaType === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
              )}
              {message.content && (
                <p className="text-sm text-white mt-2 px-1">{message.content}</p>
              )}
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {message.reactions.map((reaction, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-700 rounded-full text-xs"
                >
                  {reaction.emoji} {reaction.count > 1 && reaction.count}
                </span>
              ))}
            </div>
          )}

          {/* Quick reactions popup */}
          {showReactions && (
            <div
              className={`absolute ${isOwn ? 'right-0' : 'left-0'} -top-10 flex gap-1 bg-slate-800 rounded-full px-2 py-1 shadow-lg border border-slate-700 z-20`}
            >
              {quickReactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReact(emoji);
                    setShowReactions(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded-full transition-colors text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-slate-500">{formatTime(message.timestamp)}</span>
            {isOwn && (
              <Check className="w-3 h-3 text-blue-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Typing indicator
function TypingIndicator({ creator }: { creator: typeof demoCreators[0] }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <img
        src={creator.avatar_url}
        alt=""
        className="w-6 h-6 rounded-full object-cover"
      />
      <div className="bg-slate-800 rounded-2xl px-4 py-2 flex items-center gap-1">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-purple-400" />
        <span className="text-[10px] text-purple-400">AI is typing...</span>
      </div>
    </div>
  );
}

export default function ChatConversation() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find creator from chat ID (demo: extract creator index)
  const creatorIndex = parseInt(chatId?.split('-')[1] || '0') - 1;
  const creator = demoCreators[creatorIndex * 2] || demoCreators[0];
  const displayName = creator.display_name || creator.name;

  const [messages, setMessages] = useState(() => generateDemoMessages(creator.id));
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [coinBalance, setCoinBalance] = useState(47.50);
  const [showInsufficientCoins, setShowInsufficientCoins] = useState(false);

  // PPM rate for this creator
  const ppmRate = creator.tier === 'Elite' ? 4.99 : creator.tier === 'Verified' ? 2.99 : 1.99;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Check coin balance
    if (coinBalance < ppmRate) {
      setShowInsufficientCoins(true);
      setTimeout(() => setShowInsufficientCoins(false), 3000);
      return;
    }

    // Deduct coins
    setCoinBalance(prev => prev - ppmRate);

    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user',
      type: 'text' as const,
      content: newMessage,
      timestamp: new Date(),
      reactions: [],
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const aiResponses = [
        `Thanks for your message! 💜 I really appreciate you reaching out!`,
        `That's so sweet of you to say! You're making my day! ✨`,
        `I love hearing from my subscribers! Let me think about that...`,
        `Great question! I'd love to share more about that with you!`,
        `You're amazing! Thanks for being part of my community! 🙌`,
      ];

      const aiMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: creator.id,
        type: 'text' as const,
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
        isAI: true,
        reactions: [],
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000 + Math.random() * 2000);
  };

  const handleReact = (messageId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions?.map(r =>
                r.emoji === emoji ? { ...r, count: r.count + 1 } : r
              ),
            };
          } else {
            return {
              ...msg,
              reactions: [...(msg.reactions || []), { emoji, count: 1 }],
            };
          }
        }
        return msg;
      })
    );
  };

  // Check if timestamp should be shown (more than 1 hour gap)
  const shouldShowTimestamp = (index: number) => {
    if (index === 0) return true;
    const current = messages[index].timestamp;
    const previous = messages[index - 1].timestamp;
    return current.getTime() - previous.getTime() > 3600000;
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-neutral-950/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/inbox')}
              className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <Link
              to={`/creator/${creator.handle?.replace('@', '') || creator.id}`}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <img
                  src={creator.avatar_url}
                  alt={displayName}
                  className="w-9 h-9 rounded-full object-cover"
                />
                {creator.is_verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center border-2 border-neutral-950">
                    <Check className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-semibold text-sm">{displayName}</span>
                  {creator.tier === 'Elite' && (
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-slate-400">Online</span>
                  <span className="text-[10px] text-slate-600">•</span>
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span className="text-[10px] text-purple-400">AI-enabled</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Flag className="w-5 h-5 text-slate-400" />
            </button>
            <button
              onClick={() => navigate(`/chat/${chatId}/settings`)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Coin balance bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-semibold text-sm">${coinBalance.toFixed(2)}</span>
            <span className="text-slate-500 text-xs">balance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">Cost per message:</span>
            <span className="text-purple-400 font-semibold text-sm">${ppmRate.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Creator intro card */}
        <div className="mx-4 mb-6 p-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-500/20">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={creator.avatar_url}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-semibold">{displayName}</span>
                {creator.is_verified && <Check className="w-4 h-4 text-blue-400" />}
              </div>
              <span className="text-slate-400 text-sm">{creator.handle}</span>
            </div>
          </div>
          <p className="text-slate-300 text-sm mb-3">{creator.bio || `Welcome to my exclusive chat! Let's connect! 💜`}</p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-400">AI-powered responses</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Usually replies instantly</span>
            </div>
          </div>
        </div>

        {/* Messages list */}
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === 'user'}
            creator={creator}
            onReact={(emoji) => handleReact(message.id, emoji)}
            showTimestamp={shouldShowTimestamp(index)}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator creator={creator} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Insufficient coins alert */}
      {showInsufficientCoins && (
        <div className="absolute bottom-24 left-4 right-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">Insufficient coins to send message</span>
          </div>
          <button
            onClick={() => navigate('/buy-coins')}
            className="px-4 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-full"
          >
            Add Coins
          </button>
        </div>
      )}

      {/* Message input */}
      <div className="sticky bottom-0 bg-neutral-950 border-t border-white/10 p-4">
        {/* Quick stickers/reactions */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-xs text-slate-500 flex-shrink-0">Quick send:</span>
          {['❤️', '😂', '👍', '🔥', '👋'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                if (coinBalance >= ppmRate) {
                  setCoinBalance(prev => prev - ppmRate);
                  const reactionMsg = {
                    id: `msg-${Date.now()}`,
                    senderId: 'user',
                    type: 'text' as const,
                    content: emoji,
                    timestamp: new Date(),
                    reactions: [],
                  };
                  setMessages(prev => [...prev, reactionMsg]);
                }
              }}
              className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors text-lg flex-shrink-0"
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Image className="w-6 h-6 text-slate-400" />
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Message..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-full text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors pr-24"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
                <Smile className="w-5 h-5 text-slate-400" />
              </button>
              <button className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
                <Mic className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || coinBalance < ppmRate}
            className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Cost indicator */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <Coins className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] text-slate-500">
            Sending costs <span className="text-amber-400 font-medium">${ppmRate.toFixed(2)}</span> per message
          </span>
        </div>
      </div>
    </div>
  );
}
