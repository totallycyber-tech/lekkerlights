import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Heart, ExternalLink, TrendingUp, Star, Flag, X, Eye, Link2 } from "lucide-react";
import { Listing } from "@/data/mockListings";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ReportListingDialog } from "@/components/ReportListingDialog";
import { AddToTourButton } from "@/components/AddToTourButton";
import { copyShortUrl } from "@/lib/short-url";
import defaultCoverPhoto from "@/assets/default-cover-photo.png";

interface MapListingDetailProps {
  listing: Listing;
  isFavorite: boolean;
  isPopular: boolean;
  onToggleFavorite: (listingId: string) => void;
  onDirectionsClick: (listingId: string) => void;
  onClose: () => void;
  reviewStats?: { average_rating: number; review_count: number } | null;
  isInTour?: boolean;
  tourIsFull?: boolean;
  onAddToTour?: () => void;
  onRemoveFromTour?: () => void;
}

export function MapListingDetail({
  listing,
  isFavorite,
  isPopular,
  onToggleFavorite,
  onDirectionsClick,
  onClose,
  reviewStats,
  isInTour = false,
  tourIsFull = false,
  onAddToTour,
  onRemoveFromTour,
}: MapListingDetailProps) {
  const getDirectionsUrl = () => {
    const address = `${listing.location.streetNumber} ${listing.location.streetName}, ${listing.location.suburb}, ${listing.location.city}, ${listing.location.province}, ${listing.location.postalCode}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  const handleFavoriteClick = () => {
    onToggleFavorite(listing.id);
    toast({
      title: isFavorite ? "Removed from favourites" : "Added to favourites",
      description: isFavorite 
        ? `${listing.title} has been removed from your favourites.`
        : `${listing.title} has been added to your favourites.`,
    });
  };

  const handleCopyLinkClick = () => {
    copyShortUrl(listing.shortCode, listing.title);
  };

  const streetAddress = `${listing.location.streetNumber} ${listing.location.streetName}${listing.location.complexName ? `, ${listing.location.complexName}` : ''}${listing.location.unitNo ? ` Unit ${listing.location.unitNo}` : ''}`;

  return (
    <Card className="border-christmas/30 bg-card/95 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-300">
      <CardContent className="p-4">
        {/* Header with Street Address and Close Button */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MapPin className="h-4 w-4 text-christmas shrink-0" />
            <h2 className="font-semibold text-base truncate" title={streetAddress}>
              {streetAddress}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 shrink-0"
            aria-label="Close listing details"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Image - only show first photo as cover if hasCoverPhoto is true */}
          <div className="relative w-full md:w-48 h-36 md:h-32 shrink-0 rounded-lg overflow-hidden">
            <img 
              src={(listing.hasCoverPhoto && listing.photos[0] && listing.photos[0] !== '') ? listing.photos[0] : defaultCoverPhoto} 
              alt={`Christmas light display: ${listing.title}`}
              className="w-full h-full object-cover"
            />
            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              <Badge variant="christmas" className="text-xs">
                <span aria-hidden="true">🎄</span> Christmas
              </Badge>
              {isPopular && (
                <Badge className="bg-amber-500/90 text-white text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title and Rating */}
            {listing.title && (
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-semibold text-lg line-clamp-1">
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
            )}
            {!listing.title && reviewStats && reviewStats.review_count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{reviewStats.average_rating}</span>
                <span className="text-xs text-muted-foreground">({reviewStats.review_count})</span>
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {listing.description}
              </p>
            )}

            {/* Location and Hours */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-christmas shrink-0" />
                <span className="text-muted-foreground">
                  {listing.location.suburb}, {listing.location.city}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-christmas shrink-0" />
                <span className="text-muted-foreground">
                  {listing.operatingHours.days} • {listing.operatingHours.times}
                </span>
              </div>
            </div>

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {listing.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {listing.tags.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{listing.tags.length - 4} more
                  </Badge>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button asChild size="sm" variant="default">
                <Link to={`/listing/${listing.id}`}>
                  <Eye className="h-4 w-4 mr-1.5" />
                  View Details
                </Link>
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                asChild
                onClick={() => onDirectionsClick(listing.id)}
              >
                <a
                  href={getDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  Get Directions
                </a>
              </Button>

              <Button
                size="sm"
                variant={isFavorite ? "default" : "outline"}
                onClick={handleFavoriteClick}
                className={cn(isFavorite && "bg-christmas hover:bg-christmas/90")}
              >
                <Heart className={cn("h-4 w-4 mr-1.5", isFavorite && "fill-current")} />
                {isFavorite ? "Favourited" : "Favourite"}
              </Button>

              {/* Add to Tour Button */}
              {onAddToTour && onRemoveFromTour && (
                <AddToTourButton
                  isInTour={isInTour}
                  isFull={tourIsFull}
                  onAdd={onAddToTour}
                  onRemove={onRemoveFromTour}
                  listingTitle={listing.title}
                />
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyLinkClick}
                title="Copy Short Link"
              >
                <Link2 className="h-4 w-4 mr-1.5" />
                Copy Link
              </Button>

              <ReportListingDialog
                listingId={listing.id}
                listingTitle={listing.title}
                trigger={
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive">
                    <Flag className="h-4 w-4 mr-1.5" />
                    Report
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
