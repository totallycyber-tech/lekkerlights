import { useMemo, useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { Listing } from "@/data/mockListings";
import { useGoogleMapsKey } from "@/hooks/use-google-maps-key";
import { Loader2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ListingsMapProps {
  listings: Listing[];
}

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "12px",
};

// Custom Christmas tree marker SVG
const createChristmasTreeMarker = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64" width="48" height="64">
      <!-- Tree shadow -->
      <ellipse cx="24" cy="60" rx="10" ry="3" fill="rgba(0,0,0,0.2)"/>
      
      <!-- Tree trunk -->
      <rect x="20" y="48" width="8" height="8" fill="#8B4513"/>
      
      <!-- Tree layers (bottom to top) -->
      <polygon points="24,8 6,48 42,48" fill="#228B22"/>
      <polygon points="24,4 10,36 38,36" fill="#2E8B2E"/>
      <polygon points="24,0 14,24 34,24" fill="#32CD32"/>
      
      <!-- Star on top -->
      <polygon points="24,0 25.5,5 30,5 26.5,8 28,13 24,10 20,13 21.5,8 18,5 22.5,5" fill="#FFD700"/>
      
      <!-- Lights -->
      <circle cx="16" cy="40" r="2.5" fill="#FF0000">
        <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
      </circle>
      <circle cx="32" cy="42" r="2.5" fill="#00FF00">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="32" r="2.5" fill="#0000FF">
        <animate attributeName="opacity" values="1;0.5;1" dur="0.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="28" cy="30" r="2.5" fill="#FFFF00">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.1s" repeatCount="indefinite"/>
      </circle>
      <circle cx="24" cy="20" r="2.5" fill="#FF00FF">
        <animate attributeName="opacity" values="1;0.5;1" dur="0.9s" repeatCount="indefinite"/>
      </circle>
      <circle cx="12" cy="45" r="2" fill="#00FFFF">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="36" cy="38" r="2" fill="#FFA500">
        <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export function ListingsMap({ listings }: ListingsMapProps) {
  const { apiKey, isLoading: isLoadingKey } = useGoogleMapsKey();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || "",
    id: "google-map-script",
  });

  // Filter listings with valid coordinates
  const listingsWithCoords = useMemo(() => {
    return listings.filter((l) => l.location.lat && l.location.lng);
  }, [listings]);

  // Calculate map center based on listings
  const center = useMemo(() => {
    if (listingsWithCoords.length === 0) {
      // Default to South Africa center
      return { lat: -28.4793, lng: 24.6727 };
    }
    const avgLat =
      listingsWithCoords.reduce((sum, l) => sum + (l.location.lat || 0), 0) /
      listingsWithCoords.length;
    const avgLng =
      listingsWithCoords.reduce((sum, l) => sum + (l.location.lng || 0), 0) /
      listingsWithCoords.length;
    return { lat: avgLat, lng: avgLng };
  }, [listingsWithCoords]);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    }),
    []
  );

  const christmasTreeIcon = useMemo(() => createChristmasTreeMarker(), []);

  const handleMarkerClick = useCallback((listing: Listing) => {
    setSelectedListing(listing);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedListing(null);
  }, []);

  if (isLoadingKey) {
    return (
      <div className="w-full h-[400px] bg-secondary rounded-xl flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-christmas" />
      </div>
    );
  }

  if (!apiKey || loadError) {
    return (
      <div className="w-full h-[400px] bg-secondary rounded-xl flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Map unavailable</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] bg-secondary rounded-xl flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-christmas" />
      </div>
    );
  }

  if (listingsWithCoords.length === 0) {
    return (
      <div className="w-full h-[300px] bg-secondary rounded-xl flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No listings with location data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border border-border shadow-lg">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={listingsWithCoords.length === 1 ? 14 : 6}
        options={mapOptions}
      >
        {listingsWithCoords.map((listing) => (
          <Marker
            key={listing.id}
            position={{
              lat: listing.location.lat!,
              lng: listing.location.lng!,
            }}
            icon={{
              url: christmasTreeIcon,
              scaledSize: new google.maps.Size(40, 52),
              anchor: new google.maps.Point(20, 52),
            }}
            onClick={() => handleMarkerClick(listing)}
            title={listing.title}
          />
        ))}

        {selectedListing && (
          <InfoWindow
            position={{
              lat: selectedListing.location.lat!,
              lng: selectedListing.location.lng!,
            }}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="p-2 max-w-[250px]">
              {selectedListing.photos && selectedListing.photos.length > 0 && (
                <img
                  src={selectedListing.photos[0]}
                  alt={selectedListing.title}
                  className="w-full h-24 object-cover rounded-md mb-2"
                />
              )}
              <h3 className="font-semibold text-sm text-gray-900 mb-1">
                {selectedListing.title}
              </h3>
              <p className="text-xs text-gray-600 mb-2">
                {selectedListing.location.suburb}, {selectedListing.location.city}
              </p>
              <Link to={`/listing/${selectedListing.id}`}>
                <Button size="sm" className="w-full text-xs h-7 bg-[#dc2626] hover:bg-[#b91c1c]">
                  View Details
                </Button>
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
