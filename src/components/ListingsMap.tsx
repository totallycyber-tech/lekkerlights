/// <reference types="@types/google.maps" />
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useGoogleMapsKey } from "@/hooks/use-google-maps-key";
import { Listing } from "@/data/mockListings";
import { Loader2 } from "lucide-react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";
import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";

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

// Calculate marker size based on listing count AND zoom level
const getMarkerSize = (listingCount: number, zoomLevel: number): { width: number; height: number } => {
  // Base size from listing count
  let baseWidth: number;
  if (listingCount <= 5) baseWidth = 40;
  else if (listingCount <= 10) baseWidth = 36;
  else if (listingCount <= 20) baseWidth = 32;
  else if (listingCount <= 35) baseWidth = 28;
  else if (listingCount <= 50) baseWidth = 24;
  else baseWidth = 20;

  // Zoom multiplier: larger markers when zoomed in, smaller when zoomed out
  let zoomMultiplier: number;
  if (zoomLevel >= 14) zoomMultiplier = 1.3;
  else if (zoomLevel >= 12) zoomMultiplier = 1.15;
  else if (zoomLevel >= 10) zoomMultiplier = 1.0;
  else if (zoomLevel >= 8) zoomMultiplier = 0.85;
  else if (zoomLevel >= 6) zoomMultiplier = 0.7;
  else zoomMultiplier = 0.55;

  const width = Math.round(baseWidth * zoomMultiplier);
  const height = Math.round(width * 1.2); // Maintain aspect ratio

  // Clamp to min/max sizes
  const clampedWidth = Math.max(16, Math.min(52, width));
  const clampedHeight = Math.max(19, Math.min(62, height));

  return { width: clampedWidth, height: clampedHeight };
};

// Christmas tree marker SVG - scalable
const createTreeMarker = (isFavorite: boolean, size: { width: number; height: number }) => {
  const { width, height } = size;
  const scale = width / 40; // Base scale factor from original 40px width
  
  // Scale heart badge position and size
  const heartRadius = Math.max(4, 6 * scale);
  const heartX = width - (width * 0.5);
  const heartY = 8 * scale;
  
  const heartIcon = isFavorite 
    ? `<circle cx="${heartX}" cy="${heartY}" r="${heartRadius}" fill="#ef4444"/>
       <path d="M${heartX} ${heartY - 3 * scale} L${heartX} ${heartY + 3 * scale} M${heartX - 3 * scale} ${heartY} L${heartX + 3 * scale} ${heartY}" stroke="white" stroke-width="${Math.max(1, 1.5 * scale)}" fill="none"/>`
    : '';
  
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
      <polygon points="20,4 32,20 8,20" fill="#228B22"/>
      <polygon points="20,12 34,28 6,28" fill="#2E8B2E"/>
      <polygon points="20,20 36,36 4,36" fill="#228B22"/>
      
      <!-- Star on top -->
      <polygon points="20,2 21.5,6 26,6 22.5,9 24,14 20,11 16,14 17.5,9 14,6 18.5,6" fill="#FFD700"/>
      
      <!-- Ornaments (simplified if marker is small) -->
      ${scale >= 0.5 ? `
        <circle cx="14" cy="24" r="${ornamentSize}" fill="#ef4444"/>
        <circle cx="26" cy="24" r="${ornamentSize}" fill="#3b82f6"/>
        <circle cx="20" cy="30" r="${ornamentSize}" fill="#eab308"/>
        ${scale >= 0.7 ? `
          <circle cx="12" cy="32" r="${smallOrnamentSize}" fill="#22c55e"/>
          <circle cx="28" cy="32" r="${smallOrnamentSize}" fill="#ef4444"/>
          <circle cx="16" cy="18" r="${smallOrnamentSize}" fill="#eab308"/>
          <circle cx="24" cy="18" r="${smallOrnamentSize}" fill="#22c55e"/>
        ` : ''}
      ` : `
        <circle cx="20" cy="28" r="${ornamentSize}" fill="#ef4444"/>
      `}
      
      <!-- Favorite heart badge -->
      ${heartIcon}
    </svg>
  `)}`;
};

// Custom cluster renderer with Christmas theme
const createClusterRenderer = () => ({
  render: ({ count, position }: { count: number; position: google.maps.LatLng }) => {
    // Size based on count
    const size = Math.min(60, 30 + Math.log2(count) * 8);
    
    const svg = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer glow -->
        <circle cx="20" cy="20" r="19" fill="#228B22" opacity="0.3"/>
        <!-- Main circle -->
        <circle cx="20" cy="20" r="16" fill="#228B22" stroke="#166534" stroke-width="2"/>
        <!-- Inner highlight -->
        <circle cx="20" cy="20" r="12" fill="#2E8B2E"/>
        <!-- Star decoration -->
        <polygon points="20,6 22,14 30,14 24,19 26,27 20,23 14,27 16,19 10,14 18,14" fill="#FFD700" opacity="0.8"/>
      </svg>
    `)}`;

    return new google.maps.Marker({
      position,
      icon: {
        url: svg,
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(size / 2, size / 2),
      },
      label: {
        text: String(count),
        color: "white",
        fontSize: `${Math.max(11, size / 4)}px`,
        fontWeight: "bold",
      },
      zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
    });
  },
});

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
  onSelectListing,
}: ListingsMapProps & { apiKey: string }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const listingsMapRef = useRef<Map<google.maps.Marker, Listing>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(defaultZoom);

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

  // Update marker icons when zoom changes
  const updateMarkerSizes = useCallback((zoom: number) => {
    const markerSize = getMarkerSize(listingsWithCoords.length, zoom);
    
    markersRef.current.forEach((marker) => {
      const listing = listingsMapRef.current.get(marker);
      if (listing) {
        marker.setIcon({
          url: createTreeMarker(favorites.includes(listing.id), markerSize),
          scaledSize: new google.maps.Size(markerSize.width, markerSize.height),
          anchor: new google.maps.Point(markerSize.width / 2, markerSize.height),
        });
      }
    });
  }, [listingsWithCoords.length, favorites]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapRef.current) return;

    mapRef.current = new google.maps.Map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      ...mapOptions,
    });

    // Listen for zoom changes to update marker sizes
    mapRef.current.addListener("zoom_changed", () => {
      const zoom = mapRef.current?.getZoom() || defaultZoom;
      setCurrentZoom(zoom);
    });
  }, [isLoaded]);

  // Update marker sizes when zoom changes
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      updateMarkerSizes(currentZoom);
    }
  }, [currentZoom, isLoaded, updateMarkerSizes]);

  // Update markers when listings change
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Clear existing clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    listingsMapRef.current.clear();

    // Calculate marker size based on listing count and current zoom
    const zoom = mapRef.current.getZoom() || defaultZoom;
    const markerSize = getMarkerSize(listingsWithCoords.length, zoom);

    // Create new markers
    listingsWithCoords.forEach((listing) => {
      const marker = new google.maps.Marker({
        position: {
          lat: listing.location.lat!,
          lng: listing.location.lng!,
        },
        icon: {
          url: createTreeMarker(favorites.includes(listing.id), markerSize),
          scaledSize: new google.maps.Size(markerSize.width, markerSize.height),
          anchor: new google.maps.Point(markerSize.width / 2, markerSize.height),
        },
      });

      marker.addListener("click", () => {
        onSelectListing?.(listing);
      });

      markersRef.current.push(marker);
      listingsMapRef.current.set(marker, listing);
    });

    // Create clusterer with custom renderer
    clustererRef.current = new MarkerClusterer({
      map: mapRef.current,
      markers: markersRef.current,
      algorithm: new SuperClusterAlgorithm({ 
        radius: 80,
        maxZoom: 14,
      }),
      renderer: createClusterRenderer(),
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
        const currentZoom = mapRef.current?.getZoom();
        if (currentZoom && currentZoom > 15) {
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