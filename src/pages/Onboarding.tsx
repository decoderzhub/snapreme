import { CheckCircle, Upload, Shield, Heart, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settingUpFan, setSettingUpFan] = useState(false);

  const handleSetupAsFan = async () => {
    if (!user) return;
    setSettingUpFan(true);

    try {
      const { error } = await supabase
        .from('fan_profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          account_type: 'fan',
          onboarding_complete: false,
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Supabase error:', error);
        alert(`Failed to set up fan account: ${error.message}`);
        setSettingUpFan(false);
        return;
      }

      navigate('/fan-onboarding');
    } catch (err) {
      console.error('Error setting up fan account:', err);
      alert('Failed to set up fan account. Please try again.');
      setSettingUpFan(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-transparent py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-lg p-8 sm:p-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Welcome to peak.boo!</h1>
          </div>
          <p className="text-blue-50 text-lg max-w-2xl">
            Choose how you'd like to use peak.boo. You can always change this later.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">I'm a Creator</h2>
            <p className="text-slate-600 mb-6">
              Share your content, grow your audience, and monetize your Snapchat presence.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">Upload avatar, card image, and banner</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">Set your subscription price</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">Connect Stripe for payouts</p>
              </div>
            </div>

            <Link
              to="/account/settings"
              className="block w-full text-center px-5 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              Complete creator profile
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">I'm a Fan</h2>
            <p className="text-slate-600 mb-6">
              Discover and subscribe to your favorite creators' premium Snapchat content.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">Browse thousands of creators</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">Save favorites and get recommendations</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">Unlock premium content securely</p>
              </div>
            </div>

            <button
              onClick={handleSetupAsFan}
              disabled={settingUpFan}
              className="block w-full text-center px-5 py-3 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-colors disabled:opacity-60"
            >
              {settingUpFan ? 'Setting up...' : 'Continue as fan'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Not sure yet?</p>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Preview the network</h3>
          <p className="text-slate-600 mb-4">
            Browse creators as a guest. No commitment required.
          </p>
          <Link
            to="/network"
            className="inline-flex items-center px-5 py-2.5 rounded-full border-2 border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Explore creators
          </Link>
        </div>
      </div>
    </div>
  );
}
