import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, Heart, Home, ArrowLeft } from "lucide-react";

export default function DonateCancelled() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20 md:pt-24 pb-16 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="bg-card/50 backdrop-blur border-border/50 text-center">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mx-auto">
                <XCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  Donation Cancelled
                </h1>
                <p className="text-muted-foreground">
                  Your donation was not completed. No payment has been processed.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Changed your mind? No worries! If you'd like to support Lekker Lights in the future, 
                  we'd greatly appreciate it. Every contribution helps keep this community platform running.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link to="/donate">
                  <Button variant="glow" className="w-full">
                    <Heart className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
