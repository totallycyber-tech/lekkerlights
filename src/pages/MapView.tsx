import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api";
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
import { mockListings, provinces } from "@/data/mockListings";
import { MapPin, LayoutGrid, List, ExternalLink, Search, Loader2 } from "lucide-react";

const GOOGLE_MAPS_API_KEY = "AIzaSyAH-g4xwt6nXkCVlRC0eSYkM7-Q19_4gAo";

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

export default function MapView() {
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [citySearch, setCitySearch] = useState('');
  const [suburbSearch, setSuburbSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [hoveredListing, setHoveredListing] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const listingRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const filteredListings = useMemo(() => {
    return mockListings.filter(listing => {
      const provinceMatch = selectedProvince === 'all' || listing.location.province === selectedProvince;
      const cityMatch = !citySearch || listing.location.city.toLowerCase().includes(citySearch.toLowerCase());
      const suburbMatch = !suburbSearch || listing.location.suburb.toLowerCase().includes(suburbSearch.toLowerCase());
      return provinceMatch && cityMatch && suburbMatch;
    });
  }, [selectedProvince, citySearch, suburbSearch]);

  const selected = mockListings.find(l => l.id === selectedListing);

  const getDirectionsUrl = (listing: typeof mockListings[0]) => {
    const address = `${listing.location.streetNumber} ${listing.location.streetName}, ${listing.location.suburb}, ${listing.location.city}, ${listing.location.province}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  const clearFilters = () => {
    setSelectedProvince('all');
    setCitySearch('');
    setSuburbSearch('');
  };

  const hasActiveFilters = selectedProvince !== 'all' || citySearch || suburbSearch;

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
    const listing = mockListings.find(l => l.id === listingId);
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search city..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="bg-secondary pl-9"
                />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search suburb..."
                  value={suburbSearch}
                  onChange={(e) => setSuburbSearch(e.target.value)}
                  className="bg-secondary pl-9"
                />
              </div>

              <div className="flex items-center">
                <span className="text-sm text-muted-foreground">
                  {filteredListings.length} display{filteredListings.length !== 1 ? 's' : ''} found
                </span>
              </div>
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

            {!isLoaded && !loadError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <Loader2 className="h-12 w-12 text-christmas mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}

            {isLoaded && !loadError && (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={11}
                options={mapOptions}
                onLoad={onMapLoad}
              >
                {filteredListings.map((listing) => (
                  listing.location.lat && listing.location.lng && (
                    <MarkerF
                      key={listing.id}
                      position={{ lat: listing.location.lat, lng: listing.location.lng }}
                      onClick={() => handleMarkerClick(listing.id)}
                      icon={{
                        url: selectedListing === listing.id || hoveredListing === listing.id
                          ? "data:image/svg+xml," + encodeURIComponent(`
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
                                <circle cx="18" cy="18" r="16" fill="#166534" stroke="#fff" stroke-width="2"/>
                                <polygon points="18,6 22,14 26,14 23,18 25,26 18,22 11,26 13,18 10,14 14,14" fill="#0f5132"/>
                                <circle cx="14" cy="12" r="2" fill="#ef4444"/>
                                <circle cx="22" cy="12" r="2" fill="#fbbf24"/>
                                <circle cx="12" cy="18" r="2" fill="#3b82f6"/>
                                <circle cx="24" cy="18" r="2" fill="#ef4444"/>
                                <circle cx="15" cy="23" r="2" fill="#fbbf24"/>
                                <circle cx="21" cy="23" r="2" fill="#3b82f6"/>
                                <circle cx="18" cy="16" r="2" fill="#22c55e"/>
                              </svg>
                            `)
                          : "data:image/svg+xml," + encodeURIComponent(`
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
                                <circle cx="14" cy="14" r="12" fill="#166534" stroke="#fff" stroke-width="2"/>
                                <circle cx="10" cy="10" r="2" fill="#ef4444"/>
                                <circle cx="18" cy="10" r="2" fill="#fbbf24"/>
                                <circle cx="9" cy="16" r="2" fill="#3b82f6"/>
                                <circle cx="19" cy="16" r="2" fill="#ef4444"/>
                                <circle cx="14" cy="13" r="2" fill="#22c55e"/>
                                <circle cx="14" cy="20" r="2" fill="#fbbf24"/>
                              </svg>
                            `),
                        scaledSize: selectedListing === listing.id || hoveredListing === listing.id
                          ? new google.maps.Size(36, 36)
                          : new google.maps.Size(28, 28),
                        anchor: selectedListing === listing.id || hoveredListing === listing.id
                          ? new google.maps.Point(18, 18)
                          : new google.maps.Point(14, 14),
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
                        src={selected.photos[0]} 
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
          <div className="w-full lg:w-96 bg-card border-t lg:border-t-0 lg:border-l border-border overflow-y-auto max-h-[50vh] lg:max-h-none">
            <div className="p-4 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold">
                  {filteredListings.length} Display{filteredListings.length !== 1 ? 's' : ''}
                </h2>
                <List className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {filteredListings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No displays found matching your filters.</p>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredListings.map((listing) => (
                  <div 
                    key={listing.id}
                    ref={(el) => { listingRefs.current[listing.id] = el; }}
                    className={`
                      p-4 cursor-pointer transition-colors
                      ${selectedListing === listing.id 
                        ? 'bg-christmas/10 border-l-2 border-l-christmas' 
                        : 'hover:bg-secondary'
                      }
                    `}
                    onClick={() => handleListingClick(listing.id)}
                    onMouseEnter={() => setHoveredListing(listing.id)}
                    onMouseLeave={() => setHoveredListing(null)}
                  >
                    <div className="flex gap-3">
                      <img 
                        src={listing.photos[0]} 
                        alt={listing.title}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Badge variant="christmas" className="mb-1 text-xs">
                          🎄 Christmas
                        </Badge>
                        <h3 className="font-medium text-sm truncate">
                          {listing.title}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {listing.location.suburb}, {listing.location.city}
                        </p>
                        <p className="text-xs text-muted-foreground/70 truncate">
                          {listing.location.province}
                        </p>
                      </div>
                    </div>

                    {selectedListing === listing.id && (
                      <div className="mt-3 pt-3 border-t border-border space-y-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {listing.description}
                        </p>
                        <div className="flex gap-2">
                          <Link to={`/listing/${listing.id}`} className="flex-1">
                            <Button variant="default" size="sm" className="w-full">
                              View Details
                            </Button>
                          </Link>
                          <a 
                            href={getDirectionsUrl(listing)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
