import { Target, TrendingUp, ShieldCheck } from 'lucide-react';

export default function BrandCta() {
  const features = [
    {
      icon: Target,
      title: 'Brand Alignment',
      description: 'Creators matched to your niche, tone, and region for authentic partnerships.',
    },
    {
      icon: TrendingUp,
      title: 'Conversion-Ready Content',
      description: 'Story formats optimized for clicks, signups, and sales that drive real results.',
    },
    {
      icon: ShieldCheck,
      title: 'Safe & Verified',
      description: 'ID-verified creators with transparent pricing and secure collaboration.',
    },
  ];

  return (
    <section id="for-brands" className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Need a perfect Snapchat creator for your brand?
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Snapreme matches your brand with vetted Snapchat influencers based on audience, niche, and campaign goals.
            From promo stories to long-term ambassador deals, we handle the hard parts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg">
            Book a Brand Call
          </button>
          <a
            href="#"
            className="px-8 py-4 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            View brand case studies →
          </a>
        </div>
      </div>
    </section>
  );
}
