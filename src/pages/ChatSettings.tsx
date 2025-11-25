import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Bell,
  BellOff,
  Pin,
  Flag,
  Ban,
  ChevronRight,
  Crown,
  Check,
  Sparkles,
  Shield,
  Coins,
  MessageCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { demoCreators } from '../data/demoCreators';

export default function ChatSettings() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  // Find creator from chat ID
  const creatorIndex = parseInt(chatId?.split('-')[1] || '0') - 1;
  const creator = demoCreators[creatorIndex * 2] || demoCreators[0];
  const displayName = creator.display_name || creator.name;

  const [isMuted, setIsMuted] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const ppmRate = creator.tier === 'Elite' ? 4.99 : creator.tier === 'Verified' ? 2.99 : 1.99;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-neutral-950/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center py-8 px-4">
        <div className="relative mb-4">
          <img
            src={creator.avatar_url}
            alt={displayName}
            className="w-24 h-24 rounded-full object-cover"
          />
          {creator.is_verified && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center border-3 border-neutral-950">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-white">{displayName}</h1>
          {creator.tier === 'Elite' && (
            <Crown className="w-5 h-5 text-amber-400" />
          )}
        </div>

        <span className="text-slate-400 text-sm mb-4">{creator.handle}</span>

        <Link
          to={`/creator/${creator.handle?.replace('@', '') || creator.id}`}
          className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-500 transition-colors"
        >
          View Profile
        </Link>
      </div>

      {/* Creator Info Card */}
      <div className="mx-4 mb-6 p-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">AI-Powered Chat</span>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          This creator uses AI to help respond to messages faster while maintaining their authentic voice.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl">
            <Coins className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-white font-semibold text-sm">${ppmRate.toFixed(2)}</p>
              <p className="text-slate-500 text-xs">per message</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl">
            <Zap className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-white font-semibold text-sm">~30 sec</p>
              <p className="text-slate-500 text-xs">response time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Options */}
      <div className="px-4 space-y-2">
        {/* Group Chat Option */}
        <button
          onClick={() => {}}
          className="w-full flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <span className="flex-1 text-left text-white font-medium">Create group chat</span>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>

        {/* Mute Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-full flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
            {isMuted ? (
              <BellOff className="w-5 h-5 text-slate-400" />
            ) : (
              <Bell className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <span className="flex-1 text-left text-white font-medium">Mute notifications</span>
          <div
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              isMuted ? 'bg-purple-600' : 'bg-slate-600'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isMuted ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </button>

        {/* Pin Toggle */}
        <button
          onClick={() => setIsPinned(!isPinned)}
          className="w-full flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
            <Pin className="w-5 h-5 text-slate-400" />
          </div>
          <span className="flex-1 text-left text-white font-medium">Pin to top</span>
          <div
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              isPinned ? 'bg-purple-600' : 'bg-slate-600'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isPinned ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Danger Zone */}
      <div className="px-4 mt-6 space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 px-1">Safety</p>

        {/* Report */}
        <button
          onClick={() => setShowReportModal(true)}
          className="w-full flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <Flag className="w-5 h-5 text-red-400" />
          </div>
          <span className="flex-1 text-left text-red-400 font-medium">Report</span>
        </button>

        {/* Block */}
        <button
          onClick={() => setShowBlockModal(true)}
          className="w-full flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <Ban className="w-5 h-5 text-red-400" />
          </div>
          <span className="flex-1 text-left text-red-400 font-medium">Block</span>
        </button>
      </div>

      {/* Trust & Safety Info */}
      <div className="mx-4 mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-300 font-medium mb-1">Your safety matters</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              peak.boo has a zero-tolerance policy for harassment, spam, and inappropriate content.
              All messages are monitored for safety.
            </p>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-sm bg-slate-900 rounded-2xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white text-center mb-2">Report {displayName}?</h3>
              <p className="text-slate-400 text-sm text-center mb-6">
                Select a reason for reporting this user. Our team will review your report.
              </p>

              <div className="space-y-2">
                {['Spam or scam', 'Harassment', 'Inappropriate content', 'Impersonation', 'Other'].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => {
                      setShowReportModal(false);
                      // Show success toast
                    }}
                    className="w-full p-3 bg-slate-800 hover:bg-slate-700 text-white text-left rounded-xl transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowReportModal(false)}
              className="w-full p-4 border-t border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-sm bg-slate-900 rounded-2xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white text-center mb-2">Block {displayName}?</h3>
              <p className="text-slate-400 text-sm text-center mb-6">
                They won't be able to message you or see your content. You can unblock them later.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    navigate('/inbox');
                  }}
                  className="w-full p-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors"
                >
                  Block
                </button>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="w-full p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}
