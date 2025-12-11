import { useState, useCallback } from "react";
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
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { TagSelector } from "@/components/TagSelector";
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

interface ListingEntry {
  id: string;
  title: string;
  description: string;
  streetNumber: string;
  streetName: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  complexName: string;
  unitNo: string;
  tags: string[];
  operatingHours: OperatingHours;
  operatingHoursOther: string;
  parkingInfo: string;
  maxVisitors: string;
  gateAccessInfo: string;
  addressSelected: boolean;
}

const createEmptyListing = (): ListingEntry => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  streetNumber: '',
  streetName: '',
  suburb: '',
  city: '',
  province: '',
  postalCode: '',
  complexName: '',
  unitNo: '',
  tags: [],
  operatingHours: { ...defaultOperatingHours },
  operatingHoursOther: '',
  parkingInfo: '',
  maxVisitors: '',
  gateAccessInfo: '',
  addressSelected: false,
});

interface BulkListingFormProps {
  onSubmit: (listings: ListingEntry[], sharedData: {
    contactEmail: string;
    contactName: string;
    contactPhone: string;
    nameVisible: boolean;
    emailVisible: boolean;
    phoneVisible: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function BulkListingForm({ onSubmit, isSubmitting }: BulkListingFormProps) {
  const [listings, setListings] = useState<ListingEntry[]>([createEmptyListing()]);
  const [expandedListing, setExpandedListing] = useState<string>(listings[0].id);
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
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

  const handleAddressSelect = useCallback((id: string, components: {
    streetNumber: string;
    streetName: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
  }) => {
    setListings(prev => prev.map(l => 
      l.id === id ? { 
        ...l, 
        ...components,
        addressSelected: true 
      } : l
    ));
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
      if (!l.title.trim()) {
        toast({ title: "Missing title", description: `Listing ${i + 1} needs a title.`, variant: "destructive" });
        setExpandedListing(l.id);
        return;
      }
      if (!l.description.trim()) {
        toast({ title: "Missing description", description: `Listing ${i + 1} needs a description.`, variant: "destructive" });
        setExpandedListing(l.id);
        return;
      }
      if (!l.addressSelected || !l.streetName || !l.city) {
        toast({ title: "Missing address", description: `Listing ${i + 1} needs an address.`, variant: "destructive" });
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
    });
  };

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
              <div className="p-4 pt-0 border-t border-border space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Title *</Label>
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
                    className="bg-secondary"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Description *</Label>
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
                    className="bg-secondary min-h-[80px]"
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label>Address *</Label>
                  <AddressAutocomplete 
                    onAddressSelect={(components) => handleAddressSelect(listing.id, components)} 
                  />
                  {listing.addressSelected && (
                    <p className="text-sm text-muted-foreground">
                      ✓ {listing.streetNumber} {listing.streetName}, {listing.suburb}, {listing.city}
                    </p>
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

                {/* Visit Guidance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Parking Info</Label>
                    <Textarea
                      value={listing.parkingInfo}
                      onChange={(e) => updateListing(listing.id, 'parkingInfo', e.target.value)}
                      placeholder="Where can visitors park?"
                      className="bg-secondary min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gate Access</Label>
                    <Textarea
                      value={listing.gateAccessInfo}
                      onChange={(e) => updateListing(listing.id, 'gateAccessInfo', e.target.value)}
                      placeholder="Security or access requirements..."
                      className="bg-secondary min-h-[60px]"
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
          `Publish ${listings.length} Listing${listings.length > 1 ? 's' : ''}`
        )}
      </Button>
    </form>
  );
}
