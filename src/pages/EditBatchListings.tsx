import { useState, useEffect, useCallback } from "react";
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
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
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
  Trash2,
  User,
  Mail,
  Phone,
  Wand2,
  FileText
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
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  name_visible?: boolean;
  email_visible?: boolean;
  phone_visible?: boolean;
  submitter_notes?: string;
  revision?: number;
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
  // Contact info
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  nameVisible: boolean;
  emailVisible: boolean;
  phoneVisible: boolean;
  // Address
  streetNumber: string;
  streetName: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  complexName: string;
  unitNo: string;
  showComplexField: boolean;
  showUnitField: boolean;
  showTitleField: boolean;
  showDescriptionField: boolean;
  isGeneratingTitle: boolean;
  isGeneratingDescription: boolean;
  submitterNotes: string;
}

function parseOperatingHours(hours: Record<string, any> | undefined): { operatingHours: OperatingHours; operatingHoursOther: string } {
  if (!hours || typeof hours !== 'object') {
    return { operatingHours: { ...defaultOperatingHours }, operatingHoursOther: '' };
  }

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
        // Contact info
        contactName: listing.contact_name || '',
        contactEmail: listing.contact_email || '',
        contactPhone: listing.contact_phone || '',
        nameVisible: listing.name_visible ?? true,
        emailVisible: listing.email_visible ?? true,
        phoneVisible: listing.phone_visible ?? true,
        // Address
        streetNumber: listing.street_number || '',
        streetName: listing.street_name || '',
        suburb: listing.suburb || '',
        city: listing.city || '',
        province: listing.province || '',
        postalCode: listing.postal_code || '',
        complexName: listing.complex_name || '',
        unitNo: listing.unit_no || '',
        showComplexField: !!listing.complex_name,
        showUnitField: !!listing.unit_no,
        showTitleField: !!listing.title,
        showDescriptionField: !!listing.description,
        isGeneratingTitle: false,
        isGeneratingDescription: false,
        submitterNotes: listing.submitter_notes || '',
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

  // Media state update helper
  const updateMediaState = (listingId: string, updates: Partial<ListingMediaState>) => {
    setMediaState(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        ...updates,
      },
    }));
  };

  // Image management
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
    updateMediaState(listingId, { newCoverPhoto: photo });
  };

  const handleAdditionalImagesChange = (listingId: string, images: File[]) => {
    updateMediaState(listingId, { newAdditionalImages: images });
  };

  // YouTube URLs
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
    updateMediaState(listingId, { selectedTags: tags });
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
        operatingHoursOther: '',
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
    updateMediaState(listingId, { operatingHoursOther: value });
  };

  // Address handling
  const handleAddressSelect = useCallback((listingId: string, components: {
    streetNumber: string;
    streetName: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
  }) => {
    updateMediaState(listingId, {
      streetNumber: components.streetNumber,
      streetName: components.streetName,
      suburb: components.suburb,
      city: components.city,
      province: components.province,
      postalCode: components.postalCode,
    });
  }, []);

  const generateWithAI = async (listingId: string, type: 'title' | 'description') => {
    const state = mediaState[listingId];
    if (!state) return;

    const loadingKey = type === 'title' ? 'isGeneratingTitle' : 'isGeneratingDescription';
    updateMediaState(listingId, { [loadingKey]: true });

    try {
      const listing = listings.find(l => l.id === listingId);
      const editedData = editedListings[listingId] || {};
      
      const { data, error } = await supabase.functions.invoke('generate-listing-content', {
        body: {
          type,
          tags: state.selectedTags,
          existingTitle: (editedData.title as string) || listing?.title || '',
          existingDescription: (editedData.description as string) || listing?.description || '',
        },
      });

      if (error) throw error;

      if (data?.text) {
        handleFieldChange(listingId, type, data.text);
        toast({
          title: `${type === 'title' ? 'Title' : 'Description'} generated!`,
          description: "Feel free to edit it to make it your own.",
        });
      }
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast({
        title: "Generation failed",
        description: "Could not generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      updateMediaState(listingId, { [loadingKey]: false });
    }
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
      for (const listing of listings) {
        const state = mediaState[listing.id];
        const changes = editedListings[listing.id] || {};
        
        // Check for changes
        const { operatingHours: originalHours, operatingHoursOther: originalOther } = parseOperatingHours(listing.operating_hours);
        
        const hasTextChanges = Object.keys(changes).length > 0;
        const hasMediaChanges = state && (
          state.imagesToDelete.length > 0 ||
          state.newCoverPhoto !== null ||
          state.newAdditionalImages.length > 0 ||
          JSON.stringify(state.youtubeUrls.filter(u => u.trim())) !== JSON.stringify((listing.youtube_urls || []).filter(u => u.trim())) ||
          JSON.stringify(state.selectedTags) !== JSON.stringify(listing.tags || []) ||
          JSON.stringify(state.operatingHours) !== JSON.stringify(originalHours) ||
          state.operatingHoursOther !== originalOther ||
          // Contact changes
          state.contactName !== (listing.contact_name || '') ||
          state.contactEmail !== (listing.contact_email || '') ||
          state.contactPhone !== (listing.contact_phone || '') ||
          state.nameVisible !== (listing.name_visible ?? true) ||
          state.emailVisible !== (listing.email_visible ?? true) ||
          state.phoneVisible !== (listing.phone_visible ?? true) ||
          // Address changes
          state.streetNumber !== (listing.street_number || '') ||
          state.streetName !== (listing.street_name || '') ||
          state.suburb !== (listing.suburb || '') ||
          state.city !== (listing.city || '') ||
          state.province !== (listing.province || '') ||
          state.postalCode !== (listing.postal_code || '') ||
          state.complexName !== (listing.complex_name || '') ||
          state.unitNo !== (listing.unit_no || '') ||
          // Private notes
          state.submitterNotes !== (listing.submitter_notes || '')
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

        // Build updated image URLs - separate cover from additional
        const existingCover = (state?.existingImages || [])[0] || null;
        const existingAdditional = (state?.existingImages || []).slice(1);
        
        let coverUrl: string | null = null;
        let additionalUrls: string[] = [...existingAdditional];

        if (state?.newCoverPhoto || (state?.newAdditionalImages.length || 0) > 0) {
          const newImages: File[] = [];
          if (state.newCoverPhoto) newImages.push(state.newCoverPhoto);
          if (state.newAdditionalImages.length > 0) newImages.push(...state.newAdditionalImages);

          if (newImages.length > 0) {
            try {
              const newUrls = await uploadListingImages(newImages, listing.id, token!);
              if (state.newCoverPhoto) {
                // New cover photo uploaded - use it as cover
                coverUrl = newUrls[0];
                additionalUrls = [...existingAdditional, ...newUrls.slice(1)];
              } else {
                // No new cover - keep existing cover (or null if removed)
                coverUrl = existingCover;
                additionalUrls = [...existingAdditional, ...newUrls];
              }
            } catch (err) {
              console.error('Error uploading images:', err);
              toast({
                title: "Warning",
                description: `Failed to upload some images for listing "${listing.title}"`,
                variant: "destructive",
              });
              coverUrl = existingCover;
            }
          } else {
            coverUrl = existingCover;
          }
        } else {
          coverUrl = existingCover;
        }

        // Build final image array: cover first (or empty string for default), then additional
        let updatedImageUrls: string[];
        if (coverUrl) {
          updatedImageUrls = [coverUrl, ...additionalUrls];
        } else {
          // No cover - use empty string as placeholder to indicate "use default"
          updatedImageUrls = additionalUrls.length > 0 ? ['', ...additionalUrls] : [];
        }

        // Build operating hours
        const operatingHoursData = DAYS_OF_WEEK.some(day => state?.operatingHours[day].enabled)
          ? state?.operatingHours
          : { other: state?.operatingHoursOther || '' };

        // Prepare updates
        const updates: Record<string, unknown> = {
          ...changes,
          // Handle optional title/description based on toggle state
          title: state?.showTitleField ? (changes.title ?? listing.title) : null,
          description: state?.showDescriptionField ? (changes.description ?? listing.description) : null,
          image_urls: updatedImageUrls,
          youtube_urls: state?.youtubeUrls.filter(url => url.trim() !== '') || [],
          tags: state?.selectedTags || [],
          operating_hours: operatingHoursData,
          // Contact info
          contact_name: state?.contactName || null,
          contact_email: state?.contactEmail || null,
          contact_phone: state?.contactPhone || null,
          name_visible: state?.nameVisible ?? true,
          email_visible: state?.emailVisible ?? true,
          phone_visible: state?.phoneVisible ?? true,
          // Address
          street_number: state?.streetNumber || listing.street_number,
          street_name: state?.streetName || listing.street_name,
          suburb: state?.suburb || listing.suburb,
          city: state?.city || listing.city,
          province: state?.province || listing.province,
          postal_code: state?.postalCode || listing.postal_code,
          complex_name: state?.complexName || null,
          unit_no: state?.unitNo || null,
          submitter_notes: state?.submitterNotes || null,
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

        // Check if address was changed and trigger geocoding
        const addressChanged = 
          state?.streetNumber !== (listing.street_number || '') ||
          state?.streetName !== (listing.street_name || '') ||
          state?.suburb !== (listing.suburb || '') ||
          state?.city !== (listing.city || '') ||
          state?.province !== (listing.province || '') ||
          state?.postalCode !== (listing.postal_code || '');

        if (addressChanged) {
          try {
            const fullAddress = [
              state?.streetNumber || listing.street_number,
              state?.streetName || listing.street_name,
              state?.suburb || listing.suburb,
              state?.city || listing.city,
              state?.province || listing.province,
              state?.postalCode || listing.postal_code,
              'South Africa'
            ].filter(Boolean).join(', ');

            await supabase.functions.invoke('geocode-address', {
              body: {
                listingId: listing.id,
                address: fullAddress,
              },
            });
          } catch (geocodeError) {
            console.error('Failed to geocode address:', geocodeError);
            // Don't fail the save, just continue without updated coordinates
          }
        }
      }

      toast({
        title: "Changes saved",
        description: "All your listings have been updated successfully.",
      });

      setEditedListings({});
      
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
        state.operatingHoursOther !== originalOther ||
        // Contact changes
        state.contactName !== (listing.contact_name || '') ||
        state.contactEmail !== (listing.contact_email || '') ||
        state.contactPhone !== (listing.contact_phone || '') ||
        state.nameVisible !== (listing.name_visible ?? true) ||
        state.emailVisible !== (listing.email_visible ?? true) ||
        state.phoneVisible !== (listing.phone_visible ?? true) ||
        // Address changes
        state.streetNumber !== (listing.street_number || '') ||
        state.streetName !== (listing.street_name || '') ||
        state.suburb !== (listing.suburb || '') ||
        state.city !== (listing.city || '') ||
        state.province !== (listing.province || '') ||
        state.postalCode !== (listing.postal_code || '') ||
        state.complexName !== (listing.complex_name || '') ||
        state.unitNo !== (listing.unit_no || '') ||
        // Private notes
        state.submitterNotes !== (listing.submitter_notes || '')
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
                                {state?.suburb || listing.suburb}, {state?.city || listing.city}
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
                              {/* Title Toggle */}
                              <div className="space-y-3 bg-secondary/50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label>Add a display title?</Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Enable to give this display a custom title
                                    </p>
                                  </div>
                                  <Switch
                                    checked={state.showTitleField}
                                    onCheckedChange={(checked) => {
                                      updateMediaState(listing.id, { showTitleField: checked });
                                      if (!checked) handleFieldChange(listing.id, 'title', '');
                                    }}
                                  />
                                </div>
                                {state.showTitleField && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-xs">Title</Label>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => generateWithAI(listing.id, 'title')}
                                        disabled={state.isGeneratingTitle}
                                        className="h-7 text-xs text-muted-foreground hover:text-christmas"
                                      >
                                        {state.isGeneratingTitle ? (
                                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        ) : (
                                          <Wand2 className="h-3 w-3 mr-1" />
                                        )}
                                        Generate with AI
                                      </Button>
                                    </div>
                                    <Input
                                      value={(getFieldValue(listing, 'title') as string) || ''}
                                      onChange={(e) => handleFieldChange(listing.id, 'title', e.target.value)}
                                      className="bg-background"
                                      placeholder="e.g., Winter Wonderland Display"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Description Toggle */}
                              <div className="space-y-3 bg-secondary/50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label>Add a description?</Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Enable to describe this display to visitors
                                    </p>
                                  </div>
                                  <Switch
                                    checked={state.showDescriptionField}
                                    onCheckedChange={(checked) => {
                                      updateMediaState(listing.id, { showDescriptionField: checked });
                                      if (!checked) handleFieldChange(listing.id, 'description', '');
                                    }}
                                  />
                                </div>
                                {state.showDescriptionField && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-xs">Description</Label>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => generateWithAI(listing.id, 'description')}
                                        disabled={state.isGeneratingDescription}
                                        className="h-7 text-xs text-muted-foreground hover:text-christmas"
                                      >
                                        {state.isGeneratingDescription ? (
                                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        ) : (
                                          <Wand2 className="h-3 w-3 mr-1" />
                                        )}
                                        Generate with AI
                                      </Button>
                                    </div>
                                    <Textarea
                                      value={(getFieldValue(listing, 'description') as string) || ''}
                                      onChange={(e) => handleFieldChange(listing.id, 'description', e.target.value)}
                                      className="bg-background min-h-[100px]"
                                      placeholder="Describe this display..."
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-christmas" />
                                <Label className="text-sm font-medium">Location</Label>
                              </div>

                              {/* Current Address Display */}
                              <div className="p-3 bg-secondary/50 rounded-lg">
                                <p className="text-sm text-foreground">
                                  <strong>Current:</strong> {state.streetNumber} {state.streetName}, {state.suburb}, {state.city}, {state.province} {state.postalCode}
                                </p>
                              </div>

                              {/* Address Autocomplete */}
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Update Address</Label>
                                <AddressAutocomplete 
                                  onAddressSelect={(components) => handleAddressSelect(listing.id, components)} 
                                />
                              </div>

                              {/* Complex/Estate Toggle */}
                              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                <Label className="text-sm font-medium cursor-pointer">
                                  Located in a complex or estate?
                                </Label>
                                <Switch
                                  checked={state.showComplexField}
                                  onCheckedChange={(checked) => {
                                    updateMediaState(listing.id, { 
                                      showComplexField: checked,
                                      complexName: checked ? state.complexName : ''
                                    });
                                  }}
                                />
                              </div>
                              {state.showComplexField && (
                                <div className="space-y-2 pl-4 border-l-2 border-christmas/30">
                                  <Label>Complex/Estate Name</Label>
                                  <Input
                                    placeholder="e.g., Silver Lakes Estate"
                                    value={state.complexName}
                                    onChange={(e) => updateMediaState(listing.id, { complexName: e.target.value })}
                                    className="bg-secondary"
                                  />
                                </div>
                              )}

                              {/* Unit No Toggle */}
                              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                <Label className="text-sm font-medium cursor-pointer">
                                  Have a unit or flat number?
                                </Label>
                                <Switch
                                  checked={state.showUnitField}
                                  onCheckedChange={(checked) => {
                                    updateMediaState(listing.id, { 
                                      showUnitField: checked,
                                      unitNo: checked ? state.unitNo : ''
                                    });
                                  }}
                                />
                              </div>
                              {state.showUnitField && (
                                <div className="space-y-2 pl-4 border-l-2 border-christmas/30">
                                  <Label>Unit / Flat / House Number</Label>
                                  <Input
                                    placeholder="e.g., Unit 12, Flat 3A"
                                    value={state.unitNo}
                                    onChange={(e) => updateMediaState(listing.id, { unitNo: e.target.value })}
                                    className="bg-secondary"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Current Photos */}
                            {state.existingImages.filter(url => url !== '').length > 0 && (
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-sm font-medium">Current Photos</Label>
                                  <p className="text-xs text-muted-foreground mt-1">Click X to remove a photo</p>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {state.existingImages.filter(url => url !== '').map((url, displayIndex) => {
                                    // Find actual index in original array for removal
                                    const actualIndex = state.existingImages.indexOf(url);
                                    const isCover = actualIndex === 0;
                                    return (
                                      <div key={actualIndex} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img src={url} alt={`Photo ${displayIndex + 1}`} className="w-full h-full object-cover" />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveExistingImage(listing.id, actualIndex)}
                                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                        {isCover && (
                                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-christmas text-white text-[10px] rounded">
                                            Cover
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
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
                                  maxImages={15}
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

                            {/* Contact Information */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-christmas" />
                                <Label className="text-sm font-medium">Contact Information</Label>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <Label>Full Name</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {state.nameVisible ? 'Visible' : 'Hidden'}
                                    </span>
                                    <Switch
                                      checked={state.nameVisible}
                                      onCheckedChange={(checked) => updateMediaState(listing.id, { nameVisible: checked })}
                                    />
                                  </div>
                                </div>
                                <Input
                                  placeholder="John Smith"
                                  value={state.contactName}
                                  onChange={(e) => updateMediaState(listing.id, { contactName: e.target.value })}
                                  className="bg-secondary"
                                />
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <Label>Email</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {state.emailVisible ? 'Visible' : 'Hidden'}
                                    </span>
                                    <Switch
                                      checked={state.emailVisible}
                                      onCheckedChange={(checked) => updateMediaState(listing.id, { emailVisible: checked })}
                                    />
                                  </div>
                                </div>
                                <Input
                                  type="email"
                                  placeholder="your@email.com"
                                  value={state.contactEmail}
                                  onChange={(e) => updateMediaState(listing.id, { contactEmail: e.target.value })}
                                  className="bg-secondary"
                                />
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <Label>Phone</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {state.phoneVisible ? 'Visible' : 'Hidden'}
                                    </span>
                                    <Switch
                                      checked={state.phoneVisible}
                                      onCheckedChange={(checked) => updateMediaState(listing.id, { phoneVisible: checked })}
                                    />
                                  </div>
                                </div>
                                <Input
                                  type="tel"
                                  placeholder="+27 12 345 6789"
                                  value={state.contactPhone}
                                  onChange={(e) => updateMediaState(listing.id, { contactPhone: e.target.value })}
                                  className="bg-secondary"
                                />
                              </div>
                            </div>

                            {/* Private Notes */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-christmas" />
                                <div>
                                  <Label className="text-sm font-medium">Private Notes</Label>
                                  <p className="text-xs text-muted-foreground">
                                    Only visible to you in edit link emails
                                  </p>
                                </div>
                              </div>
                              <Textarea
                                placeholder="e.g., Neighbour's display on Main Street..."
                                value={state.submitterNotes}
                                onChange={(e) => updateMediaState(listing.id, { submitterNotes: e.target.value })}
                                className="bg-secondary min-h-[60px]"
                              />
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
