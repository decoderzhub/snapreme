import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader, Clock, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getPendingVerifications, updateCreatorVerification, logAdminActivity } from '../../lib/adminHelpers';
import { Creator } from '../../types/database';

export default function AdminVerifications() {
  const [pendingCreators, setPendingCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  async function loadPendingVerifications() {
    setLoading(true);
    const { creators, error: verificationError } = await getPendingVerifications();

    if (verificationError) {
      setError(verificationError.message);
    } else {
      setPendingCreators(creators);
    }

    setLoading(false);
  }

  async function handleApprove(creator: Creator) {
    if (!confirm(`Approve ${creator.name} for verification?`)) {
      return;
    }

    setProcessing(true);
    const { error } = await updateCreatorVerification(creator.id, 'verified', verificationNotes);

    if (error) {
      alert(`Error approving verification: ${error.message}`);
    } else {
      await logAdminActivity('approve_verification', 'creator', creator.id, { name: creator.name });
      setSelectedCreator(null);
      setVerificationNotes('');
      loadPendingVerifications();
    }

    setProcessing(false);
  }

  async function handleReject(creator: Creator) {
    if (!verificationNotes.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    if (!confirm(`Reject ${creator.name}'s verification?`)) {
      return;
    }

    setProcessing(true);
    const { error } = await updateCreatorVerification(creator.id, 'rejected', verificationNotes);

    if (error) {
      alert(`Error rejecting verification: ${error.message}`);
    } else {
      await logAdminActivity('reject_verification', 'creator', creator.id, {
        name: creator.name,
        reason: verificationNotes,
      });
      setSelectedCreator(null);
      setVerificationNotes('');
      loadPendingVerifications();
    }

    setProcessing(false);
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Pending Verifications</h1>
          <p className="text-slate-600">Review and approve creator verification requests</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {pendingCreators.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h3>
            <p className="text-slate-600">There are no pending verification requests at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingCreators.map((creator) => (
              <div
                key={creator.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  {creator.avatar_url ? (
                    <img
                      src={creator.avatar_url}
                      alt={creator.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-xl font-semibold text-slate-600">
                        {creator.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">{creator.name}</h3>
                    <p className="text-sm text-slate-600">{creator.handle}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        <Clock size={12} />
                        Pending
                      </span>
                      {creator.is_admin && (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Followers</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {creator.followers.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Engagement</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {creator.engagement_rate}%
                    </p>
                  </div>
                </div>

                {creator.bio && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-600 line-clamp-2">{creator.bio}</p>
                  </div>
                )}

                {creator.niches && creator.niches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {creator.niches.map((niche) => (
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

                {creator.snapcode_url && (
                  <div className="mb-4">
                    <a
                      href={creator.snapcode_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <ImageIcon size={16} />
                      View Snapcode
                    </a>
                  </div>
                )}

                {creator.verification_submitted_at && (
                  <p className="text-xs text-slate-500 mb-4">
                    Submitted: {new Date(creator.verification_submitted_at).toLocaleString()}
                  </p>
                )}

                <button
                  onClick={() => setSelectedCreator(creator)}
                  className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Review Verification
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedCreator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-start gap-4 mb-6">
                {selectedCreator.avatar_url ? (
                  <img
                    src={selectedCreator.avatar_url}
                    alt={selectedCreator.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-slate-600">
                      {selectedCreator.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedCreator.name}</h2>
                  <p className="text-slate-600">{selectedCreator.handle}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Verification Notes
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes about this verification (optional for approval, required for rejection)"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedCreator)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {processing ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedCreator)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {processing ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  Reject
                </button>
                <button
                  onClick={() => {
                    setSelectedCreator(null);
                    setVerificationNotes('');
                  }}
                  disabled={processing}
                  className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
