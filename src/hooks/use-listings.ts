import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

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
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  name_visible: boolean;
  email_visible: boolean;
  phone_visible: boolean;
  parking_info: string | null;
  max_visitors: number | null;
  gate_access_info: string | null;
  image_urls: string[];
  youtube_urls: string[];
  operating_hours: Record<string, { enabled: boolean; startTime: string; endTime: string }> | { other: string };
  directions_clicks: number;
  favorites_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Helper to safely cast database row to Listing
function toListingFromDb(row: any): Listing {
  return {
    ...row,
    image_urls: row.image_urls ?? [],
    youtube_urls: row.youtube_urls ?? [],
    operating_hours: (row.operating_hours as Record<string, { enabled: boolean; startTime: string; endTime: string }> | { other: string }) ?? {},
    directions_clicks: row.directions_clicks ?? 0,
    favorites_count: row.favorites_count ?? 0,
    tags: row.tags ?? [],
  };
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
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  name_visible?: boolean;
  email_visible?: boolean;
  phone_visible?: boolean;
  parking_info?: string | null;
  max_visitors?: number | null;
  gate_access_info?: string | null;
  image_urls?: string[];
  youtube_urls?: string[];
  operating_hours?: Record<string, { enabled: boolean; startTime: string; endTime: string }> | { other: string };
  tags?: string[];
}

export function useListings() {
  return useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      // Use the secure public view that excludes edit_token and respects visibility flags
      const { data, error } = await supabase
        .from('listings_public')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        throw error;
      }

      return (data || []).map(toListingFromDb);
    },
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      // Use the secure public view that excludes edit_token and respects visibility flags
      const { data, error } = await supabase
        .from('listings_public')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching listing:', error);
        throw error;
      }

      return data ? toListingFromDb(data) : null;
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

      return toListingFromDb(data);
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

// Upload images to storage via secure edge function with server-side validation
export async function uploadListingImages(
  files: File[], 
  listingId: string, 
  editToken?: string
): Promise<string[]> {
  const urls: string[] = [];
  
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('listingId', listingId);
    if (editToken) {
      formData.append('editToken', editToken);
    }

    const { data, error } = await supabase.functions.invoke('upload-listing-image', {
      body: formData,
    });

    if (error) {
      console.error('Error uploading image:', error);
      throw new Error(error.message || 'Failed to upload image');
    }

    if (!data?.success) {
      console.error('Upload failed:', data?.error);
      throw new Error(data?.error || 'Failed to upload image');
    }

    urls.push(data.url);
  }

  return urls;
}
