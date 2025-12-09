import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Sparkles, Server, Code, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PRESET_AMOUNTS = [
  { value: 2000, label: "R20" },
  { value: 5000, label: "R50" },
  { value: 10000, label: "R100" },
  { value: 20000, label: "R200" },
];

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(5000);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(null);
    }
  };

  const getAmountInCents = (): number => {
    if (customAmount) {
      const parsed = parseFloat(customAmount);
      if (!isNaN(parsed) && parsed >= 5) {
        return Math.round(parsed * 100);
      }
    }
    return selectedAmount || 0;
  };

  const handleDonate = async () => {
    const amountInCents = getAmountInCents();
    
    if (amountInCents < 500) {
      toast.error("Minimum donation amount is R5");
      return;
    }

    if (amountInCents > 1000000) {
      toast.error("Maximum donation amount is R10,000");
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-donation-checkout", {
        body: { amount: amountInCents },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (error: any) {
      console.error("Donation error:", error);
      toast.error(error.message || "Failed to process donation. Please try again.");
      setIsProcessing(false);
    }
  };

  const displayAmount = customAmount 
    ? `R${customAmount}` 
    : selectedAmount 
      ? `R${(selectedAmount / 100).toFixed(0)}` 
      : "R0";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Heart className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 glow-text">
              Support Lekker Lights
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Help keep the festive spirit alive by supporting the development and maintenance of this community platform.
            </p>
          </div>

          {/* Why Donate Section */}
          <Card className="mb-8 bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Why Your Support Matters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Lekker Lights is a passion project built to bring our South African community together 
                during the festive season. Running this platform involves real costs:
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                  <Server className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Server Hosting</h3>
                    <p className="text-sm text-muted-foreground">
                      Database, storage, and server costs to keep the site running smoothly.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                  <Code className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Development</h3>
                    <p className="text-sm text-muted-foreground">
                      Time spent building new features and improving the platform.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Maintenance</h3>
                    <p className="text-sm text-muted-foreground">
                      Keeping the site secure, updated, and running year after year.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                Every donation, no matter the size, helps keep this platform free and accessible for 
                all South Africans to discover and share their beautiful Christmas light displays.
              </p>
            </CardContent>
          </Card>

          {/* Donation Card */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Make a Donation</CardTitle>
              <CardDescription>
                Choose an amount or enter a custom value. Minimum donation is R5.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preset Amounts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PRESET_AMOUNTS.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={selectedAmount === preset.value ? "default" : "outline"}
                    className="h-14 text-lg font-semibold"
                    onClick={() => handlePresetClick(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Or enter a custom amount (ZAR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R</span>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="pl-8"
                    min="5"
                    max="10000"
                  />
                </div>
              </div>

              {/* Donate Button */}
              <Button
                variant="glow"
                size="lg"
                className="w-full h-14 text-lg"
                onClick={handleDonate}
                disabled={isProcessing || getAmountInCents() < 500}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5 mr-2" />
                    Donate {displayAmount}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Secure payment processed by Yoco. Your payment details are never stored on our servers.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
