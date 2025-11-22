import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Rocket } from 'lucide-react';
import InfluencerGrid from '../components/InfluencerGrid';
import BrandCta from '../components/BrandCta';
import ForCreators from '../components/ForCreators';
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

  return (
    <main>
      {/* HERO SECTION */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-blue-50/60 to-transparent overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_65%)]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-lg text-sm font-semibold mb-6 animate-pulse">
            <Rocket className="w-4 h-4 text-blue-600" />
            <span>Launching January 1st, 2026 • Early access live</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Premium creator content,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              all in one place.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
            Snapreme lets you subscribe to your favorite creators and unlock exclusive, story-style content,
            behind-the-scenes moments, and private drops — while creators get a simple way to earn directly
            from their fans.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap mb-4">
            <Link
              to={user ? '/network' : '/signup'}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg hover:brightness-110 transition-all"
            >
              {user ? 'Browse Creators' : 'Create your free account'}
            </Link>

            <Link
              to="/apply"
              className="px-8 py-3 rounded-full border border-slate-300 text-slate-700 font-medium hover:border-blue-500 hover:text-blue-600 bg-white/70 backdrop-blur-sm transition-all"
            >
              Become a creator
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-slate-500">
            No public feed. No algorithm games. Just direct connection between creators and their biggest fans.
          </p>
        </div>
      </section>

      <InfluencerGrid />
      <BrandCta />
      <ForCreators />
      <ContactSection />
    </main>
  );
}
