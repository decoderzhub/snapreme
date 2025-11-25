import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Coins,
  Sparkles,
  Check,
  CreditCard,
  Shield,
  Zap,
  Gift,
  Crown,
  Star,
} from 'lucide-react';

const coinPackages = [
  {
    id: 'starter',
    coins: 10,
    price: 9.99,
    popular: false,
    bonus: 0,
    color: 'from-slate-600 to-slate-700',
  },
  {
    id: 'basic',
    coins: 25,
    price: 19.99,
    popular: false,
    bonus: 5,
    color: 'from-blue-600 to-blue-700',
  },
  {
    id: 'popular',
    coins: 50,
    price: 34.99,
    popular: true,
    bonus: 15,
    color: 'from-purple-600 to-pink-600',
  },
  {
    id: 'premium',
    coins: 100,
    price: 59.99,
    popular: false,
    bonus: 40,
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'elite',
    coins: 250,
    price: 129.99,
    popular: false,
    bonus: 125,
    color: 'from-emerald-500 to-teal-600',
  },
];

export default function BuyCoins() {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string | null>('popular');
  const [processing, setProcessing] = useState(false);
  const [currentBalance] = useState(47.50);

  const handlePurchase = () => {
    if (!selectedPackage) return;
    setProcessing(true);

    // Simulate purchase
    setTimeout(() => {
      setProcessing(false);
      navigate('/inbox');
    }, 2000);
  };

  const selected = coinPackages.find(p => p.id === selectedPackage);

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-neutral-950/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <h1 className="text-lg font-bold text-white">Buy Coins</h1>

          <div className="w-9" />
        </div>
      </div>

      {/* Current Balance */}
      <div className="px-4 py-6">
        <div className="p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Coins className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Current Balance</p>
                <p className="text-2xl font-bold text-amber-400">${currentBalance.toFixed(2)}</p>
              </div>
            </div>
            <Sparkles className="w-8 h-8 text-amber-400/50" />
          </div>
        </div>
      </div>

      {/* What are coins for */}
      <div className="px-4 mb-6">
        <h2 className="text-white font-semibold mb-3">What are coins for?</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <Zap className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-white text-sm font-medium">Send Messages</p>
            <p className="text-slate-500 text-xs">Chat with creators</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <Gift className="w-5 h-5 text-pink-400 mb-2" />
            <p className="text-white text-sm font-medium">Send Tips</p>
            <p className="text-slate-500 text-xs">Support creators</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <Crown className="w-5 h-5 text-amber-400 mb-2" />
            <p className="text-white text-sm font-medium">Unlock Content</p>
            <p className="text-slate-500 text-xs">Access exclusives</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <Star className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-white text-sm font-medium">Priority Access</p>
            <p className="text-slate-500 text-xs">Get noticed first</p>
          </div>
        </div>
      </div>

      {/* Coin Packages */}
      <div className="px-4 mb-6">
        <h2 className="text-white font-semibold mb-3">Select a package</h2>
        <div className="space-y-3">
          {coinPackages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`w-full p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
                selectedPackage === pkg.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-bl-xl">
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pkg.color} flex items-center justify-center`}>
                    <Coins className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-lg">${pkg.coins}</span>
                      {pkg.bonus > 0 && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                          +${pkg.bonus} FREE
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">
                      {pkg.bonus > 0 ? `${pkg.coins + pkg.bonus} coins total` : `${pkg.coins} coins`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-white font-bold text-lg">${pkg.price.toFixed(2)}</p>
                  {pkg.bonus > 0 && (
                    <p className="text-green-400 text-xs">Save ${(pkg.bonus * 0.99).toFixed(0)}%</p>
                  )}
                </div>
              </div>

              {selectedPackage === pkg.id && (
                <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="px-4 mb-6">
        <h2 className="text-white font-semibold mb-3">Payment method</h2>
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Credit/Debit Card</p>
              <p className="text-slate-500 text-xs">Visa, Mastercard, Amex</p>
            </div>
            <Check className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="px-4 mb-8">
        <div className="flex items-center justify-center gap-6 py-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Secure Payment</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Check className="w-4 h-4" />
            <span className="text-xs">Instant Delivery</span>
          </div>
        </div>
      </div>

      {/* Purchase Button - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-950 border-t border-white/10">
        <div className="max-w-2xl mx-auto">
          {selected && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm">Total</span>
              <span className="text-white font-bold text-lg">${selected.price.toFixed(2)}</span>
            </div>
          )}
          <button
            onClick={handlePurchase}
            disabled={!selectedPackage || processing}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Coins className="w-5 h-5" />
                Buy {selected ? `$${selected.coins + selected.bonus}` : ''} Coins
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-500 mt-3">
            By purchasing, you agree to our Terms of Service
          </p>
        </div>
      </div>

      <div className="h-40" />
    </div>
  );
}
