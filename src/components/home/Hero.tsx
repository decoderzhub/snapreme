import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(124,58,237,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.08),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            SFW Creator Platform • Brand-Safe & Professional
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Monetize Your Superfans.{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Keep It Professional.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8 max-w-3xl mx-auto">
            The SFW creator platform for fitness, fashion, cosplay, coaching, and art.
            Visual content, paid messaging, and subscriptions—without the adult content stigma.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all"
            >
              Start Earning as a Creator
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/network"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Play className="w-5 h-5" />
              Explore Creators
            </Link>
          </div>
        </div>

        {/* Creator Cards Preview */}
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Fitness Coach', category: 'Fitness', color: 'from-orange-400 to-red-500' },
              { name: 'Style Creator', category: 'Fashion', color: 'from-pink-400 to-purple-500' },
              { name: 'Cosplay Artist', category: 'Cosplay', color: 'from-blue-400 to-cyan-500' },
              { name: 'Career Coach', category: 'Coaching', color: 'from-emerald-400 to-teal-500' },
            ].map((creator, i) => (
              <div
                key={i}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200 group cursor-pointer"
              >
                {/* Gradient Placeholder */}
                <div className={`absolute inset-0 bg-gradient-to-br ${creator.color} opacity-80`} />

                {/* Blur Overlay */}
                <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />

                {/* Unlock Badge */}
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/90 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Unlock
                </div>

                {/* Creator Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-semibold text-sm">{creator.name}</p>
                  <p className="text-white/70 text-xs">{creator.category}</p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100% SFW Content</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Stripe Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Verified Creators Only</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
