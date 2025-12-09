import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/ListingCard";
import { ArrowRight, Sparkles } from "lucide-react";
import { useListings } from "@/hooks/use-listings";
import { transformDbListing } from "@/data/mockListings";

export function FeaturedListings() {
  const { data: listings = [], isLoading } = useListings();
  
  // Get up to 3 most popular listings (sorted by popularity score)
  const featuredListings = [...listings]
    .sort((a, b) => {
      const scoreA = (a.directions_clicks || 0) + (a.favorites_count || 0) * 2;
      const scoreB = (b.directions_clicks || 0) + (b.favorites_count || 0) * 2;
      return scoreB - scoreA;
    })
    .slice(0, 3)
    .map((listing) => transformDbListing(listing as any));

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-night">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading displays...</div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredListings.length === 0) {
    return (
      <section className="py-20 bg-gradient-night">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <Sparkles className="h-12 w-12 text-primary mx-auto" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Be the First to Share!
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No Christmas light displays have been listed yet. Be the first to share your festive creation with South Africa!
            </p>
            <Link to="/create">
              <Button size="lg" className="mt-4">
                List Your Display
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-night">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Featured
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Most Popular Displays
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Discover the most stunning light displays that have captured hearts across South Africa.
            </p>
          </div>
          
          <Link to="/browse">
            <Button variant="outline" size="lg">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}
