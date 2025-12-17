export interface Listing {
  id: string;
  title: string | null;
  description: string | null;
  location: {
    streetNumber: string;
    streetName: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
    complexName?: string | null;
    unitNo?: string | null;
    lat: number;
    lng: number;
  };
  photos: string[];
  hasCoverPhoto: boolean;
  youtubeUrls: string[];
  operatingHours: {
    days: string;
    times: string;
  };
  contact?: {
    email?: string;
    phone?: string;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
}

// Input type for transformDbListing that's compatible with both useListings and direct DB queries
type DbListingInput = {
  id: string;
  title: string | null;
  description: string | null;
  street_number: string;
  street_name: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
  complex_name?: string | null;
  unit_no?: string | null;
  lat: number | null;
  lng: number | null;
  image_urls: string[];
  has_cover_photo?: boolean;
  youtube_urls: string[];
  operating_hours: Record<string, { enabled: boolean; startTime: string; endTime: string }> | { other: string } | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
  directions_clicks: number;
  favorites_count: number;
  tags: string[] | null;
};

// Transform database listing to UI format
export function transformDbListing(dbListing: DbListingInput): Listing {
  // Build operating hours display string
  const hours = dbListing.operating_hours || {};
  
  let daysStr = 'Contact for hours';
  let timesStr = '';
  
  // Check if it's the "other" type
  if ('other' in hours && typeof hours.other === 'string') {
    daysStr = hours.other || 'Contact for hours';
    timesStr = '';
  } else {
    const enabledDays = Object.entries(hours as Record<string, { enabled: boolean; startTime: string; endTime: string }>)
      .filter(([_, schedule]) => schedule?.enabled)
      .map(([day, schedule]) => ({ day, ...schedule }));
    
    if (enabledDays.length > 0) {
      if (enabledDays.length === 7) {
        daysStr = 'Daily';
      } else {
        daysStr = enabledDays.map(d => d.day.substring(0, 3)).join(', ');
      }
      // Get unique time ranges
      const timeRanges = [...new Set(enabledDays.map(d => `${d.startTime} - ${d.endTime}`))];
      timesStr = timeRanges[0] || '';
    }
  }

  // Use uploaded images as photos, or default cover photo if none
  // Note: The default cover photo is imported in components that use this
  const photos = dbListing.image_urls?.length > 0 
    ? dbListing.image_urls 
    : [];

  return {
    id: dbListing.id,
    title: dbListing.title,
    description: dbListing.description,
    location: {
      streetNumber: dbListing.street_number,
      streetName: dbListing.street_name,
      suburb: dbListing.suburb,
      city: dbListing.city,
      province: dbListing.province,
      postalCode: dbListing.postal_code,
      complexName: dbListing.complex_name,
      unitNo: dbListing.unit_no,
      lat: dbListing.lat || 0,
      lng: dbListing.lng || 0,
    },
    photos,
    hasCoverPhoto: dbListing.has_cover_photo ?? false,
    youtubeUrls: dbListing.youtube_urls || [],
    operatingHours: {
      days: daysStr,
      times: timesStr,
    },
    contact: {
      email: dbListing.contact_email || undefined,
      phone: dbListing.contact_phone || undefined,
    },
    tags: dbListing.tags || [],
    createdAt: dbListing.created_at,
    updatedAt: dbListing.updated_at,
  };
}

export const provinces = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
];

// Mock listings removed - all listings now come from database only
export const mockListings: Listing[] = [];
