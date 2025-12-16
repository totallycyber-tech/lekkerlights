import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, TreePine, Gift, Star, Heart, ArrowRight } from "lucide-react";

export function CommunityThanks() {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Festive gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-christmas/10 via-background to-festive-gold/10" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-8 left-[10%] animate-float">
        <Gift className="h-8 w-8 text-christmas/40" />
      </div>
      <div className="absolute top-16 right-[15%] animate-float" style={{ animationDelay: "1s" }}>
        <Star className="h-6 w-6 text-festive-gold/50" />
      </div>
      <div className="absolute bottom-12 left-[20%] animate-float" style={{ animationDelay: "0.5s" }}>
        <Sparkles className="h-7 w-7 text-primary/40" />
      </div>
      <div className="absolute bottom-20 right-[10%] animate-float" style={{ animationDelay: "1.5s" }}>
        <TreePine className="h-9 w-9 text-festive-green/40" />
      </div>
      <div className="absolute top-1/2 left-[5%] animate-pulse">
        <Heart className="h-5 w-5 text-christmas/30" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Main heading with decorative elements */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <TreePine className="h-8 w-8 text-festive-green animate-pulse" />
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                Thank You, Benoni!
              </h2>
              <TreePine className="h-8 w-8 text-festive-green animate-pulse" />
            </div>
            
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-christmas" />
              <Sparkles className="h-4 w-4 text-festive-gold animate-twinkle" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-christmas" />
            </div>
          </div>
          
          {/* Heartfelt message */}
          <div className="space-y-4 text-lg text-muted-foreground">
            <p className="leading-relaxed">
              <span className="text-foreground font-semibold">Lekker Lights was born right here in Benoni</span> – and now it's lighting up homes across South Africa!
            </p>
            <p className="leading-relaxed">
              Every display you share brings joy to families, neighbours, and visitors in our community and beyond.
            </p>
          </div>
          
          {/* Pun CTA section */}
          <div className="pt-4 space-y-6">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-festive-gold animate-twinkle" />
              <p className="text-xl sm:text-2xl font-display font-semibold text-foreground italic">
                "Be on everyone's Christmas list – list your display!"
              </p>
              <Star className="h-5 w-5 text-festive-gold animate-twinkle" style={{ animationDelay: "0.5s" }} />
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
