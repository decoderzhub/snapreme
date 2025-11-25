import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Camera,
  User,
  ArrowRight,
  Check,
  Loader,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ImageUpload from '../components/ImageUpload';
import { uploadProfileImage, deleteProfileImage } from '../lib/profileHelpers';

const CATEGORY_OPTIONS = [
  { id: 'Fitness', label: 'Fitness' },
  { id: 'Fashion', label: 'Fashion' },
  { id: 'Art', label: 'Art & Design' },
  { id: 'Coaching', label: 'Coaching' },
  { id: 'Cosplay', label: 'Cosplay' },
  { id: 'Lifestyle', label: 'Lifestyle' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCard, setUploadingCard] = useState(false);

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    setUploadingAvatar(true);

    if (avatarUrl) {
      await deleteProfileImage(avatarUrl);
    }

    const { url, error: uploadError } = await uploadProfileImage(file, user.id, 'avatar');
    if (uploadError) {
      setError(uploadError.message);
    } else if (url) {
      setAvatarUrl(url);
    }
    setUploadingAvatar(false);
  };

  const handleCardUpload = async (file: File) => {
    if (!user) return;
    setUploadingCard(true);

    if (cardImageUrl) {
      await deleteProfileImage(cardImageUrl);
    }

    const { url, error: uploadError } = await uploadProfileImage(file, user.id, 'card');
    if (uploadError) {
      setError(uploadError.message);
    } else if (url) {
      setCardImageUrl(url);
    }
    setUploadingCard(false);
  };

  const canProceedStep1 = displayName.trim() && username.trim();
  const canProceedStep2 = avatarUrl && cardImageUrl;
  const canProceedStep3 = category;

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      // Create creator profile
      const { error: createError } = await supabase
        .from('creators')
        .upsert({
          user_id: user.id,
          name: displayName,
          display_name: displayName,
          handle: `@${username}`,
          bio: bio,
          avatar_url: avatarUrl,
          card_image_url: cardImageUrl,
          category: category,
          niches: category ? [category] : [],
          tier: 'Rising',
          onboarding_complete: true,
          account_status: 'active',
          verification_status: 'pending',
          subscription_price: 9.99,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (createError) {
        console.error('Error creating profile:', createError);
        setError(createError.message);
        setLoading(false);
        return;
      }

      // Navigate to their new profile
      navigate(`/creator/${username}`);
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-4 border border-purple-500/30">
            <Sparkles className="w-4 h-4" />
            Welcome to peak.boo
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Set Up Your Profile</h1>
          <p className="text-slate-400">
            Create your creator profile and start sharing content
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-20 h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Basic Information</h2>
                <p className="text-sm text-slate-400">How should we introduce you?</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Display Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Your display name"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username <span className="text-red-400">*</span>
                </label>
                <div className="flex">
                  <span className="px-4 py-3 bg-slate-700 border border-slate-600 border-r-0 rounded-l-xl text-slate-400">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-r-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="username"
                    maxLength={30}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">This will be your unique profile URL</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio <span className="text-slate-500">(optional)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  placeholder="Tell your fans about yourself..."
                  rows={3}
                  maxLength={300}
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Images */}
        {step === 2 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Camera className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Profile Images</h2>
                <p className="text-sm text-slate-400">Add photos to make your profile stand out</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Profile Picture <span className="text-red-400">*</span>
                </label>
                <ImageUpload
                  currentImage={avatarUrl}
                  onImageSelect={handleAvatarUpload}
                  onImageRemove={() => setAvatarUrl(null)}
                  label="Avatar"
                  aspectRatio="aspect-square"
                  uploading={uploadingAvatar}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Card Image <span className="text-red-400">*</span>
                </label>
                <ImageUpload
                  currentImage={cardImageUrl}
                  onImageSelect={handleCardUpload}
                  onImageRemove={() => setCardImageUrl(null)}
                  label="Card"
                  aspectRatio="aspect-[3/4]"
                  uploading={uploadingCard}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4 text-center">
              Your card image appears on the Explore page and Sneak Peak feed
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Category */}
        {step === 3 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Content Category</h2>
                <p className="text-sm text-slate-400">What type of content will you create?</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    category === cat.id
                      ? 'bg-purple-500/20 border-purple-500 text-white'
                      : 'bg-slate-900/30 border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{cat.label}</span>
                    {category === cat.id && (
                      <Check className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!canProceedStep3 || loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Skip Option */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Want to explore first?{' '}
          <button
            onClick={() => navigate('/sneak-peak')}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Browse the feed
          </button>
        </p>
      </div>
    </div>
  );
}
