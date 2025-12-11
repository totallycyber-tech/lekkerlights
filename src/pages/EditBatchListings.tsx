import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown,
  ChevronUp,
  MapPin,
  Save
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface BatchListing {
  id: string;
  title: string;
  description: string;
  street_number: string;
  street_name: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
  complex_name?: string;
  unit_no?: string;
  parking_info?: string;
  max_visitors?: number;
  gate_access_info?: string;
}

export default function EditBatchListings() {
  const { batchId } = useParams<{ batchId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [listings, setListings] = useState<BatchListing[]>([]);
  const [expandedListing, setExpandedListing] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editedListings, setEditedListings] = useState<Record<string, Partial<BatchListing>>>({});

  useEffect(() => {
    const verifyToken = async () => {
      if (!batchId || !token) {
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-batch-token", {
          body: { batchId, editToken: token },
        });

        if (error) throw error;

        if (data.valid) {
          setIsValid(true);
          setListings(data.listings || []);
          if (data.listings?.length > 0) {
            setExpandedListing(data.listings[0].id);
          }
        } else if (data.expired) {
          setIsExpired(true);
        }
      } catch (error) {
        console.error("Verification error:", error);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [batchId, token]);

  const handleFieldChange = (listingId: string, field: string, value: string | number) => {
    setEditedListings(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        [field]: value,
      },
    }));
  };

  const getFieldValue = (listing: BatchListing, field: keyof BatchListing) => {
    const edited = editedListings[listing.id];
    if (edited && field in edited) {
      return edited[field as keyof typeof edited];
    }
    return listing[field];
  };

  const handleSaveAll = async () => {
    setIsSaving(true);

    try {
      // Update each edited listing
      for (const [listingId, changes] of Object.entries(editedListings)) {
        if (Object.keys(changes).length === 0) continue;

        const { error } = await supabase.functions.invoke("update-listing", {
          body: {
            listingId,
            editToken: token,
            updates: changes,
          },
        });

        if (error) {
          throw new Error(`Failed to update listing: ${error.message}`);
        }
      }

      toast({
        title: "Changes saved",
        description: "All your listings have been updated successfully.",
      });

      // Clear edited state and reload
      setEditedListings({});
      
      // Re-fetch listings
      const { data } = await supabase.functions.invoke("verify-batch-token", {
        body: { batchId, editToken: token },
      });
      if (data.listings) {
        setListings(data.listings);
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Error saving changes",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = Object.keys(editedListings).some(
    id => Object.keys(editedListings[id]).length > 0
  );

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-christmas" />
            <p className="text-muted-foreground">Verifying your edit link...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-2">
                {isExpired ? "Link Expired" : "Invalid Link"}
              </h1>
              <p className="text-muted-foreground mb-6">
                {isExpired
                  ? "This edit link has expired. Edit links are valid for 1 hour for security reasons."
                  : "This edit link is invalid or the listings no longer exist."}
              </p>
              <div className="space-y-3">
                <Link to="/resend-edit-link">
                  <Button variant="hero" className="w-full">
                    Request New Edit Link
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button variant="outline" className="w-full">
                    Browse Displays
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link to="/browse" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Browse
            </Link>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-christmas" />
                <span className="text-sm font-medium text-christmas">Batch Edit Mode</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                Edit Your {listings.length} Listings
              </h1>
              <p className="text-muted-foreground mt-1">
                Make changes to any of your bulk-submitted listings below.
              </p>
            </div>

            {/* Listings Accordion */}
            <div className="space-y-4 mb-8">
              {listings.map((listing, index) => (
                <div
                  key={listing.id}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedListing(
                      expandedListing === listing.id ? null : listing.id
                    )}
                    className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <span className="w-8 h-8 bg-christmas/10 text-christmas rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold">
                          {getFieldValue(listing, 'title') || listing.title}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {listing.suburb}, {listing.city}
                        </p>
                      </div>
                    </div>
                    {expandedListing === listing.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  {expandedListing === listing.id && (
                    <div className="p-4 pt-0 border-t border-border space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={getFieldValue(listing, 'title') as string}
                          onChange={(e) => handleFieldChange(listing.id, 'title', e.target.value)}
                          className="bg-secondary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={getFieldValue(listing, 'description') as string}
                          onChange={(e) => handleFieldChange(listing.id, 'description', e.target.value)}
                          className="bg-secondary min-h-[100px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Parking Info</Label>
                          <Textarea
                            value={(getFieldValue(listing, 'parking_info') as string) || ''}
                            onChange={(e) => handleFieldChange(listing.id, 'parking_info', e.target.value)}
                            className="bg-secondary min-h-[80px]"
                            placeholder="Parking details..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Gate Access</Label>
                          <Textarea
                            value={(getFieldValue(listing, 'gate_access_info') as string) || ''}
                            onChange={(e) => handleFieldChange(listing.id, 'gate_access_info', e.target.value)}
                            className="bg-secondary min-h-[80px]"
                            placeholder="Access requirements..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Max Visitors</Label>
                        <Input
                          type="number"
                          min="1"
                          value={(getFieldValue(listing, 'max_visitors') as number) || ''}
                          onChange={(e) => handleFieldChange(listing.id, 'max_visitors', parseInt(e.target.value) || 0)}
                          className="bg-secondary w-32"
                          placeholder="e.g., 20"
                        />
                      </div>

                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {listing.street_number} {listing.street_name}, {listing.suburb}, {listing.city}, {listing.province}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className={cn(
              "sticky bottom-4 bg-background/95 backdrop-blur rounded-xl border border-border p-4 shadow-lg transition-opacity",
              hasUnsavedChanges ? "opacity-100" : "opacity-50"
            )}>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {hasUnsavedChanges 
                    ? "You have unsaved changes" 
                    : "All changes saved"}
                </p>
                <Button
                  onClick={handleSaveAll}
                  disabled={!hasUnsavedChanges || isSaving}
                  variant="hero"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save All Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
