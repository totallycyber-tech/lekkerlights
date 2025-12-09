import { useRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { useGoogleMapsKey } from "@/hooks/use-google-maps-key";

interface AddressComponents {
  streetNumber: string;
  streetName: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  onAddressSelect: (components: AddressComponents) => void;
}

export function AddressAutocomplete({ onAddressSelect }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const { apiKey, isLoading: isLoadingKey, error: keyError } = useGoogleMapsKey();

  useEffect(() => {
    if (!apiKey) return;
    
    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, [apiKey]);

  // Initialize map when coordinates are set
  useEffect(() => {
    if (!isLoaded || !coordinates || !mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: coordinates,
        zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
    } else {
      mapRef.current.setCenter(coordinates);
    }

    if (markerRef.current) {
      markerRef.current.setPosition(coordinates);
    } else {
      markerRef.current = new google.maps.Marker({
        position: coordinates,
        map: mapRef.current,
        animation: google.maps.Animation.DROP,
        draggable: true,
      });

      // Update coordinates when marker is dragged
      markerRef.current.addListener("dragend", () => {
        const position = markerRef.current?.getPosition();
        if (position) {
          const newCoords = {
            lat: position.lat(),
            lng: position.lng(),
          };
          setCoordinates(newCoords);
        }
      });
    }
  }, [isLoaded, coordinates]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "za" },
      types: ["address"],
      fields: ["address_components", "formatted_address", "geometry"],
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place?.address_components) return;

      // Get coordinates for map
      if (place.geometry?.location) {
        setCoordinates({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }

      const components: AddressComponents = {
        streetNumber: "",
        streetName: "",
        suburb: "",
        city: "",
        province: "",
        postalCode: "",
      };

      for (const component of place.address_components) {
        const types = component.types;

        if (types.includes("street_number")) {
          components.streetNumber = component.long_name;
        }
        if (types.includes("route")) {
          components.streetName = component.long_name;
        }
        if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
          components.suburb = component.long_name;
        }
        if (types.includes("locality")) {
          components.city = component.long_name;
        }
        if (types.includes("administrative_area_level_1")) {
          components.province = component.long_name;
        }
        if (types.includes("postal_code")) {
          components.postalCode = component.long_name;
        }
      }

      // Fallback for suburb if not found
      if (!components.suburb) {
        const neighborhoodComponent = place.address_components.find(
          (c) => c.types.includes("neighborhood")
        );
        if (neighborhoodComponent) {
          components.suburb = neighborhoodComponent.long_name;
        }
      }

      onAddressSelect(components);
    });
  }, [isLoaded, onAddressSelect]);

  if (isLoadingKey) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading address search...
      </div>
    );
  }

  if (keyError) {
    return (
      <div className="text-sm text-destructive">
        {keyError}. Please contact support.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Start typing your address..."
          className="bg-secondary pl-10"
        />
      </div>
      
      {/* Map Preview */}
      {coordinates && (
        <div 
          ref={mapContainerRef}
          className="w-full h-48 rounded-lg border border-border overflow-hidden"
        />
      )}
    </div>
  );
}
