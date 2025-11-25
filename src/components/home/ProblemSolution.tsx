import { useEffect, useRef, useState } from 'react';
import { X, Check, Instagram, Users } from 'lucide-react';
import { demoCreators } from '../../data/demoCreators';

export default function ProblemSolution() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const sectionTop = rect.top;
        const windowHeight = window.innerHeight;

        // Calculate scroll progress within the section
        if (sectionTop < windowHeight && sectionTop > -rect.height) {
          setScrollY((windowHeight - sectionTop) * 0.1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get 6 random creator images for the background
  const creatorImages = demoCreators.slice(0, 8).map(c => c.card_image_url);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Angled creator cards background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Left side cards */}
        <div
          className="absolute -left-20 top-1/2 -translate-y-1/2"
          style={{ transform: `translateY(calc(-50% + ${scrollY * 0.5}px))` }}
        >
          <div className="flex flex-col gap-6" style={{ transform: 'rotate(-12deg)' }}>
            {creatorImages.slice(0, 4).map((img, i) => (
              <div
                key={i}
                className="w-48 h-64 rounded-2xl overflow-hidden shadow-2xl opacity-20 hover:opacity-30 transition-opacity"
                style={{
                  transform: `translateX(${i % 2 === 0 ? 20 : -20}px) translateY(${scrollY * (0.2 + i * 0.1)}px)`,
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right side cards */}
        <div
          className="absolute -right-20 top-1/2 -translate-y-1/2"
          style={{ transform: `translateY(calc(-50% + ${-scrollY * 0.3}px))` }}
        >
          <div className="flex flex-col gap-6" style={{ transform: 'rotate(12deg)' }}>
            {creatorImages.slice(4, 8).map((img, i) => (
              <div
                key={i}
                className="w-48 h-64 rounded-2xl overflow-hidden shadow-2xl opacity-20 hover:opacity-30 transition-opacity"
                style={{
                  transform: `translateX(${i % 2 === 0 ? -20 : 20}px) translateY(${-scrollY * (0.2 + i * 0.1)}px)`,
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Floating cards in background - scattered */}
        <div
          className="absolute left-1/4 -top-10 w-32 h-44 rounded-xl overflow-hidden shadow-xl opacity-10"
          style={{
            transform: `rotate(-8deg) translateY(${scrollY * 0.4}px)`,
          }}
        >
          <img src={creatorImages[0]} alt="" className="w-full h-full object-cover" />
        </div>
        <div
          className="absolute right-1/4 -top-20 w-36 h-48 rounded-xl overflow-hidden shadow-xl opacity-10"
          style={{
            transform: `rotate(15deg) translateY(${scrollY * 0.6}px)`,
          }}
        >
          <img src={creatorImages[2]} alt="" className="w-full h-full object-cover" />
        </div>
        <div
          className="absolute left-1/3 -bottom-10 w-28 h-40 rounded-xl overflow-hidden shadow-xl opacity-10"
          style={{
            transform: `rotate(10deg) translateY(${-scrollY * 0.3}px)`,
          }}
        >
          <img src={creatorImages[4]} alt="" className="w-full h-full object-cover" />
        </div>
        <div
          className="absolute right-1/3 -bottom-16 w-32 h-44 rounded-xl overflow-hidden shadow-xl opacity-10"
          style={{
            transform: `rotate(-12deg) translateY(${-scrollY * 0.5}px)`,
          }}
        >
          <img src={creatorImages[6]} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="text-center mb-16"
          style={{ transform: `translateY(${-scrollY * 0.1}px)` }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Tired of algorithm chaos and platform fees?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Compare your options and see why creators are switching to peak.boo
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Instagram/TikTok */}
          <div
            className="relative p-6 lg:p-8 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Instagram / TikTok</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Build an audience... but can't monetize directly
            </p>
            <ul className="space-y-3">
              {[
                'Algorithm controls your reach',
                'No direct monetization tools',
                'Fighting for brand deals',
                'Platform owns your audience',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-red-500" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Patreon */}
          <div
            className="relative p-6 lg:p-8 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ transform: `translateY(${scrollY * 0.05}px)` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Patreon</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Monthly subscriptions... but no visual feed or PPM chat
            </p>
            <ul className="space-y-3">
              {[
                'Text-heavy, not visual-first',
                'No pay-per-message feature',
                'Clunky for visual content',
                'No AI tools for scaling',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-red-500" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Peak.boo */}
          <div
            className="relative p-6 lg:p-8 rounded-3xl border-2 border-purple-500 bg-gradient-to-br from-purple-50/90 to-blue-50/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{ transform: `translateY(${-scrollY * 0.05}px)` }}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
              Best for Visual Creators
            </div>
            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg p-2">
                <img src="/assets/snapreme_icon.png" alt="peak.boo" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Peak.boo</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Visual content + subscriptions + paid messaging + AI
            </p>
            <ul className="space-y-3">
              {[
                'TikTok-style visual feed',
                'Pay-per-message chat',
                'AI-powered fan engagement',
                '4 revenue streams built-in',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-800 font-medium">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            {/* Decorative glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
