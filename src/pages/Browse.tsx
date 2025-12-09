import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchFilters } from "@/components/SearchFilters";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { mockListings } from "@/data/mockListings";
import { LayoutGrid, Map, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Browse() {
  const [filters, setFilters] = useState({
    search: "",
    province: "",
    suburb: "",
  });
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const filteredListings = useMemo(() => {
    return mockListings.filter((listing) => {
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

      return true;
    });
  }, [filters]);

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
              
              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Grid
                </Button>
                <Link to="/map">
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    <Map className="h-4 w-4 mr-1" />
                    Map
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <SearchFilters onFilterChange={setFilters} />
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredListings.length} display{filteredListings.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Listings Grid */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
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
                onClick={() => setFilters({ search: "", province: "", suburb: "" })}
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
