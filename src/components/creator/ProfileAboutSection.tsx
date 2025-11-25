import { Link } from 'react-router-dom';
import {
  QrCode,
  Lock,
  AlertCircle,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Calendar,
  Star,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { Creator } from '../../types/database';

interface ProfileAboutSectionProps {
  creator: Creator;
  isOwnProfile: boolean;
  isSubscribed: boolean;
  subscriberCount: number;
}

export function ProfileAboutSection({
  creator,
  isOwnProfile,
  isSubscribed,
  subscriberCount,
}: ProfileAboutSectionProps) {
  const bio = (creator as any).bio || '';
  const snapcodeUrl = (creator as any).snapcode_url || null;
  const displayName = (creator as any).display_name || (creator as any).name || 'Creator';
  const category = creator.category;
  const joinedDate = (creator as any).created_at
    ? new Date((creator as any).created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  // Check for social links (placeholder for now)
  const socialLinks = {
    instagram: (creator as any).instagram_url,
    twitter: (creator as any).twitter_url,
    youtube: (creator as any).youtube_url,
  };

  const hasSocialLinks = Object.values(socialLinks).some(Boolean);

  // Soft enforcement: warn if bio looks like it has Snapchat username attempts
  const looksLikeSnapBypass = /snap(chat)?|sc:|add me on sc|snap me/i.test(bio);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">About {displayName}</h3>
              {category && (
                <span className="text-xs text-white/60">{category}</span>
              )}
            </div>
          </div>
          {isOwnProfile && (
            <Link
              to="/account/settings"
              className="text-xs text-purple-400 font-medium hover:text-purple-300"
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Bio */}
        <div>
          {bio ? (
            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          ) : (
            <p className="text-white/50 text-sm italic">
              {isOwnProfile
                ? 'Add a bio to tell fans about yourself.'
                : "This creator hasn't added a bio yet."}
            </p>
          )}

          {isOwnProfile && looksLikeSnapBypass && (
            <div className="mt-4 flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-200/80">
                It looks like you might be mentioning Snapchat directly in your bio.
                To keep peak.boo as the secure middle layer, please avoid putting your
                Snapchat username here. Fans should only get access via the unlock + QR flow.
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4">
          {subscriberCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{subscriberCount}</p>
                <p className="text-white/50 text-xs">Subscribers</p>
              </div>
            </div>
          )}
          {joinedDate && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{joinedDate}</p>
                <p className="text-white/50 text-xs">Joined</p>
              </div>
            </div>
          )}
        </div>

        {/* Social Links */}
        {hasSocialLinks && (
          <div className="flex flex-wrap gap-2">
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 text-white/80 text-xs font-medium hover:bg-pink-600/30 transition-colors"
              >
                <Instagram className="w-4 h-4" />
                Instagram
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            )}
            {socialLinks.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-white/80 text-xs font-medium hover:bg-blue-600/30 transition-colors"
              >
                <Twitter className="w-4 h-4" />
                Twitter
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            )}
            {socialLinks.youtube && (
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-white/80 text-xs font-medium hover:bg-red-600/30 transition-colors"
              >
                <Youtube className="w-4 h-4" />
                YouTube
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            )}
          </div>
        )}

        {/* Snapchat QR Section */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-yellow-400" />
            <h4 className="text-white font-semibold">Premium Snapchat Access</h4>
          </div>

          {!snapcodeUrl && isOwnProfile && (
            <div className="text-center py-4">
              <p className="text-white/60 text-sm mb-3">
                Add your Snapchat QR code so fans can unlock it after subscribing.
              </p>
              <Link
                to="/account/settings"
                className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold transition-colors"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Add Snapchat QR
              </Link>
            </div>
          )}

          {!isOwnProfile && !isSubscribed && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-32 h-32 rounded-2xl bg-white/10 flex items-center justify-center mb-3 border border-white/20">
                <Lock className="w-10 h-10 text-white/40" />
              </div>
              <p className="text-white/60 text-xs text-center max-w-xs">
                Subscribe to unlock this creator's Snapchat QR code and access their premium content directly in Snapchat.
              </p>
            </div>
          )}

          {(isSubscribed || isOwnProfile) && snapcodeUrl && (
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-2xl p-4 mb-3">
                <img
                  src={snapcodeUrl}
                  alt="Snapchat QR code"
                  className="w-36 h-36 object-contain"
                />
              </div>
              <p className="text-white/50 text-[11px] text-center">
                Scan with Snapchat to connect.
                {!isOwnProfile && " Don't share this publicly – it's reserved for paying fans."}
              </p>
            </div>
          )}

          {isSubscribed && !snapcodeUrl && !isOwnProfile && (
            <div className="text-center py-4">
              <p className="text-white/60 text-sm">
                This creator hasn't added their Snapchat QR code yet. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
