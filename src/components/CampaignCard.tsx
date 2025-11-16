import { Calendar, DollarSign } from 'lucide-react';
import { Campaign } from '../types/database';

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline(campaign.deadline);
  const isUrgent = daysLeft <= 7;

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-lg transition-all duration-200 hover:border-blue-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
            {campaign.logo_initials}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{campaign.brand_name}</p>
            <h3 className="text-sm font-semibold text-slate-900">{campaign.title}</h3>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">
        {campaign.description}
      </p>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-xs font-medium text-slate-900">{campaign.budget_range}</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className={`text-xs font-medium ${isUrgent ? 'text-orange-600' : 'text-slate-600'}`}>
            {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
          </span>
        </div>
      </div>

      {campaign.niches && campaign.niches.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {campaign.niches.slice(0, 3).map((niche) => (
            <span
              key={niche}
              className="inline-flex rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-medium"
            >
              {niche}
            </span>
          ))}
        </div>
      )}

      {campaign.regions && campaign.regions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {campaign.regions.map((region) => (
            <span
              key={region}
              className="inline-flex rounded-full bg-blue-50 text-blue-600 px-2 py-0.5 text-xs font-medium"
            >
              {region}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button className="flex-1 text-xs font-medium text-blue-600 py-2 px-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
          View Brief
        </button>
        <button className="flex-1 text-xs font-medium text-white py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-colors">
          Apply Now
        </button>
      </div>
    </div>
  );
}
