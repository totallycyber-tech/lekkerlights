import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CommunityThanks } from "@/components/CommunityThanks";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Sparkles, Users, Flag, TreePine, Star, Gift } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        
        {/* Festive Welcome Section */}
        <section className="py-10 sm:py-14 relative overflow-hidden">
          {/* Vibrant festive gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-christmas/10 via-festive-gold/5 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-festive-green/5 via-transparent to-festive-green/5" />
          
          {/* Decorative corner elements */}
          <div className="absolute top-4 left-4 opacity-30 animate-float">
            <TreePine className="h-10 w-10 sm:h-14 w-14 text-festive-green" />
          </div>
          <div className="absolute top-4 right-4 opacity-30 animate-float" style={{ animationDelay: "1s" }}>
            <TreePine className="h-10 w-10 sm:h-14 w-14 text-festive-green" />
          </div>
          <div className="absolute bottom-4 left-8 opacity-20 animate-float" style={{ animationDelay: "0.5s" }}>
            <Gift className="h-8 w-8 text-christmas" />
          </div>
          <div className="absolute bottom-4 right-8 opacity-20 animate-float" style={{ animationDelay: "1.5s" }}>
            <Star className="h-8 w-8 text-festive-gold animate-twinkle" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Welcome Card - Centered with String Lights Border */}
              <div className="relative p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-card via-card to-card/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-visible">
                {/* String Lights Border Effect with Wire */}
                <div className="absolute -inset-2 rounded-2xl pointer-events-none">
                  {/* Wire/cord - top */}
                  <div className="absolute top-1 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-gray-600 to-transparent rounded-full" />
                  {/* Wire/cord - bottom */}
                  <div className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-gray-600 to-transparent rounded-full" />
                  {/* Wire/cord - left */}
                  <div className="absolute top-4 bottom-4 left-1 w-0.5 bg-gradient-to-b from-transparent via-gray-600 to-transparent rounded-full" />
                  {/* Wire/cord - right */}
                  <div className="absolute top-4 bottom-4 right-1 w-0.5 bg-gradient-to-b from-transparent via-gray-600 to-transparent rounded-full" />
                  
                  {/* Top string lights */}
                  <div className="absolute top-0 left-2 right-2 h-3 flex justify-around items-center">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={`top-${i}`}
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full animate-twinkle"
                        style={{
                          backgroundColor: ['#ef4444', '#22c55e', '#eab308', '#ef4444', '#22c55e', '#eab308', '#ef4444', '#22c55e', '#eab308', '#ef4444'][i],
                          animationDelay: `${i * 0.2}s`,
                          boxShadow: `0 0 10px 3px ${['#ef4444', '#22c55e', '#eab308', '#ef4444', '#22c55e', '#eab308', '#ef4444', '#22c55e', '#eab308', '#ef4444'][i]}90`
                        }}
                      />
                    ))}
                  </div>
                  {/* Bottom string lights */}
                  <div className="absolute bottom-0 left-2 right-2 h-3 flex justify-around items-center">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={`bottom-${i}`}
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full animate-twinkle"
                        style={{
                          backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#22c55e', '#eab308', '#ef4444', '#22c55e', '#eab308', '#ef4444', '#22c55e'][i],
                          animationDelay: `${i * 0.15 + 0.1}s`,
                          boxShadow: `0 0 10px 3px ${['#22c55e', '#eab308', '#ef4444', '#22c55e', '#eab308', '#ef4444', '#22c55e', '#eab308', '#ef4444', '#22c55e'][i]}90`
                        }}
                      />
                    ))}
                  </div>
                  {/* Left string lights */}
                  <div className="absolute top-2 bottom-2 left-0 w-3 flex flex-col justify-around items-center">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={`left-${i}`}
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full animate-twinkle"
                        style={{
                          backgroundColor: ['#eab308', '#ef4444', '#22c55e', '#eab308', '#ef4444'][i],
                          animationDelay: `${i * 0.25 + 0.2}s`,
                          boxShadow: `0 0 10px 3px ${['#eab308', '#ef4444', '#22c55e', '#eab308', '#ef4444'][i]}90`
                        }}
                      />
                    ))}
                  </div>
                  {/* Right string lights */}
                  <div className="absolute top-2 bottom-2 right-0 w-3 flex flex-col justify-around items-center">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={`right-${i}`}
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full animate-twinkle"
                        style={{
                          backgroundColor: ['#ef4444', '#22c55e', '#eab308', '#ef4444', '#22c55e'][i],
                          animationDelay: `${i * 0.3 + 0.15}s`,
                          boxShadow: `0 0 10px 3px ${['#ef4444', '#22c55e', '#eab308', '#ef4444', '#22c55e'][i]}90`
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Decorative glows - more vibrant */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-christmas/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-festive-gold/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-festive-green/10 rounded-full blur-3xl" />
                
                <div className="relative space-y-6 text-center">
                  {/* Header with festive styling - centered */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-christmas/30 to-festive-gold/30 rounded-xl shadow-lg">
                      <Sparkles className="h-7 w-7 sm:h-8 w-8 text-festive-gold animate-twinkle" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                        Welcome to South Africa's Festive Lights Community!
                      </h2>
                      <div className="flex items-center justify-center gap-1.5">
                        <Star className="h-3 w-3 text-festive-gold animate-twinkle" />
                        <span className="text-sm sm:text-base text-muted-foreground">Where neighbourhoods come alive with Christmas magic</span>
                        <Star className="h-3 w-3 text-festive-gold animate-twinkle" style={{ animationDelay: "0.5s" }} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Description - centered */}
                  <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto text-sm sm:text-base">
                    Lekker Lights is a community-driven platform where anyone can share Christmas light displays they've discovered. 
                    Listings may be submitted by homeowners, neighbours, friends, or members of the public who have spotted a festive display.
                  </p>
                  
                  {/* Feature highlights - centered */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
                    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-christmas/10 to-christmas/5 border border-christmas/20">
                      <Users className="h-5 w-5 text-christmas shrink-0" />
                      <div className="text-left">
                        <p className="font-medium text-foreground text-sm">Community-powered</p>
                        <p className="text-muted-foreground text-xs sm:text-sm">Anyone can list a display</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-festive-gold/10 to-festive-gold/5 border border-festive-gold/20">
                      <Flag className="h-5 w-5 text-festive-gold shrink-0" />
                      <div className="text-left">
                        <p className="font-medium text-foreground text-sm">Homeowners</p>
                        <p className="text-muted-foreground text-xs sm:text-sm">Report to request removal</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Terms & Privacy - centered */}
                  <p className="text-xs text-muted-foreground/70 pt-4 border-t border-border/30 max-w-lg mx-auto">
                    By using this site, you agree to our{" "}
                    <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Community Thank You Section */}
        <CommunityThanks />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
