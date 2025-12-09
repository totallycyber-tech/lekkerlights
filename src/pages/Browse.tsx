import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchFilters, SearchFilters as SearchFiltersType } from "@/components/SearchFilters";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { mockListings, transformDbListing, Listing } from "@/data/mockListings";
import { Sparkles, Heart, Loader2, MapPin, ExternalLink } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { usePopularity } from "@/hooks/use-popularity";
import { useListings } from "@/hooks/use-listings";
import { useReviewStats } from "@/hooks/use-reviews";
import { calculateDistance } from "@/lib/geo-utils";

// Generate Google Maps URL with all listings using addresses
function generateGoogleMapsUrl(listings: Listing[]): string {
  if (listings.length === 0) {
    return "";
  }

  // For a single listing, use the place search
  if (listings.length === 1) {
    const listing = listings[0];
    const address = [
      listing.location.streetNumber,
      listing.location.streetName,
      listing.location.suburb,
      listing.location.city,
      listing.location.province,
    ]
      .filter(Boolean)
      .join(" ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  // For multiple listings, use directions mode with waypoints (max 10)
  const baseUrl = "https://www.google.com/maps/dir/";
  
  const waypoints = listings.slice(0, 10).map((listing) => {
    const address = [
      listing.location.streetNumber,
      listing.location.streetName,
      listing.location.suburb,
      listing.location.city,
      listing.location.province,
    ]
      .filter(Boolean)
      .join(" ");
    return encodeURIComponent(address);
  });

  return baseUrl + waypoints.join("/");
}

export default function Browse() {
  const [filters, setFilters] = useState<SearchFiltersType>({
    search: "",
    province: "",
    suburb: "",
    tags: [],
    location: null,
    radius: null,
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { favorites, toggleFavorite, isFavorite, favoritesCount } = useFavorites();
  const { isPopular, trackDirectionsClick, refreshFavoritesCount } = usePopularity();
  const { data: dbListings, isLoading, error } = useListings();

  // Refresh popularity counts when favorites change
  useEffect(() => {
    refreshFavoritesCount();
  }, [favorites, refreshFavoritesCount]);

  // Combine database listings with mock listings for display
  const allListings: Listing[] = useMemo(() => {
    const transformed = (dbListings || []).map(transformDbListing);
    // If we have database listings, use them; otherwise fall back to mock
    return transformed.length > 0 ? transformed : mockListings;
  }, [dbListings]);

  // Fetch review stats for all listings
  const listingIds = useMemo(() => allListings.map(l => l.id), [allListings]);
  const { data: reviewStats } = useReviewStats(listingIds);

  // Calculate distance for each listing if user location is available
  const getListingDistance = (listing: Listing): number | null => {
    if (!filters.location || !listing.location.lat || !listing.location.lng) {
      return null;
    }
    return calculateDistance(
      filters.location.lat,
      filters.location.lng,
      listing.location.lat,
      listing.location.lng
    );
  };

  const filteredListings = useMemo(() => {
    return allListings.filter((listing) => {
      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(listing.id)) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          listing.title.toLowerCase().includes(searchLower) ||
          listing.description.toLowerCase().includes(searchLower) ||
          listing.location.suburb.toLowerCase().includes(searchLower) ||
          listing.location.city.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Province filter
      if (filters.province && listing.location.province !== filters.province) {
        return false;
      }

      // Suburb filter
      if (filters.suburb) {
        const suburbLower = filters.suburb.toLowerCase();
        if (!listing.location.suburb.toLowerCase().includes(suburbLower)) {
          return false;
        }
      }

      // Tags filter - listing must have ALL selected tags
      if (filters.tags.length > 0) {
        const listingTags = listing.tags || [];
        const hasAllTags = filters.tags.every((tag) => listingTags.includes(tag));
        if (!hasAllTags) return false;
      }

      // Distance filter - only if location and radius are set
      if (filters.location && filters.radius) {
        const distance = getListingDistance(listing);
        if (distance === null || distance > filters.radius) return false;
      }

      return true;
    });
  }, [filters, showFavoritesOnly, favorites, allListings]);

  // Generate Google Maps URL for filtered listings
  const googleMapsUrl = useMemo(() => {
    return generateGoogleMapsUrl(filteredListings);
  }, [filteredListings]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-christmas" />
              <span className="text-sm font-medium text-christmas uppercase tracking-wider">
                Discover
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold">
                  Browse Christmas Displays
                </h1>
                <p className="text-muted-foreground mt-2">
                  Find stunning Christmas light displays across South Africa
                </p>
              </div>
              
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <SearchFilters onFilterChange={setFilters} />
          </div>

          {/* Results Header */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading displays...
                </span>
              ) : (
                <>
                  Showing {filteredListings.length} display{filteredListings.length !== 1 ? 's' : ''}
                  {showFavoritesOnly && ' (favourites only)'}
                </>
              )}
            </p>
            <Button
              variant={showFavoritesOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favourites {favoritesCount > 0 && `(${favoritesCount})`}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-christmas" />
            </div>
          ) : filteredListings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing}
                    isFavorite={isFavorite(listing.id)}
                    onToggleFavorite={toggleFavorite}
                    isPopular={isPopular(listing.id)}
                    onDirectionsClick={trackDirectionsClick}
                    distance={getListingDistance(listing)}
                    reviewStats={reviewStats?.[listing.id] || null}
                  />
                ))}
              </div>

              {/* Google Maps Link */}
              {googleMapsUrl && (
                <div className="mt-12 flex justify-center">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-3 border-christmas/30 hover:border-christmas hover:bg-christmas/10 transition-all"
                    >
                      <MapPin className="h-5 w-5 text-christmas" />
                      <span>View these on Google Maps</span>
                      <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-display text-xl font-semibold mb-2">
                No displays found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search for something else.
              </p>
              <Button 
                variant="outline"
                onClick={() => setFilters({ search: "", province: "", suburb: "", tags: [], location: null, radius: null })}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
