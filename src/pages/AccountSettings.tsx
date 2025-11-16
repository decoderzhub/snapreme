import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader, CheckCircle, AlertCircle, Eye, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';
import Field from '../components/Field';
import {
  getCurrentUserProfile,
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
  updateUserEmail,
  updateUserPassword,
  ProfileUpdateData,
} from '../lib/profileHelpers';
import { Creator } from '../types/database';

const NICHE_OPTIONS = [
  'Fashion & Beauty',
  'Fitness & Health',
  'Food & Cooking',
  'Travel & Lifestyle',
  'Gaming & Tech',
  'Comedy & Entertainment',
  'Business & Finance',
  'Art & Photography',
  'Music & Dance',
  'Education & Learning',
];

const REGION_OPTIONS = [
  'North America',
  'Europe',
  'Asia',
  'South America',
  'Africa',
  'Oceania',
  'Middle East',
];

const TIER_OPTIONS: Array<'Rising' | 'Pro' | 'Elite'> = ['Rising', 'Pro', 'Elite'];

export default function AccountSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingSnapcode, setUploadingSnapcode] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Creator | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: '',
    display_name: '',
    handle: '',
    bio: '',
    short_bio: '',
    about: '',
    region: '',
    followers: 0,
    engagement_rate: 0,
    starting_rate: 0,
    starting_rate_label: '',
    avg_story_views: 0,
    tier: 'Rising',
    content_types: [],
    top_regions: [],
    avatar_url: null,
    cover_url: null,
    snapcode_url: null,
  });

  const [niches, setNiches] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [contentTypeInput, setContentTypeInput] = useState('');
  const [topRegionInput, setTopRegionInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  async function loadProfile() {
    setLoading(true);
    const { profile: profileData, error: profileError } = await getCurrentUserProfile();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (profileData) {
      setProfile(profileData);
      setFormData({
        name: profileData.name || '',
        display_name: profileData.display_name || '',
        handle: profileData.handle || '',
        bio: profileData.bio || '',
        short_bio: profileData.short_bio || '',
        about: profileData.about || '',
        region: profileData.region || '',
        followers: profileData.followers || 0,
        engagement_rate: profileData.engagement_rate || 0,
        starting_rate: profileData.starting_rate || 0,
        starting_rate_label: profileData.starting_rate_label || '',
        avg_story_views: profileData.avg_story_views || 0,
        tier: profileData.tier || 'Rising',
        content_types: profileData.content_types || [],
        top_regions: profileData.top_regions || [],
        avatar_url: profileData.avatar_url,
        cover_url: profileData.cover_url,
        snapcode_url: profileData.snapcode_url,
      });
      setNiches(profileData.niches || []);
      setNewEmail(user?.email || '');
    }

    setLoading(false);
  }

  const handleInputChange = (field: keyof ProfileUpdateData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    setUploadingAvatar(true);
    if (formData.avatar_url) {
      await deleteProfileImage(formData.avatar_url);
    }

    const { url, error: uploadError } = await uploadProfileImage(file, user.id, 'avatar');

    if (uploadError) {
      setError(uploadError.message);
    } else if (url) {
      handleInputChange('avatar_url', url);
    }

    setUploadingAvatar(false);
  };

  const handleCoverUpload = async (file: File) => {
    if (!user) return;

    setUploadingCover(true);
    if (formData.cover_url) {
      await deleteProfileImage(formData.cover_url);
    }

    const { url, error: uploadError } = await uploadProfileImage(file, user.id, 'cover');

    if (uploadError) {
      setError(uploadError.message);
    } else if (url) {
      handleInputChange('cover_url', url);
    }

    setUploadingCover(false);
  };

  const handleSnapcodeUpload = async (file: File) => {
    if (!user) return;

    setUploadingSnapcode(true);
    if (formData.snapcode_url) {
      await deleteProfileImage(formData.snapcode_url);
    }

    const { url, error: uploadError } = await uploadProfileImage(file, user.id, 'snapcode');

    if (uploadError) {
      setError(uploadError.message);
    } else if (url) {
      handleInputChange('snapcode_url', url);
    }

    setUploadingSnapcode(false);
  };

  const handleNicheToggle = (niche: string) => {
    setNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
    setHasUnsavedChanges(true);
  };

  const addContentType = () => {
    if (contentTypeInput.trim() && !formData.content_types?.includes(contentTypeInput.trim())) {
      handleInputChange('content_types', [...(formData.content_types || []), contentTypeInput.trim()]);
      setContentTypeInput('');
    }
  };

  const removeContentType = (type: string) => {
    handleInputChange('content_types', formData.content_types?.filter((t) => t !== type) || []);
  };

  const addTopRegion = () => {
    if (topRegionInput.trim() && !formData.top_regions?.includes(topRegionInput.trim())) {
      handleInputChange('top_regions', [...(formData.top_regions || []), topRegionInput.trim()]);
      setTopRegionInput('');
    }
  };

  const removeTopRegion = (region: string) => {
    handleInputChange('top_regions', formData.top_regions?.filter((r) => r !== region) || []);
  };

  const handleSave = async () => {
    if (!user) return;

    setError('');
    setSaving(true);

    if (!formData.handle?.startsWith('@')) {
      setError('Handle must start with @');
      setSaving(false);
      return;
    }

    const { error: updateError } = await updateUserProfile(user.id, formData, niches);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    if (newEmail && newEmail !== user.email) {
      const { error: emailError } = await updateUserEmail(newEmail);
      if (emailError) {
        setError(`Profile updated but email change failed: ${emailError.message}`);
        setSaving(false);
        return;
      }
    }

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        setSaving(false);
        return;
      }

      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        setSaving(false);
        return;
      }

      const { error: passwordError } = await updateUserPassword(newPassword);
      if (passwordError) {
        setError(`Profile updated but password change failed: ${passwordError.message}`);
        setSaving(false);
        return;
      }

      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    }

    setSuccess(true);
    setHasUnsavedChanges(false);
    setSaving(false);

    setTimeout(() => setSuccess(false), 3000);
    await loadProfile();
  };

  const calculateCompleteness = () => {
    const fields = [
      formData.name,
      formData.handle,
      formData.bio,
      formData.short_bio,
      formData.avatar_url,
      formData.cover_url,
      formData.region,
      niches.length > 0,
      formData.content_types && formData.content_types.length > 0,
      formData.starting_rate_label,
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-transparent flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-transparent flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Profile Found</h2>
          <p className="text-slate-600 mb-6">
            You need to create a creator profile first.
          </p>
          <button
            onClick={() => navigate('/apply')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  const completeness = calculateCompleteness();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-transparent py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Account Settings</h1>
          <p className="text-slate-600">Manage your creator profile and account preferences</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Profile updated successfully!</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-900">Profile Completeness</h3>
            <span className="text-2xl font-bold text-blue-600">{completeness}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Complete your profile to increase visibility to brands
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile Pictures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUpload
                currentImage={formData.avatar_url}
                onImageSelect={handleAvatarUpload}
                onImageRemove={() => handleInputChange('avatar_url', null)}
                label="Avatar Image"
                aspectRatio="aspect-square"
                uploading={uploadingAvatar}
              />
              <ImageUpload
                currentImage={formData.cover_url}
                onImageSelect={handleCoverUpload}
                onImageRemove={() => handleInputChange('cover_url', null)}
                label="Cover Image"
                aspectRatio="aspect-[4/3]"
                uploading={uploadingCover}
              />
            </div>
            <div className="mt-6">
              <ImageUpload
                currentImage={formData.snapcode_url}
                onImageSelect={handleSnapcodeUpload}
                onImageRemove={() => handleInputChange('snapcode_url', null)}
                label="Snapcode Image"
                aspectRatio="aspect-square"
                uploading={uploadingSnapcode}
              />
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Basic Information</h2>
            <div className="space-y-4">
              <Field
                label="Display Name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your Name"
                required
              />
              <Field
                label="Username (for search)"
                value={formData.display_name || ''}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="Display Name"
              />
              <Field
                label="Handle"
                value={formData.handle || ''}
                onChange={(e) => handleInputChange('handle', e.target.value)}
                placeholder="@yourusername"
                required
              />
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Creator Tier
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => handleInputChange('tier', e.target.value as 'Rising' | 'Pro' | 'Elite')}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIER_OPTIONS.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Region
                </label>
                <select
                  value={formData.region || ''}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a region</option>
                  {REGION_OPTIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Bio & About</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Short Bio
                  <span className="text-xs text-slate-500 font-normal ml-2">
                    (shown on cards)
                  </span>
                </label>
                <textarea
                  value={formData.short_bio || ''}
                  onChange={(e) => handleInputChange('short_bio', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y"
                  placeholder="A brief description of what you do..."
                  maxLength={160}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.short_bio?.length || 0}/160 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Bio
                  <span className="text-xs text-slate-500 font-normal ml-2">
                    (shown on profile header)
                  </span>
                </label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
                  placeholder="Tell brands about yourself..."
                  maxLength={300}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.bio?.length || 0}/300 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  About
                  <span className="text-xs text-slate-500 font-normal ml-2">
                    (full profile description)
                  </span>
                </label>
                <textarea
                  value={formData.about || ''}
                  onChange={(e) => handleInputChange('about', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] resize-y"
                  placeholder="Write a detailed description about your content, style, and what makes you unique..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.about?.length || 0} characters
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Content & Niches</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Select Your Niches
                </label>
                <div className="flex flex-wrap gap-2">
                  {NICHE_OPTIONS.map((niche) => (
                    <button
                      key={niche}
                      type="button"
                      onClick={() => handleNicheToggle(niche)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        niches.includes(niche)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {niche}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Content Types
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={contentTypeInput}
                    onChange={(e) => setContentTypeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContentType())}
                    placeholder="e.g., Stories, Reels, Spotlights"
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addContentType}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.content_types?.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {type}
                      <button
                        type="button"
                        onClick={() => removeContentType(type)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Top Audience Regions
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={topRegionInput}
                    onChange={(e) => setTopRegionInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopRegion())}
                    placeholder="e.g., United States, United Kingdom"
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addTopRegion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.top_regions?.map((region) => (
                    <span
                      key={region}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                    >
                      {region}
                      <button
                        type="button"
                        onClick={() => removeTopRegion(region)}
                        className="hover:text-slate-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Stats & Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Followers"
                type="number"
                value={formData.followers?.toString() || '0'}
                onChange={(e) => handleInputChange('followers', parseInt(e.target.value) || 0)}
                placeholder="100000"
              />
              <Field
                label="Engagement Rate (%)"
                type="number"
                step="0.01"
                value={formData.engagement_rate?.toString() || '0'}
                onChange={(e) => handleInputChange('engagement_rate', parseFloat(e.target.value) || 0)}
                placeholder="5.5"
              />
              <Field
                label="Average Story Views"
                type="number"
                value={formData.avg_story_views?.toString() || '0'}
                onChange={(e) => handleInputChange('avg_story_views', parseInt(e.target.value) || 0)}
                placeholder="50000"
              />
              <Field
                label="Starting Rate (in cents)"
                type="number"
                value={formData.starting_rate?.toString() || '0'}
                onChange={(e) => handleInputChange('starting_rate', parseInt(e.target.value) || 0)}
                placeholder="50000"
                helperText="100 cents = $1.00"
              />
              <div className="md:col-span-2">
                <Field
                  label="Starting Rate Label"
                  value={formData.starting_rate_label || ''}
                  onChange={(e) => handleInputChange('starting_rate_label', e.target.value)}
                  placeholder="e.g., $500 / Story Post"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Account Security
            </h2>
            <div className="space-y-4">
              <Field
                label="Email Address"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="your@email.com"
              />

              {!showPasswordSection ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Change Password
                </button>
              ) : (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <Field
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <Field
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-slate-600 hover:text-slate-700 font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 sticky bottom-6 bg-white rounded-xl shadow-lg border border-slate-100 p-4">
          <button
            type="button"
            onClick={() => navigate(`/creator/${profile.handle.replace('@', '')}`)}
            className="flex items-center gap-2 px-6 py-3 text-slate-700 font-semibold hover:text-slate-900 transition-colors"
          >
            <Eye className="w-5 h-5" />
            Preview Profile
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (hasUnsavedChanges) {
                  if (confirm('Discard unsaved changes?')) {
                    loadProfile();
                    setHasUnsavedChanges(false);
                  }
                } else {
                  navigate(-1);
                }
              }}
              className="px-6 py-3 text-slate-600 font-semibold hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
