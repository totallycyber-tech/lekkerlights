import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockListings, themes, Theme } from "@/data/mockListings";
import { MapPin, LayoutGrid, List, ExternalLink } from "lucide-react";

export default function MapView() {
  const [selectedTheme, setSelectedTheme] = useState<Theme | 'all'>('all');
  const [selectedListing, setSelectedListing] = useState<string | null>(null);

  const filteredListings = mockListings.filter(listing => 
    selectedTheme === 'all' || listing.theme === selectedTheme
  );

  const selected = mockListings.find(l => l.id === selectedListing);
  const theme = selected ? themes.find(t => t.value === selected.theme) : null;

  const getDirectionsUrl = (listing: typeof mockListings[0]) => {
    const address = `${listing.location.streetNumber} ${listing.location.streetName}, ${listing.location.suburb}, ${listing.location.city}, ${listing.location.province}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 h-screen flex flex-col">
        {/* Top Bar */}
        <div className="bg-card border-b border-border p-4">
          <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-xl font-bold">Map View</h1>
              <Select 
                value={selectedTheme} 
                onValueChange={(value) => setSelectedTheme(value as Theme | 'all')}
              >
                <SelectTrigger className="w-40 bg-secondary">
                  <SelectValue placeholder="All Themes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Themes</SelectItem>
                  {themes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.emoji} {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Link to="/browse">
                <Button variant="outline" size="sm">
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Grid View
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 flex">
          {/* Map Area */}
          <div className="flex-1 relative bg-secondary">
            {/* Placeholder Map */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold mb-2">
                  Interactive Map Coming Soon
                </h2>
                <p className="text-muted-foreground mb-6">
                  We're working on an interactive map to help you discover displays near you. 
                  In the meantime, browse the list below!
                </p>
              </div>
            </div>

            {/* Map Markers (Visual representation) */}
            <div className="absolute inset-0 pointer-events-none">
              {filteredListings.map((listing, index) => {
                // Generate pseudo-random positions for visual demo
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
                        ? 'bg-primary scale-125 shadow-glow' 
                        : 'bg-card border border-border hover:bg-primary/20'
                      }
                    `}>
                      <span className="text-lg">
                        {themes.find(t => t.value === listing.theme)?.emoji}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar List */}
          <div className="w-full sm:w-96 bg-card border-l border-border overflow-y-auto">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold">
                  {filteredListings.length} Displays
                </h2>
                <List className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="divide-y divide-border">
              {filteredListings.map((listing) => {
                const listingTheme = themes.find(t => t.value === listing.theme);
                return (
                  <div 
                    key={listing.id}
                    className={`
                      p-4 cursor-pointer transition-colors
                      ${selectedListing === listing.id 
                        ? 'bg-primary/10 border-l-2 border-l-primary' 
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
                        <Badge 
                          variant={listing.theme as any} 
                          className="mb-1 text-xs"
                        >
                          {listingTheme?.emoji} {listingTheme?.label}
                        </Badge>
                        <h3 className="font-medium text-sm truncate">
                          {listing.title}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {listing.location.suburb}, {listing.location.city}
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
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
