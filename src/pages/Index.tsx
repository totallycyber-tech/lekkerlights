import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FeaturedListings } from "@/components/FeaturedListings";
import { ThemeShowcase } from "@/components/ThemeShowcase";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <FeaturedListings />
        <ThemeShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
