import { Link } from "react-router-dom";
import { Listing } from "@/data/mockListings";
import { Button } from "@/components/ui/button";
import { Heart, Navigation, MapPin, Clock, Star } from "lucide-react";
import defaultCoverPhoto from "@/assets/default-cover-photo.png";

interface ReviewStats {
  listing_id: string;
  average_rating: number;
  review_count: number;
}

interface MapInfoWindowProps {
  listing: Listing;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onDirectionsClick: (id: string) => void;
  reviewStats: ReviewStats | null;
}

export function MapInfoWindow({
  listing,
  isFavorite,
  onToggleFavorite,
  onDirectionsClick,
  reviewStats,
}: MapInfoWindowProps) {
  const coverPhoto = (listing.hasCoverPhoto && listing.photos?.[0] && listing.photos[0] !== '') ? listing.photos[0] : defaultCoverPhoto;
  
  const getGoogleMapsUrl = () => {
    const address = `${listing.location.streetNumber} ${listing.location.streetName}, ${listing.location.suburb}, ${listing.location.city}, ${listing.location.province}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  const handleDirectionsClick = () => {
    onDirectionsClick(listing.id);
    window.open(getGoogleMapsUrl(), "_blank");
  };

  // Format operating hours for today
  const getTodayHours = () => {
    if (!listing.operatingHours) return null;
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = days[new Date().getDay()];
    const hours = listing.operatingHours[today];
    if (hours?.enabled && hours.start && hours.end) {
      return `${hours.start} - ${hours.end}`;
    }
    return "Closed today";
  };

  const todayHours = getTodayHours();

  return (
    <div className="w-64 p-0 font-sans">
      {/* Cover Photo */}
      <div className="relative w-full h-32 -mt-2 -mx-2 mb-2" style={{ width: 'calc(100% + 16px)' }}>
        <img
          src={coverPhoto}
          alt={listing.title}
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Title */}
        {listing.title && (
          <Link 
            to={`/listing/${listing.id}`}
            className="block font-semibold text-base hover:text-christmas transition-colors line-clamp-1"
            style={{ color: '#1a1a1a' }}
          >
            {listing.title}
          </Link>
        )}

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#666' }}>
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="line-clamp-1">
            {listing.location.suburb}, {listing.location.city}
          </span>
        </div>

        {/* Today's Hours */}
        {todayHours && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#666' }}>
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span>{todayHours}</span>
          </div>
        )}

        {/* Rating */}
        {reviewStats && reviewStats.review_count > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span style={{ color: '#1a1a1a', fontWeight: 500 }}>
              {reviewStats.average_rating.toFixed(1)}
            </span>
            <span style={{ color: '#666' }}>
              ({reviewStats.review_count} review{reviewStats.review_count !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleFavorite(listing.id)}
            className="flex-1 h-8 text-xs gap-1"
          >
            <Heart className={`h-3 w-3 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            {isFavorite ? 'Saved' : 'Save'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleDirectionsClick}
            className="flex-1 h-8 text-xs gap-1"
          >
            <Navigation className="h-3 w-3" />
            Directions
          </Button>
        </div>

        {/* View Details Link */}
        <Link 
          to={`/listing/${listing.id}`}
          className="block text-center text-xs font-medium hover:underline pt-1"
          style={{ color: '#16a34a' }}
        >
          View full details →
        </Link>
      </div>
    </div>
  );
}
