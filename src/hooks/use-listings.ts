import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Listing {
  id: string;
  title: string;
  description: string;
  complex_name: string | null;
  unit_no: string | null;
  street_number: string;
  street_name: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
  lat: number | null;
  lng: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  google_drive_urls: string[];
  youtube_urls: string[];
  operating_hours: Record<string, { enabled: boolean; startTime: string; endTime: string }>;
  directions_clicks: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListingInsert {
  title: string;
  description: string;
  complex_name?: string | null;
  unit_no?: string | null;
  street_number: string;
  street_name: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
  lat?: number | null;
  lng?: number | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  google_drive_urls?: string[];
  youtube_urls?: string[];
  operating_hours?: Record<string, { enabled: boolean; startTime: string; endTime: string }>;
}

export function useListings() {
  return useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        throw error;
      }

      return (data || []) as Listing[];
    },
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching listing:', error);
        throw error;
      }

      return data as Listing | null;
    },
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: ListingInsert) => {
      const { data, error } = await supabase
        .from('listings')
        .insert(listing as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating listing:', error);
        throw error;
      }

      return data as Listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useIncrementDirectionsClicks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      // First fetch current value
      const { data: listing } = await supabase
        .from('listings')
        .select('directions_clicks')
        .eq('id', listingId)
        .single();

      if (listing) {
        const { error } = await supabase
          .from('listings')
          .update({ directions_clicks: (listing.directions_clicks || 0) + 1 } as any)
          .eq('id', listingId);
        
        if (error) {
          console.error('Error incrementing clicks:', error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
