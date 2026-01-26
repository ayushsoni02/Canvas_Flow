import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { WhiteboardMockup } from "@/components/WhiteboardMockup";
import { FeaturesGrid } from "@/components/FeaturesGrid";
import { TechStack } from "@/components/TechStack";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 bg-gradient-animated bg-grid-pattern aurora-glow">
      <Navbar />
      <Hero />
      <WhiteboardMockup />
      <FeaturesGrid />
      <TechStack />
      <Footer />
    </main>
  );
}