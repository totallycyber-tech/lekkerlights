export interface Listing {
  id: string;
  title: string;
  description: string;
  location: {
    streetNumber: string;
    streetName: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
    lat: number;
    lng: number;
  };
  photos: string[];
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
  featured?: boolean;
}

// Input type for transformDbListing that's compatible with both useListings and direct DB queries
type DbListingInput = {
  id: string;
  title: string;
  description: string;
  street_number: string;
  street_name: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
  lat: number | null;
  lng: number | null;
  image_urls: string[];
  youtube_urls: string[];
  operating_hours: Record<string, { enabled: boolean; startTime: string; endTime: string }> | { other: string } | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
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
      lat: dbListing.lat || 0,
      lng: dbListing.lng || 0,
    },
    photos,
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

export const mockListings: Listing[] = [
  {
    id: 'example-1',
    title: '✨ EXAMPLE: Winter Wonderland Display',
    description: 'THIS IS AN EXAMPLE LISTING to show you what a display looks like on Lekker Lights. This is not a real listing. When you list your display, it will appear like this! Features described: over 50,000 lights, animated reindeer, a life-size nativity scene, and snow machines.',
    location: {
      streetNumber: '123',
      streetName: 'Example Street',
      suburb: 'Sample Suburb',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '0000',
      lat: -26.1076,
      lng: 28.0567,
    },
    photos: [
      'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=800',
      'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800',
      'https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=800',
    ],
    youtubeUrls: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    operatingHours: {
      days: 'Daily from 1 Dec - 6 Jan',
      times: '7:00 PM - 11:00 PM',
    },
    contact: {
      email: 'example@email.com',
    },
    tags: ['family-friendly', 'animated-figures', 'nativity'],
    createdAt: '2024-11-15',
    featured: true,
  },
  {
    id: 'example-2',
    title: '✨ EXAMPLE: Santa\'s Workshop',
    description: 'THIS IS AN EXAMPLE LISTING to demonstrate the Lekker Lights platform. This is not a real display. A family-friendly Christmas display example featuring Santa\'s workshop, elves, toy trains, and a beautiful nativity scene.',
    location: {
      streetNumber: '456',
      streetName: 'Demo Avenue',
      suburb: 'Sample Area',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '0000',
      lat: -34.0268,
      lng: 18.4232,
    },
    photos: [
      'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800',
      'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800',
    ],
    youtubeUrls: [],
    operatingHours: {
      days: 'Fri-Sun, Dec 1-25',
      times: '7:00 PM - 10:00 PM',
    },
    tags: ['kid-friendly', 'meet-santa', 'photo-opportunities'],
    createdAt: '2024-11-20',
    featured: true,
  },
  {
    id: 'example-3',
    title: '✨ EXAMPLE: Neighbourhood Christmas Lane',
    description: 'THIS IS AN EXAMPLE LISTING showing how a street-wide display would appear. This is not a real listing. Example scenario: 12 houses all decorated with synchronized light shows set to music.',
    location: {
      streetNumber: '1',
      streetName: 'Sample Crescent',
      suburb: 'Demo Suburb',
      city: 'Pretoria',
      province: 'Gauteng',
      postalCode: '0000',
      lat: -25.7689,
      lng: 28.2795,
    },
    photos: [
      'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?w=800',
      'https://images.unsplash.com/photo-1544143481-18a7c2b49242?w=800',
    ],
    youtubeUrls: ['https://www.youtube.com/watch?v=example123'],
    operatingHours: {
      days: 'Nightly, Dec 1-31',
      times: '8:00 PM - 10:30 PM',
    },
    contact: {
      email: 'example@email.com',
    },
    tags: ['drive-by', 'music-synchronized', 'walk-through'],
    createdAt: '2024-11-25',
    featured: true,
  },
];
