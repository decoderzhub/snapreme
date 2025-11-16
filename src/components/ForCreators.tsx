import { DollarSign, Users, Lock, Sparkles } from 'lucide-react';

export default function ForCreators() {
  const perks = [
    { icon: DollarSign, text: 'Keep 85%+ of your collaboration earnings' },
    { icon: Users, text: 'Get discovered by premium brands actively seeking creators' },
    { icon: Lock, text: 'Protect your identity with secure booking management' },
    { icon: Sparkles, text: 'Access exclusive brand partnerships and campaigns' },
  ];

  return (
    <section id="for-creators" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-6">
              Turn your Snapchat into a real business.
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Join Snapreme's exclusive creator network and connect with brands that value your unique voice and audience.
              We handle the business side so you can focus on creating amazing content.
            </p>
            <ul className="space-y-4 mb-8">
              {perks.slice(0, 3).map((perk) => (
                <li key={perk.text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <perk.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-slate-700 leading-relaxed">{perk.text}</span>
                </li>
              ))}
            </ul>
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg">
              Apply as a Creator
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-card">
            <h3 className="text-2xl font-semibold text-slate-900 mb-6">Creator Perks</h3>
            <ul className="space-y-5">
              {perks.map((perk) => (
                <li key={perk.text} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                    <perk.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-700 font-medium leading-relaxed">{perk.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-8 border-t border-blue-100">
              <p className="text-sm text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-900">Fast approval:</span> Most applications are reviewed within 48 hours.
                Start collaborating with brands as soon as you're approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
