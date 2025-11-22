import { HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';

export default function BrandCta() {
  const features = [
    {
      icon: HeartHandshake,
      title: 'Closer to your favorite creators',
      description:
        'Unlock content that never hits the public feed — daily moments, unfiltered stories, and drops made just for paying fans.',
    },
    {
      icon: Sparkles,
      title: 'Premium, curated experience',
      description:
        'No endless scrolling. Snapreme helps you find creators you actually care about and keeps everything in one clean space.',
    },
    {
      icon: ShieldCheck,
      title: 'Safe, private, and secure',
      description:
        'Your payments and access are protected. Creators keep control of their content, and you keep control of your data.',
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-slate-50 border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid gap-12 lg:grid-cols-2 items-center">

          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
              Built for fans who want more than just a follow.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
              Social media is loud. Snapreme is quiet, intentional, and premium. Subscribe to the creators
              you love and get a direct line to their best content — with no noise from the algorithm.
            </p>
            <p className="text-sm text-slate-500">
              Pay monthly, cancel anytime. New features for messaging, bundles, and exclusive drops are rolling
              out during early access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200
                           border border-slate-100"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
