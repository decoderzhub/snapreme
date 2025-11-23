import { Upload, Package, MessageCircle, DollarSign, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateGuideProps {
  isOwnProfile: boolean;
}

export function EmptyStateGuide({ isOwnProfile }: EmptyStateGuideProps) {
  if (!isOwnProfile) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-neutral-950 backdrop-blur-lg border border-white/5 p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-white/40" />
        </div>
        <h3 className="text-white text-lg font-semibold mb-2">No content yet</h3>
        <p className="text-white/60 text-sm">
          This creator hasn't posted yet. Follow to get notified when they do!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-neutral-950 backdrop-blur-lg border border-white/5 p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-white text-xl font-bold mb-2">Start Sharing Your Content</h3>
        <p className="text-white/70 text-sm">
          Upload your first post to start earning from your fans
        </p>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm mb-1">Upload Content</h4>
              <p className="text-white/60 text-xs mb-2">
                Share videos and images with your fans. Set individual unlock prices or make content exclusive to subscribers.
              </p>
              <div className="text-xs text-purple-400 font-medium">
                Coming soon: Upload directly from dashboard
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm mb-1">Create Bundles</h4>
              <p className="text-white/60 text-xs">
                Package multiple posts together and offer them at a discounted price to increase sales.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm mb-1">Engage via PPM</h4>
              <p className="text-white/60 text-xs">
                Fans can send you paid messages. Respond to build relationships and earn extra income.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm mb-1">Set Your Pricing</h4>
              <p className="text-white/60 text-xs mb-2">
                Configure your monthly subscription price and connect Stripe to start receiving payments.
              </p>
              <Link
                to="/dashboard/monetization"
                className="text-xs text-amber-400 font-medium hover:text-amber-300"
              >
                Go to Monetization Settings →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:brightness-110 transition-all shadow-lg"
        >
          <Sparkles className="w-4 h-4" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
