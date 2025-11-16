import { useEffect, useState } from 'react';
import { BarChart3, Loader, TrendingUp, Users } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminStats } from '../../lib/adminHelpers';
import { AdminStats } from '../../types/database';

export default function AdminReports() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    const { stats: data } = await getAdminStats();
    setStats(data);
    setLoading(false);
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

  if (!stats) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading reports
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reports & Analytics</h1>
          <p className="text-slate-600">Platform metrics and insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Creators</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalCreators}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-600">Verified: {stats.verifiedCreators}</p>
              <p className="text-xs text-slate-600">Pending: {stats.pendingVerification}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Growth (7d)</p>
                <p className="text-2xl font-bold text-slate-900">{stats.newSignups7d}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-600">Last 24h: {stats.newSignups24h}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Campaigns</p>
                <p className="text-2xl font-bold text-slate-900">{stats.liveCampaigns}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-600">Active campaigns</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Collaboration Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-slate-50 rounded-lg">
              <p className="text-4xl font-bold text-slate-900 mb-2">{stats.totalBookingRequests}</p>
              <p className="text-sm text-slate-600">Total Requests</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <p className="text-4xl font-bold text-green-600 mb-2">{stats.completedCollaborations}</p>
              <p className="text-sm text-slate-600">Completed</p>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-lg">
              <p className="text-4xl font-bold text-orange-600 mb-2">{stats.pendingRequests}</p>
              <p className="text-sm text-slate-600">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Platform Health</h3>
          <p className="text-sm text-slate-600">
            Your platform is growing steadily with {stats.newSignups7d} new signups in the last week.
            {stats.pendingVerification > 0 && ` You have ${stats.pendingVerification} verifications pending review.`}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
