import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, Plus, MapPin } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
      </div>

      {/* Floating light effects */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-christmas/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 right-20 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 backdrop-blur-sm rounded-full border border-border">
            <Sparkles className="h-4 w-4 text-christmas animate-pulse" />
            <span className="text-sm font-medium">Discover South Africa's lekker Christmas lights</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-tight">
            Light Up Your
            <span className="block glow-text">
              Christmas
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore stunning Christmas light displays across South Africa. 
            Share your decorations or discover magical displays near you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/browse">
              <Button variant="hero" size="xl">
                <Search className="h-5 w-5" />
                Find Displays
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="hero-outline" size="xl">
                <Plus className="h-5 w-5" />
                List Your Display
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-lg mx-auto">
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-christmas">250+</div>
              <div className="text-sm text-muted-foreground">Active Displays</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-christmas">9</div>
              <div className="text-sm text-muted-foreground">Provinces</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-christmas">50K+</div>
              <div className="text-sm text-muted-foreground">Happy Visitors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-muted-foreground">Scroll to explore</span>
        <MapPin className="h-5 w-5 text-christmas" />
      </div>
    </section>
  );
}
