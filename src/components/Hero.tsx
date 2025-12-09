import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, Plus, MapPin } from "lucide-react";

export function Hero() {
  return (
    <section 
      className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden"
      aria-label="Welcome to Lekker Lights"
    >
      {/* Background with gradient overlay */}
      <div className="absolute inset-0" aria-hidden="true">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=1920&q=80')`,
          }}
          role="img"
          aria-label="Festive Christmas lights decorating a house at night"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
      </div>

      {/* Floating light effects - decorative */}
      <div className="absolute top-20 left-10 w-24 md:w-32 h-24 md:h-32 bg-christmas/20 rounded-full blur-3xl animate-float" aria-hidden="true" />
      <div className="absolute bottom-40 right-20 w-36 md:w-48 h-36 md:h-48 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} aria-hidden="true" />
      <div className="absolute top-1/2 left-1/4 w-20 md:w-24 h-20 md:h-24 bg-primary/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-secondary/50 backdrop-blur-sm rounded-full border border-border">
            <Sparkles className="h-4 w-4 text-christmas animate-pulse" aria-hidden="true" />
            <span className="text-xs md:text-sm font-medium">Discover South Africa's lekker Christmas lights</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Light Up Your
            <span className="block glow-text">
              Christmas
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Explore stunning Christmas light displays across South Africa. 
            Share your decorations or discover magical displays near you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-2 md:pt-4">
            <Link to="/browse">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                <Search className="h-5 w-5" aria-hidden="true" />
                Find Displays
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                <Plus className="h-5 w-5" aria-hidden="true" />
                List Your Display
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 pt-8 md:pt-12 max-w-lg mx-auto" role="list" aria-label="Platform statistics">
            <div className="text-center" role="listitem">
              <div className="font-display text-2xl md:text-3xl font-bold text-christmas">250+</div>
              <div className="text-xs md:text-sm text-muted-foreground">Active Displays</div>
            </div>
            <div className="text-center" role="listitem">
              <div className="font-display text-2xl md:text-3xl font-bold text-christmas">9</div>
              <div className="text-xs md:text-sm text-muted-foreground">Provinces</div>
            </div>
            <div className="text-center" role="listitem">
              <div className="font-display text-2xl md:text-3xl font-bold text-christmas">50K+</div>
              <div className="text-xs md:text-sm text-muted-foreground">Happy Visitors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce" aria-hidden="true">
        <span className="text-xs text-muted-foreground">Scroll to explore</span>
        <MapPin className="h-5 w-5 text-christmas" />
      </div>
    </section>
  );
}
