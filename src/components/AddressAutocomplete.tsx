import { useRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

const GOOGLE_MAPS_API_KEY = "AIzaSyAH-g4xwt6nXkCVlRC0eSYkM7-Q19_4gAo";

interface AddressComponents {
  streetNumber: string;
  streetName: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (components: AddressComponents) => void;
}

export function AddressAutocomplete({ onAddressSelect }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "za" },
      types: ["address"],
      fields: ["address_components", "formatted_address"],
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place?.address_components) return;

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

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder="Start typing your address..."
        className="bg-secondary pl-10"
      />
    </div>
  );
}
