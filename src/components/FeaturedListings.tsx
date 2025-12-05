import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/ListingCard";
import { mockListings } from "@/data/mockListings";
import { ArrowRight, Sparkles } from "lucide-react";

export function FeaturedListings() {
  const featuredListings = mockListings.filter(l => l.featured).slice(0, 3);

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
