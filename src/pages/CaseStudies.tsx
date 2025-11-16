import { TrendingUp, Users, Target } from 'lucide-react';

export default function CaseStudies() {
  const caseStudies = [
    {
      id: 1,
      brand: 'Volt Energy',
      title: 'Volt Energy x Lifestyle Creators',
      logo: 'VE',
      niche: 'Fitness & Lifestyle',
      creators: 14,
      views: '2.3M',
      swipeUpRate: '+38%',
      description:
        'Partnered with 14 fitness and lifestyle creators to launch new energy drink flavor. Campaign focused on authentic workout content and daily routine integration.',
    },
    {
      id: 2,
      brand: 'Lux Beauty',
      title: 'Summer Skincare Launch',
      logo: 'LB',
      niche: 'Beauty & Skincare',
      creators: 8,
      views: '1.8M',
      swipeUpRate: '+45%',
      description:
        'Collaborated with beauty influencers for authentic skincare routine content. Focus on before/after results and honest product reviews drove exceptional engagement.',
    },
    {
      id: 3,
      brand: 'GamePro',
      title: 'Gaming Headset Campaign',
      logo: 'GP',
      niche: 'Gaming & Technology',
      creators: 12,
      views: '3.1M',
      swipeUpRate: '+52%',
      description:
        'Worked with gaming creators for product reviews and tournament coverage. Live gameplay content with product integration achieved record-breaking conversion rates.',
    },
    {
      id: 4,
      brand: 'WanderCo',
      title: 'Caribbean Resort Series',
      logo: 'WC',
      niche: 'Travel & Lifestyle',
      creators: 6,
      views: '1.5M',
      swipeUpRate: '+41%',
      description:
        'Sent travel creators to partnered Caribbean resorts for multi-day content series. Authentic vacation content with property tours drove significant booking increases.',
    },
    {
      id: 5,
      brand: 'StyleHub',
      title: 'Fall Fashion Collection',
      logo: 'SH',
      niche: 'Fashion & Lifestyle',
      creators: 10,
      views: '2.0M',
      swipeUpRate: '+36%',
      description:
        'Fashion creators showcased fall collection through styling videos and outfit inspiration. Mix of haul content and daily outfit posts maximized reach and engagement.',
    },
    {
      id: 6,
      brand: 'FitLife',
      title: 'Supplement Challenge',
      logo: 'FL',
      niche: 'Fitness & Health',
      creators: 15,
      views: '2.7M',
      swipeUpRate: '+48%',
      description:
        '30-day fitness challenge featuring supplement products. Creators shared transformation content, workout routines, and honest reviews throughout campaign period.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-gradient-to-b from-blue-50/60 to-transparent text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.16),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">Case Studies</h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            See how brands and creators partnered on Snapreme to reach millions and drive real results.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study) => (
            <div
              key={study.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {study.logo}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{study.brand}</h3>
                    <p className="text-sm text-slate-600">{study.niche}</p>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-slate-900 mb-3">{study.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">{study.description}</p>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users size={16} className="text-blue-600" />
                      <span className="font-medium">Creators</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{study.creators}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Target size={16} className="text-blue-600" />
                      <span className="font-medium">Combined Views</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{study.views}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <TrendingUp size={16} className="text-green-600" />
                      <span className="font-medium">Swipe-up Rate</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{study.swipeUpRate}</span>
                  </div>
                </div>

                <button className="w-full mt-6 px-4 py-2.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-lg hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Want results like these?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Let's create a winning Snapchat creator campaign for your brand.
          </p>

          <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-lg">
            Book a Discovery Call
          </button>
        </div>
      </section>
    </div>
  );
}
