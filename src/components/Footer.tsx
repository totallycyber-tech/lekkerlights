import { Link } from "react-router-dom";
import { Sparkles, Mail, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-christmas" />
              <span className="font-display font-bold text-xl glow-text">Lekker Lights</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Discover and share beautiful Christmas light displays across South Africa. 
              Bringing communities together through festive celebrations.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-christmas transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-christmas transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-christmas transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/browse" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Browse Displays
              </Link>
              <Link to="/map" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Map View
              </Link>
              <Link to="/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                List Your Display
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Get Notified</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to get updates when new Christmas displays are added in your area.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-secondary border-border"
              />
              <Button variant="default" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Lekker Lights. Made with ❤️ in South Africa.
          </p>
          <nav className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
