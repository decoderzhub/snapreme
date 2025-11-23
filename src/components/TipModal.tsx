import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { Creator } from '../types/database';

interface TipModalProps {
  creator: Creator;
  onClose: () => void;
}

const TIP_AMOUNTS = [5, 10, 20, 50, 100, 200];

export default function TipModal({ creator, onClose }: TipModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleTip = async () => {
    const amount = selectedAmount || parseFloat(customAmount);

    if (!amount || amount < 1) {
      alert('Please select or enter a valid tip amount');
      return;
    }

    setProcessing(true);

    try {
      console.log('Processing tip:', { creatorId: creator.id, amount, message });

      setTimeout(() => {
        alert(`Successfully tipped $${amount} to ${creator.display_name || creator.name}!`);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error processing tip:', error);
      alert('Failed to process tip. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Send a Tip</h2>
              <p className="text-sm text-slate-400">Support {creator.display_name || creator.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl">
            <img
              src={creator.avatar_url}
              alt={creator.display_name || creator.name}
              className="w-12 h-12 rounded-full border-2 border-purple-500"
            />
            <div className="flex-1">
              <p className="text-white font-semibold">{creator.display_name || creator.name}</p>
              <p className="text-sm text-slate-400">@{creator.handle.replace(/^@/, '')}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Select Amount
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIP_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    selectedAmount === amount
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Or Enter Custom Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                $
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Add a Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say something nice..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTip}
              disabled={processing || (!selectedAmount && !customAmount)}
              className="flex-1 py-3 px-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {processing ? 'Processing...' : `Send Tip`}
            </button>
          </div>

          {(selectedAmount || customAmount) && (
            <div className="text-center text-sm text-slate-400">
              You're about to tip ${selectedAmount || customAmount} to {creator.display_name || creator.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
