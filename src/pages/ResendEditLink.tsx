import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Send, CheckCircle, Loader2, Layers } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type LinkType = "single" | "bulk";

export default function ResendEditLink() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [linkType, setLinkType] = useState<LinkType>("single");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter the email address you used when creating your listing.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const functionName = linkType === "bulk" ? "resend-batch-edit-link" : "resend-edit-link";
      const { error } = await supabase.functions.invoke(functionName, {
        body: { email: email.trim().toLowerCase() },
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (error) {
      console.error("Error resending edit link:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>

            <div className="bg-card rounded-xl border border-border p-8">
              {isSuccess ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-christmas/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-christmas" />
                  </div>
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    Check Your Email
                  </h1>
                  <p className="text-muted-foreground">
                    If any {linkType === "bulk" ? "bulk listings" : "listings"} are associated with <strong className="text-foreground">{email}</strong>, 
                    we've sent the edit links to that address.
                  </p>
                  {linkType === "bulk" && (
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                      <strong>Note:</strong> If you submitted several batches of up to 10 listings, you'll receive a <strong>separate email for each batch</strong>.
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Don't see the email? Please check your <strong>spam</strong>, <strong>junk</strong>, and other folders.
                  </p>
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEmail("");
                        setIsSuccess(false);
                      }}
                    >
                      Try a Different Email
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-christmas/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-7 w-7 text-christmas" />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-foreground">
                      Lost Your Edit Link?
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      Enter the email address you used when creating your listing and we'll send you the edit links.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-3 mt-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> Edit links are valid for <strong>1 hour</strong> for security. If your link has expired, request a new one here.
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground/80 mt-2">
                      <strong>Tip:</strong> Edit link emails sometimes land in spam or junk folders – please check there too!
                    </p>
                  </div>

                  {/* Link Type Toggle */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">What type of listing?</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLinkType("single")}
                        className={cn(
                          "p-3 rounded-lg border text-sm font-medium transition-colors",
                          linkType === "single"
                            ? "bg-christmas/10 border-christmas text-christmas"
                            : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Mail className="h-4 w-4 mx-auto mb-1" />
                        Single Listing
                      </button>
                      <button
                        type="button"
                        onClick={() => setLinkType("bulk")}
                        className={cn(
                          "p-3 rounded-lg border text-sm font-medium transition-colors",
                          linkType === "bulk"
                            ? "bg-christmas/10 border-christmas text-christmas"
                            : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Layers className="h-4 w-4 mx-auto mb-1" />
                        Bulk Listings
                      </button>
                    </div>
                    {linkType === "bulk" && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Select this if you submitted multiple listings at once. <strong>Note:</strong> If you submitted several batches of up to 10 listings, you'll receive a separate email for each batch.
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-secondary"
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Edit Links
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="text-xs text-muted-foreground text-center mt-6">
                    For security, we'll only send edit links to the email address on file. 
                    We won't confirm whether the email exists in our system.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
