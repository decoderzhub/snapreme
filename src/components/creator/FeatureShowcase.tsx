import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  MessageSquare,
  Lock,
  Sparkles,
  ChevronRight,
  Check,
  Bot,
  Zap,
} from 'lucide-react';

interface FeatureShowcaseProps {
  hasSubscription?: boolean;
  hasPpm?: boolean;
  hasExclusiveContent?: boolean;
  hasAiAssistant?: boolean;
}

const features = [
  {
    id: 'subscriptions',
    icon: CreditCard,
    title: 'Monthly Subscriptions',
    description: 'Recurring revenue from fans who want regular access to your content',
    example: '$4.99 – $49.99/month',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    darkIconColor: 'text-purple-400',
    darkBgColor: 'bg-purple-500/20',
    setupLink: '/dashboard/monetization',
    tips: [
      'Set competitive pricing based on your niche',
      'Offer subscription-only content as incentive',
      'Promote your subscription link on social media',
    ],
  },
  {
    id: 'ppm',
    icon: MessageSquare,
    title: 'Pay-Per-Message',
    description: 'Fans pay coins to chat directly with you',
    example: '10 – 20 coins per message',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    darkIconColor: 'text-blue-400',
    darkBgColor: 'bg-blue-500/20',
    setupLink: '/dashboard/messaging',
    tips: [
      'Respond promptly to build loyalty',
      'Use priority messages for important fans',
      'Set expectations for response time in bio',
    ],
  },
  {
    id: 'exclusive',
    icon: Lock,
    title: 'Exclusive Content',
    description: 'Sell individual posts or bundles at premium prices',
    example: 'Pay-per-view or sub-only',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    darkIconColor: 'text-emerald-400',
    darkBgColor: 'bg-emerald-500/20',
    setupLink: '/dashboard/content',
    tips: [
      'Create themed content bundles',
      'Offer limited-time discounts',
      'Tease locked content to drive purchases',
    ],
  },
  {
    id: 'tips',
    icon: Sparkles,
    title: 'Tips & Gifts',
    description: 'Let fans show appreciation with tips and virtual gifts',
    example: 'Any amount, anytime',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
    darkIconColor: 'text-amber-400',
    darkBgColor: 'bg-amber-500/20',
    setupLink: '/dashboard/monetization',
    tips: [
      'Thank tippers publicly (with permission)',
      'Create special shoutouts for top supporters',
      'Enable virtual gifts in your settings',
    ],
  },
];

export function FeatureShowcase({
  hasSubscription = false,
  hasPpm = true,
  hasExclusiveContent = false,
  hasAiAssistant = false,
}: FeatureShowcaseProps) {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const featureStatus: Record<string, boolean> = {
    subscriptions: hasSubscription,
    ppm: hasPpm,
    exclusive: hasExclusiveContent,
    tips: true, // Always available
  };

  return (
    <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 rounded-3xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Revenue Streams</h3>
              <p className="text-xs text-white/60">4 ways to earn on peak.boo</p>
            </div>
          </div>
          <Link
            to="/dashboard/monetization"
            className="text-sm text-purple-400 font-medium hover:text-purple-300 flex items-center gap-1"
          >
            Manage all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="p-4 space-y-3">
        {features.map((feature) => {
          const isExpanded = expandedFeature === feature.id;
          const isSetup = featureStatus[feature.id];

          return (
            <div
              key={feature.id}
              className={`rounded-2xl border transition-all duration-300 ${
                isExpanded
                  ? 'bg-white/10 border-purple-500/50'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <button
                onClick={() => setExpandedFeature(isExpanded ? null : feature.id)}
                className="w-full p-4 flex items-center gap-4 text-left"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.darkBgColor} flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className={`w-6 h-6 ${feature.darkIconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-white font-semibold text-sm">{feature.title}</h4>
                    {isSetup && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-xs line-clamp-1">{feature.description}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${feature.color} text-white text-[10px] font-semibold shadow-md`}>
                    {feature.example}
                  </span>
                  <ChevronRight
                    className={`w-5 h-5 text-white/40 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 space-y-4">
                  <div className="ml-16 pl-4 border-l-2 border-purple-500/30">
                    <p className="text-white/70 text-sm mb-4">{feature.description}</p>

                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-white/50 uppercase tracking-wide font-medium">Quick Tips</p>
                      {feature.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-white/70">{tip}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      to={feature.setupLink}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${feature.color} text-white text-xs font-semibold hover:brightness-110 transition-all`}
                    >
                      {isSetup ? 'Manage Settings' : 'Set Up Now'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* AI Feature Teaser */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 p-4 mt-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-white font-semibold text-sm">AI Assistant</h4>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-medium">
                  Coming Soon
                </span>
              </div>
              <p className="text-white/60 text-xs mb-3">
                Let AI handle fan messages 24/7, trained on your voice and style. Earn while you sleep.
              </p>
              <button className="text-xs text-purple-400 font-medium hover:text-purple-300">
                Join waitlist →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
