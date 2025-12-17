import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SearchFilters, SearchFilters as SearchFiltersType } from "@/components/SearchFilters";
import { SuburbChips } from "@/components/SuburbChips";
import { ListingCard } from "@/components/ListingCard";
import { ListingsMap } from "@/components/ListingsMap";
import { MapListingDetail } from "@/components/MapListingDetail";
import { TourPanel } from "@/components/TourPanel";
import { Button } from "@/components/ui/button";
import { mockListings, transformDbListing, Listing } from "@/data/mockListings";
import { Sparkles, Heart, Loader2, LayoutGrid, Map, RefreshCw, MousePointerClick } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { usePopularity } from "@/hooks/use-popularity";
import { useListings } from "@/hooks/use-listings";
import { useReviewStats } from "@/hooks/use-reviews";
import { useTour } from "@/hooks/use-tour";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export default function Browse() {
  const [filters, setFilters] = useState<SearchFiltersType>({
    search: "",
    province: "",
    suburb: "",
    address: "",
    tags: [],
  });
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">(() => {
    const saved = localStorage.getItem("lekker-lights-view-mode");
    return (saved === "map" || saved === "grid") ? saved : "grid";
  });
  const [mapKey, setMapKey] = useState(0);
  const [selectedMapListing, setSelectedMapListing] = useState<Listing | null>(null);
  const { favorites, toggleFavorite, isFavorite, favoritesCount } = useFavorites();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  
  // Tour functionality
  const {
    tourListings,
    tourCount,
    maxStops,
    isFull: tourIsFull,
    addToTour,
    removeFromTour,
    clearTour,
    isInTour,
    reorderTour,
    optimizeRoute,
    generateGoogleMapsUrl,
    generateShareUrl,
    loadTourFromIds,
  } = useTour();

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

      // Search filter - handle null values
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const title = listing.title?.toLowerCase() || '';
        const description = listing.description?.toLowerCase() || '';
        const streetName = listing.location.streetName.toLowerCase();
        const streetNumber = listing.location.streetNumber.toLowerCase();
        const fullAddress = `${streetNumber} ${streetName}`;
        
        const matchesSearch = 
          title.includes(searchLower) ||
          description.includes(searchLower) ||
          listing.location.suburb.toLowerCase().includes(searchLower) ||
          listing.location.city.toLowerCase().includes(searchLower) ||
          streetName.includes(searchLower) ||
          fullAddress.includes(searchLower);
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

      // Address filter - search by street number and street name
      if (filters.address) {
        const addressLower = filters.address.toLowerCase().trim();
        const streetName = listing.location.streetName.toLowerCase();
        const streetNumber = listing.location.streetNumber.toLowerCase();
        const fullAddress = `${streetNumber} ${streetName}`;
        
        // Match if the search term is found in the full address, street name, or street number
        const matchesAddress = 
          fullAddress.includes(addressLower) || 
          streetName.includes(addressLower) ||
          streetNumber.includes(addressLower) ||
          addressLower.includes(fullAddress) ||
          addressLower.includes(streetName);
          
        if (!matchesAddress) return false;
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

  // Show toast when search returns no results and reset to all listings
  useEffect(() => {
    if (searchPerformed && filteredListings.length === 0 && !isLoading) {
      const hasActiveFilters = filters.search || filters.province || filters.suburb || filters.address || filters.tags.length > 0;
      if (hasActiveFilters) {
        toast({
          title: "Listing not found",
          description: "No displays match your search criteria. Returning to all listings.",
          variant: "destructive",
        });
        // Reset filters after a short delay so user sees the message
        setTimeout(() => {
          setFilters({ search: "", province: "", suburb: "", address: "", tags: [] });
        }, 2000);
      }
      setSearchPerformed(false);
    }
  }, [filteredListings.length, searchPerformed, isLoading, filters]);

  // Handle filter change and track search
  const handleFilterChange = useCallback((newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setSearchPerformed(true);
  }, []);

  // Load tour from URL params (for shared tour links)
  useEffect(() => {
    const tourIds = searchParams.get("tour");
    if (tourIds && allListings.length > 0) {
      const ids = tourIds.split(",").filter(Boolean);
      if (ids.length > 0) {
        loadTourFromIds(ids, allListings);
        // Switch to map view when loading a shared tour
        setViewMode("map");
      }
    }
  }, [searchParams, allListings, loadTourFromIds]);

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
          <div className="mb-4">
            <SearchFilters 
              onFilterChange={handleFilterChange}
              filters={filters}
              listings={allListings.map(l => ({
                id: l.id,
                street_number: l.location.streetNumber,
                street_name: l.location.streetName,
                suburb: l.location.suburb,
                city: l.location.city,
                province: l.location.province,
                complex_name: l.location.complexName,
                unit_no: l.location.unitNo,
              }))}
            />
          </div>

          {/* Suburb Quick Chips */}
          {!isLoading && (
            <div className="mb-6">
              <SuburbChips
                listings={allListings}
                selectedSuburb={filters.suburb}
                selectedProvince={filters.province}
                onSuburbSelect={(suburb) => handleFilterChange({ ...filters, suburb })}
              />
            </div>
          )}

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
              
              {/* Tour Panel - only shown in map view */}
              {viewMode === "map" && (
                <TourPanel
                  tourListings={tourListings}
                  maxStops={maxStops}
                  onRemove={removeFromTour}
                  onClear={clearTour}
                  onReorder={reorderTour}
                  onOptimize={optimizeRoute}
                  generateGoogleMapsUrl={generateGoogleMapsUrl}
                  generateShareUrl={generateShareUrl}
                />
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
                  isInTour={isInTour(selectedMapListing.id)}
                  tourIsFull={tourIsFull}
                  onAddToTour={() => addToTour(selectedMapListing)}
                  onRemoveFromTour={() => removeFromTour(selectedMapListing.id)}
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
                onClick={() => setFilters({ search: "", province: "", suburb: "", address: "", tags: [] })}
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