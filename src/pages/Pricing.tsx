import { Check, Sparkles, Crown, Zap, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
  const navigate = useNavigate();

  const tiers = [
    {
      name: 'Starter',
      price: 'Free',
      priceNote: 'forever',
      tagline: 'Everything you need to launch and test your creator profile.',
      features: [
        'Public creator profile',
        'AI-generated bio',
        'AI DM assistant (up to 100 messages/month)',
        '1 exclusive content post per month',
        'Accept tips & gifts',
        'Basic analytics',
        'Standard payout speed',
        'Access to brand-safe campaigns',
      ],
      cta: 'Get Started — Free',
      note: 'Perfect for new creators exploring peak.boo before unlocking full monetization.',
      highlighted: false,
      icon: Zap,
      gradient: 'from-slate-600 to-slate-700',
      iconBg: 'bg-slate-500/20',
      iconColor: 'text-slate-400',
    },
    {
      name: 'Creator Pro',
      price: '$9',
      priceNote: '/month',
      badge: 'Most Popular',
      tagline: 'Unlock full monetization and unlimited AI engagement.',
      features: [
        'Everything in Starter',
        'Unlimited AI DM assistant (fair-use limits apply)',
        'Subscriptions enabled',
        'Pay-per-message earnings unlocked',
        'Unlimited exclusive content',
        'Custom cover photos and branding',
        'Priority visibility across the network',
        'Advanced engagement analytics',
        'Faster payout speed',
        'Email & chat support',
      ],
      cta: 'Upgrade to Pro',
      note: 'Best for creators who want predictable income and consistent fan engagement.',
      highlighted: true,
      icon: Sparkles,
      gradient: 'from-purple-600 to-blue-600',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
    },
    {
      name: 'Creator Elite',
      price: '$29',
      priceNote: '/month',
      tagline: 'For creators turning their audience into a real business.',
      features: [
        'Everything in Creator Pro',
        'Featured placement on Explore and homepage',
        'Dedicated creator success manager',
        'Priority support',
        'AI campaign builder (auto-generated content packs)',
        'Deep analytics and performance insights',
        'Brand outreach and collaboration assistance',
        'API access for custom integrations',
        'Early access to new monetization features',
      ],
      cta: 'Join Elite',
      note: 'Ideal for established creators ready to scale with AI-powered growth.',
      highlighted: false,
      icon: Crown,
      gradient: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
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

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-6 border border-purple-500/30">
            <Sparkles className="w-4 h-4" />
            Creator-Friendly Pricing
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Simple,{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Creator-Friendly
            </span>{' '}
            Pricing
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            Start free. Upgrade as you grow. No platform fees.{' '}
            <span className="text-white font-semibold">Keep 85% of everything you earn.</span>
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`relative rounded-3xl p-8 transition-all duration-300 ${
                  tier.highlighted
                    ? 'bg-gradient-to-b from-purple-900/50 to-slate-900 border-2 border-purple-500 shadow-2xl shadow-purple-500/20 scale-105 z-10'
                    : 'bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-600 hover:-translate-y-1'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold rounded-full shadow-lg">
                    {tier.badge}
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                  <div className={`w-14 h-14 ${tier.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-600/50`}>
                    <Icon className={`w-7 h-7 ${tier.iconColor}`} />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>

                  <div className="flex items-baseline justify-center gap-1 mb-3">
                    <span className="text-5xl font-bold text-white">{tier.price}</span>
                    <span className="text-slate-400 text-lg">{tier.priceNote}</span>
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed">{tier.tagline}</p>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        tier.highlighted
                          ? 'bg-purple-500/30'
                          : 'bg-slate-700'
                      }`}>
                        <Check className={`w-3 h-3 ${tier.highlighted ? 'text-purple-400' : 'text-slate-400'}`} />
                      </div>
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => navigate('/apply')}
                  className={`w-full px-6 py-4 font-semibold rounded-xl transition-all duration-300 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 hover:brightness-110'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {tier.cta}
                </button>

                {/* Note */}
                <p className="mt-4 text-xs text-slate-500 text-center leading-relaxed">
                  {tier.note}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-block bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 max-w-lg">
            <h3 className="text-xl font-semibold text-white mb-3">
              Not sure which plan is right for you?
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Our team can help you find the perfect plan for your creator journey.
            </p>
            <button
              onClick={() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/', { state: { scrollTo: 'contact' } });
                }
              }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-purple-500/25"
            >
              <MessageSquare className="w-5 h-5" />
              Contact Our Team
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>No hidden fees</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Secure payments via Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Keep 85% of earnings</span>
          </div>
        </div>
      </section>
    </div>
  );
}
