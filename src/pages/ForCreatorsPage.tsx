import { Link } from 'react-router-dom';
import { DollarSign, FileText, Users, Sparkles, BarChart, MessageCircle } from 'lucide-react';

export default function ForCreatorsPage() {
  return (
    <div className="min-h-screen bg-white">

      <section className="relative py-20 bg-white text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.16),transparent_60%)]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            For Creators
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Snapreme is your home for premium, story-style content. Turn your private snaps, behind-the-scenes
            moments, and close-friends energy into a predictable monthly income from fans who genuinely support you.
          </p>

          <div className="mt-8">
            <Link
              to="/apply"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r
                         from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-md hover:shadow-lg
                         hover:brightness-110 transition-all"
            >
              Apply as a creator
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <Feature
              icon={DollarSign}
              title="Direct fan income"
              description="Subscribers pay you monthly for access to your premium content."
            />
            <Feature
              icon={Users}
              title="Own your audience"
              description="Build a core fanbase that you can message, reward, and grow over time."
            />
            <Feature
              icon={Sparkles}
              title="Premium, not spammy"
              description="You decide what's premium — drops, sets, stories, behind-the-scenes, or anything else."
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid gap-10 lg:grid-cols-2 items-start">

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">How it works</h2>

              <ol className="space-y-4 text-sm sm:text-base text-slate-700">
                <li>
                  <span className="font-semibold text-slate-900">1. Apply and get verified.</span>
                  Tell us who you are, what you create, and how you want to price your content.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">2. Set up your premium space.</span>
                  Create tiers, decide what's public vs premium, and schedule your first drops.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">3. Invite your fans.</span>
                  Share your Snapreme link anywhere you already show up — stories, bios, group chats, or community platforms.
                </li>
              </ol>
            </div>

            <div className="space-y-6">
              <Feature
                icon={BarChart}
                title="Simple analytics"
                description="See what content your subscribers love and how your monthly recurring revenue grows."
              />
              <Feature
                icon={MessageCircle}
                title="Closer fan connection"
                description="We're building tools for messages, requests, and fan rewards so you can build a real community."
              />
              <Feature
                icon={FileText}
                title="Clear terms"
                description="No surprise fees. Transparent payout structure so you always know what you're taking home."
              />
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}

interface FeatureProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function Feature({ icon: Icon, title, description }: FeatureProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
