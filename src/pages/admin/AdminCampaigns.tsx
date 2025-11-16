import { useEffect, useState } from 'react';
import { Loader, ToggleLeft, ToggleRight, Trash2, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAllCampaigns, updateCampaignStatus, deleteCampaign, logAdminActivity } from '../../lib/adminHelpers';
import { Campaign } from '../../types/database';

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    setLoading(true);
    const { campaigns: data, error: campaignsError } = await getAllCampaigns();

    if (campaignsError) {
      setError(campaignsError.message);
    } else {
      setCampaigns(data);
    }

    setLoading(false);
  }

  async function handleToggleStatus(campaign: Campaign) {
    const newStatus = !campaign.is_active;
    const { error } = await updateCampaignStatus(campaign.id, newStatus);

    if (error) {
      alert(`Error updating campaign: ${error.message}`);
    } else {
      await logAdminActivity('toggle_campaign', 'campaign', campaign.id, {
        title: campaign.title,
        is_active: newStatus,
      });
      loadCampaigns();
    }
  }

  async function handleDelete(campaign: Campaign) {
    if (!confirm(`Delete campaign "${campaign.title}"? This action cannot be undone!`)) {
      return;
    }

    const { error } = await deleteCampaign(campaign.id);

    if (error) {
      alert(`Error deleting campaign: ${error.message}`);
    } else {
      await logAdminActivity('delete_campaign', 'campaign', campaign.id, { title: campaign.title });
      loadCampaigns();
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Brand Campaigns</h1>
          <p className="text-slate-600">Manage all campaigns on the platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {campaigns.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-600">No campaigns found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-xl border border-slate-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{campaign.title}</h3>
                    <p className="text-sm text-slate-600">{campaign.brand_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle size={12} />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        <XCircle size={12} />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{campaign.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Budget Range</p>
                    <p className="text-sm font-semibold text-slate-900">{campaign.budget_range}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Deadline</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(campaign.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {campaign.niches && campaign.niches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {campaign.niches.map((niche) => (
                        <span
                          key={niche}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {niche}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => handleToggleStatus(campaign)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {campaign.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    {campaign.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(campaign)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-slate-50 rounded-lg p-4 text-center text-sm text-slate-600">
          Showing {campaigns.length} campaigns
        </div>
      </div>
    </AdminLayout>
  );
}
