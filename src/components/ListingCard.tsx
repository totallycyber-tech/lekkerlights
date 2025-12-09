import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Heart, ExternalLink } from "lucide-react";
import { Listing } from "@/data/mockListings";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const getDirectionsUrl = () => {
    const address = `${listing.location.streetNumber} ${listing.location.streetName}, ${listing.location.suburb}, ${listing.location.city}, ${listing.location.province}, ${listing.location.postalCode}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  return (
    <Link 
      to={`/listing/${listing.id}`}
      className={cn(
        "group block bg-card rounded-xl overflow-hidden border border-border",
        "transition-all duration-300 hover:border-christmas/50 card-glow",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={listing.photos[0]} 
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        {/* Theme Badge */}
        <Badge 
          variant="christmas"
          className="absolute top-3 left-3"
        >
          🎄 Christmas
        </Badge>

        {/* Featured Badge */}
        {listing.featured && (
          <Badge 
            variant="default"
            className="absolute top-3 right-3 bg-primary/90"
          >
            ⭐ Featured
          </Badge>
        )}

        {/* Favorite Button */}
        <button 
          className="absolute bottom-3 right-3 p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Add to favorites
          }}
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-display font-semibold text-lg group-hover:text-christmas transition-colors line-clamp-1">
          {listing.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {listing.description}
        </p>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-christmas shrink-0 mt-0.5" />
          <span className="text-muted-foreground">
            {listing.location.suburb}, {listing.location.city}
          </span>
        </div>

        {/* Operating Hours */}
        <div className="flex items-start gap-2 text-sm">
          <Clock className="h-4 w-4 text-christmas shrink-0 mt-0.5" />
          <span className="text-muted-foreground">
            {listing.operatingHours.days} • {listing.operatingHours.times}
          </span>
        </div>

        {/* Get Directions */}
        <a
          href={getDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-sm text-christmas hover:text-christmas/80 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Get Directions
        </a>
      </div>
    </Link>
  );
}
