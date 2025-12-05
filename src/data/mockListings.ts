export type Theme = 'christmas' | 'diwali' | 'halloween' | 'eid' | 'hanukkah' | 'other';

export interface Listing {
  id: string;
  theme: Theme;
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

export const themes: { value: Theme; label: string; emoji: string }[] = [
  { value: 'christmas', label: 'Christmas', emoji: '🎄' },
  { value: 'diwali', label: 'Diwali', emoji: '🪔' },
  { value: 'halloween', label: 'Halloween', emoji: '🎃' },
  { value: 'eid', label: 'Eid', emoji: '🌙' },
  { value: 'hanukkah', label: 'Hanukkah', emoji: '🕎' },
  { value: 'other', label: 'Other', emoji: '✨' },
];

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
    theme: 'christmas',
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
    theme: 'diwali',
    title: 'Festival of Lights Celebration',
    description: 'Experience the beauty of Diwali with our traditional diyas, rangoli patterns lit with LED lights, and a stunning display of lanterns. Our garden features thousands of fairy lights creating a warm, welcoming atmosphere.',
    location: {
      streetNumber: '15',
      streetName: 'Krishna Road',
      suburb: 'Chatsworth',
      city: 'Durban',
      province: 'KwaZulu-Natal',
      postalCode: '4030',
      lat: -29.9167,
      lng: 30.9167,
    },
    photos: [
      'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800',
      'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800',
    ],
    youtubeUrls: [],
    operatingHours: {
      days: 'Diwali Week',
      times: '6:30 PM - 10:00 PM',
    },
    createdAt: '2024-10-20',
    featured: true,
  },
  {
    id: '3',
    theme: 'halloween',
    title: 'Spooky Manor',
    description: 'Welcome to our haunted house! Complete with animatronic ghosts, a fog machine, spooky sound effects, and a graveyard scene. Not for the faint-hearted! Safe trick-or-treat area for kids available.',
    location: {
      streetNumber: '666',
      streetName: 'Raven Street',
      suburb: 'Camps Bay',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '8005',
      lat: -33.9506,
      lng: 18.3776,
    },
    photos: [
      'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=800',
      'https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?w=800',
    ],
    youtubeUrls: [],
    operatingHours: {
      days: '25-31 October',
      times: '6:00 PM - 9:00 PM',
    },
    contact: {
      phone: '+27 82 123 4567',
    },
    createdAt: '2024-10-01',
  },
  {
    id: '4',
    theme: 'christmas',
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
  },
  {
    id: '5',
    theme: 'eid',
    title: 'Eid Mubarak Lights',
    description: 'Celebrating Eid with beautiful crescent moon and star displays, green and gold lights throughout the garden, and traditional lanterns.',
    location: {
      streetNumber: '23',
      streetName: 'Mosque Street',
      suburb: 'Bo-Kaap',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '8001',
      lat: -33.9213,
      lng: 18.4165,
    },
    photos: [
      'https://images.unsplash.com/photo-1532635241-17e820acc59f?w=800',
    ],
    youtubeUrls: [],
    operatingHours: {
      days: 'Eid Week',
      times: '7:00 PM - 11:00 PM',
    },
    createdAt: '2024-03-15',
  },
  {
    id: '6',
    theme: 'christmas',
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
];
