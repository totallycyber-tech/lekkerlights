import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flag, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const REPORT_REASONS = [
  { value: "inaccurate_info", label: "Inaccurate info" },
  { value: "privacy_concern", label: "Privacy concern" },
  { value: "offensive_content", label: "Offensive content" },
  { value: "safety_issue", label: "Safety issue" },
  { value: "listing_closed", label: "Listing no longer available" },
  { value: "spam", label: "Spam or fake listing" },
  { value: "other", label: "Other" },
];

interface ReportListingDialogProps {
  listingId: string;
  listingTitle: string;
  trigger?: React.ReactNode;
}

export function ReportListingDialog({
  listingId,
  listingTitle,
  trigger,
}: ReportListingDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reason, setReason] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");

  const resetForm = () => {
    setReason("");
    setAdditionalDetails("");
    setReporterName("");
    setReporterEmail("");
    setReporterPhone("");
    setIsSuccess(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setTimeout(resetForm, 200);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast({
        title: "Reason required",
        description: "Please select a reason for your report.",
        variant: "destructive",
      });
      return;
    }

    if (!reporterName.trim()) {
      toast({
        title: "Name required",
        description: "Please provide your name.",
        variant: "destructive",
      });
      return;
    }

    if (!reporterEmail.trim() && !reporterPhone.trim()) {
      toast({
        title: "Contact required",
        description: "Please provide either an email address or phone number.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation if provided
    if (reporterEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(reporterEmail.trim())) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const reasonLabel = REPORT_REASONS.find(r => r.value === reason)?.label || reason;

      const { error } = await supabase.functions.invoke("report-listing", {
        body: {
          listingId,
          listingTitle,
          reason: reasonLabel,
          additionalDetails: additionalDetails.trim(),
          reporterName: reporterName.trim(),
          reporterEmail: reporterEmail.trim(),
          reporterPhone: reporterPhone.trim(),
          reportedAt: new Date().toISOString(),
        },
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Failed to submit report",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
            <Flag className="h-4 w-4 mr-1" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card">
        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-christmas/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-christmas" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center">Report Submitted</DialogTitle>
              <DialogDescription className="text-center">
                Thank you for your report. We'll review it and take appropriate action.
              </DialogDescription>
            </DialogHeader>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-destructive" />
                Report Listing
              </DialogTitle>
              <DialogDescription>
                Report "{listingTitle}" if you believe there's an issue with this listing.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Report *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="bg-secondary">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {REPORT_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Additional Details</Label>
                <Textarea
                  id="details"
                  placeholder="Please provide any additional information about your concern..."
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  className="bg-secondary min-h-[80px]"
                  maxLength={1000}
                />
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your contact information (so we can follow up if needed)
                </p>

                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="bg-secondary"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    className="bg-secondary"
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+27 82 123 4567"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="bg-secondary"
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">
                    * Email or phone number required
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
