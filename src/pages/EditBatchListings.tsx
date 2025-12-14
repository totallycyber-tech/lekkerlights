import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ImageUploader";
import { CoverPhotoUploader } from "@/components/CoverPhotoUploader";
import { YouTubePreview } from "@/components/YouTubePreview";
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown,
  ChevronUp,
  MapPin,
  Save,
  Youtube,
  Plus,
  X,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { uploadListingImages } from "@/hooks/use-listings";

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
  image_urls?: string[];
  youtube_urls?: string[];
}

interface ListingMediaState {
  existingImages: string[];
  newCoverPhoto: File | null;
  newAdditionalImages: File[];
  youtubeUrls: string[];
  imagesToDelete: string[];
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
  const [mediaState, setMediaState] = useState<Record<string, ListingMediaState>>({});

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
          const fetchedListings = data.listings || [];
          setListings(fetchedListings);
          
          // Initialize media state for each listing
          const initialMediaState: Record<string, ListingMediaState> = {};
          fetchedListings.forEach((listing: BatchListing) => {
            initialMediaState[listing.id] = {
              existingImages: listing.image_urls || [],
              newCoverPhoto: null,
              newAdditionalImages: [],
              youtubeUrls: listing.youtube_urls?.length ? [...listing.youtube_urls] : [''],
              imagesToDelete: [],
            };
          });
          setMediaState(initialMediaState);
          
          if (fetchedListings.length > 0) {
            setExpandedListing(fetchedListings[0].id);
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

  // Media management functions
  const handleRemoveExistingImage = async (listingId: string, imageIndex: number) => {
    const state = mediaState[listingId];
    if (!state) return;

    const imageUrl = state.existingImages[imageIndex];
    
    // Mark for deletion and remove from display
    setMediaState(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        existingImages: prev[listingId].existingImages.filter((_, i) => i !== imageIndex),
        imagesToDelete: [...prev[listingId].imagesToDelete, imageUrl],
      },
    }));
  };

  const handleCoverPhotoChange = (listingId: string, photo: File | null) => {
    setMediaState(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        newCoverPhoto: photo,
      },
    }));
  };

  const handleAdditionalImagesChange = (listingId: string, images: File[]) => {
    setMediaState(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        newAdditionalImages: images,
      },
    }));
  };

  const handleAddYoutubeUrl = (listingId: string) => {
    const state = mediaState[listingId];
    if (!state || state.youtubeUrls.length >= 3) return;

    setMediaState(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        youtubeUrls: [...prev[listingId].youtubeUrls, ''],
      },
    }));
  };

  const handleRemoveYoutubeUrl = (listingId: string, index: number) => {
    setMediaState(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        youtubeUrls: prev[listingId].youtubeUrls.filter((_, i) => i !== index),
      },
    }));
  };

  const handleUpdateYoutubeUrl = (listingId: string, index: number, value: string) => {
    setMediaState(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        youtubeUrls: prev[listingId].youtubeUrls.map((url, i) => i === index ? value : url),
      },
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);

    try {
      // Process each listing
      for (const listing of listings) {
        const state = mediaState[listing.id];
        const changes = editedListings[listing.id] || {};
        
        // Check if there are any changes to save
        const hasTextChanges = Object.keys(changes).length > 0;
        const hasMediaChanges = state && (
          state.imagesToDelete.length > 0 ||
          state.newCoverPhoto !== null ||
          state.newAdditionalImages.length > 0 ||
          JSON.stringify(state.youtubeUrls.filter(u => u.trim())) !== JSON.stringify((listing.youtube_urls || []).filter(u => u.trim()))
        );

        if (!hasTextChanges && !hasMediaChanges) continue;

        // Delete marked images
        if (state?.imagesToDelete.length > 0) {
          for (const imageUrl of state.imagesToDelete) {
            const urlParts = imageUrl.split('/listing-images/');
            if (urlParts.length === 2) {
              const imagePath = urlParts[1];
              try {
                await supabase.functions.invoke('delete-listing-image', {
                  body: {
                    listingId: listing.id,
                    batchToken: token,
                    imagePath: imagePath,
                  },
                });
              } catch (err) {
                console.error('Error deleting image:', err);
              }
            }
          }
        }

        // Build updated image URLs
        let updatedImageUrls = [...(state?.existingImages || [])];

        // Upload new images if any
        if (state?.newCoverPhoto || (state?.newAdditionalImages.length || 0) > 0) {
          const newImages: File[] = [];
          if (state.newCoverPhoto) newImages.push(state.newCoverPhoto);
          if (state.newAdditionalImages.length > 0) newImages.push(...state.newAdditionalImages);

          if (newImages.length > 0) {
            try {
              const newUrls = await uploadListingImages(newImages, listing.id, token!);
              if (state.newCoverPhoto) {
                // New cover photo goes first
                updatedImageUrls = [newUrls[0], ...updatedImageUrls, ...newUrls.slice(1)];
              } else {
                updatedImageUrls = [...updatedImageUrls, ...newUrls];
              }
            } catch (err) {
              console.error('Error uploading images:', err);
              toast({
                title: "Warning",
                description: `Failed to upload some images for listing "${listing.title}"`,
                variant: "destructive",
              });
            }
          }
        }

        // Prepare updates
        const updates: Record<string, unknown> = {
          ...changes,
          image_urls: updatedImageUrls,
          youtube_urls: state?.youtubeUrls.filter(url => url.trim() !== '') || [],
        };

        const { error } = await supabase.functions.invoke("update-listing", {
          body: {
            listingId: listing.id,
            batchToken: token,
            updates,
          },
        });

        if (error) {
          throw new Error(`Failed to update listing "${listing.title}": ${error.message}`);
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
        
        // Reset media state
        const resetMediaState: Record<string, ListingMediaState> = {};
        data.listings.forEach((listing: BatchListing) => {
          resetMediaState[listing.id] = {
            existingImages: listing.image_urls || [],
            newCoverPhoto: null,
            newAdditionalImages: [],
            youtubeUrls: listing.youtube_urls?.length ? [...listing.youtube_urls] : [''],
            imagesToDelete: [],
          };
        });
        setMediaState(resetMediaState);
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

  const hasUnsavedChanges = () => {
    // Check text field changes
    const hasTextChanges = Object.keys(editedListings).some(
      id => Object.keys(editedListings[id]).length > 0
    );
    
    // Check media changes
    const hasMediaChanges = Object.entries(mediaState).some(([listingId, state]) => {
      const listing = listings.find(l => l.id === listingId);
      if (!listing) return false;
      
      return (
        state.imagesToDelete.length > 0 ||
        state.newCoverPhoto !== null ||
        state.newAdditionalImages.length > 0 ||
        JSON.stringify(state.youtubeUrls.filter(u => u.trim())) !== JSON.stringify((listing.youtube_urls || []).filter(u => u.trim()))
      );
    });
    
    return hasTextChanges || hasMediaChanges;
  };

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
              {listings.map((listing, index) => {
                const state = mediaState[listing.id];
                
                return (
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

                    {expandedListing === listing.id && state && (
                      <div className="p-4 pt-0 border-t border-border space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
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
                        </div>

                        {/* Current Photos */}
                        {state.existingImages.length > 0 && (
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium">Current Photos</Label>
                              <p className="text-xs text-muted-foreground mt-1">Click X to remove a photo</p>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {state.existingImages.map((url, imgIndex) => (
                                <div key={imgIndex} className="relative aspect-square rounded-lg overflow-hidden group">
                                  <img src={url} alt={`Photo ${imgIndex + 1}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExistingImage(listing.id, imgIndex)}
                                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                  {imgIndex === 0 && (
                                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-christmas text-white text-[10px] rounded">
                                      Cover
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add New Photos */}
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium">New Cover Photo</Label>
                              <p className="text-xs text-muted-foreground mt-1">Upload to replace current cover</p>
                            </div>
                            <CoverPhotoUploader 
                              image={state.newCoverPhoto}
                              onImageChange={(photo) => handleCoverPhotoChange(listing.id, photo)}
                              maxSizeMB={5}
                            />
                          </div>

                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium">Additional Photos</Label>
                              <p className="text-xs text-muted-foreground mt-1">Add more photos to gallery</p>
                            </div>
                            <ImageUploader 
                              images={state.newAdditionalImages}
                              onImagesChange={(images) => handleAdditionalImagesChange(listing.id, images)}
                              maxImages={9}
                              maxSizeMB={5}
                            />
                          </div>
                        </div>

                        {/* YouTube URLs */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Youtube className="h-5 w-5 text-destructive" />
                              <Label className="text-sm font-medium">YouTube Videos</Label>
                            </div>
                            {state.youtubeUrls.length < 3 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddYoutubeUrl(listing.id)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                          {state.youtubeUrls.map((url, urlIndex) => (
                            <div key={urlIndex} className="flex gap-2">
                              <div className="relative flex-1">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="https://www.youtube.com/watch?v=..."
                                  value={url}
                                  onChange={(e) => handleUpdateYoutubeUrl(listing.id, urlIndex, e.target.value)}
                                  className="bg-secondary pl-10"
                                />
                              </div>
                              {state.youtubeUrls.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveYoutubeUrl(listing.id, urlIndex)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <YouTubePreview urls={state.youtubeUrls} />
                        </div>

                        {/* Visit Guidance */}
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
                );
              })}
            </div>

            {/* Save Button */}
            <div className={cn(
              "sticky bottom-4 bg-background/95 backdrop-blur rounded-xl border border-border p-4 shadow-lg transition-opacity",
              hasUnsavedChanges() ? "opacity-100" : "opacity-50"
            )}>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {hasUnsavedChanges() 
                    ? "You have unsaved changes" 
                    : "All changes saved"}
                </p>
                <Button
                  onClick={handleSaveAll}
                  disabled={!hasUnsavedChanges() || isSaving}
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
