import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import InfluencerGrid from '../components/InfluencerGrid';
import BrandCta from '../components/BrandCta';
import ForCreators from '../components/ForCreators';
import ContactSection from '../components/ContactSection';

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <main>
      <section id="about" className="relative py-20 md:py-28 bg-gradient-to-b from-blue-50/60 to-transparent overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
            Premium Snapchat Influencer Discovery
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
            Connect with verified Snapchat creators who drive real results. Whether you're a brand seeking authentic partnerships or a creator ready to monetize your influence, Snapreme is your trusted marketplace.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to={user ? '/network' : '/signup'}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {user ? 'Go to Network' : 'Explore the Snapreme Network'}
            </Link>
            {!user && (
              <Link
                to="/login"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      <InfluencerGrid />
      <BrandCta />
      <ForCreators />
      <ContactSection />
    </main>
  );
}
