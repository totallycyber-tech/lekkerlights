import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReviewStats {
  listing_id: string;
  average_rating: number;
  review_count: number;
}

export function useReviewStats(listingIds: string[]) {
  return useQuery({
    queryKey: ['review-stats', listingIds],
    queryFn: async (): Promise<Record<string, ReviewStats>> => {
      if (listingIds.length === 0) return {};

      const { data, error } = await supabase
        .from('reviews')
        .select('listing_id, rating')
        .in('listing_id', listingIds);

      if (error) {
        console.error('Error fetching review stats:', error);
        return {};
      }

      // Aggregate reviews by listing_id
      const statsMap: Record<string, { total: number; count: number }> = {};
      
      (data || []).forEach((review) => {
        if (!statsMap[review.listing_id]) {
          statsMap[review.listing_id] = { total: 0, count: 0 };
        }
        statsMap[review.listing_id].total += review.rating;
        statsMap[review.listing_id].count += 1;
      });

      // Convert to final format
      const result: Record<string, ReviewStats> = {};
      Object.entries(statsMap).forEach(([listing_id, { total, count }]) => {
        result[listing_id] = {
          listing_id,
          average_rating: Math.round((total / count) * 10) / 10,
          review_count: count,
        };
      });

      return result;
    },
    enabled: listingIds.length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });
}
