import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF, CircleF } from "@react-google-maps/api";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockListings, provinces, transformDbListing, Listing } from "@/data/mockListings";
import { MapPin, LayoutGrid, List, ExternalLink, Search, Loader2, Navigation, Crosshair, X, Tags, Star, Flag } from "lucide-react";
import { usePopularity } from "@/hooks/use-popularity";
import { useGoogleMapsKey } from "@/hooks/use-google-maps-key";
import { useListings } from "@/hooks/use-listings";
import { useReviewStats } from "@/hooks/use-reviews";
import { calculateDistance } from "@/lib/geo-utils";
import { toast } from "@/hooks/use-toast";
import { TagFilter } from "@/components/TagFilter";
import { ReportListingDialog } from "@/components/ReportListingDialog";
import defaultCoverPhoto from "@/assets/default-cover-photo.png";

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Center on Benoni, Gauteng
const defaultCenter = {
  lat: -26.1881,
  lng: 28.3208,
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

const RADIUS_OPTIONS = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 20, label: "20 km" },
  { value: 50, label: "50 km" },
];

// Inner component that only renders after API key is loaded
function MapViewContent({ apiKey }: { apiKey: string }) {
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [suburbSearch, setSuburbSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [hoveredListing, setHoveredListing] = useState<string | null>(null);
  const [searchMarker, setSearchMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const mapRef = useRef<google.maps.Map | null>(null);
  const listingRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const addressInputRef = useRef<HTMLInputElement>(null);
  const suburbInputRef = useRef<HTMLInputElement>(null);
  const addressAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const suburbAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { trackDirectionsClick } = usePopularity();
  const { data: dbListings } = useListings();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  // Combine database listings with mock listings
  const allListings: Listing[] = useMemo(() => {
    const transformed = (dbListings || []).map(transformDbListing);
    return transformed.length > 0 ? transformed : mockListings;
  }, [dbListings]);

  // Fetch review stats for all listings
  const listingIds = useMemo(() => allListings.map(l => l.id), [allListings]);
  const { data: reviewStats } = useReviewStats(listingIds);

  // Calculate distance for each listing
  const getListingDistance = (listing: Listing): number | null => {
    if (!userLocation || !listing.location.lat || !listing.location.lng) {
      return null;
    }
    return calculateDistance(
      userLocation.lat,
      userLocation.lng,
      listing.location.lat,
      listing.location.lng
    );
  };

  const filteredListings = useMemo(() => {
    return allListings.filter(listing => {
      const provinceMatch = selectedProvince === 'all' || listing.location.province === selectedProvince;
      const suburbMatch = !suburbSearch || listing.location.suburb.toLowerCase().includes(suburbSearch.toLowerCase()) || listing.location.city.toLowerCase().includes(suburbSearch.toLowerCase());
      
      // Distance filter
      if (userLocation && radiusFilter) {
        const distance = getListingDistance(listing);
        if (distance === null || distance > radiusFilter) return false;
      }

      // Tags filter - listing must have ALL selected tags
      if (selectedTags.length > 0) {
        const listingTags = listing.tags || [];
        const hasAllTags = selectedTags.every((tag) => listingTags.includes(tag));
        if (!hasAllTags) return false;
      }
      
      return provinceMatch && suburbMatch;
    });
  }, [selectedProvince, suburbSearch, allListings, userLocation, radiusFilter, selectedTags]);

  const selected = allListings.find(l => l.id === selectedListing);

  const getDirectionsUrl = (listing: Listing) => {
    const address = `${listing.location.streetNumber} ${listing.location.streetName}, ${listing.location.suburb}, ${listing.location.city}, ${listing.location.province}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  const clearFilters = () => {
    setSelectedProvince('all');
    setSuburbSearch('');
    setSearchMarker(null);
    setUserLocation(null);
    setRadiusFilter(null);
    setSelectedTags([]);
    if (addressInputRef.current) addressInputRef.current.value = '';
    if (suburbInputRef.current) suburbInputRef.current.value = '';
  };

  const hasActiveFilters = selectedProvince !== 'all' || suburbSearch || searchMarker || userLocation || selectedTags.length > 0;

  // Handle getting user's current location
  const handleGetLocation = () => {
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

        setUserLocation({ lat: latitude, lng: longitude, label });
        setMapCenter({ lat: latitude, lng: longitude });
        mapRef.current?.panTo({ lat: latitude, lng: longitude });
        
        // Auto-set radius to 10km if not already set
        if (!radiusFilter) {
          setRadiusFilter(10);
          mapRef.current?.setZoom(12);
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
        }
        toast({
          title: "Location error",
          description: message,
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const clearProximityFilter = () => {
    setUserLocation(null);
    setRadiusFilter(null);
  };

  // Initialize address autocomplete
  useEffect(() => {
    if (!isLoaded || !addressInputRef.current || addressAutocompleteRef.current) return;

    addressAutocompleteRef.current = new google.maps.places.Autocomplete(addressInputRef.current, {
      componentRestrictions: { country: "za" },
      types: ["address"],
      fields: ["geometry", "formatted_address"],
    });

    addressAutocompleteRef.current.addListener("place_changed", () => {
      const place = addressAutocompleteRef.current?.getPlace();
      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setSearchMarker({ lat, lng });
        setMapCenter({ lat, lng });
        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(15);
      }
    });
  }, [isLoaded]);

  // Initialize suburb autocomplete with province restriction
  useEffect(() => {
    if (!isLoaded || !suburbInputRef.current) return;

    // Clear previous autocomplete
    if (suburbAutocompleteRef.current) {
      google.maps.event.clearInstanceListeners(suburbAutocompleteRef.current);
    }

    suburbAutocompleteRef.current = new google.maps.places.Autocomplete(suburbInputRef.current, {
      componentRestrictions: { country: "za" },
      types: ["(regions)"],
      fields: ["geometry", "address_components", "name"],
    });

    suburbAutocompleteRef.current.addListener("place_changed", () => {
      const place = suburbAutocompleteRef.current?.getPlace();
      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setSearchMarker({ lat, lng });
        setMapCenter({ lat, lng });
        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(13);

        // Extract suburb/locality name for filtering
        const suburbComponent = place.address_components?.find(
          c => c.types.includes("sublocality") || c.types.includes("locality") || c.types.includes("neighborhood")
        );
        if (suburbComponent) {
          setSuburbSearch(suburbComponent.long_name);
        } else if (place.name) {
          setSuburbSearch(place.name);
        }
      }
    });
  }, [isLoaded, selectedProvince]);

  // Handle draggable marker position change
  const handleSearchMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSearchMarker({ lat, lng });
    }
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Fit bounds to show all filtered listings
  useEffect(() => {
    if (!mapRef.current || filteredListings.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    filteredListings.forEach((listing) => {
      if (listing.location.lat && listing.location.lng) {
        bounds.extend({ lat: listing.location.lat, lng: listing.location.lng });
      }
    });

    // Only fit bounds if we have valid coordinates
    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      
      // Limit max zoom when fitting bounds
      const listener = google.maps.event.addListener(mapRef.current, "idle", () => {
        const zoom = mapRef.current?.getZoom();
        if (zoom && zoom > 15) {
          mapRef.current?.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [filteredListings, isLoaded]);

  // Pan to selected listing
  const handleListingClick = (listingId: string) => {
    setSelectedListing(listingId);
    const listing = allListings.find(l => l.id === listingId);
    if (listing && mapRef.current && listing.location.lat && listing.location.lng) {
      mapRef.current.panTo({ lat: listing.location.lat, lng: listing.location.lng });
      mapRef.current.setZoom(14);
    }
  };

  // Scroll to listing in sidebar when marker is clicked
  const handleMarkerClick = (listingId: string) => {
    setSelectedListing(listingId);
    const listingElement = listingRefs.current[listingId];
    if (listingElement) {
      listingElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Show loading state while loading Google Maps
  if (!isLoaded && !loadError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <Loader2 className="h-12 w-12 text-christmas mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show error state if Google Maps failed to load
  if (loadError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 h-screen flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <MapPin className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Map</h2>
            <p className="text-muted-foreground mb-4">
              Google Maps couldn't be loaded. This may be due to network issues or API configuration.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              You can still browse all Christmas light displays using the grid view.
            </p>
            <Link to="/browse">
              <Button className="bg-christmas hover:bg-christmas/90">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Browse Displays
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 h-screen flex flex-col">
        {/* Top Bar with Filters */}
        <div className="bg-card border-b border-border p-4">
          <div className="container mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="font-display text-xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-christmas" />
                Map View
              </h1>
              
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
                <Link to="/browse">
                  <Button variant="outline" size="sm">
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    Grid View
                  </Button>
                </Link>
              </div>
            </div>

            {/* Location Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Select 
                value={selectedProvince} 
                onValueChange={setSelectedProvince}
              >
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="All Provinces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={addressInputRef}
                  placeholder="Search address..."
                  className="bg-secondary pl-9"
                />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={suburbInputRef}
                  placeholder={selectedProvince !== 'all' ? `Search suburb in ${selectedProvince}...` : "Search suburb..."}
                  className="bg-secondary pl-9"
                />
              </div>

              {/* Proximity Filter */}
              {!userLocation ? (
                <Button
                  variant="outline"
                  className="bg-secondary"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Locating...
                    </>
                  ) : (
                    <>
                      <Crosshair className="h-4 w-4 mr-2" />
                      My location
                    </>
                  )}
                </Button>
              ) : (
                <Select
                  value={radiusFilter?.toString() || ""}
                  onValueChange={(value) => setRadiusFilter(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="bg-christmas/10 border-christmas/30">
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent>
                    {RADIUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        Within {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Location indicator or results count */}
              {userLocation ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-christmas/10 border border-christmas/30 rounded-md">
                  <Navigation className="h-4 w-4 text-christmas flex-shrink-0" />
                  <span className="text-sm truncate">{userLocation.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0.5 ml-auto"
                    onClick={clearProximityFilter}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">
                    {filteredListings.length} display{filteredListings.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              )}
            </div>

            {/* Tag Filter Row */}
            <div className="pt-2">
              <TagFilter
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Map Area */}
          <div className="flex-1 relative bg-secondary min-h-[300px] lg:min-h-0">
            {loadError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <MapPin className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <p className="text-destructive">Error loading maps</p>
                </div>
              </div>
            )}

            {!isLoaded && !loadError && apiKey && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <Loader2 className="h-12 w-12 text-christmas mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}

            {isLoaded && !loadError && apiKey && (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={11}
                options={mapOptions}
                onLoad={onMapLoad}
              >
                {/* User location marker and radius circle */}
                {userLocation && (
                  <>
                    <MarkerF
                      position={{ lat: userLocation.lat, lng: userLocation.lng }}
                      icon={{
                        url: "data:image/svg+xml," + encodeURIComponent(`
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
                            <circle cx="20" cy="20" r="18" fill="#3b82f6" fill-opacity="0.3" stroke="#3b82f6" stroke-width="3"/>
                            <circle cx="20" cy="20" r="8" fill="#3b82f6"/>
                            <circle cx="20" cy="20" r="4" fill="#fff"/>
                          </svg>
                        `),
                        scaledSize: new google.maps.Size(40, 40),
                        anchor: new google.maps.Point(20, 20),
                      }}
                      title="Your location"
                    />
                    {radiusFilter && (
                      <CircleF
                        center={{ lat: userLocation.lat, lng: userLocation.lng }}
                        radius={radiusFilter * 1000} // Convert km to meters
                        options={{
                          fillColor: "#3b82f6",
                          fillOpacity: 0.1,
                          strokeColor: "#3b82f6",
                          strokeOpacity: 0.5,
                          strokeWeight: 2,
                        }}
                      />
                    )}
                  </>
                )}

                {/* Draggable search marker */}
                {searchMarker && (
                  <MarkerF
                    position={searchMarker}
                    draggable={true}
                    onDragEnd={handleSearchMarkerDragEnd}
                    icon={{
                      url: "data:image/svg+xml," + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
                          <path d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30s20-15 20-30C40 9 31 0 20 0z" fill="#3b82f6" stroke="#fff" stroke-width="2"/>
                          <circle cx="20" cy="18" r="8" fill="#fff"/>
                          <circle cx="20" cy="18" r="4" fill="#3b82f6"/>
                        </svg>
                      `),
                      scaledSize: new google.maps.Size(40, 50),
                      anchor: new google.maps.Point(20, 50),
                    }}
                    title="Drag to search a different location"
                  />
                )}
                {/* Markers for all filtered listings */}
                {filteredListings.map((listing) => (
                    listing.location.lat && listing.location.lng && (
                      <MarkerF
                        key={listing.id}
                        position={{ lat: listing.location.lat, lng: listing.location.lng }}
                        onClick={() => handleMarkerClick(listing.id)}
                        icon={{
                          url: "data:image/svg+xml," + encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
                              <!-- Tree trunk -->
                              <rect x="17" y="40" width="6" height="8" fill="#8B4513"/>
                              <!-- Tree layers -->
                              <polygon points="20,2 32,18 26,18 35,32 28,32 38,45 2,45 12,32 5,32 14,18 8,18" fill="#166534" stroke="#0f5132" stroke-width="1"/>
                              <!-- Decorative lights -->
                              <circle cx="12" cy="38" r="2.5" fill="#ef4444">
                                <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
                              </circle>
                              <circle cx="28" cy="38" r="2.5" fill="#fbbf24">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite"/>
                              </circle>
                              <circle cx="8" cy="30" r="2.5" fill="#3b82f6">
                                <animate attributeName="opacity" values="1;0.5;1" dur="0.8s" repeatCount="indefinite"/>
                              </circle>
                              <circle cx="32" cy="30" r="2.5" fill="#ef4444">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="0.8s" repeatCount="indefinite"/>
                              </circle>
                              <circle cx="11" cy="22" r="2.5" fill="#22c55e">
                                <animate attributeName="opacity" values="1;0.5;1" dur="1.2s" repeatCount="indefinite"/>
                              </circle>
                              <circle cx="29" cy="22" r="2.5" fill="#fbbf24">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite"/>
                              </circle>
                              <circle cx="15" cy="14" r="2.5" fill="#3b82f6">
                                <animate attributeName="opacity" values="1;0.5;1" dur="0.9s" repeatCount="indefinite"/>
                              </circle>
                              <circle cx="25" cy="14" r="2.5" fill="#ef4444">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="0.9s" repeatCount="indefinite"/>
                              </circle>
                              <circle cx="20" cy="8" r="2" fill="#fbbf24">
                                <animate attributeName="opacity" values="1;0.5;1" dur="1.1s" repeatCount="indefinite"/>
                              </circle>
                              <!-- Star on top -->
                              <polygon points="20,0 21,4 25,4 22,6 23,10 20,8 17,10 18,6 15,4 19,4" fill="#fbbf24"/>
                            </svg>
                          `),
                          scaledSize: selectedListing === listing.id || hoveredListing === listing.id
                            ? new google.maps.Size(48, 60)
                            : new google.maps.Size(40, 50),
                          anchor: selectedListing === listing.id || hoveredListing === listing.id
                            ? new google.maps.Point(24, 60)
                            : new google.maps.Point(20, 50),
                        }}
                        animation={selectedListing === listing.id ? google.maps.Animation.BOUNCE : undefined}
                      />
                    )
                  ))}

                {/* Info Window for selected listing */}
                {selected && selected.location.lat && selected.location.lng && (
                  <InfoWindowF
                    position={{ lat: selected.location.lat, lng: selected.location.lng }}
                    onCloseClick={() => setSelectedListing(null)}
                    options={{ pixelOffset: new google.maps.Size(0, -35) }}
                  >
                    <div className="p-2 max-w-[200px]">
                      <img 
                        src={selected.photos[0] || defaultCoverPhoto} 
                        alt={selected.title}
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                      <h3 className="font-semibold text-sm text-gray-900">{selected.title}</h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {selected.location.suburb}, {selected.location.city}
                      </p>
                      <a 
                        href={`/listing/${selected.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View Details →
                      </a>
                    </div>
                  </InfoWindowF>
                )}
              </GoogleMap>
            )}
          </div>

          {/* Sidebar List */}
          <div className="w-full lg:w-96 bg-card border-t lg:border-t-0 lg:border-l border-border overflow-y-auto max-h-[40vh] sm:max-h-[50vh] lg:max-h-none">
            <div className="p-4 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold">
                  <List className="h-4 w-4 inline mr-2" />
                  {userLocation ? "Displays Near You" : "Nearby Displays"}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {filteredListings.length} found
                </span>
              </div>
            </div>

            <div className="divide-y divide-border">
              {filteredListings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No displays found in this area</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                filteredListings.map((listing) => {
                  const distance = getListingDistance(listing);
                  const stats = reviewStats?.[listing.id];
                  const formatDistance = (km: number) => {
                    if (km < 1) return `${Math.round(km * 1000)} m`;
                    return `${km.toFixed(1)} km`;
                  };
                  
                  return (
                    <div
                      key={listing.id}
                      ref={(el) => (listingRefs.current[listing.id] = el)}
                      className={`p-4 cursor-pointer transition-colors hover:bg-secondary/50 ${
                        selectedListing === listing.id ? "bg-christmas/10 border-l-2 border-christmas" : ""
                      }`}
                      onClick={() => handleListingClick(listing.id)}
                      onMouseEnter={() => setHoveredListing(listing.id)}
                      onMouseLeave={() => setHoveredListing(null)}
                    >
                      <div className="flex gap-2 sm:gap-3">
                        <img
                          src={listing.photos[0] || defaultCoverPhoto}
                          alt={listing.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
                            {stats && stats.review_count > 0 && (
                              <div className="flex items-center gap-0.5 shrink-0">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium">{stats.average_rating}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {listing.location.suburb}, {listing.location.city}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {listing.location.province}
                            </Badge>
                            {distance !== null && (
                              <Badge variant="outline" className="text-xs">
                                <Navigation className="h-2.5 w-2.5 mr-1" />
                                {formatDistance(distance)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <a
                              href={getDirectionsUrl(listing)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                                trackDirectionsClick(listing.id);
                              }}
                              className="inline-flex items-center text-xs text-christmas hover:underline"
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Get Directions
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                            <div onClick={(e) => e.stopPropagation()}>
                              <ReportListingDialog
                                listingId={listing.id}
                                listingTitle={listing.title}
                                trigger={
                                  <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                                    <Flag className="h-3 w-3" />
                                    Report
                                  </button>
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Wrapper component that fetches API key first
export default function MapView() {
  const { apiKey, isLoading: isLoadingKey, error: keyError } = useGoogleMapsKey();

  // Show loading state while fetching API key
  if (isLoadingKey) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <Loader2 className="h-12 w-12 text-christmas mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show error state if API key failed to load
  if (keyError || !apiKey) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 h-screen flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <MapPin className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Map</h2>
            <p className="text-muted-foreground mb-4">
              {keyError || "Map configuration not available. Please try again later."}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              You can still browse all Christmas light displays using the grid view.
            </p>
            <Link to="/browse">
              <Button className="bg-christmas hover:bg-christmas/90">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Browse Displays
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Only render the map content after API key is available
  return <MapViewContent apiKey={apiKey} />;
}
