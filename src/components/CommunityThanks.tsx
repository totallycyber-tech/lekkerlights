import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, TreePine, Gift, Star, Heart, ArrowRight, Candy } from "lucide-react";

export function CommunityThanks() {
  return (
    <section className="py-16 sm:py-20 relative overflow-hidden">
      {/* Festive gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-christmas/15 via-background to-festive-gold/15" />
      
      {/* Floating decorative elements - more ornaments! */}
      <div className="absolute top-6 left-[5%] animate-float">
        <Gift className="h-7 w-7 sm:h-9 w-9 text-christmas/50" />
      </div>
      <div className="absolute top-10 left-[25%] animate-float" style={{ animationDelay: "2s" }}>
        <Star className="h-5 w-5 sm:h-6 w-6 text-festive-gold/60 animate-twinkle" />
      </div>
      <div className="absolute top-8 right-[20%] animate-float" style={{ animationDelay: "1s" }}>
        <TreePine className="h-8 w-8 sm:h-10 w-10 text-festive-green/50" />
      </div>
      <div className="absolute top-16 right-[8%] animate-float" style={{ animationDelay: "0.5s" }}>
        <Star className="h-6 w-6 text-festive-gold/50 animate-twinkle" style={{ animationDelay: "1s" }} />
      </div>
      <div className="absolute top-1/3 left-[3%] animate-pulse">
        <Heart className="h-5 w-5 text-christmas/40" />
      </div>
      <div className="absolute top-1/3 right-[3%] animate-float" style={{ animationDelay: "1.5s" }}>
        <Candy className="h-6 w-6 text-christmas/40" />
      </div>
      <div className="absolute bottom-1/3 left-[8%] animate-float" style={{ animationDelay: "0.8s" }}>
        <Sparkles className="h-6 w-6 sm:h-8 w-8 text-festive-gold/50 animate-twinkle" />
      </div>
      <div className="absolute bottom-1/4 left-[20%] animate-float" style={{ animationDelay: "2.5s" }}>
        <Gift className="h-5 w-5 text-christmas/40" />
      </div>
      <div className="absolute bottom-12 left-[12%] animate-float" style={{ animationDelay: "1.2s" }}>
        <TreePine className="h-7 w-7 text-festive-green/40" />
      </div>
      <div className="absolute bottom-16 right-[15%] animate-float" style={{ animationDelay: "1.8s" }}>
        <Star className="h-5 w-5 text-festive-gold/60 animate-twinkle" style={{ animationDelay: "0.5s" }} />
      </div>
      <div className="absolute bottom-10 right-[8%] animate-float" style={{ animationDelay: "0.3s" }}>
        <TreePine className="h-10 w-10 text-festive-green/50" />
      </div>
      <div className="absolute bottom-1/3 right-[12%] animate-pulse" style={{ animationDelay: "1s" }}>
        <Heart className="h-4 w-4 text-christmas/30" />
      </div>
      <div className="absolute top-1/2 left-[15%] animate-float" style={{ animationDelay: "2.2s" }}>
        <Candy className="h-5 w-5 text-festive-gold/30" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Main heading with decorative elements */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <TreePine className="h-6 w-6 sm:h-8 w-8 text-festive-green animate-pulse" />
              <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground">
                Thank You, Benoni!
              </h2>
              <TreePine className="h-6 w-6 sm:h-8 w-8 text-festive-green animate-pulse" />
            </div>
            
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-christmas" />
              <Sparkles className="h-4 w-4 text-festive-gold animate-twinkle" />
              <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-christmas" />
            </div>
          </div>
          
          {/* Heartfelt message */}
          <div className="space-y-4 text-base sm:text-lg text-muted-foreground px-2">
            <p className="leading-relaxed">
              <span className="text-foreground font-semibold">Lekker Lights was born right here in Benoni</span> – and now it's lighting up homes across South Africa!
            </p>
            <p className="leading-relaxed">
              Every display you share brings joy to families, neighbours, and visitors in our community and beyond.
            </p>
          </div>
          
          {/* Pun CTA section - with extra spacing */}
          <div className="pt-8 sm:pt-12 space-y-10 sm:space-y-12">
            <div className="flex items-center justify-center gap-2 px-2">
              <Star className="h-4 w-4 sm:h-5 w-5 text-festive-gold animate-twinkle shrink-0" />
              <p className="text-lg sm:text-xl lg:text-2xl font-display font-semibold text-foreground italic">
                "Be on everyone's Christmas list – list your display!"
              </p>
              <Star className="h-4 w-4 sm:h-5 w-5 text-festive-gold animate-twinkle shrink-0" style={{ animationDelay: "0.5s" }} />
            </div>
            
            <Link to="/create">
              <Button size="lg" className="group">
                <Gift className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                List Your Display
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
