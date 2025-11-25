import { useState, useEffect, useCallback } from 'react';
import { Bot, MessageCircle, Zap, Clock } from 'lucide-react';

// Sample fan messages and AI responses for the matrix effect
const fanMessages = [
  "Love your content! Any tips?",
  "How do you stay motivated?",
  "What's your workout routine?",
  "Can you review my portfolio?",
  "Best camera for beginners?",
  "How did you get started?",
  "What products do you use?",
  "Tips for growing followers?",
  "Your style is amazing!",
  "How long to see results?",
  "What's your diet like?",
  "Can you mentor me?",
  "Love the new post!",
  "How do you edit photos?",
  "Best advice for newbies?",
];

const aiResponses = [
  "Thanks so much! My #1 tip is consistency...",
  "Great question! I focus on small daily goals...",
  "I do 4 days strength, 2 days cardio...",
  "Love your work! Here's my feedback...",
  "Start with a good mirrorless camera...",
  "I started 3 years ago with just...",
  "My favorites are linked in my bio...",
  "Engage authentically with your audience...",
  "Thank you! That means so much...",
  "Usually 8-12 weeks with dedication...",
  "High protein, balanced macros...",
  "I'd love to help! Let's chat more...",
  "So glad you liked it! More coming...",
  "I use Lightroom with custom presets...",
  "Start before you're ready and iterate...",
];

interface FloatingChat {
  id: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  fanMessage: string;
  aiResponse: string;
  typedResponse: string;
  earnings: string;
  isTyping: boolean;
  speed: number;
}

function MatrixBackground() {
  const [chats, setChats] = useState<FloatingChat[]>([]);
  const [nextId, setNextId] = useState(0);

  const createChat = useCallback(() => {
    // Spawn from edges, moving towards center
    const side = Math.floor(Math.random() * 4);
    let x, y;

    switch (side) {
      case 0: // top
        x = 10 + Math.random() * 80;
        y = -5;
        break;
      case 1: // right
        x = 105;
        y = 10 + Math.random() * 80;
        break;
      case 2: // bottom
        x = 10 + Math.random() * 80;
        y = 105;
        break;
      default: // left
        x = -5;
        y = 10 + Math.random() * 80;
        break;
    }

    const msgIndex = Math.floor(Math.random() * fanMessages.length);
    const earnings = (1 + Math.random() * 9).toFixed(2);

    const newChat: FloatingChat = {
      id: nextId,
      x,
      y,
      scale: 0.9 + Math.random() * 0.3,
      opacity: 0.85 + Math.random() * 0.15,
      fanMessage: fanMessages[msgIndex],
      aiResponse: aiResponses[msgIndex],
      typedResponse: '',
      earnings: `+$${earnings}`,
      isTyping: true,
      speed: 0.25 + Math.random() * 0.35,
    };

    setNextId(prev => prev + 1);
    return newChat;
  }, [nextId]);

  // Initialize chats
  useEffect(() => {
    const initialChats: FloatingChat[] = [];
    for (let i = 0; i < 10; i++) {
      const chat = createChat();
      // Spread initial positions
      chat.x = 5 + Math.random() * 90;
      chat.y = 5 + Math.random() * 90;
      chat.scale = 0.5 + Math.random() * 0.6;
      chat.opacity = 0.7 + Math.random() * 0.3;
      initialChats.push({ ...chat, id: i });
    }
    setChats(initialChats);
    setNextId(10);
  }, []);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setChats(prevChats => {
        let updated = prevChats.map(chat => {
          // Move towards center (50, 50)
          const dx = (50 - chat.x) * 0.02 * chat.speed;
          const dy = (50 - chat.y) * 0.02 * chat.speed;

          const newX = chat.x + dx;
          const newY = chat.y + dy;

          // Scale down as approaching center (3D depth effect)
          const distToCenter = Math.sqrt(Math.pow(50 - newX, 2) + Math.pow(50 - newY, 2));
          const newScale = Math.max(0.1, chat.scale * 0.997);
          const newOpacity = Math.max(0, chat.opacity * 0.996);

          // Type out response
          let newTypedResponse = chat.typedResponse;
          let isTyping = chat.isTyping;
          if (chat.isTyping && chat.typedResponse.length < chat.aiResponse.length) {
            if (Math.random() > 0.5) {
              newTypedResponse = chat.aiResponse.slice(0, chat.typedResponse.length + 1);
            }
          } else {
            isTyping = false;
          }

          return {
            ...chat,
            x: newX,
            y: newY,
            scale: newScale,
            opacity: newOpacity,
            typedResponse: newTypedResponse,
            isTyping,
          };
        });

        // Remove chats that are too small or faded
        updated = updated.filter(chat => chat.scale > 0.15 && chat.opacity > 0.1);

        // Add new chats to maintain count
        while (updated.length < 10) {
          const newChat = createChat();
          updated.push({ ...newChat, id: Date.now() + Math.random() });
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [createChat]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Radial gradient overlay for depth - lighter version */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.4)_80%)]" />

      {chats.map(chat => (
        <div
          key={chat.id}
          className="absolute transition-none"
          style={{
            left: `${chat.x}%`,
            top: `${chat.y}%`,
            transform: `translate(-50%, -50%) scale(${chat.scale})`,
            opacity: chat.opacity,
          }}
        >
          {/* Mini chat card */}
          <div className="w-64 bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/50 bg-slate-900/50">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <span className="text-[10px] text-slate-400">AI Assistant</span>
              <span className="ml-auto text-[10px] text-green-400 font-semibold">{chat.earnings}</span>
            </div>

            {/* Messages */}
            <div className="p-2 space-y-2">
              {/* Fan message */}
              <div className="flex justify-end">
                <div className="max-w-[85%] px-2.5 py-1.5 rounded-xl rounded-br-sm bg-purple-600 text-white text-[10px]">
                  {chat.fanMessage}
                </div>
              </div>

              {/* AI response with typing effect */}
              <div className="flex gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="max-w-[85%] px-2.5 py-1.5 rounded-xl rounded-bl-sm bg-slate-700 text-white text-[10px]">
                  {chat.typedResponse}
                  {chat.isTyping && (
                    <span className="inline-block w-1 h-3 bg-purple-400 ml-0.5 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AIFeature() {
  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 text-white overflow-hidden">
      {/* Matrix AI Background */}
      <MatrixBackground />

      {/* Additional depth overlay - lighter for better visibility */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(15,23,42,0.7)_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-6 border border-purple-500/30">
              <Bot className="w-4 h-4" />
              AI-Powered Engagement
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Scale Your Fan Engagement{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                with AI
              </span>
            </h2>

            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              Can't reply to every fan? Your AI persona handles conversations 24/7,
              trained on your voice, style, and boundaries. Fans get instant responses,
              you earn while you sleep.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: MessageCircle,
                  title: 'Your Voice, Automated',
                  description: 'AI learns your personality and responds authentically',
                },
                {
                  icon: Clock,
                  title: '24/7 Availability',
                  description: 'Never miss a paying conversation, even while you sleep',
                },
                {
                  icon: Zap,
                  title: 'Instant Responses',
                  description: 'Fans get immediate replies, boosting engagement',
                },
              ].map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                    <feature.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Mockup */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-3xl" />

            {/* Chat Window */}
            <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Sarah's AI</p>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online 24/7
                  </p>
                </div>
                <div className="ml-auto px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
                  AI Mode
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-4">
                {/* Fan Message */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md bg-purple-600 text-white text-sm">
                    Hey! Love your fitness content. Any tips for staying motivated?
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-bl-md bg-slate-700 text-white text-sm">
                    Hey! So glad you're enjoying the content! My #1 tip? Start small.
                    I set tiny daily goals when I first started—even 10 mins counts.
                    Consistency beats intensity every time. What's your biggest challenge right now?
                  </div>
                </div>

                {/* Typing Indicator */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-slate-700">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Stats */}
              <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Response time: &lt;2 seconds</span>
                  <span className="text-green-400 font-semibold">$2.50 earned from this chat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
