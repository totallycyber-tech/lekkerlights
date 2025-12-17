import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditListingDialogProps {
  listingId: string;
  listingTitle?: string;
}

export function EditListingDialog({ listingId, listingTitle }: EditListingDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter the email address used when creating this listing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-email-for-edit', {
        body: { listingId, email: email.trim() }
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Verification failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.success && data?.editUrl) {
        toast({
          title: "Email verified!",
          description: "Redirecting to edit page...",
        });
        
        // Small delay so user sees the success message
        setTimeout(() => {
          window.location.href = data.editUrl;
        }, 500);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-christmas" />
            Edit Your Listing
          </DialogTitle>
          <DialogDescription>
            Enter the email address you used when creating this listing to verify ownership.
            {listingTitle && (
              <span className="block mt-2 font-medium text-foreground">
                "{listingTitle}"
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              An edit link will also be sent to this email for future reference.
            </p>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Edit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
