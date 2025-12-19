import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Heart, ExternalLink, TrendingUp, Navigation, Star, Share2, Flag, Camera, Youtube, Play, Route, Check } from "lucide-react";
import { Listing } from "@/data/mockListings";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ReportListingDialog } from "@/components/ReportListingDialog";
import defaultCoverPhoto from "@/assets/default-cover-photo.png";

interface ListingCardProps {
  listing: Listing;
  className?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (listingId: string) => void;
  isPopular?: boolean;
  onDirectionsClick?: (listingId: string) => void;
  distance?: number | null;
  reviewStats?: { average_rating: number; review_count: number } | null;
  isInTour?: boolean;
  tourIsFull?: boolean;
  onAddToTour?: (listing: Listing) => void;
  onRemoveFromTour?: (listingId: string) => void;
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
  isInTour = false,
  tourIsFull = false,
  onAddToTour,
  onRemoveFromTour,
}: ListingCardProps) {
  const navigate = useNavigate();

  const getDirectionsUrl = () => {
    const address = `${listing.location.streetNumber} ${listing.location.streetName}, ${listing.location.suburb}, ${listing.location.city}, ${listing.location.province}, ${listing.location.postalCode}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('[role="dialog"]')) {
      return;
    }
    navigate(`/listing/${listing.id}`);
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

  const handleTourClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInTour) {
      onRemoveFromTour?.(listing.id);
      toast({
        title: "Removed from tour",
        description: `${listing.title || 'Display'} removed from your tour.`,
      });
    } else if (tourIsFull) {
      toast({
        title: "Tour is full",
        description: "Remove a stop to add more (max 10 stops).",
        variant: "destructive",
      });
    } else {
      onAddToTour?.(listing);
      toast({
        title: "Added to tour!",
        description: `${listing.title || 'Display'} added to your tour.`,
      });
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={cn(
        "group block bg-card rounded-xl overflow-hidden border border-border cursor-pointer",
        "transition-all duration-300 hover:border-christmas/50 card-glow",
        className
      )}
    >
      {/* Image - only show first photo as cover if hasCoverPhoto is true */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={(listing.hasCoverPhoto && listing.photos[0] && listing.photos[0] !== '') ? listing.photos[0] : defaultCoverPhoto} 
          alt={`Christmas light display: ${listing.title} in ${listing.location.suburb}, ${listing.location.city}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" aria-hidden="true" />
        
        {/* Theme Badge */}
        <Badge 
          variant="christmas"
          className="absolute top-3 left-3"
        >
          <span aria-hidden="true">🎄</span> Christmas
        </Badge>

        {/* Popular Badge */}
        {isPopular && (
          <Badge 
            variant="default"
            className="absolute top-3 right-3 bg-amber-500/90 text-white"
          >
            <TrendingUp className="h-3 w-3 mr-1" aria-hidden="true" />
            Popular
          </Badge>
        )}

        {/* Photo Count Badge */}
        {(() => {
          const totalPhotos = listing.photos.filter(url => url && url !== '').length;
          if (totalPhotos > 0) {
            return (
              <Badge 
                variant="secondary"
                className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm"
                style={{ right: isPopular ? 'auto' : undefined, left: isPopular ? '8rem' : undefined }}
              >
                <Camera className="h-3 w-3 mr-1" aria-hidden="true" />
                {totalPhotos}
              </Badge>
            );
          }
          return null;
        })()}

        {/* Video Count Badge */}
        {(() => {
          const totalVideos = listing.youtubeUrls?.filter(url => url && url !== '').length || 0;
          const totalPhotos = listing.photos.filter(url => url && url !== '').length;
          if (totalVideos > 0) {
            // Position based on whether photo badge and popular badge exist
            const leftOffset = isPopular ? (totalPhotos > 0 ? '11rem' : '8rem') : (totalPhotos > 0 ? '3.5rem' : undefined);
            return (
              <Badge 
                variant="secondary"
                className="absolute top-3 bg-background/80 backdrop-blur-sm"
                style={{ 
                  right: (!isPopular && totalPhotos === 0) ? '0.75rem' : 'auto', 
                  left: leftOffset 
                }}
              >
                <Youtube className="h-3 w-3 mr-1" aria-hidden="true" />
                {totalVideos}
              </Badge>
            );
          }
          return null;
        })()}

        {/* Distance Badge - show when location is provided */}
        {distance !== undefined && distance !== null && (
          <Badge 
            variant="secondary"
            className="absolute bottom-14 left-3 bg-background/80 backdrop-blur-sm"
          >
            <Navigation className="h-3 w-3 mr-1" aria-hidden="true" />
            <span className="sr-only">Distance: </span>{formatDistance(distance)}
          </Badge>
        )}

        {/* Additional Photos & Video Thumbnails - Full Width Row */}
        {(() => {
          const additionalPhotos = listing.hasCoverPhoto 
            ? listing.photos.slice(1).filter(url => url && url !== '')
            : listing.photos.filter(url => url && url !== '');
          
          // Extract YouTube video IDs for thumbnails
          const extractYouTubeId = (url: string): string | null => {
            if (!url) return null;
            const patterns = [
              /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
              /youtube\.com\/shorts\/([^&\s?]+)/,
            ];
            for (const pattern of patterns) {
              const match = url.match(pattern);
              if (match && match[1]) return match[1];
            }
            return null;
          };
          
          const videoIds = (listing.youtubeUrls || [])
            .map(url => extractYouTubeId(url))
            .filter((id): id is string => id !== null);
          
          const hasContent = additionalPhotos.length > 0 || videoIds.length > 0;
          
          if (hasContent) {
            const maxDisplay = 4;
            // Combine video thumbnails first, then photos
            const photoItems = additionalPhotos.map(url => ({ type: 'photo' as const, url }));
            const videoItems = videoIds.map(id => ({ 
              type: 'video' as const, 
              url: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
              id 
            }));
            const allItems = [...videoItems, ...photoItems];
            const displayItems = allItems.slice(0, maxDisplay);
            const remainingCount = allItems.length - maxDisplay;
            
            return (
              <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-1.5 bg-background/70 backdrop-blur-sm">
                {displayItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="w-12 h-9 shrink-0 overflow-hidden rounded-sm relative"
                  >
                    <img 
                      src={item.url} 
                      alt={item.type === 'video' ? `Video thumbnail ${idx + 1}` : `Additional photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                          <Play className="h-2.5 w-2.5 text-white fill-white ml-0.5" aria-hidden="true" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {remainingCount > 0 && (
                  <div className="w-12 h-9 shrink-0 rounded-sm bg-background/90 flex items-center justify-center text-xs font-medium">
                    +{remainingCount}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })()}

        {/* Action Buttons */}
        <div className="absolute bottom-14 right-3 flex gap-2">
          {/* Tour Button */}
          {onAddToTour && (
            <button 
              className={cn(
                "p-2 rounded-full backdrop-blur-sm transition-all",
                isInTour 
                  ? "bg-primary text-white hover:bg-primary/80" 
                  : "bg-background/50 hover:bg-background/80"
              )}
              onClick={handleTourClick}
              disabled={!isInTour && tourIsFull}
              aria-label={isInTour ? `Remove ${listing.title} from tour` : `Add ${listing.title} to tour`}
            >
              {isInTour ? (
                <Check className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Route className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          )}
          <button 
            className="p-2 rounded-full backdrop-blur-sm transition-all bg-background/50 hover:bg-background/80"
            onClick={handleShareClick}
            aria-label={`Share ${listing.title}`}
          >
            <Share2 className="h-5 w-5" aria-hidden="true" />
          </button>
          <button 
            className={cn(
              "p-2 rounded-full backdrop-blur-sm transition-all",
              isFavorite 
                ? "bg-christmas text-white hover:bg-christmas/80" 
                : "bg-background/50 hover:bg-background/80"
            )}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? `Remove ${listing.title} from favourites` : `Add ${listing.title} to favourites`}
            aria-pressed={isFavorite}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Full Address as Title */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-lg group-hover:text-christmas transition-colors line-clamp-2">
            {listing.location.streetNumber} {listing.location.streetName}
            {listing.location.complexName && `, ${listing.location.complexName}`}
            {listing.location.unitNo && ` Unit ${listing.location.unitNo}`}
          </h3>
          {reviewStats && reviewStats.review_count > 0 && (
            <div className="flex items-center gap-1 shrink-0" aria-label={`Rating: ${reviewStats.average_rating} out of 5 from ${reviewStats.review_count} reviews`}>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              <span className="text-sm font-medium">{reviewStats.average_rating}</span>
              <span className="text-xs text-muted-foreground">({reviewStats.review_count})</span>
            </div>
          )}
        </div>
        
        {listing.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {listing.description}
          </p>
        )}

        {/* Suburb/City Location */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-christmas shrink-0 mt-0.5" aria-hidden="true" />
          <span className="text-muted-foreground">
            <span className="sr-only">Location: </span>
            {listing.location.suburb}, {listing.location.city}
          </span>
        </div>

        {/* Operating Hours */}
        <div className="flex items-start gap-2 text-sm">
          <Clock className="h-4 w-4 text-christmas shrink-0 mt-0.5" aria-hidden="true" />
          <span className="text-muted-foreground">
            <span className="sr-only">Operating hours: </span>
            {listing.operatingHours.days} • {listing.operatingHours.times}
          </span>
        </div>

        {/* Get Directions */}
        <div className="flex items-center justify-between">
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              onDirectionsClick?.(listing.id);
            }}
            className="inline-flex items-center gap-1 text-sm text-christmas hover:text-christmas/80 transition-colors"
            aria-label={`Get directions to ${listing.title}`}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Get Directions
          </a>
          <div onClick={(e) => e.stopPropagation()}>
            <ReportListingDialog
              listingId={listing.id}
              listingTitle={listing.title}
              trigger={
                <button
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Report ${listing.title}`}
                >
                  <Flag className="h-3 w-3" aria-hidden="true" />
                  Report
                </button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}