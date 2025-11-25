import { useState, useEffect } from 'react';
import { HeartHandshake, ShieldCheck, Sparkles, Zap, Users, Lock } from 'lucide-react';

const rolodexWords = [
  'exclusive content',
  'direct access',
  'premium drops',
  'real connection',
  'VIP moments',
];

export default function BrandCta() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % rolodexWords.length);
        setIsAnimating(false);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: HeartHandshake,
      title: 'Direct Creator Access',
      description: 'Skip the algorithm. Get daily moments, unfiltered stories, and drops made just for paying fans.',
      gradient: 'from-pink-500 to-rose-500',
      bgGlow: 'bg-pink-500/20',
    },
    {
      icon: Sparkles,
      title: 'Curated Experience',
      description: 'No endless scrolling. Find creators you care about in one clean, premium space.',
      gradient: 'from-purple-500 to-indigo-500',
      bgGlow: 'bg-purple-500/20',
    },
    {
      icon: ShieldCheck,
      title: 'Private & Secure',
      description: 'Protected payments. Creators control content. You control your data.',
      gradient: 'from-emerald-500 to-teal-500',
      bgGlow: 'bg-emerald-500/20',
    },
  ];

  const stats = [
    { icon: Users, value: '10K+', label: 'Active Fans' },
    { icon: Zap, value: '50K+', label: 'Messages Sent' },
    { icon: Lock, value: '100%', label: 'SFW Content' },
  ];

  return (
    <section className="py-24 md:py-32 bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(124,58,237,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(59,130,246,0.15),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with rolodex animation */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
            Built for fans who want
            <br />
            <span className="relative inline-block h-[1.2em] overflow-hidden align-bottom">
              <span
                className={`inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent transition-all duration-300 ${
                  isAnimating ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
                }`}
              >
                {rolodexWords[currentWordIndex]}
              </span>
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Social media is loud. peak.boo is quiet, intentional, and premium.
            Subscribe to creators you love — no algorithm noise.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16 md:mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow effect */}
              <div className={`absolute -inset-1 ${feature.bgGlow} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 h-full">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>

                {/* Decorative line */}
                <div className={`absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r ${feature.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16 md:mb-20">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <stat.icon className="w-5 h-5 text-purple-400" />
                <span className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</span>
              </div>
              <span className="text-slate-400 text-sm">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <span className="text-slate-300 px-4">Pay monthly, cancel anytime</span>
            <a
              href="/signup"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              Start Free Trial
            </a>
          </div>
          <p className="text-slate-500 text-sm mt-4">
            New features for messaging, bundles, and exclusive drops rolling out during early access.
          </p>
        </div>
      </div>
    </section>
  );
}
