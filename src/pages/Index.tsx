import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import QueueSimulator from "@/components/QueueSimulator";
import LPVisualizer from "@/components/LPVisualizer";
import SupplyChainViz from "@/components/SupplyChainViz";
import Dashboard from "@/components/Dashboard";
import AboutSection from "@/components/AboutSection";
import AIChat from "@/components/AIChat";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <QueueSimulator />
      <LPVisualizer />
      <SupplyChainViz />
      <Dashboard />
      <AboutSection />
      <AIChat />
    </div>
  );
};

export default Index;
