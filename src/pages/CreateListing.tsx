import { useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { provinces } from "@/data/mockListings";
import { Sparkles, ArrowLeft, Check, Youtube, Plus, X, Link as LinkIcon, Tags, Eye, Wand2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { useCreateListing, uploadListingImages } from "@/hooks/use-listings";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "@/components/ImageUploader";
import { CoverPhotoUploader } from "@/components/CoverPhotoUploader";
import { TagSelector } from "@/components/TagSelector";
import { YouTubePreview } from "@/components/YouTubePreview";
import { ListingPreview } from "@/components/ListingPreview";

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

export default function CreateListing() {
  const navigate = useNavigate();
  const createListing = useCreateListing();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>(['']);
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(defaultOperatingHours);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [nameVisible, setNameVisible] = useState(true);
  const [emailVisible, setEmailVisible] = useState(true);
  const [phoneVisible, setPhoneVisible] = useState(true);
  const [showComplexField, setShowComplexField] = useState(false);
  const [showUnitField, setShowUnitField] = useState(false);
  const [addressSelected, setAddressSelected] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
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
    setAddressSelected(true);
    setAddressError(false);
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

  const generateWithAI = async (type: 'title' | 'description') => {
    const setLoading = type === 'title' ? setIsGeneratingTitle : setIsGeneratingDescription;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-listing-content', {
        body: {
          type,
          tags: selectedTags,
          existingTitle: formData.title,
          existingDescription: formData.description,
        },
      });

      if (error) throw error;

      if (data?.text) {
        handleChange(type, data.text);
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
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email (required for edit link)
    if (!formData.contactEmail || !formData.contactEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please provide your email address so we can send you a secure edit link.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate address selection
    if (!addressSelected || !formData.streetName || !formData.city || !formData.province) {
      setAddressError(true);
      toast({
        title: "Address required",
        description: "Please select an address from the autocomplete suggestions.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate address
    setIsSubmitting(true);
    setUploadProgress('Checking for duplicate address...');
    
    try {
      const { data: existingListings, error: checkError } = await supabase
        .from('listings')
        .select('id, street_number, street_name, suburb, city')
        .ilike('street_number', formData.streetNumber.trim())
        .ilike('street_name', formData.streetName.trim())
        .ilike('suburb', formData.suburb.trim())
        .ilike('city', formData.city.trim());
      
      if (checkError) {
        console.error('Error checking for duplicate address:', checkError);
      } else if (existingListings && existingListings.length > 0) {
        setIsSubmitting(false);
        setUploadProgress('');
        toast({
          title: "Address already listed",
          description: "This address has already been listed. If this is your listing, you can request an edit link to modify it.",
          variant: "destructive",
        });
        return;
      }
    } catch (checkError) {
      console.error('Error checking for duplicate address:', checkError);
      // Continue with submission even if check fails
    }

    try {
      // Filter out empty YouTube URLs
      const filteredYoutubeUrls = youtubeUrls.filter(url => url.trim() !== '');

      // First create the listing to get an ID
      setUploadProgress('Creating listing...');
      const listing = await createListing.mutateAsync({
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
        contact_email: formData.contactEmail.trim(),
        contact_phone: formData.contactPhone || null,
        name_visible: nameVisible,
        email_visible: emailVisible,
        phone_visible: phoneVisible,
        parking_info: formData.parkingInfo || null,
        max_visitors: formData.maxVisitors ? parseInt(formData.maxVisitors) : null,
        gate_access_info: formData.gateAccessInfo || null,
        youtube_urls: filteredYoutubeUrls,
        image_urls: [],
        operating_hours: operatingHours,
        tags: selectedTags,
      });

      // Geocode the address to get lat/lng coordinates
      setUploadProgress('Getting location coordinates...');
      try {
        const fullAddress = [
          formData.streetNumber,
          formData.streetName,
          formData.suburb,
          formData.city,
          formData.province,
          formData.postalCode,
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
        // Don't fail the submission, just continue without coordinates
      }

      // Upload images if any (cover photo first, then additional)
      const allImages: File[] = [];
      if (coverPhoto) allImages.push(coverPhoto);
      allImages.push(...additionalImages);
      
      if (allImages.length > 0) {
        setUploadProgress(`Uploading ${allImages.length} photo(s)...`);
        const imageUrls = await uploadListingImages(allImages, listing.id);
        
        // Update listing with image URLs
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase
          .from('listings')
          .update({ image_urls: imageUrls } as any)
          .eq('id', listing.id);
      }

      // Send edit link email via edge function (which has access to the secure token table)
      setUploadProgress('Sending edit link to your email...');
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Create token in secure table first via edge function
        await supabase.functions.invoke('create-listing-token', {
          body: {
            listingId: listing.id,
            email: formData.contactEmail.trim(),
            listingTitle: formData.title,
          },
        });
      } catch (emailError) {
        console.error('Failed to send edit link email:', emailError);
        // Don't fail the whole submission, just warn the user
      }

      toast({
        title: "Listing published!",
        description: "Your Christmas display is now live. Check your email for the edit link.",
      });

      navigate('/browse');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to publish your listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

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
                onClick={() => navigate(-1)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-christmas" />
                <span className="text-sm font-medium text-christmas uppercase tracking-wider">
                  Share Your Display
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                List Your Christmas Display
              </h1>
              <p className="text-muted-foreground">
                Share your Christmas decorations with your community and help spread the festive joy!
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <h2 className="font-display text-lg font-semibold">Basic Information</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="title">Display Title *</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => generateWithAI('title')}
                        disabled={isGeneratingTitle}
                        className="h-8 text-xs text-muted-foreground hover:text-christmas"
                      >
                        {isGeneratingTitle ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Wand2 className="h-3 w-3 mr-1" />
                        )}
                        Generate with AI
                      </Button>
                    </div>
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description">Description *</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => generateWithAI('description')}
                        disabled={isGeneratingDescription}
                        className="h-8 text-xs text-muted-foreground hover:text-christmas"
                      >
                        {isGeneratingDescription ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Wand2 className="h-3 w-3 mr-1" />
                        )}
                        Generate with AI
                      </Button>
                    </div>
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
                  <p className="text-sm text-muted-foreground mt-1">Search for your address to auto-fill your location details</p>
                </div>

                {/* Address Autocomplete */}
                <div className="space-y-2">
                  <Label>Address *</Label>
                  <div className={cn(
                    "rounded-lg transition-colors",
                    addressError && "ring-2 ring-destructive ring-offset-2 ring-offset-background"
                  )}>
                    <AddressAutocomplete onAddressSelect={handleAddressSelect} />
                  </div>
                  {addressError && !addressSelected && (
                    <p className="text-sm text-destructive">
                      Please select an address from the suggestions
                    </p>
                  )}
                  {formData.streetNumber && formData.streetName && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <Check className="h-4 w-4 inline mr-1 text-christmas-secondary" />
                      {formData.streetNumber} {formData.streetName}, {formData.suburb}, {formData.city}, {formData.province} {formData.postalCode}
                    </p>
                  )}
                </div>

                {/* Complex/Estate Toggle */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="showComplex" className="text-sm font-medium cursor-pointer">
                        Located in a complex or estate?
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Enable if your home is within a gated community, security estate, or apartment complex
                      </p>
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
                      <p className="text-xs text-muted-foreground">
                        Enable if visitors need a unit, flat, or house number to find you within the complex
                      </p>
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

              {/* Photos & Videos */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <h2 className="font-display text-lg font-semibold">Photos & Videos</h2>
                
                <div className="space-y-6">
                  {/* Cover Photo Upload */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Cover Photo</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        This image will be displayed on listing cards in the Browse page. If not provided, a default festive image will be used.
                      </p>
                      <p className="text-xs text-christmas mt-1">
                        Recommended size: 1200 × 800 pixels (3:2 aspect ratio) for best display quality
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
                        Add more photos to showcase your display (optional)
                      </p>
                      <p className="text-xs text-christmas mt-1">
                        Recommended size: 1600 × 1200 pixels or larger for gallery viewing
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
                    <p className="text-xs text-muted-foreground">
                      Add YouTube video URLs to showcase your display (up to 3)
                    </p>
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
                    
                    {/* YouTube Video Preview */}
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
                  <p className="text-sm text-muted-foreground mt-1">
                    Select tags that best describe your display to help visitors find you
                  </p>
                </div>
                
                <TagSelector 
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  maxTags={20}
                />
              </div>

              {/* Operating Hours */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h2 className="font-display text-lg font-semibold">Operating Hours</h2>
                  <p className="text-sm text-muted-foreground mt-1">Select which days your display is viewable and set the times</p>
                </div>
                
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
                <div>
                  <h2 className="font-display text-lg font-semibold">Visit Guidance</h2>
                  <p className="text-sm text-muted-foreground mt-1">Help visitors know what to expect when visiting</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="parkingInfo">Parking Information</Label>
                    <Textarea
                      id="parkingInfo"
                      placeholder="e.g., Street parking available, park on the left side of the road, dedicated visitor parking in the complex..."
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
                    <p className="text-xs text-muted-foreground">Leave empty if no limit</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gateAccessInfo">Gate/Complex Access Requirements</Label>
                    <Textarea
                      id="gateAccessInfo"
                      placeholder="e.g., Show driver's license at security gate, dial code #1234 at the gate, call ahead for access..."
                      value={formData.gateAccessInfo}
                      onChange={(e) => handleChange('gateAccessInfo', e.target.value)}
                      className="bg-secondary min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground">Only fill in if your display is within a complex or gated estate</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h2 className="font-display text-lg font-semibold">Contact Information</h2>
                  <p className="text-sm text-muted-foreground mt-1">Your email is required so we can send you a secure link to edit or delete your listing</p>
                </div>
                
                <div className="space-y-4">
                  {/* Email - Required */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="contactEmail">Email Address *</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {emailVisible ? 'Visible to public' : 'Hidden from public'}
                        </span>
                        <Switch
                          checked={emailVisible}
                          onCheckedChange={setEmailVisible}
                          aria-label="Toggle email visibility"
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
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll send you a secure edit link to this email. You can choose whether to show it publicly using the toggle above.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="contactName">Full Name</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {nameVisible ? 'Visible to public' : 'Hidden from public'}
                        </span>
                        <Switch
                          checked={nameVisible}
                          onCheckedChange={setNameVisible}
                          aria-label="Toggle name visibility"
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
                      <Label htmlFor="contactPhone">Phone</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {phoneVisible ? 'Visible to public' : 'Hidden from public'}
                        </span>
                        <Switch
                          checked={phoneVisible}
                          onCheckedChange={setPhoneVisible}
                          aria-label="Toggle phone visibility"
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

              {/* Submit */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="flex-1"
                    disabled={isSubmitting || !agreedToTerms}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        {uploadProgress || 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Publish Listing
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => setPreviewOpen(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    By submitting this listing, you confirm that you have read and agree to the{" "}
                    <Link to="/terms-of-service" className="text-christmas hover:underline" target="_blank">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy-policy" className="text-christmas hover:underline" target="_blank">
                      Privacy Policy
                    </Link>.
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />

      {/* Preview Dialog */}
      <ListingPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={formData}
        coverPhoto={coverPhoto ? URL.createObjectURL(coverPhoto) : null}
        additionalPhotos={additionalImages.map(img => URL.createObjectURL(img))}
        operatingHours={Object.fromEntries(
          Object.entries(operatingHours).map(([day, schedule]) => [
            day.toLowerCase(),
            { enabled: schedule.enabled, start: schedule.startTime, end: schedule.endTime }
          ])
        )}
        nameVisible={nameVisible}
        emailVisible={emailVisible}
        phoneVisible={phoneVisible}
        selectedTags={selectedTags}
      />
    </div>
  );
}
