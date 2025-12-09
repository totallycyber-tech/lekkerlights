import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
import { MapPin, LayoutGrid, List, ExternalLink, Search } from "lucide-react";

export default function MapView() {
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [citySearch, setCitySearch] = useState('');
  const [suburbSearch, setSuburbSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState<string | null>(null);

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
            {/* Placeholder Map */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-christmas/10 flex items-center justify-center festive-glow">
                  <MapPin className="h-12 w-12 text-christmas animate-glow" />
                </div>
                <h2 className="font-display text-xl font-semibold mb-2">
                  Interactive Map Coming Soon
                </h2>
                <p className="text-muted-foreground mb-6">
                  We're working on an interactive map to help you discover Christmas displays near you. 
                  Use the filters above to find displays by location!
                </p>
              </div>
            </div>

            {/* Map Markers (Visual representation) */}
            <div className="absolute inset-0 pointer-events-none">
              {filteredListings.map((listing, index) => {
                const left = 10 + (index * 15) % 80;
                const top = 15 + (index * 20) % 70;
                return (
                  <button
                    key={listing.id}
                    className="absolute pointer-events-auto"
                    style={{ left: `${left}%`, top: `${top}%` }}
                    onClick={() => setSelectedListing(listing.id)}
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      transition-all duration-200 cursor-pointer
                      ${selectedListing === listing.id 
                        ? 'bg-christmas scale-125 shadow-glow' 
                        : 'bg-card border border-border hover:bg-christmas/20'
                      }
                    `}>
                      <span className="text-lg">🎄</span>
                    </div>
                  </button>
                );
              })}
            </div>
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
                    className={`
                      p-4 cursor-pointer transition-colors
                      ${selectedListing === listing.id 
                        ? 'bg-christmas/10 border-l-2 border-l-christmas' 
                        : 'hover:bg-secondary'
                      }
                    `}
                    onClick={() => setSelectedListing(listing.id)}
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
