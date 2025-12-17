import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Route,
  X,
  Trash2,
  Navigation,
  Share2,
  Sparkles,
  GripVertical,
  MapPin,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Listing } from "@/data/mockListings";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import defaultCoverPhoto from "@/assets/default-cover-photo.png";

interface TourPanelProps {
  tourListings: Listing[];
  maxStops: number;
  onRemove: (id: string) => void;
  onClear: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onOptimize: (startLat?: number, startLng?: number) => void;
  generateGoogleMapsUrl: (userLat?: number, userLng?: number) => string | null;
  generateShareUrl: () => string;
}

export function TourPanel({
  tourListings,
  maxStops,
  onRemove,
  onClear,
  onReorder,
  onOptimize,
  generateGoogleMapsUrl,
  generateShareUrl,
}: TourPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return Promise.resolve(null);
    }

    setIsLocating(true);
    return new Promise<{ lat: number; lng: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
          setIsLocating(false);
          resolve(loc);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLocating(false);
          toast({
            title: "Location access denied",
            description: "Tour will start from first display instead.",
          });
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  const handleStartTour = async () => {
    const loc = await getUserLocation();
    const url = generateGoogleMapsUrl(loc?.lat, loc?.lng);
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleOptimize = async () => {
    const loc = await getUserLocation();
    onOptimize(loc?.lat, loc?.lng);
    toast({
      title: "Route optimized!",
      description: "Displays reordered for the shortest driving distance.",
    });
  };

  const handleShare = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url);
    toast({
      title: "Tour link copied!",
      description: "Share this link so others can follow your tour.",
    });
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) onReorder(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index < tourListings.length - 1) onReorder(index, index + 1);
  };

  const TourContent = () => (
    <div className="flex flex-col h-full">
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant="secondary" className="text-sm">
          {tourListings.length} / {maxStops} stops
        </Badge>
        {tourListings.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {tourListings.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <Route className="h-12 w-12 text-muted-foreground mb-3" />
          <h4 className="font-medium mb-1">No stops yet</h4>
          <p className="text-sm text-muted-foreground">
            Click "Add to Tour" on displays to plan your lights tour
          </p>
        </div>
      ) : (
        <>
          {/* Tour Stops List */}
          <ScrollArea className="flex-1 -mx-4 px-4">
            <div className="space-y-2 pb-4">
              {tourListings.map((listing, index) => (
                <div
                  key={listing.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border"
                >
                  {/* Order Number */}
                  <div className="flex flex-col items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <span className="text-xs font-bold text-christmas w-5 text-center">
                      {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === tourListings.length - 1}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                    <img
                      src={
                        listing.hasCoverPhoto && listing.photos[0]
                          ? listing.photos[0]
                          : defaultCoverPhoto
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {listing.title || `${listing.location.streetNumber} ${listing.location.streetName}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {listing.location.suburb}
                    </p>
                  </div>

                  {/* Remove */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(listing.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-border mt-auto">
            {tourListings.length > 1 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleOptimize}
                disabled={isLocating}
              >
                {isLocating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Optimize Route
              </Button>
            )}

            <Button
              className="w-full bg-christmas hover:bg-christmas/90"
              onClick={handleStartTour}
              disabled={isLocating}
            >
              {isLocating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              Start Tour in Google Maps
            </Button>

            <Button variant="outline" className="w-full" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Tour Link
            </Button>
          </div>
        </>
      )}
    </div>
  );

  // Floating button trigger
  const TriggerButton = (
    <Button
      className={cn(
        "gap-2 shadow-lg",
        tourListings.length > 0
          ? "bg-christmas hover:bg-christmas/90"
          : "bg-primary"
      )}
    >
      <Route className="h-4 w-4" />
      <span className="hidden sm:inline">Plan Tour</span>
      {tourListings.length > 0 && (
        <Badge
          variant="secondary"
          className="ml-1 bg-white/20 text-white hover:bg-white/20"
        >
          {tourListings.length}
        </Badge>
      )}
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{TriggerButton}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-christmas" />
            Plan Your Lights Tour
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden mt-4">
          <TourContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
