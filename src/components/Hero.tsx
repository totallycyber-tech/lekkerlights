import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, Plus } from "lucide-react";

// Generate snowflakes with random positions and delays
const snowflakes = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 8}s`,
  duration: `${6 + Math.random() * 6}s`,
  size: Math.random() > 0.5 ? 'w-1 h-1' : 'w-1.5 h-1.5',
}));

// Generate twinkling lights with festive colors
const twinklingLights = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${5 + Math.random() * 90}%`,
  top: `${5 + Math.random() * 90}%`,
  delay: `${Math.random() * 3}s`,
  duration: `${1.5 + Math.random() * 2}s`,
  color: ['bg-christmas', 'bg-christmas-secondary', 'bg-primary', 'bg-accent', 'bg-festive-cyan', 'bg-festive-gold'][Math.floor(Math.random() * 6)],
  size: Math.random() > 0.6 ? 'w-2 h-2' : 'w-1.5 h-1.5',
}));

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

      {/* Snowfall effect */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className={`absolute ${flake.size} bg-white/70 rounded-full animate-snowfall`}
            style={{
              left: flake.left,
              animationDelay: flake.delay,
              animationDuration: flake.duration,
            }}
          />
        ))}
      </div>

      {/* Twinkling Christmas lights */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {twinklingLights.map((light) => (
          <div
            key={light.id}
            className={`absolute ${light.size} ${light.color} rounded-full animate-twinkle shadow-lg`}
            style={{
              left: light.left,
              top: light.top,
              animationDelay: light.delay,
              animationDuration: light.duration,
              boxShadow: '0 0 8px currentColor, 0 0 16px currentColor',
            }}
          />
        ))}
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

          {/* Christmas Ornaments Decoration */}
          <div className="flex items-center justify-center gap-3 md:gap-6 pt-8 md:pt-12" aria-hidden="true">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-christmas animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary animate-pulse" style={{ animationDelay: '1s' }} />
            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-christmas animate-pulse" style={{ animationDelay: '1.5s' }} />
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '2.5s' }} />
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-christmas animate-pulse" style={{ animationDelay: '3s' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
