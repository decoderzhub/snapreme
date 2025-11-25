import { useEffect, useRef, useState } from 'react';
import { CreditCard, MessageSquare, Lock, Sparkles } from 'lucide-react';
import { demoCreators } from '../../data/demoCreators';

const earningMethods = [
  {
    icon: CreditCard,
    title: 'Subscriptions',
    description: 'Monthly recurring revenue from your biggest fans',
    example: '$4.99–$49.99/month',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    icon: MessageSquare,
    title: 'Pay-Per-Message',
    description: 'Charge fans to chat with you directly',
    example: '$1–$10 per message',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: Lock,
    title: 'Exclusive Content',
    description: 'Premium posts, videos, and behind-the-scenes',
    example: 'Pay-per-view or sub-only',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Sparkles,
    title: 'Tips & Gifts',
    description: 'Let fans show appreciation directly',
    example: 'Any amount, anytime',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
];

export default function MonetizationCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const sectionTop = rect.top;
        const windowHeight = window.innerHeight;

        if (sectionTop < windowHeight && sectionTop > -rect.height) {
          setScrollY((windowHeight - sectionTop) * 0.1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const creatorImages = demoCreators.slice(0, 8).map(c => c.card_image_url);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
      {/* Angled creator cards background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Left side cards - angled stack */}
        <div
          className="absolute -left-16 top-1/2"
          style={{ transform: `translateY(calc(-50% + ${scrollY * 0.4}px))` }}
        >
          <div className="flex flex-col gap-5" style={{ transform: 'rotate(-15deg)' }}>
            {creatorImages.slice(0, 3).map((img, i) => (
              <div
                key={`left-${i}`}
                className="w-40 h-56 rounded-2xl overflow-hidden shadow-2xl opacity-15"
                style={{
                  transform: `translateX(${i * 15}px) translateY(${scrollY * (0.15 + i * 0.08)}px)`,
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right side cards - angled stack */}
        <div
          className="absolute -right-16 top-1/2"
          style={{ transform: `translateY(calc(-50% + ${-scrollY * 0.3}px))` }}
        >
          <div className="flex flex-col gap-5" style={{ transform: 'rotate(15deg)' }}>
            {creatorImages.slice(3, 6).map((img, i) => (
              <div
                key={`right-${i}`}
                className="w-40 h-56 rounded-2xl overflow-hidden shadow-2xl opacity-15"
                style={{
                  transform: `translateX(${-i * 15}px) translateY(${-scrollY * (0.15 + i * 0.08)}px)`,
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Scattered floating cards */}
        <div
          className="absolute left-[15%] -top-8 w-28 h-40 rounded-xl overflow-hidden shadow-xl opacity-10"
          style={{ transform: `rotate(-10deg) translateY(${scrollY * 0.5}px)` }}
        >
          <img src={creatorImages[6]} alt="" className="w-full h-full object-cover" />
        </div>
        <div
          className="absolute right-[20%] top-10 w-24 h-32 rounded-xl overflow-hidden shadow-xl opacity-10"
          style={{ transform: `rotate(12deg) translateY(${scrollY * 0.35}px)` }}
        >
          <img src={creatorImages[7]} alt="" className="w-full h-full object-cover" />
        </div>
        <div
          className="absolute left-[20%] bottom-20 w-32 h-44 rounded-xl overflow-hidden shadow-xl opacity-10"
          style={{ transform: `rotate(8deg) translateY(${-scrollY * 0.4}px)` }}
        >
          <img src={creatorImages[1]} alt="" className="w-full h-full object-cover" />
        </div>
        <div
          className="absolute right-[15%] bottom-10 w-28 h-36 rounded-xl overflow-hidden shadow-xl opacity-10"
          style={{ transform: `rotate(-14deg) translateY(${-scrollY * 0.3}px)` }}
        >
          <img src={creatorImages[4]} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="text-center mb-16"
          style={{ transform: `translateY(${-scrollY * 0.08}px)` }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Four Ways to Earn
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Diversify your income with multiple revenue streams. Stack them for maximum earnings.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {earningMethods.map((method, index) => (
            <div
              key={method.title}
              className="relative p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 group"
              style={{ transform: `translateY(${scrollY * (0.05 - index * 0.02)}px)` }}
            >
              {/* Hover glow */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${method.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

              <div className="relative">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${method.bgColor} flex items-center justify-center mb-5 shadow-sm`}>
                  <method.icon className={`w-7 h-7 ${method.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{method.title}</h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{method.description}</p>

                {/* Example */}
                <div className={`inline-flex px-4 py-2 rounded-full bg-gradient-to-r ${method.color} text-white text-xs font-semibold shadow-md`}>
                  {method.example}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div
          className="mt-20 grid sm:grid-cols-3 gap-8 text-center"
          style={{ transform: `translateY(${-scrollY * 0.05}px)` }}
        >
          {[
            { value: '85%', label: 'Creator Payout', sublabel: 'Industry-leading rates' },
            { value: '$0', label: 'Platform Fee', sublabel: 'No monthly subscription' },
            { value: '24h', label: 'Payout Speed', sublabel: 'Fast direct deposits' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-100 shadow-lg"
              style={{ transform: `translateY(${scrollY * (0.03 * index)}px)` }}
            >
              <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </p>
              <p className="text-slate-900 font-semibold">{stat.label}</p>
              <p className="text-sm text-slate-500">{stat.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
