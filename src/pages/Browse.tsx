import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SearchFilters, SearchFilters as SearchFiltersType } from "@/components/SearchFilters";
import { ListingCard } from "@/components/ListingCard";
import { ListingsMap } from "@/components/ListingsMap";
import { MapListingDetail } from "@/components/MapListingDetail";
import { Button } from "@/components/ui/button";
import { mockListings, transformDbListing, Listing } from "@/data/mockListings";
import { Sparkles, Heart, Loader2, LayoutGrid, Map, RefreshCw, MousePointerClick } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { usePopularity } from "@/hooks/use-popularity";
import { useListings } from "@/hooks/use-listings";
import { useReviewStats } from "@/hooks/use-reviews";
import { useQueryClient } from "@tanstack/react-query";

export default function Browse() {
  const [filters, setFilters] = useState<SearchFiltersType>({
    search: "",
    province: "",
    suburb: "",
    tags: [],
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">(() => {
    const saved = localStorage.getItem("lekker-lights-view-mode");
    return (saved === "map" || saved === "grid") ? saved : "grid";
  });
  const [mapKey, setMapKey] = useState(0);
  const [selectedMapListing, setSelectedMapListing] = useState<Listing | null>(null);
  const { favorites, toggleFavorite, isFavorite, favoritesCount } = useFavorites();
  const queryClient = useQueryClient();

  // Refresh map handler
  const handleRefreshMap = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['listings'] });
    setMapKey(prev => prev + 1);
  }, [queryClient]);

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem("lekker-lights-view-mode", viewMode);
  }, [viewMode]);
  const { isPopular, trackDirectionsClick, refreshFavoritesCount } = usePopularity();
  const { data: dbListings, isLoading, error } = useListings();

  // Refresh popularity counts when favorites change
  useEffect(() => {
    refreshFavoritesCount();
  }, [favorites, refreshFavoritesCount]);

  // Combine database listings with mock listings for display
  const allListings: Listing[] = useMemo(() => {
    const transformed = (dbListings || []).map((listing) => transformDbListing(listing as any));
    // If we have database listings, use them; otherwise fall back to mock
    return transformed.length > 0 ? transformed : mockListings;
  }, [dbListings]);

  // Fetch review stats for all listings
  const listingIds = useMemo(() => allListings.map(l => l.id), [allListings]);
  const { data: reviewStats } = useReviewStats(listingIds);

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

      return true;
    });
  }, [filters, showFavoritesOnly, favorites, allListings]);

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

          {/* Community Disclaimer */}
          <div className="mb-6 bg-muted/50 rounded-lg border border-border px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Listings may be submitted by community members who have spotted displays, not necessarily the homeowners themselves. 
              If you are a homeowner and wish to have your property removed, please use the "Report Listing" feature on the listing page.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <SearchFilters onFilterChange={setFilters} />
          </div>

          {/* Results Header */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex rounded-md border border-border overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none border-0 gap-1.5 px-3"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className="rounded-none border-0 gap-1.5 px-3"
                >
                  <Map className="h-4 w-4" />
                  <span className="hidden sm:inline">Map</span>
                </Button>
              </div>
              
              {/* Refresh Map Button - only shown in map view */}
              {viewMode === "map" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshMap}
                  className="gap-1.5"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              )}
              
              {/* Favourites Filter */}
              <Button
                variant={showFavoritesOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="gap-2"
              >
                <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">Favourites</span>
                {favoritesCount > 0 && `(${favoritesCount})`}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-christmas" />
            </div>
          ) : viewMode === "map" ? (
            <div className="space-y-4">
              {/* Map Instructions */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3 border border-border">
                <MousePointerClick className="h-4 w-4 text-christmas shrink-0" />
                <span>Click on any marker to view display details below the map</span>
              </div>
              
              {/* Map */}
              <div className="h-[calc(100vh-400px)] min-h-[350px] rounded-lg overflow-hidden border border-border">
                <ListingsMap
                  key={mapKey}
                  listings={filteredListings}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onDirectionsClick={trackDirectionsClick}
                  reviewStats={reviewStats || null}
                  onSelectListing={setSelectedMapListing}
                  selectedListingId={selectedMapListing?.id}
                />
              </div>
              
              {/* Selected Listing Detail Panel */}
              {selectedMapListing && (
                <MapListingDetail
                  listing={selectedMapListing}
                  isFavorite={isFavorite(selectedMapListing.id)}
                  isPopular={isPopular(selectedMapListing.id)}
                  onToggleFavorite={toggleFavorite}
                  onDirectionsClick={trackDirectionsClick}
                  onClose={() => setSelectedMapListing(null)}
                  reviewStats={reviewStats?.[selectedMapListing.id] || null}
                />
              )}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing}
                  isFavorite={isFavorite(listing.id)}
                  onToggleFavorite={toggleFavorite}
                  isPopular={isPopular(listing.id)}
                  onDirectionsClick={trackDirectionsClick}
                  distance={null}
                  reviewStats={reviewStats?.[listing.id] || null}
                />
              ))}
            </div>
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
                onClick={() => setFilters({ search: "", province: "", suburb: "", tags: [] })}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}