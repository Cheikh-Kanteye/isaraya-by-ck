import HeroSection from "@/components/features/HeroSection";
import PromoSection from "@/components/features/PromoSection";
import CatalogShowcase from "@/components/features/CatalogShowcase";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <PromoSection />
      <CatalogShowcase /> 
    </div>
  );
};

export default Index;
