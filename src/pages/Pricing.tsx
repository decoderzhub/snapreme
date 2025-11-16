import { Check } from 'lucide-react';

export default function Pricing() {
  const tiers = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for new creators getting started',
      features: [
        'Public creator profile',
        'Up to 3 shoppable offers',
        'AI-generated bio',
        'Access to brand campaigns',
        'Basic analytics',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Creator Pro',
      price: '$9/mo',
      description: 'For established creators growing their business',
      features: [
        'Everything in Starter',
        'Priority visibility in network',
        'Unlimited shoppable offers',
        'Custom cover photos',
        'Advanced audience insights',
        'Analytics dashboard',
        'Email support',
      ],
      cta: 'Upgrade to Pro',
      highlighted: true,
    },
    {
      name: 'Creator Elite',
      price: '$29/mo',
      description: 'For top creators serious about scaling',
      features: [
        'Everything in Pro',
        'Featured homepage placement',
        'Dedicated account manager',
        'Priority brand outreach assistance',
        'Advanced analytics & reporting',
        'Campaign performance tracking',
        'API access',
      ],
      cta: 'Join Elite',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-gradient-to-b from-blue-50/60 to-transparent text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.16),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Simple, Creator-Friendly Pricing
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Start free. Pay only when you earn. No hidden fees or long-term contracts.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`bg-white rounded-3xl border p-8 transition-all ${
                tier.highlighted
                  ? 'border-blue-600 shadow-xl scale-105 relative'
                  : 'border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-500 text-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                </div>
                <p className="text-sm text-slate-600">{tier.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full px-6 py-3 font-semibold rounded-lg transition-all ${
                  tier.highlighted
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md hover:shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-4">Not sure which plan is right for you?</p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md">
            Contact Our Team
          </button>
        </div>
      </section>
    </div>
  );
}
