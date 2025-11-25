import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ProblemSolution from '../components/home/ProblemSolution';
import AIFeature from '../components/home/AIFeature';
import MonetizationCards from '../components/home/MonetizationCards';
import InfluencerGrid from '../components/InfluencerGrid';
import BrandCta from '../components/BrandCta';
import ContactSection from '../components/ContactSection';

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]);

  return (
    <main>
      <InfluencerGrid />
      <ProblemSolution />
      <AIFeature />
      <MonetizationCards />
      <BrandCta />
      <ContactSection />
    </main>
  );
}
