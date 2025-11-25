import { useState, useEffect, useRef, useMemo } from 'react';
import { demoCreators } from '../data/demoCreators';
import CreatorCard from './CreatorCard';
import CreatorModal from './CreatorModal';

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function InfluencerGrid() {
  const [selectedCreator, setSelectedCreator] = useState<typeof demoCreators[0] | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Shuffle and duplicate creators for random appearance
  const randomizedCreators = useMemo(() => {
    const shuffled1 = shuffleArray(demoCreators);
    const shuffled2 = shuffleArray(demoCreators);
    return [...shuffled1, ...shuffled2, ...shuffleArray(demoCreators)];
  }, []);

  // Random sizes for each card
  const cardSizes = useMemo(() => {
    return randomizedCreators.map(() => {
      const sizes = ['tall', 'medium', 'short'] as const;
      return sizes[Math.floor(Math.random() * sizes.length)];
    });
  }, [randomizedCreators]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    let animationId: number;
    const scrollSpeed = 0.5;

    const animate = () => {
      scrollContainer.scrollTop += scrollSpeed;

      const oneThirdHeight = scrollContainer.scrollHeight / 3;
      if (scrollContainer.scrollTop >= oneThirdHeight) {
        scrollContainer.scrollTop = 0;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused]);

  return (
    <>
      <section
        id="influencers"
        className="relative h-[800px] md:h-[900px] bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Scrolling background layer */}
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-hidden"
          style={{ scrollBehavior: 'auto' }}
        >
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 sm:gap-4 p-4">
            {randomizedCreators.map((creator, index) => (
              <div
                key={`${creator.id}-${index}`}
                className="break-inside-avoid mb-3 sm:mb-4"
              >
                <CreatorCard
                  creator={creator}
                  onClick={() => setSelectedCreator(creator)}
                  size={cardSizes[index]}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-transparent to-blue-900 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/90 via-transparent to-blue-900/90 pointer-events-none" />

        {/* Content overlay */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl">
            {/* Text background for better readability */}
            <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-8 sm:p-12">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 drop-shadow-xl"
                  style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                Discover Top Creators
              </h2>

              <p className="text-lg sm:text-xl lg:text-2xl font-medium text-white max-w-3xl mx-auto leading-relaxed"
                 style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                Fitness coaches, fashion influencers, cosplay artists, career mentors, and creative professionals
                sharing exclusive content with their biggest fans. 100% SFW, always brand-safe.
              </p>

              {/* Category pills */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8 pointer-events-auto">
                {['Fitness', 'Fashion', 'Cosplay', 'Coaching', 'Art'].map((category) => (
                  <span
                    key={category}
                    className="px-6 py-3 rounded-full bg-white/25 text-white text-base font-semibold backdrop-blur-md border border-white/30 shadow-lg hover:bg-white/40 transition-colors cursor-pointer"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedCreator && (
        <CreatorModal
          creator={selectedCreator}
          onClose={() => setSelectedCreator(null)}
        />
      )}
    </>
  );
}
