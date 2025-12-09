export interface TagCategory {
  name: string;
  tags: string[];
}

export const tagCategories: TagCategory[] = [
  {
    name: "Visitor Experience",
    tags: [
      "Kid-friendly",
      "Toddler-friendly",
      "Family-friendly",
      "Pet-friendly",
      "Pram/stroller-friendly",
      "Wheelchair-accessible",
      "Good for photos / selfies",
      "Meet Santa (on certain nights)",
      "Characters in costume",
      "Interactive elements",
    ],
  },
  {
    name: "How to Visit (Movement / Access)",
    tags: [
      "Walk-through allowed",
      "Walk-through only",
      "Drive-by only",
      "Stay-in-car",
      "Short stop only",
      "Queue likely",
      "Estate / complex access rules apply",
      "Security gate access required",
      "Street parking available",
      "Off-street parking available",
      "Limited parking",
      "Busy road – extra caution",
    ],
  },
  {
    name: "Display Content & Style",
    tags: [
      "Includes inflatables",
      "Nativity scene",
      "Santa & sleigh",
      "Reindeer",
      "Snowmen",
      "Candy canes",
      "Christmas village",
      "Train set",
      "Penguins / polar bears",
      "Big tree",
      "Roof lights",
      "Garden lights",
      "Window displays",
      "Projection / mapped visuals",
      "Laser lights",
      "Animated figures",
      "Modern / colourful",
      "Minimalist",
    ],
  },
  {
    name: "Music & Sound",
    tags: [
      "Synchronized to music",
      "Music via outdoor speakers",
      "Low-volume music",
      "No music",
      "Occasional live music",
    ],
  },
  {
    name: "Accessibility & Comfort Extras",
    tags: [
      "Pavement / flat surface",
      "Steps / uneven ground",
      "Steep driveway",
      "Pram-friendly route",
      "Wheelchair-friendly route",
      "Seating available",
      "Shelter from light rain",
      "Toilets nearby",
    ],
  },
  {
    name: "Rules & Etiquette",
    tags: [
      "No pets",
      "No smoking",
      "No littering",
      "No hooting",
      "No blocking driveways",
      "No touching displays",
      "No flash photography",
      "No drones",
      "Photos allowed with consent",
      "Please keep noise levels low",
    ],
  },
  {
    name: "Timing & Seasonality",
    tags: [
      "Weather dependent",
      "Closed in bad weather",
    ],
  },
  {
    name: "Advanced (Technical & Enthusiast Tags)",
    tags: [
      "LED lights",
      "Pixel lights",
      "Addressable RGB",
      "Laser effects",
      "Projection mapping",
      "Smart home controlled",
      "DMX / show controller",
      "Automated show schedule",
      "Show sequenced with dedicated software",
      "Music-synced light show (advanced setup)",
    ],
  },
];

// Flatten all tags for easy lookup
export const allTags = tagCategories.flatMap((category) => category.tags);
