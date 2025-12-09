import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsList } from "@/components/ReviewsList";
import { Star } from "lucide-react";

interface ListingReviewsProps {
  listingId: string;
}

export function ListingReviews({ listingId }: ListingReviewsProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReviewSubmitted = () => {
    // Trigger a refresh of the reviews list
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Leave a Review</h4>
          <ReviewForm listingId={listingId} onReviewSubmitted={handleReviewSubmitted} />
        </div>

        <div className="border-t pt-6">
          <h4 className="font-medium mb-3">Community Reviews</h4>
          <ReviewsList listingId={listingId} refreshTrigger={refreshTrigger} />
        </div>
      </CardContent>
    </Card>
  );
}
