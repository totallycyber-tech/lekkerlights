import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Crosshair, X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LocationFilterProps {
  location: { lat: number; lng: number; label: string } | null;
  radius: number | null;
  onLocationChange: (location: { lat: number; lng: number; label: string } | null) => void;
  onRadiusChange: (radius: number | null) => void;
}

const RADIUS_OPTIONS = [
  { value: 5, label: "Within 5 km" },
  { value: 10, label: "Within 10 km" },
  { value: 20, label: "Within 20 km" },
  { value: 50, label: "Within 50 km" },
];

export function LocationFilter({
  location,
  radius,
  onLocationChange,
  onRadiusChange,
}: LocationFilterProps) {
  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to get a readable address using reverse geocoding
        let label = "Your location";
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`
          );
          const data = await response.json();
          if (data.address) {
            const { suburb, city, town, village } = data.address;
            label = suburb || city || town || village || "Your location";
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
        }

        onLocationChange({ lat: latitude, lng: longitude, label });
        
        // Auto-set radius to 10km if not already set
        if (!radius) {
          onRadiusChange(10);
        }
        
        setIsLocating(false);
        
        toast({
          title: "Location captured",
          description: `Searching near ${label}`,
        });
      },
      (error) => {
        setIsLocating(false);
        let message = "Unable to get your location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission denied. Please enable location access.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out.";
        }
        toast({
          title: "Location error",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  const clearLocation = () => {
    onLocationChange(null);
    onRadiusChange(null);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Search by Distance</label>
      
      {!location ? (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleGetLocation}
          disabled={isLocating}
        >
          {isLocating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Getting location...
            </>
          ) : (
            <>
              <Crosshair className="h-4 w-4" />
              Use my current location
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-3">
          {/* Location Display */}
          <div className="flex items-center justify-between gap-2 p-3 bg-christmas/10 border border-christmas/30 rounded-lg">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-4 w-4 text-christmas flex-shrink-0" />
              <span className="text-sm font-medium truncate">{location.label}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-muted-foreground hover:text-foreground flex-shrink-0"
              onClick={clearLocation}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Radius Selection */}
          <Select
            value={radius?.toString() || ""}
            onValueChange={(value) => onRadiusChange(value ? parseInt(value) : null)}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select distance" />
            </SelectTrigger>
            <SelectContent>
              {RADIUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
