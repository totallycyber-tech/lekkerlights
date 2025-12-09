import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles, ArrowLeft, Check, Youtube, Plus, X, Link as LinkIcon, Tags, Trash2, EyeOff, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { ImageUploader } from "@/components/ImageUploader";
import { CoverPhotoUploader } from "@/components/CoverPhotoUploader";
import { TagSelector } from "@/components/TagSelector";
import { YouTubePreview } from "@/components/YouTubePreview";
import { supabase } from "@/integrations/supabase/client";
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

export default function EditListing() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>(['']);
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(defaultOperatingHours);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [nameVisible, setNameVisible] = useState(true);
  const [emailVisible, setEmailVisible] = useState(true);
  const [phoneVisible, setPhoneVisible] = useState(true);
  const [showComplexField, setShowComplexField] = useState(false);
  const [showUnitField, setShowUnitField] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    complexName: '',
    unitNo: '',
    streetNumber: '',
    streetName: '',
    suburb: '',
    city: '',
    province: '',
    postalCode: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    parkingInfo: '',
    maxVisitors: '',
    gateAccessInfo: '',
  });

  // Verify token and load listing data
  useEffect(() => {
    const verifyAndLoad = async () => {
      if (!id || !token) {
        toast({
          title: "Invalid link",
          description: "This edit link is invalid or expired.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        // Verify token via edge function (secure - client can't read tokens directly)
        const verifyResponse = await supabase.functions.invoke('verify-edit-token', {
          body: { listingId: id, editToken: token },
        });

        if (verifyResponse.error || !verifyResponse.data?.success) {
          toast({
            title: "Unauthorized",
            description: "This edit link is invalid or the listing no longer exists.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Fetch listing data (without edit_token - that's in secure table)
        const { data: listing, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error || !listing) {
          toast({
            title: "Error",
            description: "Failed to load listing data.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Populate form with existing data
        setFormData({
          title: listing.title || '',
          description: listing.description || '',
          complexName: listing.complex_name || '',
          unitNo: listing.unit_no || '',
          streetNumber: listing.street_number || '',
          streetName: listing.street_name || '',
          suburb: listing.suburb || '',
          city: listing.city || '',
          province: listing.province || '',
          postalCode: listing.postal_code || '',
          contactName: listing.contact_name || '',
          contactEmail: listing.contact_email || '',
          contactPhone: listing.contact_phone || '',
          parkingInfo: listing.parking_info || '',
          maxVisitors: listing.max_visitors?.toString() || '',
          gateAccessInfo: listing.gate_access_info || '',
        });

        setNameVisible(listing.name_visible ?? true);
        setEmailVisible(listing.email_visible ?? true);
        setPhoneVisible(listing.phone_visible ?? true);
        setShowComplexField(!!listing.complex_name);
        setShowUnitField(!!listing.unit_no);
        setExistingImageUrls(listing.image_urls || []);
        setYoutubeUrls(listing.youtube_urls?.length ? listing.youtube_urls : ['']);
        setSelectedTags(listing.tags || []);

        // Parse operating hours
        if (listing.operating_hours && typeof listing.operating_hours === 'object') {
          const hours = listing.operating_hours as Record<string, any>;
          const parsedHours: OperatingHours = { ...defaultOperatingHours };
          
          DAYS_OF_WEEK.forEach(day => {
            const dayKey = day;
            if (hours[dayKey]) {
              parsedHours[day] = {
                enabled: hours[dayKey].enabled ?? false,
                startTime: hours[dayKey].startTime || hours[dayKey].start || '18:00',
                endTime: hours[dayKey].endTime || hours[dayKey].end || '22:00',
              };
            }
          });
          
          setOperatingHours(parsedHours);
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error('Error loading listing:', err);
        toast({
          title: "Error",
          description: "Failed to load listing data.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAndLoad();
  }, [id, token, navigate]);

  const toggleDay = (day: string) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled }
    }));
  };

  const updateDayTime = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressSelect = useCallback((components: {
    streetNumber: string;
    streetName: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      streetNumber: components.streetNumber,
      streetName: components.streetName,
      suburb: components.suburb,
      city: components.city,
      province: components.province,
      postalCode: components.postalCode,
    }));
  }, []);

  const addYoutubeUrl = () => {
    if (youtubeUrls.length < 3) {
      setYoutubeUrls([...youtubeUrls, '']);
    }
  };

  const removeYoutubeUrl = (index: number) => {
    setYoutubeUrls(youtubeUrls.filter((_, i) => i !== index));
  };

  const updateYoutubeUrl = (index: number, value: string) => {
    const updated = [...youtubeUrls];
    updated[index] = value;
    setYoutubeUrls(updated);
  };

  const removeExistingImage = async (index: number) => {
    const imageUrl = existingImageUrls[index];
    
    // Extract the image path from the URL (format: .../listing-images/listingId/filename.jpg)
    const urlParts = imageUrl.split('/listing-images/');
    if (urlParts.length === 2) {
      const imagePath = urlParts[1];
      
      try {
        // Use secure edge function to delete the image
        const { data, error } = await supabase.functions.invoke('delete-listing-image', {
          body: {
            listingId: id,
            editToken: token,
            imagePath: imagePath,
          },
        });

        if (error) {
          console.error('Error deleting image:', error);
          toast({
            title: "Warning",
            description: "Image removed from listing but file may not have been deleted from storage.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error('Error calling delete-listing-image:', err);
      }
    }
    
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const filteredYoutubeUrls = youtubeUrls.filter(url => url.trim() !== '');

      // Upload new images if any
      let allImageUrls = [...existingImageUrls];
      const newImages: File[] = [];
      if (coverPhoto) newImages.push(coverPhoto);
      newImages.push(...additionalImages);

      if (newImages.length > 0) {
        const { uploadListingImages } = await import('@/hooks/use-listings');
        const newUrls = await uploadListingImages(newImages, id!, token!);
        // If cover photo was uploaded, prepend it
        if (coverPhoto) {
          allImageUrls = [newUrls[0], ...existingImageUrls, ...newUrls.slice(1)];
        } else {
          allImageUrls = [...existingImageUrls, ...newUrls];
        }
      }

      // Use secure edge function instead of direct database update
      const { data, error } = await supabase.functions.invoke('update-listing', {
        body: {
          listingId: id,
          editToken: token,
          updates: {
            title: formData.title,
            description: formData.description,
            complex_name: formData.complexName || null,
            unit_no: formData.unitNo || null,
            street_number: formData.streetNumber,
            street_name: formData.streetName,
            suburb: formData.suburb,
            city: formData.city,
            province: formData.province,
            postal_code: formData.postalCode,
            contact_name: formData.contactName || null,
            contact_email: formData.contactEmail || null,
            contact_phone: formData.contactPhone || null,
            name_visible: nameVisible,
            email_visible: emailVisible,
            phone_visible: phoneVisible,
            parking_info: formData.parkingInfo || null,
            max_visitors: formData.maxVisitors ? parseInt(formData.maxVisitors) : null,
            gate_access_info: formData.gateAccessInfo || null,
            youtube_urls: filteredYoutubeUrls,
            image_urls: allImageUrls,
            operating_hours: operatingHours,
            tags: selectedTags,
          },
        },
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || 'Update failed');

      toast({
        title: "Listing updated!",
        description: "Your changes have been saved successfully.",
      });

      navigate(`/listing/${id}`);
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update your listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // Use secure edge function instead of direct database delete
      const { data, error } = await supabase.functions.invoke('delete-listing', {
        body: {
          listingId: id,
          editToken: token,
        },
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || 'Delete failed');

      toast({
        title: "Listing deleted",
        description: "Your listing has been permanently removed.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete your listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-christmas" />
          <p className="mt-4 text-muted-foreground">Loading your listing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8 space-y-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/listing/${id}`)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Listing
              </Button>
              
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-christmas" />
                <span className="text-sm font-medium text-christmas uppercase tracking-wider">
                  Manage Your Display
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                Edit Your Listing
              </h1>
              <p className="text-muted-foreground">
                Update your Christmas display details or remove it from the platform.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <h2 className="font-display text-lg font-semibold">Basic Information</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Display Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Winter Wonderland Display"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="bg-secondary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell visitors what makes your Christmas display special..."
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="bg-secondary min-h-[120px]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h2 className="font-display text-lg font-semibold">Location</h2>
                  <p className="text-sm text-muted-foreground mt-1">Current address or search for a new one</p>
                </div>

                {/* Current Address Display */}
                {formData.streetNumber && formData.streetName && (
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-foreground">
                      <strong>Current:</strong> {formData.streetNumber} {formData.streetName}, {formData.suburb}, {formData.city}, {formData.province} {formData.postalCode}
                    </p>
                  </div>
                )}

                {/* Address Autocomplete */}
                <div className="space-y-2">
                  <Label>Update Address</Label>
                  <AddressAutocomplete onAddressSelect={handleAddressSelect} />
                </div>

                {/* Complex/Estate Toggle */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="showComplex" className="text-sm font-medium cursor-pointer">
                        Located in a complex or estate?
                      </Label>
                    </div>
                    <Switch
                      id="showComplex"
                      checked={showComplexField}
                      onCheckedChange={(checked) => {
                        setShowComplexField(checked);
                        if (!checked) handleChange('complexName', '');
                      }}
                    />
                  </div>
                  {showComplexField && (
                    <div className="space-y-2 pl-4 border-l-2 border-christmas/30">
                      <Label htmlFor="complexName">Complex/Estate Name</Label>
                      <Input
                        id="complexName"
                        placeholder="e.g., Silver Lakes Estate"
                        value={formData.complexName}
                        onChange={(e) => handleChange('complexName', e.target.value)}
                        className="bg-secondary"
                      />
                    </div>
                  )}
                </div>

                {/* Unit No Toggle */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="showUnit" className="text-sm font-medium cursor-pointer">
                        Have a unit or flat number?
                      </Label>
                    </div>
                    <Switch
                      id="showUnit"
                      checked={showUnitField}
                      onCheckedChange={(checked) => {
                        setShowUnitField(checked);
                        if (!checked) handleChange('unitNo', '');
                      }}
                    />
                  </div>
                  {showUnitField && (
                    <div className="space-y-2 pl-4 border-l-2 border-christmas/30">
                      <Label htmlFor="unitNo">Unit / Flat / House Number</Label>
                      <Input
                        id="unitNo"
                        placeholder="e.g., Unit 12, Flat 3A, House 45"
                        value={formData.unitNo}
                        onChange={(e) => handleChange('unitNo', e.target.value)}
                        className="bg-secondary"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Existing Photos */}
              {existingImageUrls.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                  <div>
                    <h2 className="font-display text-lg font-semibold">Current Photos</h2>
                    <p className="text-sm text-muted-foreground mt-1">Click X to remove a photo</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {existingImageUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 px-2 py-1 bg-christmas text-white text-xs rounded">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Photos & Videos */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <h2 className="font-display text-lg font-semibold">Add New Photos & Videos</h2>
                
                <div className="space-y-6">
                  {/* Cover Photo Upload */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">New Cover Photo</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a new cover photo to replace the current one
                      </p>
                    </div>
                    <CoverPhotoUploader 
                      image={coverPhoto}
                      onImageChange={setCoverPhoto}
                      maxSizeMB={5}
                    />
                  </div>

                  {/* Additional Photos Upload */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Additional Photos</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add more photos to your gallery
                      </p>
                    </div>
                    <ImageUploader 
                      images={additionalImages}
                      onImagesChange={setAdditionalImages}
                      maxImages={9}
                      maxSizeMB={5}
                    />
                  </div>

                  {/* YouTube URLs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-destructive" />
                        <Label className="text-sm font-medium">YouTube Videos</Label>
                      </div>
                      {youtubeUrls.length < 3 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={addYoutubeUrl}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add More
                        </Button>
                      )}
                    </div>
                    {youtubeUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="relative flex-1">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => updateYoutubeUrl(index, e.target.value)}
                            className="bg-secondary pl-10"
                          />
                        </div>
                        {youtubeUrls.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeYoutubeUrl(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <YouTubePreview urls={youtubeUrls} />
                  </div>
                </div>
              </div>

              {/* Display Tags */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Tags className="h-5 w-5 text-christmas" />
                    <h2 className="font-display text-lg font-semibold">Display Tags</h2>
                  </div>
                </div>
                
                <TagSelector 
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  maxTags={20}
                />
              </div>

              {/* Operating Hours */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <h2 className="font-display text-lg font-semibold">Operating Hours</h2>
                
                <div className="space-y-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <div 
                      key={day} 
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border transition-colors",
                        operatingHours[day].enabled 
                          ? "bg-christmas/5 border-christmas/30" 
                          : "bg-secondary/50 border-border"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-[140px]">
                        <Switch
                          checked={operatingHours[day].enabled}
                          onCheckedChange={() => toggleDay(day)}
                        />
                        <span className={cn(
                          "font-medium text-sm",
                          operatingHours[day].enabled ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {day}
                        </span>
                      </div>
                      
                      {operatingHours[day].enabled && (
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground whitespace-nowrap">From</Label>
                            <Input
                              type="time"
                              value={operatingHours[day].startTime}
                              onChange={(e) => updateDayTime(day, 'startTime', e.target.value)}
                              className="bg-background w-[120px] text-sm"
                            />
                          </div>
                          <span className="text-muted-foreground">–</span>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground whitespace-nowrap">To</Label>
                            <Input
                              type="time"
                              value={operatingHours[day].endTime}
                              onChange={(e) => updateDayTime(day, 'endTime', e.target.value)}
                              className="bg-background w-[120px] text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Visit Guidance */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <h2 className="font-display text-lg font-semibold">Visit Guidance</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="parkingInfo">Parking Information</Label>
                    <Textarea
                      id="parkingInfo"
                      placeholder="e.g., Street parking available..."
                      value={formData.parkingInfo}
                      onChange={(e) => handleChange('parkingInfo', e.target.value)}
                      className="bg-secondary min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxVisitors">Maximum Visitors at a Time</Label>
                    <Input
                      id="maxVisitors"
                      type="number"
                      min="1"
                      placeholder="e.g., 20"
                      value={formData.maxVisitors}
                      onChange={(e) => handleChange('maxVisitors', e.target.value)}
                      className="bg-secondary w-32"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gateAccessInfo">Gate/Complex Access Requirements</Label>
                    <Textarea
                      id="gateAccessInfo"
                      placeholder="e.g., Show driver's license at security gate..."
                      value={formData.gateAccessInfo}
                      onChange={(e) => handleChange('gateAccessInfo', e.target.value)}
                      className="bg-secondary min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <h2 className="font-display text-lg font-semibold">Contact Information</h2>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="contactName">Full Name</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {nameVisible ? 'Visible' : 'Hidden'}
                        </span>
                        <Switch
                          checked={nameVisible}
                          onCheckedChange={setNameVisible}
                        />
                      </div>
                    </div>
                    <Input
                      id="contactName"
                      type="text"
                      placeholder="John Smith"
                      value={formData.contactName}
                      onChange={(e) => handleChange('contactName', e.target.value)}
                      className="bg-secondary"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="contactEmail">Email</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {emailVisible ? 'Visible' : 'Hidden'}
                        </span>
                        <Switch
                          checked={emailVisible}
                          onCheckedChange={setEmailVisible}
                        />
                      </div>
                    </div>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.contactEmail}
                      onChange={(e) => handleChange('contactEmail', e.target.value)}
                      className="bg-secondary"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="contactPhone">Phone</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {phoneVisible ? 'Visible' : 'Hidden'}
                        </span>
                        <Switch
                          checked={phoneVisible}
                          onCheckedChange={setPhoneVisible}
                        />
                      </div>
                    </div>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+27 82 123 4567"
                      value={formData.contactPhone}
                      onChange={(e) => handleChange('contactPhone', e.target.value)}
                      className="bg-secondary"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate(`/listing/${id}`)}
                  >
                    Cancel
                  </Button>
                </div>

                {/* Delete Section */}
                <div className="border-t border-border pt-6 mt-4">
                  <div className="bg-destructive/10 rounded-xl p-6 space-y-4">
                    <h3 className="font-display text-lg font-semibold text-destructive">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground">
                      Once you delete your listing, it cannot be recovered. This action is permanent.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="lg" disabled={isDeleting}>
                          {isDeleting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Listing Permanently
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete your listing "{formData.title}" from Lekker Lights. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, delete permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
