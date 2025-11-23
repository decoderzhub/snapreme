import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Upload, X, Plus } from 'lucide-react';
import MultiStepProgress from '../components/MultiStepProgress';
import Field from '../components/Field';
import { CreatorApplication } from '../types/database';
import { supabase } from '../lib/supabase';

const NICHES = [
  'Beauty',
  'Fitness',
  'Lifestyle',
  'Gaming',
  'Couples',
  'Business',
  'Creator',
  'Travel',
  'Food',
  'Fashion',
  'Technology',
  'Health',
];

const REGIONS = ['North America', 'Europe', 'Asia-Pacific', 'LATAM', 'Global'];

const DELIVERY_WINDOWS = ['24 hours', '48 hours', '3 days', '5 days', '7 days'];

const steps = [
  { label: 'Basics', description: 'Your profile info' },
  { label: 'Content', description: 'Audience & content' },
  { label: 'Offers', description: 'Monetization setup' },
];

export default function ApplyCreator() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<CreatorApplication>({
    full_name: '',
    snapchat_handle: '',
    email: '',
    region: 'North America',
    niches: [],
    snapcode_file: null,
    followers: 0,
    avg_story_views: 0,
    short_bio: '',
    content_types: '',
    open_to_collabs: true,
    open_to_swaps: false,
    offers: [
      {
        title: '',
        description: '',
        price_label: '',
        delivery_window: '48 hours',
        best_for: '',
      },
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof CreatorApplication, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const toggleNiche = (niche: string) => {
    const niches = formData.niches.includes(niche)
      ? formData.niches.filter((n) => n !== niche)
      : [...formData.niches, niche];
    updateField('niches', niches);
  };

  const addOffer = () => {
    if (formData.offers.length < 3) {
      updateField('offers', [
        ...formData.offers,
        {
          title: '',
          description: '',
          price_label: '',
          delivery_window: '48 hours',
          best_for: '',
        },
      ]);
    }
  };

  const removeOffer = (index: number) => {
    if (formData.offers.length > 1) {
      updateField(
        'offers',
        formData.offers.filter((_, i) => i !== index)
      );
    }
  };

  const updateOffer = (index: number, field: string, value: string) => {
    const offers = [...formData.offers];
    offers[index] = { ...offers[index], [field]: value };
    updateField('offers', offers);
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.snapchat_handle.trim()) newErrors.snapchat_handle = 'Snapchat handle is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (formData.niches.length === 0) newErrors.niches = 'Select at least one niche';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.short_bio?.trim()) newErrors.short_bio = 'Short bio is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    const firstOffer = formData.offers[0];
    if (!firstOffer.title.trim()) newErrors.offer_title = 'At least one offer title is required';
    if (!firstOffer.description.trim()) newErrors.offer_description = 'Offer description is required';
    if (!firstOffer.price_label.trim()) newErrors.offer_price = 'Price label is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('creator_applications').insert([
        {
          full_name: formData.full_name,
          snapchat_handle: formData.snapchat_handle,
          email: formData.email,
          region: formData.region,
          niches: formData.niches,
          followers: formData.followers || 0,
          avg_story_views: formData.avg_story_views || 0,
          short_bio: formData.short_bio,
          content_types: formData.content_types,
          open_to_collabs: formData.open_to_collabs,
          open_to_swaps: formData.open_to_swaps,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-transparent py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.12)] p-8 sm:p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Received!</h2>
            <p className="text-lg text-slate-600 mb-6">
              Your creator application has been received. We'll email you at{' '}
              <span className="font-semibold text-blue-600">{formData.email}</span> when your peak.boo profile
              is live.
            </p>
            <p className="text-slate-600 mb-8">
              In the meantime, you can preview what your profile will look like and share it with brands.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/network')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
              >
                Explore the Network
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-transparent py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.12)] p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">
              Apply as a peak.boo Creator
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Anyone can apply. We'll use your info to build a professional profile brands can browse.
            </p>
          </div>

          <MultiStepProgress steps={steps} currentStep={currentStep} />

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Basic Information</h2>

              <Field
                label="Full Name"
                type="text"
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                error={errors.full_name}
                required
                placeholder="John Doe"
              />

              <Field
                label="Snapchat Handle"
                type="text"
                value={formData.snapchat_handle}
                onChange={(e) => updateField('snapchat_handle', e.target.value)}
                error={errors.snapchat_handle}
                required
                placeholder="@username"
                helper="Your Snapchat username"
              />

              <Field
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                required
                placeholder="you@example.com"
              />

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Region <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => updateField('region', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Content Niches <span className="text-red-500">*</span>
                </label>
                {errors.niches && <p className="text-xs text-red-600 mb-2">{errors.niches}</p>}
                <div className="flex flex-wrap gap-2">
                  {NICHES.map((niche) => (
                    <button
                      key={niche}
                      type="button"
                      onClick={() => toggleNiche(niche)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.niches.includes(niche)
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {niche}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Snapcode Upload</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-1">Click to upload your Snapcode</p>
                  <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => updateField('snapcode_file', e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Content & Audience</h2>

              <Field
                label="Followers"
                type="number"
                value={formData.followers || ''}
                onChange={(e) => updateField('followers', parseInt(e.target.value) || 0)}
                placeholder="50000"
                helper="Your current Snapchat follower count"
              />

              <Field
                label="Average Story Views"
                type="number"
                value={formData.avg_story_views || ''}
                onChange={(e) => updateField('avg_story_views', parseInt(e.target.value) || 0)}
                placeholder="5000"
                helper="Average views per story"
              />

              <Field
                label="Short Bio"
                as="textarea"
                value={formData.short_bio || ''}
                onChange={(e) => updateField('short_bio', e.target.value)}
                error={errors.short_bio}
                required
                placeholder="Tell brands who you are and what makes your content special..."
                helper="This will appear on your creator card (2-3 sentences)"
              />

              <Field
                label="What type of content do you create?"
                as="textarea"
                value={formData.content_types || ''}
                onChange={(e) => updateField('content_types', e.target.value)}
                placeholder="e.g., Daily vlogs, Product reviews, Behind-the-scenes, Tutorials..."
                helper="Describe the types of content you share"
              />

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.open_to_collabs}
                    onChange={(e) => updateField('open_to_collabs', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    I'm open to brand collaborations
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.open_to_swaps}
                    onChange={(e) => updateField('open_to_swaps', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    I'm open to shoutout swaps with other creators
                  </span>
                </label>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Your Offers</h2>
                <p className="text-slate-600">
                  Set up shoppable offers that brands can book directly from your profile.
                </p>
              </div>

              {formData.offers.map((offer, index) => (
                <div key={index} className="bg-slate-50 rounded-2xl p-6 relative">
                  {formData.offers.length > 1 && (
                    <button
                      onClick={() => removeOffer(index)}
                      className="absolute top-4 right-4 p-1.5 bg-white rounded-full hover:bg-red-50 transition-colors"
                    >
                      <X size={16} className="text-red-500" />
                    </button>
                  )}

                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Offer {index + 1}</h3>

                  <div className="space-y-4">
                    <Field
                      label="Offer Title"
                      type="text"
                      value={offer.title}
                      onChange={(e) => updateOffer(index, 'title', e.target.value)}
                      error={index === 0 ? errors.offer_title : undefined}
                      required={index === 0}
                      placeholder="e.g., Story Promo Package, 24h Takeover"
                    />

                    <Field
                      label="Description"
                      as="textarea"
                      value={offer.description}
                      onChange={(e) => updateOffer(index, 'description', e.target.value)}
                      error={index === 0 ? errors.offer_description : undefined}
                      required={index === 0}
                      placeholder="Describe what's included in this offer..."
                    />

                    <Field
                      label="Price Label"
                      type="text"
                      value={offer.price_label}
                      onChange={(e) => updateOffer(index, 'price_label', e.target.value)}
                      error={index === 0 ? errors.offer_price : undefined}
                      required={index === 0}
                      placeholder="e.g., $99, $249 / story"
                      helper="How you want to display your pricing"
                    />

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Delivery Window</label>
                      <select
                        value={offer.delivery_window}
                        onChange={(e) => updateOffer(index, 'delivery_window', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {DELIVERY_WINDOWS.map((window) => (
                          <option key={window} value={window}>
                            {window}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Field
                      label="Best For"
                      type="text"
                      value={offer.best_for}
                      onChange={(e) => updateOffer(index, 'best_for', e.target.value)}
                      placeholder="e.g., Product launches, Brand awareness"
                      helper="What type of campaigns is this offer ideal for?"
                    />
                  </div>
                </div>
              ))}

              {formData.offers.length < 3 && (
                <button
                  onClick={addOffer}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 text-slate-600 hover:text-blue-600 font-medium"
                >
                  <Plus size={20} />
                  Add Another Offer (up to 3 total)
                </button>
              )}
            </div>
          )}

          {errors.submit && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Back
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
