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
  googleDrivePhotos?: string[];
  operatingHours: {
    days: string;
    times: string;
  };
  contact?: {
    email?: string;
    phone?: string;
  };
  createdAt: string;
  featured?: boolean;
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
    id: '1',
    title: 'Winter Wonderland Display',
    description: 'Our home transforms into a magical winter wonderland every December! Features over 50,000 lights, animated reindeer, a life-size nativity scene, and snow machines. A true Sandton spectacle that has been featured on local news.',
    location: {
      streetNumber: '42',
      streetName: 'Jacaranda Avenue',
      suburb: 'Sandton',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2196',
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
      email: 'lights@example.com',
    },
    createdAt: '2024-11-15',
    featured: true,
  },
  {
    id: '2',
    title: 'Santa\'s Workshop',
    description: 'A family-friendly Christmas display featuring Santa\'s workshop, elves, toy trains, and a beautiful nativity scene. Hot chocolate available on weekends!',
    location: {
      streetNumber: '88',
      streetName: 'Pine Tree Lane',
      suburb: 'Constantia',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '7806',
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
    createdAt: '2024-11-20',
    featured: true,
  },
  {
    id: '3',
    title: 'Neighbourhood Christmas Lane',
    description: 'The entire street participates! 12 houses all decorated with synchronized light shows set to music. Drive through or walk and enjoy the magic.',
    location: {
      streetNumber: '1-12',
      streetName: 'Candy Cane Crescent',
      suburb: 'Pretoria East',
      city: 'Pretoria',
      province: 'Gauteng',
      postalCode: '0181',
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
      email: 'christmaslane@example.com',
    },
    createdAt: '2024-11-25',
    featured: true,
  },
  {
    id: '4',
    title: 'Classic Christmas Cottage',
    description: 'Traditional Christmas decorations with thousands of warm white lights, candy canes lining the pathway, and a beautiful nativity scene.',
    location: {
      streetNumber: '25',
      streetName: 'Holly Street',
      suburb: 'Umhlanga',
      city: 'Durban',
      province: 'KwaZulu-Natal',
      postalCode: '4319',
      lat: -29.7276,
      lng: 31.0852,
    },
    photos: [
      'https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=800',
    ],
    youtubeUrls: [],
    operatingHours: {
      days: 'Daily, Dec 1-25',
      times: '6:30 PM - 10:00 PM',
    },
    createdAt: '2024-11-18',
  },
  {
    id: '5',
    title: 'North Pole Express',
    description: 'A magical train-themed Christmas display with model trains, a polar express setup, and plenty of snow effects. Kids love it!',
    location: {
      streetNumber: '7',
      streetName: 'Reindeer Road',
      suburb: 'Centurion',
      city: 'Pretoria',
      province: 'Gauteng',
      postalCode: '0157',
      lat: -25.8603,
      lng: 28.1894,
    },
    photos: [
      'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800',
      'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=800',
    ],
    youtubeUrls: [],
    operatingHours: {
      days: 'Weekends, Dec',
      times: '7:00 PM - 9:30 PM',
    },
    contact: {
      phone: '+27 82 555 1234',
    },
    createdAt: '2024-11-22',
  },
];
