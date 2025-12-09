import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Heart, Home, Sparkles } from "lucide-react";

export default function DonateSuccess() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20 md:pt-24 pb-16 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="bg-card/50 backdrop-blur border-border/50 text-center">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mx-auto">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              
              <div className="space-y-2">
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  Thank You! <Sparkles className="inline-block h-6 w-6 text-primary" />
                </h1>
                <p className="text-muted-foreground">
                  Your generous donation has been received successfully.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm">
                  Your support helps keep Lekker Lights running and free for the entire South African community. 
                  Together, we're spreading festive cheer across the nation!
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link to="/browse">
                  <Button variant="glow" className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Browse Displays
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
