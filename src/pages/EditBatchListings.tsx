import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/ImageUploader";
import { CoverPhotoUploader } from "@/components/CoverPhotoUploader";
import { YouTubePreview } from "@/components/YouTubePreview";
import { TagSelector } from "@/components/TagSelector";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Link as LinkIcon,
  Tags,
  Clock,
  Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { uploadListingImages } from "@/hooks/use-listings";

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

type OperatingHours = Record<string, DaySchedule>;

const defaultOperatingHours: OperatingHours = DAYS_OF_WEEK.reduce((acc, day) => {
  acc[day] = { enabled: false, startTime: '18:00', endTime: '22:00' };
  return acc;
}, {} as OperatingHours);

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
  tags?: string[];
  operating_hours?: Record<string, any>;
}

interface ListingMediaState {
  existingImages: string[];
  newCoverPhoto: File | null;
  newAdditionalImages: File[];
  youtubeUrls: string[];
  imagesToDelete: string[];
  selectedTags: string[];
  operatingHours: OperatingHours;
  operatingHoursOther: string;
}

function parseOperatingHours(hours: Record<string, any> | undefined): { operatingHours: OperatingHours; operatingHoursOther: string } {
  if (!hours || typeof hours !== 'object') {
    return { operatingHours: { ...defaultOperatingHours }, operatingHoursOther: '' };
  }

  // Check if it's the "other" type
  if ('other' in hours && typeof hours.other === 'string') {
    return { operatingHours: { ...defaultOperatingHours }, operatingHoursOther: hours.other };
  }

  const parsedHours: OperatingHours = { ...defaultOperatingHours };
  
  DAYS_OF_WEEK.forEach(day => {
    if (hours[day]) {
      parsedHours[day] = {
        enabled: hours[day].enabled ?? false,
        startTime: hours[day].startTime || hours[day].start || '18:00',
        endTime: hours[day].endTime || hours[day].end || '22:00',
      };
    }
  });
  
  return { operatingHours: parsedHours, operatingHoursOther: '' };
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
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
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
          initializeListings(data.listings || []);
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

  const initializeListings = (fetchedListings: BatchListing[]) => {
    setListings(fetchedListings);
    
    // Initialize media state for each listing
    const initialMediaState: Record<string, ListingMediaState> = {};
    fetchedListings.forEach((listing: BatchListing) => {
      const { operatingHours, operatingHoursOther } = parseOperatingHours(listing.operating_hours);
      
      initialMediaState[listing.id] = {
        existingImages: listing.image_urls || [],
        newCoverPhoto: null,
        newAdditionalImages: [],
        youtubeUrls: listing.youtube_urls?.length ? [...listing.youtube_urls] : [''],
        imagesToDelete: [],
        selectedTags: listing.tags || [],
        operatingHours,
        operatingHoursOther,
      };
    });
    setMediaState(initialMediaState);
    
    if (fetchedListings.length > 0) {
      setExpandedListing(fetchedListings[0].id);
    }
  };

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

  // Tags management
  const handleTagsChange = (listingId: string, tags: string[]) => {
    setMediaState(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        selectedTags: tags,
      },
    }));
  };

  // Operating hours management
  const toggleDay = (listingId: string, day: string) => {
    setMediaState(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        operatingHours: {
          ...prev[listingId].operatingHours,
          [day]: { ...prev[listingId].operatingHours[day], enabled: !prev[listingId].operatingHours[day].enabled }
        },
        operatingHoursOther: '', // Clear other when enabling a day
      },
    }));
  };

  const updateDayTime = (listingId: string, day: string, field: 'startTime' | 'endTime', value: string) => {
    setMediaState(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        operatingHours: {
          ...prev[listingId].operatingHours,
          [day]: { ...prev[listingId].operatingHours[day], [field]: value }
        },
      },
    }));
  };

  const updateOperatingHoursOther = (listingId: string, value: string) => {
    setMediaState(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        operatingHoursOther: value,
      },
    }));
  };

  // Delete listing
  const handleDeleteListing = async (listingId: string) => {
    setDeletingListingId(listingId);

    try {
      const { data, error } = await supabase.functions.invoke("delete-listing", {
        body: {
          listingId,
          batchToken: token,
        },
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || 'Delete failed');

      toast({
        title: "Listing deleted",
        description: "The listing has been permanently removed.",
      });

      // Remove from local state
      setListings(prev => prev.filter(l => l.id !== listingId));
      setMediaState(prev => {
        const newState = { ...prev };
        delete newState[listingId];
        return newState;
      });
      setEditedListings(prev => {
        const newState = { ...prev };
        delete newState[listingId];
        return newState;
      });

      // Expand next listing if the deleted one was expanded
      if (expandedListing === listingId) {
        const remainingListings = listings.filter(l => l.id !== listingId);
        setExpandedListing(remainingListings.length > 0 ? remainingListings[0].id : null);
      }
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingListingId(null);
    }
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
          JSON.stringify(state.youtubeUrls.filter(u => u.trim())) !== JSON.stringify((listing.youtube_urls || []).filter(u => u.trim())) ||
          JSON.stringify(state.selectedTags) !== JSON.stringify(listing.tags || []) ||
          JSON.stringify(state.operatingHours) !== JSON.stringify(parseOperatingHours(listing.operating_hours).operatingHours) ||
          state.operatingHoursOther !== parseOperatingHours(listing.operating_hours).operatingHoursOther
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

        // Build operating hours
        const operatingHoursData = DAYS_OF_WEEK.some(day => state?.operatingHours[day].enabled)
          ? state?.operatingHours
          : { other: state?.operatingHoursOther || '' };

        // Prepare updates
        const updates: Record<string, unknown> = {
          ...changes,
          image_urls: updatedImageUrls,
          youtube_urls: state?.youtubeUrls.filter(url => url.trim() !== '') || [],
          tags: state?.selectedTags || [],
          operating_hours: operatingHoursData,
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
        initializeListings(data.listings);
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
    const hasTextChanges = Object.keys(editedListings).some(
      id => Object.keys(editedListings[id]).length > 0
    );
    
    const hasMediaChanges = Object.entries(mediaState).some(([listingId, state]) => {
      const listing = listings.find(l => l.id === listingId);
      if (!listing) return false;
      
      const { operatingHours: originalHours, operatingHoursOther: originalOther } = parseOperatingHours(listing.operating_hours);
      
      return (
        state.imagesToDelete.length > 0 ||
        state.newCoverPhoto !== null ||
        state.newAdditionalImages.length > 0 ||
        JSON.stringify(state.youtubeUrls.filter(u => u.trim())) !== JSON.stringify((listing.youtube_urls || []).filter(u => u.trim())) ||
        JSON.stringify(state.selectedTags) !== JSON.stringify(listing.tags || []) ||
        JSON.stringify(state.operatingHours) !== JSON.stringify(originalHours) ||
        state.operatingHoursOther !== originalOther
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
                Edit Your {listings.length} Listing{listings.length !== 1 ? 's' : ''}
              </h1>
              <p className="text-muted-foreground mt-1">
                Make changes to any of your bulk-submitted listings below.
              </p>
            </div>

            {listings.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <p className="text-muted-foreground">All listings in this batch have been deleted.</p>
                <Link to="/browse">
                  <Button variant="outline" className="mt-4">
                    Browse Displays
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Listings Accordion */}
                <div className="space-y-4 mb-8">
                  {listings.map((listing, index) => {
                    const state = mediaState[listing.id];
                    const hasDaysEnabled = state && DAYS_OF_WEEK.some(day => state.operatingHours[day].enabled);
                    
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
                                {(getFieldValue(listing, 'title') as string) || listing.title}
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

                            {/* Tags */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Tags className="h-5 w-5 text-christmas" />
                                <Label className="text-sm font-medium">Display Tags</Label>
                              </div>
                              <TagSelector 
                                selectedTags={state.selectedTags}
                                onTagsChange={(tags) => handleTagsChange(listing.id, tags)}
                                maxTags={20}
                              />
                            </div>

                            {/* Operating Hours */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-christmas" />
                                <Label className="text-sm font-medium">Operating Hours</Label>
                              </div>
                              
                              <div className="space-y-2">
                                {DAYS_OF_WEEK.map((day) => (
                                  <div 
                                    key={day} 
                                    className={cn(
                                      "flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg border transition-colors",
                                      state.operatingHours[day].enabled 
                                        ? "bg-christmas/5 border-christmas/30" 
                                        : "bg-secondary/50 border-border"
                                    )}
                                  >
                                    <div className="flex items-center gap-2 min-w-[120px]">
                                      <Switch
                                        checked={state.operatingHours[day].enabled}
                                        onCheckedChange={() => toggleDay(listing.id, day)}
                                      />
                                      <span className={cn(
                                        "font-medium text-xs",
                                        state.operatingHours[day].enabled ? "text-foreground" : "text-muted-foreground"
                                      )}>
                                        {day}
                                      </span>
                                    </div>
                                    
                                    {state.operatingHours[day].enabled && (
                                      <div className="flex items-center gap-1 flex-1">
                                        <Input
                                          type="time"
                                          value={state.operatingHours[day].startTime}
                                          onChange={(e) => updateDayTime(listing.id, day, 'startTime', e.target.value)}
                                          className="bg-background w-[100px] text-xs h-8"
                                        />
                                        <span className="text-muted-foreground text-xs">–</span>
                                        <Input
                                          type="time"
                                          value={state.operatingHours[day].endTime}
                                          onChange={(e) => updateDayTime(listing.id, day, 'endTime', e.target.value)}
                                          className="bg-background w-[100px] text-xs h-8"
                                        />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {!hasDaysEnabled && (
                                <div className="space-y-2 pt-2 border-t border-border">
                                  <Label className="text-xs">Other (custom hours)</Label>
                                  <Textarea
                                    placeholder="e.g., Lights on from sunset to midnight daily..."
                                    value={state.operatingHoursOther}
                                    onChange={(e) => updateOperatingHoursOther(listing.id, e.target.value)}
                                    className="bg-secondary min-h-[60px] text-sm"
                                  />
                                </div>
                              )}
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

                            {/* Delete Listing */}
                            <div className="pt-4 border-t border-destructive/30">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    disabled={deletingListingId === listing.id}
                                  >
                                    {deletingListingId === listing.id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete This Listing
                                      </>
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{listing.title}"? This action cannot be undone. The listing will be permanently removed from the platform.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteListing(listing.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete Permanently
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
