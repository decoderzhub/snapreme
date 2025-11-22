import { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  Loader,
  ChevronDown,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAllCreators, updateCreatorAccountStatus, deleteCreator, logAdminActivity } from '../../lib/adminHelpers';
import { Creator } from '../../types/database';

export default function AdminCreators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCreators();
  }, []);

  useEffect(() => {
    filterCreatorsList();
  }, [creators, searchTerm, filterStatus, filterTier]);

  async function loadCreators() {
    setLoading(true);
    const { creators: data, error: creatorsError } = await getAllCreators();

    if (creatorsError) {
      setError(creatorsError.message);
    } else {
      setCreators(data);
    }

    setLoading(false);
  }

  function filterCreatorsList() {
    let filtered = [...creators];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.handle.toLowerCase().includes(term) ||
          c.user_id.toLowerCase().includes(term)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((c) => c.verification_status === filterStatus);
    }

    if (filterTier !== 'all') {
      filtered = filtered.filter((c) => c.tier === filterTier);
    }

    setFilteredCreators(filtered);
  }

  async function handleSuspend(creator: Creator) {
    if (!confirm(`Suspend ${creator.name}? They will no longer be able to access the platform.`)) {
      return;
    }

    const { error } = await updateCreatorAccountStatus(creator.id, 'suspended');
    if (error) {
      alert(`Error suspending creator: ${error.message}`);
    } else {
      await logAdminActivity('suspend_creator', 'creator', creator.id, { name: creator.name });
      loadCreators();
    }
  }

  async function handleActivate(creator: Creator) {
    const { error } = await updateCreatorAccountStatus(creator.id, 'active');
    if (error) {
      alert(`Error activating creator: ${error.message}`);
    } else {
      await logAdminActivity('activate_creator', 'creator', creator.id, { name: creator.name });
      loadCreators();
    }
  }

  async function handleDelete(creator: Creator) {
    if (!confirm(`Delete ${creator.name}? This action cannot be undone!`)) {
      return;
    }

    const confirmed = confirm('Are you absolutely sure? Type DELETE to confirm.');
    if (!confirmed) return;

    const { error } = await deleteCreator(creator.id);
    if (error) {
      alert(`Error deleting creator: ${error.message}`);
    } else {
      await logAdminActivity('delete_creator', 'creator', creator.id, { name: creator.name });
      loadCreators();
    }
  }

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      verified: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Loader },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      unverified: { bg: 'bg-slate-100', text: 'text-slate-700', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unverified;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={12} />
        {status || 'unverified'}
      </span>
    );
  };

  const getAccountStatusBadge = (status?: string) => {
    if (status === 'suspended') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <Ban size={12} />
          Suspended
        </span>
      );
    }
    return null;
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Creators Management</h1>
            <p className="text-slate-600">Manage all creator accounts on the platform</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, handle, or user ID..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Filter size={18} />
              Filters
              <ChevronDown size={16} />
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Verification Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tier</label>
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Tiers</option>
                  <option value="Rising">Rising</option>
                  <option value="Pro">Pro</option>
                  <option value="Elite">Elite</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Creator</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Handle</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Followers</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Tier</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCreators.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      No creators found
                    </td>
                  </tr>
                ) : (
                  filteredCreators.map((creator) => (
                    <tr key={creator.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {creator.avatar_url ? (
                            <img
                              src={creator.avatar_url}
                              alt={creator.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                              <span className="text-sm font-semibold text-slate-600">
                                {creator.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{creator.name}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(creator.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700">{creator.handle}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">
                        {creator.followers.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {creator.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(creator.verification_status)}
                          {getAccountStatusBadge(creator.account_status)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {creator.account_status === 'suspended' ? (
                            <button
                              onClick={() => handleActivate(creator)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Activate"
                            >
                              <CheckCircle size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspend(creator)}
                              className="p-1 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                              title="Suspend"
                            >
                              <Ban size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(creator)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 text-center text-sm text-slate-600">
          Showing {filteredCreators.length} of {creators.length} creators
        </div>
      </div>
    </AdminLayout>
  );
}
