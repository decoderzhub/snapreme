import { Coins, X } from 'lucide-react';
import { useState } from 'react';
import { buyCoins } from '../../lib/payments';

interface BuyCoinsModalProps {
  onClose: () => void;
}

const COIN_PACKAGES = [
  { type: 'small' as const, coins: 100, price: 999, label: 'Starter' },
  { type: 'medium' as const, coins: 500, price: 3999, label: 'Popular', highlighted: true },
  { type: 'large' as const, coins: 1000, price: 6999, label: 'Best Value' },
];

export function BuyCoinsModal({ onClose }: BuyCoinsModalProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (packageType: 'small' | 'medium' | 'large') => {
    setLoading(true);
    try {
      const result = await buyCoins(packageType);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Failed to initiate coin purchase:', error);
      alert(error instanceof Error ? error.message : 'Failed to initiate purchase');
    } finally {
      setLoading(false);
    }
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
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Coins className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Buy Coins</h2>
                <p className="text-sm text-slate-600">
                  Use coins for messages, tips, and gifts
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {COIN_PACKAGES.map((pkg) => (
              <button
                key={pkg.type}
                onClick={() => handlePurchase(pkg.type)}
                disabled={loading}
                className={`relative p-6 rounded-xl border-2 transition-all text-left hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  pkg.highlighted
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-offset-2'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                {pkg.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    {pkg.label}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <Coins className="w-5 h-5 text-amber-600" />
                  <span className="text-2xl font-bold text-slate-900">
                    {pkg.coins}
                  </span>
                  <span className="text-sm text-slate-600">coins</span>
                </div>

                <div className="text-3xl font-bold text-slate-900 mb-2">
                  ${(pkg.price / 100).toFixed(2)}
                </div>

                <p className="text-xs text-slate-500">
                  {(pkg.price / pkg.coins / 10).toFixed(2)}¢ per coin
                </p>

                {!pkg.highlighted && (
                  <div className="mt-3 text-xs text-slate-600">{pkg.label}</div>
                )}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <h3 className="font-semibold text-slate-900">What can you do with coins?</h3>
            <ul className="space-y-1.5 text-slate-600">
              <li>• Send messages to creators (10 coins)</li>
              <li>• Send priority messages (20 coins)</li>
              <li>• Send tips and gifts (varies)</li>
              <li>• Support your favorite creators directly</li>
            </ul>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            Secure payments powered by Stripe. Coins are non-refundable.
          </p>
        </div>
      </div>
    </div>
  );
}
