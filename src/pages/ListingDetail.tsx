import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
import defaultCoverPhoto from "@/assets/default-cover-photo.png";

export default function ListingDetail() {
  const { id } = useParams();
  const { data: dbListing, isLoading, error } = useListing(id || '');
  
  // Try to find in database first, then fall back to mock
  const listing = dbListing 
    ? transformDbListing(dbListing as any)
    : mockListings.find(l => l.id === id);

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
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        {/* Hero Image Gallery */}
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <img 
            src={listing.photos[0] || defaultCoverPhoto} 
            alt={listing.title}
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
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon"
              onClick={() => toast({ title: "Added to favorites!" })}
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
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div className="space-y-2">
                  <Badge variant="christmas" className="mb-2">
                    🎄 Christmas
                  </Badge>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold">
                    {listing.title}
                  </h1>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {listing.description}
              </p>

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
              {listing.photos.length > 1 && (
                <div className="border-t border-border pt-6 mb-8">
                  <h3 className="font-display font-semibold mb-4">More Photos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {listing.photos.slice(1).map((photo, index) => (
                      <div 
                        key={index}
                        className="aspect-video rounded-lg overflow-hidden"
                      >
                        <img 
                          src={photo} 
                          alt={`${listing.title} - Photo ${index + 2}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Report Button */}
              <div className="border-t border-border pt-6 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => toast({ 
                    title: "Report submitted",
                    description: "Thank you for helping keep Lekker Lights safe.",
                  })}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Report Listing
                </Button>
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
    </div>
  );
}
