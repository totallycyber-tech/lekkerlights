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
  tourListingIds?: string[];
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

// Calculate marker size based on number of listings
const getMarkerSize = (listingCount: number): { width: number; height: number } => {
  // Base size for few markers, scales down as count increases
  if (listingCount <= 5) return { width: 40, height: 48 };
  if (listingCount <= 10) return { width: 36, height: 43 };
  if (listingCount <= 20) return { width: 32, height: 38 };
  if (listingCount <= 35) return { width: 28, height: 34 };
  if (listingCount <= 50) return { width: 24, height: 29 };
  return { width: 20, height: 24 }; // Minimum size for many markers
};

// Christmas tree marker SVG - scalable with tour indicator
const createTreeMarker = (isFavorite: boolean, isInTour: boolean, tourNumber: number | null, size: { width: number; height: number }) => {
  const { width, height } = size;
  const scale = width / 40; // Base scale factor from original 40px width
  
  // Scale badge position and size
  const badgeRadius = Math.max(5, 7 * scale);
  const badgeX = width - (width * 0.25);
  const badgeY = 6 * scale;
  
  // Heart badge for favorites (top-left if in tour, top-right otherwise)
  const heartX = isInTour ? (width * 0.25) : badgeX;
  const heartY = badgeY;
  const heartRadius = Math.max(4, 6 * scale);
  
  const heartIcon = isFavorite 
    ? `<circle cx="${heartX}" cy="${heartY}" r="${heartRadius}" fill="#ef4444"/>
       <path d="M${heartX} ${heartY - 3 * scale} L${heartX} ${heartY + 3 * scale} M${heartX - 3 * scale} ${heartY} L${heartX + 3 * scale} ${heartY}" stroke="white" stroke-width="${Math.max(1, 1.5 * scale)}" fill="none"/>`
    : '';
  
  // Tour badge (top-right with number)
  const tourBadge = isInTour && tourNumber !== null
    ? `<circle cx="${badgeX}" cy="${badgeY}" r="${badgeRadius}" fill="#8B5CF6"/>
       <text x="${badgeX}" y="${badgeY + 3 * scale}" text-anchor="middle" font-size="${Math.max(8, 10 * scale)}" font-weight="bold" fill="white">${tourNumber}</text>`
    : '';
  
  // Different tree color for tour items
  const treeColor1 = isInTour ? '#7C3AED' : '#228B22';
  const treeColor2 = isInTour ? '#8B5CF6' : '#2E8B2E';
  
  // Scale ornament sizes
  const ornamentSize = Math.max(1.5, 2.5 * scale);
  const smallOrnamentSize = Math.max(1.2, 2 * scale);
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${width}" height="${height}" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Tree shadow -->
      <ellipse cx="20" cy="44" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
      
      <!-- Tree trunk -->
      <rect x="17" y="36" width="6" height="6" fill="#8B4513"/>
      
      <!-- Tree layers -->
      <polygon points="20,4 32,20 8,20" fill="${treeColor1}"/>
      <polygon points="20,12 34,28 6,28" fill="${treeColor2}"/>
      <polygon points="20,20 36,36 4,36" fill="${treeColor1}"/>
      
      <!-- Star on top -->
      <polygon points="20,2 21.5,6 26,6 22.5,9 24,14 20,11 16,14 17.5,9 14,6 18.5,6" fill="${isInTour ? '#FBBF24' : '#FFD700'}"/>
      
      <!-- Ornaments (simplified if marker is small) -->
      ${scale >= 0.6 ? `
        <circle cx="14" cy="24" r="${ornamentSize}" fill="#ef4444"/>
        <circle cx="26" cy="24" r="${ornamentSize}" fill="#3b82f6"/>
        <circle cx="20" cy="30" r="${ornamentSize}" fill="#eab308"/>
        <circle cx="12" cy="32" r="${smallOrnamentSize}" fill="#22c55e"/>
        <circle cx="28" cy="32" r="${smallOrnamentSize}" fill="#ef4444"/>
        <circle cx="16" cy="18" r="${smallOrnamentSize}" fill="#eab308"/>
        <circle cx="24" cy="18" r="${smallOrnamentSize}" fill="#22c55e"/>
      ` : `
        <circle cx="14" cy="26" r="${ornamentSize}" fill="#ef4444"/>
        <circle cx="26" cy="26" r="${ornamentSize}" fill="#3b82f6"/>
        <circle cx="20" cy="32" r="${ornamentSize}" fill="#eab308"/>
      `}
      
      <!-- Favorite heart badge -->
      ${heartIcon}
      
      <!-- Tour number badge -->
      ${tourBadge}
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
  tourListingIds = [],
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

    // Calculate marker size based on listing count
    const markerSize = getMarkerSize(listingsWithCoords.length);

    // Create new markers
    listingsWithCoords.forEach((listing) => {
      const isFavorite = favorites.includes(listing.id);
      const tourIndex = tourListingIds.indexOf(listing.id);
      const isInTour = tourIndex !== -1;
      const tourNumber = isInTour ? tourIndex + 1 : null;
      
      const marker = new google.maps.Marker({
        position: {
          lat: listing.location.lat!,
          lng: listing.location.lng!,
        },
        map: mapRef.current,
        icon: {
          url: createTreeMarker(isFavorite, isInTour, tourNumber, markerSize),
          scaledSize: new google.maps.Size(markerSize.width, markerSize.height),
          anchor: new google.maps.Point(markerSize.width / 2, markerSize.height),
        },
        animation: google.maps.Animation.DROP,
        zIndex: isInTour ? 1000 + tourIndex : 1, // Tour items appear on top
      });

      marker.addListener("click", () => {
        // Notify parent component about the selection
        onSelectListing?.(listing);
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
  }, [isLoaded, listingsWithCoords, favorites, tourListingIds, onSelectListing]);


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
