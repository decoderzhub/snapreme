import { Link } from 'react-router-dom';
import { Sparkles, Users, TrendingUp, Zap, Target, BarChart } from 'lucide-react';

export default function ForBrands() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-white text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.16),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">For Brands</h1>
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Partner with peak.boo to discover premium Snapchat creators for your campaigns, amplify engagement,
            and connect with audiences through authentic, high-converting story content.
          </p>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Our Services</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Strategic creator solutions designed to help your brand grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Creator Campaign Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Full-service management of Snapchat story promotions, takeovers, and UGC content creation.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Influencer Matchmaking</h3>
              <p className="text-slate-600 leading-relaxed">
                We match your brand with creators who align with your niche, tone, and target audience.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Content Creation Strategy</h3>
              <p className="text-slate-600 leading-relaxed">
                High-performing story concepts tailored for audience engagement and conversion optimization.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI-Powered Brief Generation</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Automatically generate campaign briefs with our intelligent brand tool.
              </p>
              <Link
                to="/briefs/new"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Generate a Brief →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why Choose peak.boo Creators?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Authentic Connections</h3>
              <p className="text-slate-600 leading-relaxed">
                Reach engaged audiences through creators who share real-time content that resonates and drives
                genuine brand affinity.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Fast, Scalable Production</h3>
              <p className="text-slate-600 leading-relaxed">
                Turn campaigns around quickly with story-first formats and efficient workflows that scale with your
                needs.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Performance Insights</h3>
              <p className="text-slate-600 leading-relaxed">
                Data-driven analytics to help optimize future creator partnerships and maximize campaign ROI.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Proven Results</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                peak.boo creators drive measurable engagement and brand lift across industries.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                    3.2x
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Higher Story Retention</h3>
                    <p className="text-sm text-slate-600">Compared to traditional ads</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                    24/7
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Creator Availability</h3>
                    <p className="text-sm text-slate-600">Across global time zones</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                    38%
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Average Lift in Swipe-up Rate</h3>
                    <p className="text-sm text-slate-600">For product promotions</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-200 h-96 rounded-2xl flex items-center justify-center">
              <img
                src="https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Brand success"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to elevate your brand campaigns?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Let's craft high-converting Snapchat collaborations together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-lg"
            >
              Book a Discovery Call
            </a>
            <Link
              to="/briefs/new"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
            >
              Generate Campaign Brief
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
