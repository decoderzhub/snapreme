import { useState } from 'react';
import { Package, CheckCircle } from 'lucide-react';
import type { ContentPackage, PackagePurchase } from '../../types/database';

interface ContentPackagesCardProps {
  packages: ContentPackage[];
  purchases: PackagePurchase[];
  onPurchase: (packageId: string) => void;
}

export function ContentPackagesCard({ packages, purchases, onPurchase }: ContentPackagesCardProps) {
  const [selectedPackage, setSelectedPackage] = useState<ContentPackage | null>(null);

  const isPurchased = (packageId: string) => {
    return purchases.some((p) => p.package_id === packageId);
  };

  if (packages.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-900">Content Packages</h3>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Get access to exclusive content bundles
        </p>

        <div className="space-y-3">
          {packages.map((pkg) => {
            const purchased = isPurchased(pkg.id);

            return (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                disabled={purchased}
                className={`w-full text-left rounded-xl border transition-all ${
                  purchased
                    ? 'border-emerald-200 bg-emerald-50 cursor-default'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="p-3">
                  {pkg.cover_image_url && (
                    <div className="aspect-video rounded-lg overflow-hidden mb-2">
                      <img
                        src={pkg.cover_image_url}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">
                        {pkg.title}
                      </h4>
                      {pkg.includes_summary && (
                        <p className="text-xs text-slate-600 mb-2">
                          {pkg.includes_summary}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        {pkg.items_count} items included
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {purchased ? (
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          <span>Unlocked</span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">
                            ${(pkg.price_cents / 100).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-blue-600 font-medium">
                            View details
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedPackage && (
        <ContentPackageDialog
          package={selectedPackage}
          onClose={() => setSelectedPackage(null)}
          onPurchase={onPurchase}
        />
      )}
    </>
  );
}

function ContentPackageDialog({
  package: pkg,
  onClose,
  onPurchase,
}: {
  package: ContentPackage;
  onClose: () => void;
  onPurchase: (packageId: string) => void;
}) {
  const handlePurchase = () => {
    onPurchase(pkg.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {pkg.cover_image_url && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={pkg.cover_image_url}
              alt={pkg.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{pkg.title}</h2>

          {pkg.description && (
            <p className="text-slate-700 mb-4">{pkg.description}</p>
          )}

          {pkg.includes_summary && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">What's included:</h3>
              <p className="text-sm text-slate-600">{pkg.includes_summary}</p>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Total</span>
              <span className="text-2xl font-bold text-slate-900">
                ${(pkg.price_cents / 100).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 rounded-full font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:brightness-110 transition-all shadow-md"
            >
              Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
