import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Loader,
  Eye,
  Heart,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminStats } from '../../lib/adminHelpers';
import { AdminStats } from '../../types/database';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    const { stats: data, error: statsError } = await getAdminStats();

    if (statsError) {
      setError(statsError.message);
    } else {
      setStats(data);
    }

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

  if (error || !stats) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>Error loading dashboard: {error || 'Unknown error'}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Overview of platform metrics and activity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/creators"
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">Total Creators</p>
            <p className="text-3xl font-bold text-slate-900">{stats.totalCreators}</p>
            <p className="text-xs text-slate-500 mt-2">+{stats.newSignups7d} in last 7 days</p>
          </Link>

          <Link
            to="/admin/verifications"
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">Verified Creators</p>
            <p className="text-3xl font-bold text-slate-900">{stats.verifiedCreators}</p>
            <p className="text-xs text-slate-500 mt-2">
              {stats.pendingVerification} pending verification
            </p>
          </Link>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">Total Profile Views</p>
            <p className="text-3xl font-bold text-slate-900">{stats.totalProfileViews || 0}</p>
            <p className="text-xs text-slate-500 mt-2">Across all creators</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">Total Favorites</p>
            <p className="text-3xl font-bold text-slate-900">{stats.totalFavorites || 0}</p>
            <p className="text-xs text-slate-500 mt-2">All favorites combined</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Signups</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-900">Last 24 Hours</p>
                  <p className="text-sm text-slate-600">New creator signups</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats.newSignups24h}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-900">Last 7 Days</p>
                  <p className="text-sm text-slate-600">New creator signups</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats.newSignups7d}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Platform Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-900">Active Subscriptions</p>
                  <p className="text-sm text-slate-600">Currently active</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.activeSubscriptions || 0}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-900">Onboarding Complete</p>
                  <p className="text-sm text-slate-600">Ready for network</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats.onboardingComplete || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/admin/verifications"
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-slate-900">Review Verifications</span>
            </Link>
            <Link
              to="/admin/creators"
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-slate-900">Manage Creators</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
