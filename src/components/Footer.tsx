import { Link } from "react-router-dom";
import { Sparkles, Heart, Mail } from "lucide-react";
import { ContactUsDialog } from "@/components/ContactUsDialog";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <Link to="/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                List Your Display
              </Link>
              <Link to="/resend-edit-link" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Lost Edit Link?
              </Link>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Get Involved</h4>
            <div className="flex flex-col gap-3">
              <Link to="/donate">
                <Button variant="outline" size="lg" className="w-full justify-start">
                  <Heart className="h-5 w-5 mr-2 text-christmas" />
                  Donate
                </Button>
              </Link>
              <ContactUsDialog
                trigger={
                  <Button variant="outline" size="lg" className="w-full justify-start">
                    <Mail className="h-5 w-5 mr-2 text-primary" />
                    Contact Us
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Lekker Lights. Made with ❤️ in South Africa by{" "}
            <a 
              href="https://www.linkedin.com/in/chintan-patel-za/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Chintan Patel
            </a>.
          </p>
          <nav className="flex gap-6">
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
