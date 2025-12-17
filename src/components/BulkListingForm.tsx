import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  MapPin,
  Wand2,
  Loader2,
  Youtube,
  X,
  Sparkles,
  AlertCircle,
  Eye
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { TagSelector } from "@/components/TagSelector";
import { CoverPhotoUploader } from "@/components/CoverPhotoUploader";
import { ImageUploader } from "@/components/ImageUploader";
import { YouTubePreview } from "@/components/YouTubePreview";
import { supabase } from "@/integrations/supabase/client";

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

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

export interface ListingEntry {
  id: string;
  title: string;
  description: string;
  showTitleField: boolean;
  showDescriptionField: boolean;
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
  tags: string[];
  operatingHours: OperatingHours;
  operatingHoursOther: string;
  parkingInfo: string;
  maxVisitors: string;
  gateAccessInfo: string;
  submitterNotes: string;
  addressSelected: boolean;
  duplicateAddressError: string | null;
  isCheckingDuplicate: boolean;
  coverPhoto: File | null;
  additionalImages: File[];
  youtubeUrls: string[];
}

export const createEmptyListing = (): ListingEntry => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  showTitleField: false,
  showDescriptionField: false,
  streetNumber: '',
  streetName: '',
  suburb: '',
  city: '',
  province: '',
  postalCode: '',
  complexName: '',
  unitNo: '',
  showComplexField: false,
  showUnitField: false,
  tags: [],
  operatingHours: { ...defaultOperatingHours },
  operatingHoursOther: '',
  parkingInfo: '',
  maxVisitors: '',
  gateAccessInfo: '',
  submitterNotes: '',
  addressSelected: false,
  duplicateAddressError: null,
  isCheckingDuplicate: false,
  coverPhoto: null,
  additionalImages: [],
  youtubeUrls: [''],
});

interface BulkListingFormProps {
  onSubmit: (listings: ListingEntry[], sharedData: {
    contactEmail: string;
    contactName: string;
    contactPhone: string;
    nameVisible: boolean;
    emailVisible: boolean;
    phoneVisible: boolean;
    submitterNotes: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function BulkListingForm({ onSubmit, isSubmitting }: BulkListingFormProps) {
  const [listings, setListings] = useState<ListingEntry[]>([createEmptyListing()]);
  const [expandedListing, setExpandedListing] = useState<string>(listings[0].id);
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submitterNotes, setSubmitterNotes] = useState('');
  const [nameVisible, setNameVisible] = useState(true);
  const [emailVisible, setEmailVisible] = useState(true);
  const [phoneVisible, setPhoneVisible] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<{ id: string; type: string } | null>(null);

  const addListing = () => {
    if (listings.length >= 10) {
      toast({
        title: "Maximum reached",
        description: "You can submit up to 10 listings at once.",
        variant: "destructive",
      });
      return;
    }
    const newListing = createEmptyListing();
    setListings([...listings, newListing]);
    setExpandedListing(newListing.id);
  };

  const removeListing = (id: string) => {
    if (listings.length <= 1) return;
    const filtered = listings.filter(l => l.id !== id);
    setListings(filtered);
    if (expandedListing === id) {
      setExpandedListing(filtered[0].id);
    }
  };

  const updateListing = (id: string, field: keyof ListingEntry, value: any) => {
    setListings(prev => prev.map(l => 
      l.id === id ? { ...l, [field]: value } : l
    ));
  };

  const handleAddressSelect = useCallback(async (id: string, components: {
    streetNumber: string;
    streetName: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
  }) => {
    // First update the address fields
    setListings(prev => prev.map(l => 
      l.id === id ? { 
        ...l, 
        ...components,
        addressSelected: true,
        duplicateAddressError: null,
        isCheckingDuplicate: true
      } : l
    ));
    
    // Then check for duplicate address in database
    try {
      const { data: existingListings, error } = await supabase
        .from('listings_public')
        .select('id, street_number, street_name, suburb, city')
        .ilike('street_number', components.streetNumber.trim())
        .ilike('street_name', components.streetName.trim())
        .ilike('suburb', components.suburb.trim())
        .ilike('city', components.city.trim());
      
      if (!error && existingListings && existingListings.length > 0) {
        setListings(prev => prev.map(l => 
          l.id === id ? { 
            ...l, 
            duplicateAddressError: 'This address is already listed. If this is your listing, you can request an edit link.',
            isCheckingDuplicate: false
          } : l
        ));
      } else {
        setListings(prev => prev.map(l => 
          l.id === id ? { ...l, isCheckingDuplicate: false } : l
        ));
      }
    } catch (err) {
      console.error('Error checking for duplicate:', err);
      setListings(prev => prev.map(l => 
        l.id === id ? { ...l, isCheckingDuplicate: false } : l
      ));
    }
  }, []);

  const generateWithAI = async (listingId: string, type: 'title' | 'description') => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    setGeneratingFor({ id: listingId, type });

    try {
      const { data, error } = await supabase.functions.invoke('generate-listing-content', {
        body: {
          type,
          tags: listing.tags,
          existingTitle: listing.title,
          existingDescription: listing.description,
        },
      });

      if (error) throw error;

      if (data?.text) {
        updateListing(listingId, type, data.text);
        toast({
          title: `${type === 'title' ? 'Title' : 'Description'} generated!`,
          description: "Feel free to edit it.",
        });
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingFor(null);
    }
  };

  const toggleDay = (listingId: string, day: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    
    const newHours = {
      ...listing.operatingHours,
      [day]: { ...listing.operatingHours[day], enabled: !listing.operatingHours[day].enabled }
    };
    updateListing(listingId, 'operatingHours', newHours);
  };

  const updateDayTime = (listingId: string, day: string, field: 'startTime' | 'endTime', value: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    
    const newHours = {
      ...listing.operatingHours,
      [day]: { ...listing.operatingHours[day], [field]: value }
    };
    updateListing(listingId, 'operatingHours', newHours);
  };

  const addYoutubeUrl = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing || listing.youtubeUrls.length >= 3) return;
    updateListing(listingId, 'youtubeUrls', [...listing.youtubeUrls, '']);
  };

  const removeYoutubeUrl = (listingId: string, index: number) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    updateListing(listingId, 'youtubeUrls', listing.youtubeUrls.filter((_, i) => i !== index));
  };

  const updateYoutubeUrl = (listingId: string, index: number, value: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    const updated = [...listing.youtubeUrls];
    updated[index] = value;
    updateListing(listingId, 'youtubeUrls', updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!contactEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please provide your email address.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Validate all listings
    for (let i = 0; i < listings.length; i++) {
      const l = listings[i];
      if (l.showTitleField && !l.title.trim()) {
        toast({ title: "Missing title", description: `Listing ${i + 1} has title enabled but no title provided.`, variant: "destructive" });
        setExpandedListing(l.id);
        return;
      }
      if (l.showDescriptionField && !l.description.trim()) {
        toast({ title: "Missing description", description: `Listing ${i + 1} has description enabled but no description provided.`, variant: "destructive" });
        setExpandedListing(l.id);
        return;
      }
      if (!l.addressSelected || !l.streetName || !l.city) {
        toast({ title: "Missing address", description: `Listing ${i + 1} needs an address.`, variant: "destructive" });
        setExpandedListing(l.id);
        return;
      }
      if (l.duplicateAddressError) {
        toast({ title: "Duplicate address", description: `Listing ${i + 1} has an address that's already listed.`, variant: "destructive" });
        setExpandedListing(l.id);
        return;
      }
      if (l.isCheckingDuplicate) {
        toast({ title: "Please wait", description: `Listing ${i + 1} is still checking address availability.`, variant: "destructive" });
        setExpandedListing(l.id);
        return;
      }
    }

    await onSubmit(listings, {
      contactEmail: contactEmail.trim(),
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      nameVisible,
      emailVisible,
      phoneVisible,
      submitterNotes: submitterNotes.trim(),
    });
  };

  const anyDayEnabled = (listing: ListingEntry) => DAYS_OF_WEEK.some(day => listing.operatingHours[day]?.enabled);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            Listings ({listings.length}/10)
          </h2>
          {listings.length < 10 && (
            <Button type="button" variant="outline" size="sm" onClick={addListing}>
              <Plus className="h-4 w-4 mr-1" />
              Add Another
            </Button>
          )}
        </div>

        {listings.map((listing, index) => (
          <div
            key={listing.id}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setExpandedListing(
                expandedListing === listing.id ? '' : listing.id
              )}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <span className="w-8 h-8 bg-christmas/10 text-christmas rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold">
                    {listing.title || `Listing ${index + 1}`}
                  </h3>
                  {listing.addressSelected && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.suburb}, {listing.city}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {listings.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeListing(listing.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                {expandedListing === listing.id ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {expandedListing === listing.id && (
              <div className="p-4 pt-0 border-t border-border space-y-6">
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
                      checked={listing.showTitleField}
                      onCheckedChange={(checked) => {
                        updateListing(listing.id, 'showTitleField', checked);
                        if (!checked) updateListing(listing.id, 'title', '');
                      }}
                    />
                  </div>
                  {listing.showTitleField && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Title</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => generateWithAI(listing.id, 'title')}
                          disabled={generatingFor?.id === listing.id && generatingFor?.type === 'title'}
                          className="h-8 text-xs"
                        >
                          {generatingFor?.id === listing.id && generatingFor?.type === 'title' ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Wand2 className="h-3 w-3 mr-1" />
                          )}
                          Generate
                        </Button>
                      </div>
                      <Input
                        value={listing.title}
                        onChange={(e) => updateListing(listing.id, 'title', e.target.value)}
                        placeholder="e.g., Winter Wonderland Display"
                        className="bg-background"
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
                      checked={listing.showDescriptionField}
                      onCheckedChange={(checked) => {
                        updateListing(listing.id, 'showDescriptionField', checked);
                        if (!checked) updateListing(listing.id, 'description', '');
                      }}
                    />
                  </div>
                  {listing.showDescriptionField && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Description</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => generateWithAI(listing.id, 'description')}
                          disabled={generatingFor?.id === listing.id && generatingFor?.type === 'description'}
                          className="h-8 text-xs"
                        >
                          {generatingFor?.id === listing.id && generatingFor?.type === 'description' ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Wand2 className="h-3 w-3 mr-1" />
                          )}
                          Generate
                        </Button>
                      </div>
                      <Textarea
                        value={listing.description}
                        onChange={(e) => updateListing(listing.id, 'description', e.target.value)}
                        placeholder="Describe this display..."
                        className="bg-background min-h-[80px]"
                      />
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label>Address *</Label>
                  <AddressAutocomplete 
                    onAddressSelect={(components) => handleAddressSelect(listing.id, components)} 
                  />
                  {listing.isCheckingDuplicate && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking if address is available...
                    </p>
                  )}
                  {listing.duplicateAddressError && (
                    <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {listing.duplicateAddressError}
                      </p>
                      <Link 
                        to="/resend-edit-link" 
                        className="text-sm text-primary hover:underline mt-1 inline-block"
                      >
                        Request an edit link →
                      </Link>
                    </div>
                  )}
                  {listing.addressSelected && !listing.duplicateAddressError && (
                    <p className="text-sm text-muted-foreground">
                      ✓ {listing.streetNumber} {listing.streetName}, {listing.suburb}, {listing.city}
                    </p>
                  )}
                </div>

                {/* Complex/Estate Toggle */}
                <div className="space-y-3 bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Located in a complex or estate?</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Enable if the property is within a gated community, estate, or complex
                      </p>
                    </div>
                    <Switch
                      checked={listing.showComplexField}
                      onCheckedChange={(checked) => updateListing(listing.id, 'showComplexField', checked)}
                    />
                  </div>
                  {listing.showComplexField && (
                    <Input
                      value={listing.complexName}
                      onChange={(e) => updateListing(listing.id, 'complexName', e.target.value)}
                      placeholder="e.g., Greenview Estate"
                      className="bg-background"
                    />
                  )}
                </div>

                {/* Unit/Flat Toggle */}
                <div className="space-y-3 bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Have a unit or flat number?</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Enable if the property has a specific unit, flat, or apartment number
                      </p>
                    </div>
                    <Switch
                      checked={listing.showUnitField}
                      onCheckedChange={(checked) => updateListing(listing.id, 'showUnitField', checked)}
                    />
                  </div>
                  {listing.showUnitField && (
                    <Input
                      value={listing.unitNo}
                      onChange={(e) => updateListing(listing.id, 'unitNo', e.target.value)}
                      placeholder="e.g., Unit 5B"
                      className="bg-background"
                    />
                  )}
                </div>

                {/* Cover Photo */}
                <div className="space-y-3">
                  <Label>Cover Photo</Label>
                  <p className="text-xs text-muted-foreground -mt-1">
                    This will be displayed on listing cards
                  </p>
                  <p className="text-xs text-christmas font-medium">
                    📸 Upload high quality photos taken in the evening when lights are on for best results!
                  </p>
                  <CoverPhotoUploader
                    image={listing.coverPhoto}
                    onImageChange={(file) => updateListing(listing.id, 'coverPhoto', file)}
                  />
                </div>

                {/* Additional Photos */}
                <div className="space-y-3">
                  <Label>Additional Photos</Label>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Up to 15 additional photos
                  </p>
                  <p className="text-xs text-christmas font-medium">
                    📸 Use high quality photos for the best viewing experience!
                  </p>
                  <ImageUploader
                    images={listing.additionalImages}
                    onImagesChange={(images) => updateListing(listing.id, 'additionalImages', images)}
                    maxImages={15}
                  />
                </div>

                {/* YouTube URLs */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>YouTube Videos</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Add up to 3 YouTube video links
                      </p>
                    </div>
                    {listing.youtubeUrls.length < 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addYoutubeUrl(listing.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-xs text-christmas font-medium mb-1">
                      🎬 How to add videos:
                    </p>
                    <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                      <li>Record a high quality video of your display at night</li>
                      <li>Upload your video to <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">YouTube.com</a></li>
                      <li>Copy the video's sharing link and paste it below</li>
                    </ol>
                  </div>
                  <div className="space-y-2">
                    {listing.youtubeUrls.map((url, urlIndex) => (
                      <div key={urlIndex} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={url}
                            onChange={(e) => updateYoutubeUrl(listing.id, urlIndex, e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="bg-secondary pl-10"
                          />
                        </div>
                        {listing.youtubeUrls.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeYoutubeUrl(listing.id, urlIndex)}
                            className="h-10 w-10 text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {listing.youtubeUrls.some(url => url.trim()) && (
                    <YouTubePreview urls={listing.youtubeUrls.filter(url => url.trim())} />
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <TagSelector
                    selectedTags={listing.tags}
                    onTagsChange={(tags) => updateListing(listing.id, 'tags', tags)}
                    maxTags={10}
                  />
                </div>

                {/* Operating Hours */}
                <div className="space-y-4">
                  <Label>Operating Hours</Label>
                  <div className="space-y-3">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <Switch
                            checked={listing.operatingHours[day]?.enabled || false}
                            onCheckedChange={() => toggleDay(listing.id, day)}
                          />
                          <span className="text-sm font-medium">{day}</span>
                        </div>
                        {listing.operatingHours[day]?.enabled && (
                          <div className="flex items-center gap-2 ml-8 sm:ml-0">
                            <Input
                              type="time"
                              value={listing.operatingHours[day]?.startTime || '18:00'}
                              onChange={(e) => updateDayTime(listing.id, day, 'startTime', e.target.value)}
                              className="w-28 bg-secondary"
                            />
                            <span className="text-sm text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={listing.operatingHours[day]?.endTime || '22:00'}
                              onChange={(e) => updateDayTime(listing.id, day, 'endTime', e.target.value)}
                              className="w-28 bg-secondary"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Other operating hours option */}
                  {!anyDayEnabled(listing) && (
                    <div className="space-y-2 mt-4">
                      <Label className="text-sm">Other / Custom Hours</Label>
                      <Textarea
                        value={listing.operatingHoursOther}
                        onChange={(e) => updateListing(listing.id, 'operatingHoursOther', e.target.value)}
                        placeholder="e.g., 'Weekends only, weather permitting' or 'By appointment'"
                        className="bg-secondary min-h-[60px]"
                      />
                    </div>
                  )}
                </div>

                {/* Visit Guidance */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Visit Guidance</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Parking Info</Label>
                      <Textarea
                        value={listing.parkingInfo}
                        onChange={(e) => updateListing(listing.id, 'parkingInfo', e.target.value)}
                        placeholder="Where can visitors park?"
                        className="bg-secondary min-h-[60px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Gate Access</Label>
                      <Textarea
                        value={listing.gateAccessInfo}
                        onChange={(e) => updateListing(listing.id, 'gateAccessInfo', e.target.value)}
                        placeholder="Security or access requirements..."
                        className="bg-secondary min-h-[60px]"
                      />
                    </div>
                  </div>
                  
                  {/* Max Visitors */}
                  <div className="space-y-2">
                    <Label className="text-sm">Maximum Visitors at a Time</Label>
                    <Input
                      type="number"
                      min="1"
                      value={listing.maxVisitors}
                      onChange={(e) => updateListing(listing.id, 'maxVisitors', e.target.value)}
                      placeholder="e.g., 20 (leave empty if no limit)"
                      className="bg-secondary max-w-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Shared Contact Info */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div>
          <h2 className="font-display text-lg font-semibold">Contact Information</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This information will be shared across all {listings.length} listing(s)
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="contactEmail">Email Address *</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {emailVisible ? 'Visible' : 'Hidden'}
                </span>
                <Switch checked={emailVisible} onCheckedChange={setEmailVisible} />
              </div>
            </div>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-secondary"
              required
            />
            <p className="text-xs text-muted-foreground">
              We'll send a single edit link for all your listings to this email.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="contactName">Name</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {nameVisible ? 'Visible' : 'Hidden'}
                </span>
                <Switch checked={nameVisible} onCheckedChange={setNameVisible} />
              </div>
            </div>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Your name"
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
                <Switch checked={phoneVisible} onCheckedChange={setPhoneVisible} />
              </div>
            </div>
            <Input
              id="contactPhone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g., 082 123 4567"
              className="bg-secondary"
            />
          </div>
        </div>
      </div>

      {/* Private Notes - Separate Card */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Private Notes (Optional)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add notes to help you identify this batch in your edit link emails. These notes are private and will not be shown publicly.
          </p>
        </div>
        <Textarea
          value={submitterNotes}
          onChange={(e) => setSubmitterNotes(e.target.value)}
          placeholder="e.g., 'My house', 'Neighbor on Oak Street', 'The big display with inflatables'..."
          className="bg-secondary min-h-[100px]"
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground">
          {submitterNotes.length}/200 characters
        </p>
      </div>

      {/* Submit */}
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
            Publishing {listings.length} Listing(s)...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            Publish {listings.length} Listing(s)
          </>
        )}
      </Button>
    </form>
  );
}
