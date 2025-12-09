import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Heart, ExternalLink, TrendingUp, Navigation, Star, Share2 } from "lucide-react";
import { Listing } from "@/data/mockListings";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ListingCardProps {
  listing: Listing;
  className?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (listingId: string) => void;
  isPopular?: boolean;
  onDirectionsClick?: (listingId: string) => void;
  distance?: number | null;
  reviewStats?: { average_rating: number; review_count: number } | null;
}

export function ListingCard({ 
  listing, 
  className, 
  isFavorite = false, 
  onToggleFavorite,
  isPopular = false,
  onDirectionsClick,
  distance,
  reviewStats,
}: ListingCardProps) {
  const getDirectionsUrl = () => {
    const address = `${listing.location.streetNumber} ${listing.location.streetName}, ${listing.location.suburb}, ${listing.location.city}, ${listing.location.province}, ${listing.location.postalCode}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(listing.id);
      toast({
        title: isFavorite ? "Removed from favourites" : "Added to favourites",
        description: isFavorite 
          ? `${listing.title} has been removed from your favourites.`
          : `${listing.title} has been added to your favourites.`,
      });
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const listingUrl = `${window.location.origin}/listing/${listing.id}`;
    navigator.clipboard.writeText(listingUrl);
    toast({
      title: "Link copied!",
      description: "Share this display with friends and family.",
    });
  };

  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
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

        {/* Popular Badge */}
        {isPopular && (
          <Badge 
            variant="default"
            className="absolute top-3 right-3 bg-amber-500/90 text-white"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        )}

        {/* Distance Badge - show when location is provided */}
        {distance !== undefined && distance !== null && (
          <Badge 
            variant="secondary"
            className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm"
          >
            <Navigation className="h-3 w-3 mr-1" />
            {formatDistance(distance)}
          </Badge>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button 
            className="p-2 rounded-full backdrop-blur-sm transition-all bg-background/50 hover:bg-background/80"
            onClick={handleShareClick}
            aria-label="Share listing"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button 
            className={cn(
              "p-2 rounded-full backdrop-blur-sm transition-all",
              isFavorite 
                ? "bg-christmas text-white hover:bg-christmas/80" 
                : "bg-background/50 hover:bg-background/80"
            )}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-lg group-hover:text-christmas transition-colors line-clamp-1">
            {listing.title}
          </h3>
          {reviewStats && reviewStats.review_count > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{reviewStats.average_rating}</span>
              <span className="text-xs text-muted-foreground">({reviewStats.review_count})</span>
            </div>
          )}
        </div>
        
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
          onClick={(e) => {
            e.stopPropagation();
            onDirectionsClick?.(listing.id);
          }}
          className="inline-flex items-center gap-1 text-sm text-christmas hover:text-christmas/80 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Get Directions
        </a>
      </div>
    </Link>
  );
}
