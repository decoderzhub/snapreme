import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, Users, Lock, Sparkles, Rocket } from 'lucide-react';
import InfluencerGrid from '../components/InfluencerGrid';
import BrandCta from '../components/BrandCta';
import ContactSection from '../components/ContactSection';

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]);

  const perks = [
    { icon: DollarSign, text: 'Earn recurring income from monthly fan subscriptions.' },
    { icon: Users, text: 'Own your audience instead of chasing algorithms and brand deals.' },
    { icon: Lock, text: 'Control what you share, who sees it, and how it is priced.' },
    { icon: Sparkles, text: 'Offer exclusive drops, behind-the-scenes, and premium story sets.' },
  ];

  return (
    <main>
      {/* HERO SECTION - Creator Value Proposition */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-blue-50/60 to-transparent overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_65%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                Turn your close friends vibe into a real business.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
                Snapreme gives you a clean, simple way to share premium, story-style content with the fans who
                actually care — and get paid for it. No chasing brand managers, no complicated contracts.
              </p>

              <ul className="space-y-4 mb-6">
                {perks.map((perk) => (
                  <li key={perk.text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <perk.icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-slate-700 leading-relaxed text-sm sm:text-base">{perk.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r
                           from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-md hover:shadow-lg
                           hover:brightness-110 transition-all"
              >
                Create account
              </Link>
            </div>

            <div className="relative">
              {/* Launching Badge */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-lg text-sm font-semibold animate-pulse">
                  <Rocket className="w-4 h-4 text-blue-600" />
                  <span>Launching January 1st, 2026 • Early access live</span>
                </div>
              </div>

              {/* Dashboard Preview Card */}
              <div className="relative bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.6),transparent_60%)] opacity-70" />

                <div className="relative space-y-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                    Creator dashboard preview
                  </p>

                  <h3 className="text-xl font-semibold">Your premium content, simplified.</h3>

                  <div className="space-y-3 text-sm text-slate-100">
                    <div className="flex justify-between">
                      <span>Active subscribers</span>
                      <span className="font-semibold">218</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly recurring</span>
                      <span className="font-semibold">$3,240</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Drop performance</span>
                      <span>87% viewed • 42% saved</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-xs text-slate-200">
                    "Snapreme makes it easy. I post once, choose who sees it, and know exactly what I'm earning each month."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InfluencerGrid />
      <BrandCta />
      <ContactSection />
    </main>
  );
}
