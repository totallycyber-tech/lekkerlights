/// <reference types="@types/google.maps" />
import { useMemo, useState, useEffect, useRef } from "react";
import { useGoogleMapsKey } from "@/hooks/use-google-maps-key";
import { Listing } from "@/data/mockListings";
import { Loader2 } from "lucide-react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";

interface ReviewStats {
  listing_id: string;
  average_rating: number;
  review_count: number;
}

interface ListingsMapProps {
  listings: Listing[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onDirectionsClick: (id: string) => void;
  reviewStats: Record<string, ReviewStats> | null;
  onSelectListing?: (listing: Listing | null) => void;
  selectedListingId?: string | null;
}

// South Africa center
const defaultCenter = {
  lat: -30.5595,
  lng: 22.9375,
};

const defaultZoom = 5;

// Christmas tree marker SVG - regular
const createTreeMarker = (isFavorite: boolean) => {
  const heartIcon = isFavorite 
    ? `<circle cx="20" cy="8" r="6" fill="#ef4444"/>
       <path d="M20 5 L20 11 M17 8 L23 8" stroke="white" stroke-width="1.5" fill="none"/>`
    : '';
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Tree shadow -->
      <ellipse cx="20" cy="44" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
      
      <!-- Tree trunk -->
      <rect x="17" y="36" width="6" height="6" fill="#8B4513"/>
      
      <!-- Tree layers -->
      <polygon points="20,4 32,20 8,20" fill="#228B22"/>
      <polygon points="20,12 34,28 6,28" fill="#2E8B2E"/>
      <polygon points="20,20 36,36 4,36" fill="#228B22"/>
      
      <!-- Star on top -->
      <polygon points="20,2 21.5,6 26,6 22.5,9 24,14 20,11 16,14 17.5,9 14,6 18.5,6" fill="#FFD700"/>
      
      <!-- Ornaments -->
      <circle cx="14" cy="24" r="2.5" fill="#ef4444"/>
      <circle cx="26" cy="24" r="2.5" fill="#3b82f6"/>
      <circle cx="20" cy="30" r="2.5" fill="#eab308"/>
      <circle cx="12" cy="32" r="2" fill="#22c55e"/>
      <circle cx="28" cy="32" r="2" fill="#ef4444"/>
      <circle cx="16" cy="18" r="2" fill="#eab308"/>
      <circle cx="24" cy="18" r="2" fill="#22c55e"/>
      
      <!-- Favorite heart badge -->
      ${heartIcon}
    </svg>
  `)}`;
};

const mapOptions: google.maps.MapOptions = {
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
};

// Inner component that only renders when Google Maps API is available
function ListingsMapInner({
  apiKey,
  listings,
  favorites,
  onToggleFavorite,
  onDirectionsClick,
  reviewStats,
  onSelectListing,
  selectedListingId,
}: ListingsMapProps & { apiKey: string }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filter listings with valid coordinates
  const listingsWithCoords = useMemo(() => {
    return listings.filter(
      (listing) =>
        listing.location.lat !== undefined &&
        listing.location.lng !== undefined &&
        listing.location.lat !== null &&
        listing.location.lng !== null
    );
  }, [listings]);

  // Load Google Maps using centralized loader
  useEffect(() => {
    if (!apiKey) return;
    
    loadGoogleMaps(apiKey)
      .then(() => setIsLoaded(true))
      .catch((err) => console.error("Failed to load Google Maps:", err));
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapRef.current) return;

    mapRef.current = new google.maps.Map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      ...mapOptions,
    });

    infoWindowRef.current = new google.maps.InfoWindow();
  }, [isLoaded]);

  // Update markers when listings change
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Create new markers
    listingsWithCoords.forEach((listing) => {
      const marker = new google.maps.Marker({
        position: {
          lat: listing.location.lat!,
          lng: listing.location.lng!,
        },
        map: mapRef.current,
        icon: {
          url: createTreeMarker(favorites.includes(listing.id)),
          scaledSize: new google.maps.Size(40, 48),
          anchor: new google.maps.Point(20, 48),
        },
        animation: google.maps.Animation.DROP,
      });

      marker.addListener("click", () => {
        // Notify parent component about the selection
        onSelectListing?.(listing);
        
        // Show simple tooltip with just the title
        if (infoWindowRef.current && mapRef.current) {
          infoWindowRef.current.setContent(`
            <div style="padding: 8px 12px; font-weight: 500; font-size: 14px;">
              ${listing.title}
            </div>
          `);
          infoWindowRef.current.setPosition({
            lat: listing.location.lat!,
            lng: listing.location.lng!,
          });
          infoWindowRef.current.setOptions({
            pixelOffset: new google.maps.Size(0, -48),
          });
          infoWindowRef.current.open(mapRef.current);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (listingsWithCoords.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      listingsWithCoords.forEach((listing) => {
        if (listing.location.lat && listing.location.lng) {
          bounds.extend({
            lat: listing.location.lat,
            lng: listing.location.lng,
          });
        }
      });
      mapRef.current.fitBounds(bounds);
      
      // Don't zoom in too much for single marker
      google.maps.event.addListenerOnce(mapRef.current, 'bounds_changed', () => {
        const zoom = mapRef.current?.getZoom();
        if (zoom && zoom > 15) {
          mapRef.current?.setZoom(15);
        }
      });
    }
  }, [isLoaded, listingsWithCoords, favorites, onSelectListing]);


  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-christmas" />
      </div>
    );
  }

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg overflow-hidden"
    />
  );
}

// Wrapper component that fetches the API key first
export function ListingsMap(props: ListingsMapProps) {
  const { apiKey, isLoading: keyLoading, error: keyError } = useGoogleMapsKey();

  if (keyLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-christmas mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (keyError || !apiKey) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="font-semibold mb-2">Unable to load map</h3>
          <p className="text-sm text-muted-foreground">
            {keyError || "Map configuration not available. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  return <ListingsMapInner {...props} apiKey={apiKey} />;
}
