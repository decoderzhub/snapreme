import { Dumbbell, Shirt, Wand2, Briefcase, Palette } from 'lucide-react';

const categories = [
  { icon: Dumbbell, label: 'Fitness', color: 'text-orange-500 bg-orange-100' },
  { icon: Shirt, label: 'Fashion', color: 'text-pink-500 bg-pink-100' },
  { icon: Wand2, label: 'Cosplay', color: 'text-purple-500 bg-purple-100' },
  { icon: Briefcase, label: 'Coaching', color: 'text-blue-500 bg-blue-100' },
  { icon: Palette, label: 'Art & Design', color: 'text-emerald-500 bg-emerald-100' },
];

export default function TrustBar() {
  return (
    <section className="py-12 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-slate-500 mb-6">
          Trusted by creators in
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full ${cat.color} font-medium text-sm`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
