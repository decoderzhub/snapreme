import { DollarSign, Users, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForCreators() {
  const perks = [
    { icon: DollarSign, text: 'Earn recurring income from monthly fan subscriptions.' },
    { icon: Users, text: 'Own your audience instead of chasing algorithms and brand deals.' },
    { icon: Lock, text: 'Control what you share, who sees it, and how it is priced.' },
    { icon: Sparkles, text: 'Offer exclusive drops, behind-the-scenes, and premium story sets.' },
  ];

  return (
    <section id="for-creators" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-6">
              Turn your close friends vibe into a real business.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
              peak.boo gives you a clean, simple way to share premium, story-style content with the fans who
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
                  "peak.boo makes it easy. I post once, choose who sees it, and know exactly what I'm earning each month."
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
