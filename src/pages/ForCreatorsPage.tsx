import { Link } from 'react-router-dom';
import {
  DollarSign,
  Users,
  Sparkles,
  BarChart3,
  MessageCircle,
  Zap,
  TrendingUp,
  Shield,
  Camera,
  Heart,
  Play,
  Check,
  ArrowRight
} from 'lucide-react';
import { demoCreators } from '../data/demoCreators';

export default function ForCreatorsPage() {
  // Get featured creators for showcase
  const featuredCreators = demoCreators.filter(c => c.is_featured).slice(0, 4);

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-6 border border-purple-500/30">
            <Sparkles className="w-4 h-4" />
            Built for Creators
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Turn Your Content Into{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Real Income
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            peak.boo is your home for premium, story-style content. Turn your private moments,
            behind-the-scenes content, and close-friends energy into predictable monthly income
            from fans who genuinely support you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-purple-500/25"
            >
              Start Creating
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              View Pricing
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: '85%', label: 'Creator Earnings' },
              { value: '4', label: 'Revenue Streams' },
              { value: '24h', label: 'Fast Payouts' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Streams */}
      <section className="relative py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              4 Ways to Earn
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Diversify your income with multiple monetization options built right in
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Heart,
                title: 'Subscriptions',
                description: 'Monthly recurring revenue from your biggest fans',
                gradient: 'from-pink-500 to-rose-500',
              },
              {
                icon: MessageCircle,
                title: 'Pay-Per-Message',
                description: 'Get paid for every message fans send you',
                gradient: 'from-purple-500 to-indigo-500',
              },
              {
                icon: Camera,
                title: 'Exclusive Content',
                description: 'Sell individual posts, photo sets, and videos',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Zap,
                title: 'Tips & Gifts',
                description: 'Accept tips and virtual gifts from supporters',
                gradient: 'from-amber-500 to-orange-500',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:border-slate-600 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 bg-gradient-to-b from-slate-900/50 to-neutral-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Steps */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium mb-6 border border-blue-500/30">
                <Play className="w-4 h-4" />
                Get Started in Minutes
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
                How It Works
              </h2>

              <div className="space-y-6">
                {[
                  {
                    step: '1',
                    title: 'Create your profile',
                    description: 'Sign up, choose your handle, and set up your peak.boo card. Our AI helps you craft the perfect bio.',
                  },
                  {
                    step: '2',
                    title: 'Set your pricing',
                    description: 'Decide what\'s free vs premium, set your subscription price, and configure your PPM rates.',
                  },
                  {
                    step: '3',
                    title: 'Share & grow',
                    description: 'Share your peak.boo link everywhere. Our AI assistant handles fan messages while you create.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Features */}
            <div className="space-y-4">
              {[
                {
                  icon: BarChart3,
                  title: 'Real-time Analytics',
                  description: 'Track subscribers, revenue, engagement, and content performance in one dashboard.',
                  gradient: 'from-emerald-500 to-teal-500',
                },
                {
                  icon: Sparkles,
                  title: 'AI-Powered Engagement',
                  description: 'Our AI assistant responds to fans 24/7, maintaining your voice and driving conversions.',
                  gradient: 'from-purple-500 to-pink-500',
                },
                {
                  icon: Shield,
                  title: 'Creator-First Terms',
                  description: 'Keep 85% of everything you earn. No hidden fees. Transparent payouts.',
                  gradient: 'from-blue-500 to-cyan-500',
                },
                {
                  icon: TrendingUp,
                  title: 'Growth Tools',
                  description: 'Featured placement, cross-promotion, and brand collaboration opportunities.',
                  gradient: 'from-amber-500 to-orange-500',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-5 flex items-start gap-4 hover:border-slate-600 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Creator Showcase */}
      <section className="relative py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Join Top Creators
            </h2>
            <p className="text-slate-400">
              Creators across all categories are building their communities on peak.boo
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredCreators.map((creator) => (
              <div
                key={creator.id}
                className="relative rounded-2xl overflow-hidden aspect-[3/4] group"
              >
                <img
                  src={creator.card_image_url}
                  alt={creator.display_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold">{creator.display_name}</p>
                  <p className="text-white/60 text-sm">{creator.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-3xl border border-purple-500/30 p-8 md:p-12 text-center overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-2xl" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of creators who are turning their passion into profit.
                Set up takes just 5 minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-purple-500/25"
                >
                  Create Your Profile
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-slate-400 text-sm">
                {['No setup fees', 'Cancel anytime', '24h support'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
