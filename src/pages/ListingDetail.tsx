import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockListings, transformDbListing } from "@/data/mockListings";
import { 
  MapPin, Clock, Mail, Phone, ExternalLink, 
  ArrowLeft, Share2, Heart, Flag, Calendar, Loader2 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useListing } from "@/hooks/use-listings";
import { ListingReviews } from "@/components/ListingReviews";
import { ReportListingDialog } from "@/components/ReportListingDialog";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import defaultCoverPhoto from "@/assets/default-cover-photo.png";

export default function ListingDetail() {
  const { id } = useParams();
  const { data: dbListing, isLoading, error } = useListing(id || '');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Try to find in database first, then fall back to mock
  const listing = dbListing 
    ? transformDbListing(dbListing as any)
    : mockListings.find(l => l.id === id);
  
  // Get additional photos - if has cover photo, exclude first; otherwise all are additional
  const additionalPhotos = listing?.hasCoverPhoto 
    ? listing?.photos.slice(1).filter(p => p && p !== '') || []
    : listing?.photos.filter(p => p && p !== '') || [];
  
  // Get cover photo - only if hasCoverPhoto is true
  const coverPhotoUrl = listing?.hasCoverPhoto && listing?.photos[0] ? listing.photos[0] : defaultCoverPhoto;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-christmas mx-auto mb-4" />
            <p className="text-muted-foreground">Loading display...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center py-16">
            <h1 className="font-display text-3xl font-bold mb-4">Listing Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The display you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/browse">
              <Button variant="default">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Browse
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const getDirectionsUrl = () => {
    const address = `${listing.location.streetNumber} ${listing.location.streetName}, ${listing.location.suburb}, ${listing.location.city}, ${listing.location.province}, ${listing.location.postalCode}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  const handleShare = async () => {
    const shareTitle = listing.title || `Christmas Display in ${listing.location.suburb}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Check out this amazing Christmas display!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share this link with friends and family.",
      });
    }
  };

  const fullAddress = `${listing.location.streetNumber} ${listing.location.streetName}, ${listing.location.suburb}, ${listing.location.city}, ${listing.location.province}, ${listing.location.postalCode}`;
  
  // Check if this is an example listing
  const isExampleListing = listing.id.startsWith('example-');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        {/* Example Listing Banner */}
        {isExampleListing && (
          <div className="bg-amber-500/90 text-amber-950 py-3 px-4 text-center font-medium">
            <span className="text-lg">✨ This is an EXAMPLE LISTING</span>
            <p className="text-sm opacity-90">This is a demonstration of what a listing looks like on Lekker Lights. The address and details shown are fictional.</p>
          </div>
        )}

        {/* Hero Image Gallery */}
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <img 
            src={coverPhotoUrl} 
            alt={isExampleListing
              ? `Example listing preview: ${listing.title || 'Christmas Display'}` 
              : (listing.title || `Christmas Display in ${listing.location.suburb}`)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          
          {/* Back Button */}
          <Link 
            to="/browse"
            className="absolute top-24 left-4 sm:left-8 z-10"
          >
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>

          {/* Action Buttons */}
          <div className="absolute top-24 right-4 sm:right-8 z-10 flex gap-2">
            <Button 
              variant="secondary" 
              size="icon"
              onClick={handleShare}
              aria-label="Share this listing"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon"
              onClick={() => toast({ title: "Added to favorites!" })}
              aria-label="Add to favorites"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Main Card */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-lg">
              {/* Example Notice Inside Card */}
              {isExampleListing && (
                <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg p-4 mb-6">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>📋 Example Listing:</strong> This preview shows you exactly how your listing will appear to visitors. The address, photos, and details here are for demonstration purposes only.
                  </p>
                </div>
              )}

              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div className="space-y-2">
                  <Badge variant="christmas" className="mb-2">
                    🎄 Christmas
                  </Badge>
                  {listing.title && (
                    <h1 className="font-display text-2xl sm:text-3xl font-bold">
                      {listing.title}
                    </h1>
                  )}
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  {listing.description}
                </p>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Location */}
                <div className="space-y-3">
                  <h3 className="font-display font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-christmas" />
                    Location
                  </h3>
                  <p className="text-muted-foreground">
                    {fullAddress}
                  </p>
                  <a
                    href={getDirectionsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full sm:w-auto">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </a>
                </div>

                {/* Operating Hours */}
                <div className="space-y-3">
                  <h3 className="font-display font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-christmas" />
                    Viewing Hours
                  </h3>
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {listing.operatingHours.days}
                    </p>
                    {listing.operatingHours.times && (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {listing.operatingHours.times}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              {listing.contact && (listing.contact.email || listing.contact.phone) && (
                <div className="border-t border-border pt-6 mb-8">
                  <h3 className="font-display font-semibold mb-4">Contact</h3>
                  <div className="flex flex-wrap gap-4">
                    {listing.contact.email && (
                      <a 
                        href={`mailto:${listing.contact.email}`}
                        className="flex items-center gap-2 text-christmas hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        {listing.contact.email}
                      </a>
                    )}
                    {listing.contact.phone && (
                      <a 
                        href={`tel:${listing.contact.phone}`}
                        className="flex items-center gap-2 text-christmas hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {listing.contact.phone}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Photo Gallery */}
              {additionalPhotos.length > 0 && (
                <div className="border-t border-border pt-6 mb-8">
                  <h3 className="font-display font-semibold mb-4">More Photos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {additionalPhotos.map((photo, index) => (
                      <button 
                        key={index}
                        className="aspect-video rounded-lg overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-christmas focus:ring-offset-2"
                        onClick={() => {
                          setLightboxIndex(index);
                          setLightboxOpen(true);
                        }}
                        aria-label={`View ${listing.title} - Photo ${index + 2} in full size`}
                      >
                        <img 
                          src={photo} 
                          alt={`${listing.title} - Photo ${index + 2}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Lightbox */}
              <PhotoLightbox
                photos={additionalPhotos}
                initialIndex={lightboxIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                altPrefix={listing.title}
              />

              {/* Report Button */}
              <div className="border-t border-border pt-6 flex justify-end">
                <ReportListingDialog
                  listingId={listing.id}
                  listingTitle={listing.title}
                  trigger={
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      Report Listing
                    </Button>
                  }
                />
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-8">
              <ListingReviews listingId={id || ''} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
