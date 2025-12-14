import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Clock, Mail, Phone, ExternalLink, Calendar, Car, Users, KeyRound } from "lucide-react";
import defaultCoverPhoto from "@/assets/default-cover-photo.png";

interface OperatingHours {
  [key: string]: { enabled: boolean; start: string; end: string };
}

interface ListingPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
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
    parkingInfo: string;
    maxVisitors: string;
    gateAccessInfo: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  };
  coverPhoto: string | null;
  additionalPhotos: string[];
  operatingHours: OperatingHours;
  nameVisible: boolean;
  emailVisible: boolean;
  phoneVisible: boolean;
  selectedTags: string[];
}

export function ListingPreview({
  open,
  onOpenChange,
  data,
  coverPhoto,
  additionalPhotos,
  operatingHours,
  nameVisible,
  emailVisible,
  phoneVisible,
  selectedTags,
}: ListingPreviewProps) {
  const fullAddress = `${data.streetNumber} ${data.streetName}, ${data.suburb}, ${data.city}, ${data.province}, ${data.postalCode}`;
  
  const formatOperatingHours = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const enabledDays = days.filter(day => operatingHours[day]?.enabled);
    
    if (enabledDays.length === 0) return { days: 'Not specified', times: '' };
    if (enabledDays.length === 7) {
      const time = operatingHours['monday'];
      return { days: 'Daily', times: time ? `${time.start} - ${time.end}` : '' };
    }
    
    const dayNames: Record<string, string> = {
      monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
      friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
    };
    
    const dayList = enabledDays.map(d => dayNames[d]).join(', ');
    const firstDay = operatingHours[enabledDays[0]];
    return { days: dayList, times: firstDay ? `${firstDay.start} - ${firstDay.end}` : '' };
  };

  const hours = formatOperatingHours();
  const displayPhoto = (coverPhoto && coverPhoto !== '') ? coverPhoto : defaultCoverPhoto;
  const hasContact = (emailVisible && data.contactEmail) || (phoneVisible && data.contactPhone);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Listing Preview</DialogTitle>
          <p className="text-sm text-muted-foreground">This is how your listing will appear to visitors</p>
        </DialogHeader>

        {/* Hero Image */}
        <div className="relative aspect-video rounded-lg overflow-hidden mt-4">
          <img 
            src={displayPhoto} 
            alt="Cover photo preview"
            className="w-full h-full object-cover"
          />
          <Badge variant="christmas" className="absolute top-3 left-3">
            🎄 Christmas
          </Badge>
        </div>

        {/* Content */}
        <div className="space-y-6 mt-4">
          {/* Title & Description */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-2">
              {data.title || 'Your Listing Title'}
            </h2>
            <p className="text-muted-foreground">
              {data.description || 'Your listing description will appear here...'}
            </p>
          </div>

          {/* Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="space-y-2">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-christmas" />
                Location
              </h3>
              <p className="text-muted-foreground text-sm">
                {data.streetNumber && data.streetName ? fullAddress : 'Address will appear here'}
              </p>
              <Button variant="outline" size="sm" className="pointer-events-none opacity-75">
                <ExternalLink className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
            </div>

            {/* Operating Hours */}
            <div className="space-y-2">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-christmas" />
                Viewing Hours
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {hours.days}
                </p>
                {hours.times && (
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {hours.times}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Visit Guidance */}
          {(data.parkingInfo || data.maxVisitors || data.gateAccessInfo) && (
            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="font-display font-semibold">Visit Guidance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.parkingInfo && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Car className="h-4 w-4 text-christmas" />
                      Parking
                    </p>
                    <p className="text-sm text-muted-foreground">{data.parkingInfo}</p>
                  </div>
                )}
                {data.maxVisitors && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-christmas" />
                      Max Visitors
                    </p>
                    <p className="text-sm text-muted-foreground">{data.maxVisitors} at a time</p>
                  </div>
                )}
                {data.gateAccessInfo && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-christmas" />
                      Gate Access
                    </p>
                    <p className="text-sm text-muted-foreground">{data.gateAccessInfo}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {hasContact && (
            <div className="border-t border-border pt-6">
              <h3 className="font-display font-semibold mb-3">Contact</h3>
              <div className="flex flex-wrap gap-4">
                {nameVisible && data.contactName && (
                  <span className="text-muted-foreground">{data.contactName}</span>
                )}
                {emailVisible && data.contactEmail && (
                  <span className="flex items-center gap-2 text-christmas">
                    <Mail className="h-4 w-4" />
                    {data.contactEmail}
                  </span>
                )}
                {phoneVisible && data.contactPhone && (
                  <span className="flex items-center gap-2 text-christmas">
                    <Phone className="h-4 w-4" />
                    {data.contactPhone}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Additional Photos */}
          {additionalPhotos.length > 0 && (
            <div className="border-t border-border pt-6">
              <h3 className="font-display font-semibold mb-3">More Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {additionalPhotos.map((photo, index) => (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={photo} 
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
