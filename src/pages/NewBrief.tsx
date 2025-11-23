import { useState } from 'react';
import { Sparkles, Copy, CheckCircle } from 'lucide-react';
import Field from '../components/Field';

const REGIONS = ['North America', 'Europe', 'Asia-Pacific', 'LATAM', 'Global'];
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
const DELIVERABLES = [
  'Story promo',
  'Story series',
  'Giveaway',
  'Product review',
  'Takeover',
  'Behind-the-scenes',
  'Tutorial',
  'Q&A session',
];

export default function NewBrief() {
  const [formData, setFormData] = useState({
    campaign_title: '',
    promoting: '',
    target_audience: '',
    regions: [] as string[],
    creator_niche: '',
    budget_range: '',
    deliverables: [] as string[],
  });

  const [generatedBrief, setGeneratedBrief] = useState('');
  const [copied, setCopied] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleRegion = (region: string) => {
    const regions = formData.regions.includes(region)
      ? formData.regions.filter((r) => r !== region)
      : [...formData.regions, region];
    updateField('regions', regions);
  };

  const toggleDeliverable = (deliverable: string) => {
    const deliverables = formData.deliverables.includes(deliverable)
      ? formData.deliverables.filter((d) => d !== deliverable)
      : [...formData.deliverables, deliverable];
    updateField('deliverables', deliverables);
  };

  const generateBrief = () => {
    const brief = `
# ${formData.campaign_title || 'Campaign Brief'}

## Campaign Overview
${formData.promoting ? `We're promoting: ${formData.promoting}` : 'Product/service details to be added.'}

## Campaign Goals
• Increase brand awareness among ${formData.target_audience || 'target demographic'}
• Drive authentic engagement through story-first content
• Generate user-generated content and social proof
• Boost conversions and ${formData.promoting.toLowerCase().includes('product') ? 'sales' : 'sign-ups'}

## Target Audience
${formData.target_audience || 'To be defined'} - primarily active on Snapchat with high story engagement rates.

## Geographic Focus
${formData.regions.length > 0 ? formData.regions.join(', ') : 'Global reach with focus on key markets'}

## Ideal Creator Profile
We're looking for ${formData.creator_niche || 'authentic'} creators who:
• Have an engaged Snapchat audience in our target demographic
• Create ${formData.creator_niche ? `${formData.creator_niche.toLowerCase()}-focused` : 'authentic'} content regularly
• Can deliver ${formData.deliverables.length > 0 ? formData.deliverables.join(', ').toLowerCase() : 'various content types'}
• Share our brand values and aesthetic

## Budget Range
${formData.budget_range || 'Budget to be discussed based on creator tier and scope'}

## Deliverables
${
  formData.deliverables.length > 0
    ? formData.deliverables.map((d) => `• ${d}`).join('\n')
    : '• Story content (format to be determined)\n• Authentic product integration\n• Audience engagement'
}

## Key Talking Points
• Authenticity is key - we want creators to share their honest experience
• Story content should feel natural and align with creator's usual style
• Clear call-to-action for audience (swipe up, visit link, use promo code)
• Behind-the-scenes content performs well with our audience

## Suggested Story Structure
1. Hook: Attention-grabbing opening (3-5 seconds)
2. Introduction: Brief product/brand intro in creator's voice
3. Demonstration: Show product/service in action
4. Benefits: Highlight 2-3 key benefits naturally
5. Call-to-action: Clear next step for viewers

## Timeline
• Campaign planning: 1-2 weeks
• Creator onboarding: 3-5 days
• Content creation: 5-7 days
• Campaign launch: TBD
• Post-campaign reporting: 2-3 days after completion

## Success Metrics
• Story view-through rate
• Swipe-up conversion rate
• Engagement rate (replies, shares)
• Overall reach and impressions
• Direct attribution (promo codes, links)

---

Next Steps: Review this brief, apply to work with creators on peak.boo Network, or contact us for campaign management support.
    `.trim();

    setGeneratedBrief(brief);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedBrief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-transparent py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">
            AI Campaign Brief Builder
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Answer a few questions and let our AI generate a comprehensive campaign brief for your Snapchat
            creator collaborations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Campaign Details</h2>

            <div className="space-y-6">
              <Field
                label="Campaign Title"
                type="text"
                value={formData.campaign_title}
                onChange={(e) => updateField('campaign_title', e.target.value)}
                placeholder="e.g., Summer Product Launch 2024"
                required
              />

              <Field
                label="What are you promoting?"
                as="textarea"
                value={formData.promoting}
                onChange={(e) => updateField('promoting', e.target.value)}
                placeholder="Describe your product, service, or campaign..."
                required
              />

              <Field
                label="Target Audience"
                type="text"
                value={formData.target_audience}
                onChange={(e) => updateField('target_audience', e.target.value)}
                placeholder="e.g., 18-30 year old fitness enthusiasts"
                required
              />

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Target Regions <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => toggleRegion(region)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.regions.includes(region)
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Ideal Creator Niche <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.creator_niche}
                  onChange={(e) => updateField('creator_niche', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select a niche</option>
                  {NICHES.map((niche) => (
                    <option key={niche} value={niche}>
                      {niche}
                    </option>
                  ))}
                </select>
              </div>

              <Field
                label="Budget Range"
                type="text"
                value={formData.budget_range}
                onChange={(e) => updateField('budget_range', e.target.value)}
                placeholder="e.g., $5,000 - $10,000"
                helper="Your total campaign budget"
              />

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Desired Deliverables <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DELIVERABLES.map((deliverable) => (
                    <button
                      key={deliverable}
                      type="button"
                      onClick={() => toggleDeliverable(deliverable)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.deliverables.includes(deliverable)
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {deliverable}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateBrief}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                Generate Campaign Brief
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-6 sm:p-8 lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Generated Brief</h2>
              {generatedBrief && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                >
                  {copied ? (
                    <>
                      <CheckCircle size={18} className="text-green-600" />
                      <span className="text-sm font-medium text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} className="text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {generatedBrief ? (
              <div className="prose prose-slate max-w-none">
                <div className="bg-slate-50 rounded-xl p-6 max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                    {generatedBrief}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-12 text-center">
                <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  Fill out the form and click "Generate Campaign Brief" to see your AI-powered brief here.
                </p>
              </div>
            )}

            {generatedBrief && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <button
                  disabled
                  className="w-full px-6 py-3 bg-slate-100 text-slate-400 font-semibold rounded-lg cursor-not-allowed"
                >
                  Save Brief (Coming Soon)
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Brief saving and campaign management features coming soon
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
