import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-primary animate-pulse-glow" />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
            </div>
            <span className="font-display font-bold text-xl glow-text">
              SA Lights
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/browse" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Displays
            </Link>
            <Link 
              to="/map" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Map View
            </Link>
            <Link to="/create">
              <Button variant="glow" size="sm">
                <Plus className="h-4 w-4" />
                List Your Display
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link 
                to="/browse" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Displays
              </Link>
              <Link 
                to="/map" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Map View
              </Link>
              <Link to="/create" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="glow" size="sm" className="w-full">
                  <Plus className="h-4 w-4" />
                  List Your Display
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
