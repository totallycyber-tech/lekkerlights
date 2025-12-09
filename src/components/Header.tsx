import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="Lekker Lights Home">
            <div className="relative" aria-hidden="true">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary animate-pulse-glow" />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
            </div>
            <span className="font-display font-bold text-lg md:text-xl glow-text">
              Lekker Lights
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6" aria-label="Main navigation">
            <Link 
              to="/browse" 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm lg:text-base"
            >
              Browse Displays
            </Link>
            <Link 
              to="/map" 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm lg:text-base"
            >
              Map View
            </Link>
            <ThemeToggle />
            <Link to="/create">
              <Button variant="glow" size="sm">
                <Plus className="h-4 w-4" aria-hidden="true" />
                List Your Display
              </Button>
            </Link>
          </nav>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button 
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border" aria-label="Mobile navigation">
            <div className="flex flex-col gap-4">
              <Link 
                to="/browse" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Displays
              </Link>
              <Link 
                to="/map" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Map View
              </Link>
              <Link to="/create" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="glow" size="sm" className="w-full">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  List Your Display
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
