import { Link } from 'react-router-dom';
import { DollarSign, FileText, Users, Sparkles, BarChart, MessageCircle } from 'lucide-react';

export default function ForCreatorsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-white text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.16),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">For Creators</h1>
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Turn your Snapchat presence into a real business. Join thousands of creators building paid
            partnerships, selling shoppable story promotions, and growing their brand with Snapreme.
          </p>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Why Join Snapreme?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Creators use Snapreme to grow their audience, monetize their stories, and partner with brands who
              value authentic content.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Monetize Your Stories</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Create shoppable offers for promos, takeovers, and premium story access that brands can book
                directly.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Professional Profile</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Get a public profile brands can browse and share, showcasing your best work and audience stats.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Brand Discovery</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Get matched with brands looking for Snapchat creators in your niche and region.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Tools to Grow Faster</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Get AI-assisted pricing suggestions, bio writing, and audience demographic breakdowns.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Apply in Minutes</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Fill out a quick form with your Snapcode and creator info. Anyone can apply for free.
              </p>
              <Link
                to="/apply"
                className="inline-flex px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all"
              >
                Apply Now
              </Link>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Create Shoppable Offers</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Add story promos, takeovers, and packages that brands can buy directly from your profile.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Start Collaborating</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Receive brand requests directly through your Snapreme profile and manage your deals in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Creator Tools Included</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Public Snapcode Profile</h3>
              <p className="text-sm text-slate-600">
                Host your Snapcode, offers, and stats in one shareable link.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Offer Builder</h3>
              <p className="text-sm text-slate-600">Quickly launch story promotions and service packages.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Audience Insights</h3>
              <p className="text-sm text-slate-600">
                Snapreme estimates demographics, regions, and engagement data.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Collab Request Inbox</h3>
              <p className="text-sm text-slate-600">Manage your brand deals from one central dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start your creator journey today.</h2>
          <p className="text-lg text-blue-100 mb-8">Snapreme is free to join for all creators.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/apply"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-lg"
            >
              Apply Now
            </Link>
            <Link
              to="/network"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
            >
              Preview Creator Profiles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
