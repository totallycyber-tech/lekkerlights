import { Link } from "react-router-dom";
import { Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

          {/* WhatsApp Community */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Join Our Community</h4>
            <p className="text-sm text-muted-foreground">
              Join our WhatsApp group to get updates on new Christmas displays and connect with fellow enthusiasts.
            </p>
            <a 
              className="mt-2 inline-block"
              href="https://chat.whatsapp.com/EX3d4STqIA79fxHNUKTL5v?mode=hqrt3"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="default" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Join WhatsApp Group
              </Button>
            </a>
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
