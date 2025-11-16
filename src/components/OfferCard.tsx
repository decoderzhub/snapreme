import { Clock, Target } from 'lucide-react';

interface OfferCardProps {
  title: string;
  description: string;
  priceLabel: string;
  deliveryWindow: string;
  bestFor: string;
  onBook?: () => void;
  editable?: boolean;
}

export default function OfferCard({
  title,
  description,
  priceLabel,
  deliveryWindow,
  bestFor,
  onBook,
  editable = false,
}: OfferCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            {priceLabel}
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed mb-4">{description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock size={16} className="text-blue-600" />
          <span>
            <span className="font-medium">Delivery:</span> {deliveryWindow}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Target size={16} className="text-blue-600" />
          <span>
            <span className="font-medium">Best for:</span> {bestFor}
          </span>
        </div>
      </div>

      {onBook && !editable && (
        <button
          onClick={onBook}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all shadow-sm hover:shadow-md"
        >
          Book this offer
        </button>
      )}
    </div>
  );
}
