import { useState, useCallback } from "react";
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
import { Sparkles, ArrowLeft, Check, Youtube, Plus, X, Link as LinkIcon, Tags } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { useCreateListing, uploadListingImages } from "@/hooks/use-listings";
import { ImageUploader } from "@/components/ImageUploader";
import { CoverPhotoUploader } from "@/components/CoverPhotoUploader";
import { TagSelector } from "@/components/TagSelector";

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
  const [emailVisible, setEmailVisible] = useState(true);
  const [phoneVisible, setPhoneVisible] = useState(true);
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
    contactEmail: '',
    contactPhone: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
        contact_email: formData.contactEmail || null,
        contact_phone: formData.contactPhone || null,
        email_visible: emailVisible,
        phone_visible: phoneVisible,
        youtube_urls: filteredYoutubeUrls,
        image_urls: [],
        operating_hours: operatingHours,
        tags: selectedTags,
      });

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

      toast({
        title: "Listing published!",
        description: "Your Christmas display is now live for everyone to see.",
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
                  <p className="text-sm text-muted-foreground mt-1">Start typing your address to auto-fill the fields below</p>
                </div>

                {/* Address Autocomplete */}
                <div className="space-y-2">
                  <Label>Search Address</Label>
                  <AddressAutocomplete onAddressSelect={handleAddressSelect} />
                </div>

                {/* Complex/Estate Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="complexName">Complex/Estate Name</Label>
                    <Input
                      id="complexName"
                      placeholder="e.g., Silver Lakes Estate"
                      value={formData.complexName}
                      onChange={(e) => handleChange('complexName', e.target.value)}
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitNo">Unit No</Label>
                    <Input
                      id="unitNo"
                      placeholder="e.g., Unit 12"
                      value={formData.unitNo}
                      onChange={(e) => handleChange('unitNo', e.target.value)}
                      className="bg-secondary"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="streetNumber">Street Number *</Label>
                    <Input
                      id="streetNumber"
                      placeholder="42"
                      value={formData.streetNumber}
                      onChange={(e) => handleChange('streetNumber', e.target.value)}
                      className="bg-secondary"
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label htmlFor="streetName">Street Name *</Label>
                    <Input
                      id="streetName"
                      placeholder="Jacaranda Avenue"
                      value={formData.streetName}
                      onChange={(e) => handleChange('streetName', e.target.value)}
                      className="bg-secondary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="suburb">Suburb *</Label>
                    <Input
                      id="suburb"
                      placeholder="Sandton"
                      value={formData.suburb}
                      onChange={(e) => handleChange('suburb', e.target.value)}
                      className="bg-secondary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Johannesburg"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="bg-secondary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province *</Label>
                    <Select 
                      value={formData.province}
                      onValueChange={(value) => handleChange('province', value)}
                    >
                      <SelectTrigger className="bg-secondary">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      placeholder="2196"
                      value={formData.postalCode}
                      onChange={(e) => handleChange('postalCode', e.target.value)}
                      className="bg-secondary"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Photos & Videos */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <h2 className="font-display text-lg font-semibold">Photos & Videos</h2>
                
                <div className="space-y-6">
                  {/* Cover Photo Upload */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Cover Photo *</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        This image will be displayed on listing cards in the Browse page
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

              {/* Contact Info */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h2 className="font-display text-lg font-semibold">Contact Information</h2>
                  <p className="text-sm text-muted-foreground mt-1">Optional - only if you want visitors to contact you</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="contactEmail">Email</Label>
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
    </div>
  );
}
