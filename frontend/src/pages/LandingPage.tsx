import { NavBar } from '../components/landing/NavBar';
import { Hero } from '../components/landing/Hero';
import { Process } from '../components/landing/Process';
import { Features } from '../components/landing/Features';
import { Stats } from '../components/landing/Stats';
import { MapPreview } from '../components/landing/MapPreview';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <Hero />
      <Process />
      <Features />
      <Stats />
      <MapPreview />
      <Footer />
    </div>
  );
}