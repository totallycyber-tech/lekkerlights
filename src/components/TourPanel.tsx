import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  Route,
  X,
  Trash2,
  Navigation,
  Share2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Loader2,
  Clock,
  MapPin,
  Save,
  FolderOpen,
  Pencil,
  Check,
} from "lucide-react";
import { Listing } from "@/data/mockListings";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { calculateDistance } from "@/lib/geo-utils";
import { SavedTour } from "@/hooks/use-tour";
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
  // Saved tours
  savedTours: SavedTour[];
  onSaveTour: (name: string) => boolean;
  onLoadSavedTour: (tourId: string, allListings: Listing[]) => boolean;
  onDeleteSavedTour: (tourId: string) => void;
  onRenameSavedTour: (tourId: string, newName: string) => void;
  allListings: Listing[];
}

// Estimate driving time based on distance (average 40 km/h in suburban areas + 2 min per stop)
function estimateDrivingTime(distanceKm: number, stops: number): string {
  const drivingMinutes = Math.round((distanceKm / 40) * 60);
  const stopTime = stops * 2; // 2 minutes per stop for viewing
  const totalMinutes = drivingMinutes + stopTime;
  
  if (totalMinutes < 60) {
    return `~${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `~${hours}h ${mins}m` : `~${hours}h`;
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
  savedTours,
  onSaveTour,
  onLoadSavedTour,
  onDeleteSavedTour,
  onRenameSavedTour,
  allListings,
}: TourPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showSavedTours, setShowSavedTours] = useState(false);
  const [saveTourName, setSaveTourName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [editingTourId, setEditingTourId] = useState<string | null>(null);
  const [editingTourName, setEditingTourName] = useState("");

  // Calculate total distance between all stops
  const tourStats = useMemo(() => {
    const listingsWithCoords = tourListings.filter(
      (l) => l.location.lat != null && l.location.lng != null
    );
    
    if (listingsWithCoords.length < 2) {
      return { totalDistance: 0, estimatedTime: null };
    }
    
    let totalDistance = 0;
    for (let i = 0; i < listingsWithCoords.length - 1; i++) {
      const from = listingsWithCoords[i];
      const to = listingsWithCoords[i + 1];
      totalDistance += calculateDistance(
        from.location.lat!,
        from.location.lng!,
        to.location.lat!,
        to.location.lng!
      );
    }
    
    return {
      totalDistance: Math.round(totalDistance * 10) / 10,
      estimatedTime: estimateDrivingTime(totalDistance, listingsWithCoords.length),
    };
  }, [tourListings]);

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

  const handleSaveTour = () => {
    if (!saveTourName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your tour.",
        variant: "destructive",
      });
      return;
    }
    
    const success = onSaveTour(saveTourName);
    if (success) {
      toast({
        title: "Tour saved!",
        description: `"${saveTourName}" has been saved.`,
      });
      setSaveTourName("");
      setShowSaveInput(false);
    }
  };

  const handleLoadTour = (tourId: string) => {
    const success = onLoadSavedTour(tourId, allListings);
    if (success) {
      const tour = savedTours.find((t) => t.id === tourId);
      toast({
        title: "Tour loaded!",
        description: `"${tour?.name}" has been loaded.`,
      });
      setShowSavedTours(false);
    } else {
      toast({
        title: "Error loading tour",
        description: "Some displays may no longer exist.",
        variant: "destructive",
      });
    }
  };

  const handleStartRename = (tour: SavedTour) => {
    setEditingTourId(tour.id);
    setEditingTourName(tour.name);
  };

  const handleFinishRename = () => {
    if (editingTourId && editingTourName.trim()) {
      onRenameSavedTour(editingTourId, editingTourName);
      toast({
        title: "Tour renamed",
        description: `Tour renamed to "${editingTourName.trim()}"`,
      });
    }
    setEditingTourId(null);
    setEditingTourName("");
  };

  const SavedToursView = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Saved Tours</h4>
        <Button variant="ghost" size="sm" onClick={() => setShowSavedTours(false)}>
          Back
        </Button>
      </div>

      {savedTours.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-3" />
          <h4 className="font-medium mb-1">No saved tours</h4>
          <p className="text-sm text-muted-foreground">
            Save your current tour to access it later
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="space-y-2 pb-4">
            {savedTours.map((tour) => (
              <div
                key={tour.id}
                className="p-3 rounded-lg bg-muted/50 border border-border"
              >
                {editingTourId === tour.id ? (
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      value={editingTourName}
                      onChange={(e) => setEditingTourName(e.target.value)}
                      className="h-8"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleFinishRename();
                        if (e.key === "Escape") {
                          setEditingTourId(null);
                          setEditingTourName("");
                        }
                      }}
                    />
                    <Button size="icon" className="h-8 w-8" onClick={handleFinishRename}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium truncate">{tour.name}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleStartRename(tour)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete tour?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{tour.name}"? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                onDeleteSavedTour(tour.id);
                                toast({
                                  title: "Tour deleted",
                                  description: `"${tour.name}" has been deleted.`,
                                });
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{tour.listingIds.length} stops</span>
                  <span>{new Date(tour.createdAt).toLocaleDateString()}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleLoadTour(tour.id)}
                >
                  Load Tour
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  const TourContent = () => (
    <div className="flex flex-col h-full">
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-sm">
            {tourListings.length} / {maxStops} stops
          </Badge>
          {tourStats.totalDistance > 0 && (
            <>
              <Badge variant="outline" className="text-sm gap-1">
                <MapPin className="h-3 w-3" />
                {tourStats.totalDistance} km
              </Badge>
              {tourStats.estimatedTime && (
                <Badge variant="outline" className="text-sm gap-1">
                  <Clock className="h-3 w-3" />
                  {tourStats.estimatedTime}
                </Badge>
              )}
            </>
          )}
        </div>
        {tourListings.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Saved Tours Button */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setShowSavedTours(true)}
        >
          <FolderOpen className="h-4 w-4 mr-1" />
          Saved Tours ({savedTours.length})
        </Button>
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
          {/* Save Tour Input */}
          {showSaveInput ? (
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter tour name..."
                value={saveTourName}
                onChange={(e) => setSaveTourName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTour();
                  if (e.key === "Escape") {
                    setShowSaveInput(false);
                    setSaveTourName("");
                  }
                }}
                autoFocus
              />
              <Button size="icon" onClick={handleSaveTour}>
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setShowSaveInput(false);
                  setSaveTourName("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="mb-4"
              onClick={() => setShowSaveInput(true)}
            >
              <Save className="h-4 w-4 mr-1" />
              Save This Tour
            </Button>
          )}

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
                    <span className="text-xs font-bold text-primary w-5 text-center bg-primary/10 rounded">
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
          {showSavedTours ? <SavedToursView /> : <TourContent />}
        </div>
      </SheetContent>
    </Sheet>
  );
}