import { CheckCircle, Upload, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-transparent py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10 mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Creator setup</p>
              <h1 className="text-3xl font-bold text-slate-900">Finish your Snapreme profile</h1>
              <p className="text-slate-600 mt-2 max-w-2xl">
                Upload your avatar, card image, and banner to activate your creator account. Fans only see profiles that
                are 100% complete and compliant.
              </p>
            </div>
            <Link
              to="/account/settings"
              className="inline-flex items-center px-5 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to setup
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Required images</h3>
              <p className="text-sm text-slate-600">Avatar, card image, and banner are mandatory for discovery.</p>
            </div>
            <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Compliance</h3>
              <p className="text-sm text-slate-600">No Snapchat usernames in bios, handles, or descriptions.</p>
            </div>
            <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Secure unlocks</h3>
              <p className="text-sm text-slate-600">Fans unlock via Snapreme + Stripe, never via leaked usernames.</p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-slate-600">
              Already have your assets? Head to the setup page to upload them and mark onboarding complete.
            </p>
            <div className="mt-3 flex gap-3 flex-wrap">
              <Link
                to="/account/settings"
                className="inline-flex items-center px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold"
              >
                Complete profile
              </Link>
              <Link
                to="/network"
                className="inline-flex items-center px-4 py-2 rounded-full border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                Preview the network
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
