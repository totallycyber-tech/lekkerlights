import { useState, useCallback, useEffect } from "react";
import { Listing } from "@/data/mockListings";
import { calculateDistance } from "@/lib/geo-utils";

const TOUR_STORAGE_KEY = "lekker-lights-tour";
const MAX_TOUR_STOPS = 10;

interface TourState {
  listings: Listing[];
}

export function useTour() {
  const [tourListings, setTourListings] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem(TOUR_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load tour from localStorage:", e);
    }
    return [];
  });

  // Persist to localStorage whenever tour changes
  useEffect(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(tourListings));
  }, [tourListings]);

  const addToTour = useCallback((listing: Listing) => {
    setTourListings((prev) => {
      if (prev.length >= MAX_TOUR_STOPS) {
        return prev;
      }
      if (prev.some((l) => l.id === listing.id)) {
        return prev;
      }
      return [...prev, listing];
    });
  }, []);

  const removeFromTour = useCallback((listingId: string) => {
    setTourListings((prev) => prev.filter((l) => l.id !== listingId));
  }, []);

  const clearTour = useCallback(() => {
    setTourListings([]);
  }, []);

  const isInTour = useCallback(
    (listingId: string) => tourListings.some((l) => l.id === listingId),
    [tourListings]
  );

  const reorderTour = useCallback((fromIndex: number, toIndex: number) => {
    setTourListings((prev) => {
      const newList = [...prev];
      const [removed] = newList.splice(fromIndex, 1);
      newList.splice(toIndex, 0, removed);
      return newList;
    });
  }, []);

  // Nearest neighbor algorithm for route optimization
  const optimizeRoute = useCallback((startLat?: number, startLng?: number) => {
    if (tourListings.length <= 1) return;

    const listingsWithCoords = tourListings.filter(
      (l) => l.location.lat != null && l.location.lng != null
    );

    if (listingsWithCoords.length <= 1) return;

    const optimized: Listing[] = [];
    const remaining = [...listingsWithCoords];

    // Start from user's location or first listing
    let currentLat = startLat ?? remaining[0].location.lat!;
    let currentLng = startLng ?? remaining[0].location.lng!;

    // If starting from user location, don't remove first listing
    if (startLat == null && remaining.length > 0) {
      optimized.push(remaining.shift()!);
      currentLat = optimized[0].location.lat!;
      currentLng = optimized[0].location.lng!;
    }

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      remaining.forEach((listing, index) => {
        const distance = calculateDistance(
          currentLat,
          currentLng,
          listing.location.lat!,
          listing.location.lng!
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      const nearest = remaining.splice(nearestIndex, 1)[0];
      optimized.push(nearest);
      currentLat = nearest.location.lat!;
      currentLng = nearest.location.lng!;
    }

    // Add back any listings without coords at the end
    const withoutCoords = tourListings.filter(
      (l) => l.location.lat == null || l.location.lng == null
    );

    setTourListings([...optimized, ...withoutCoords]);
  }, [tourListings]);

  // Generate Google Maps multi-stop URL
  const generateGoogleMapsUrl = useCallback((userLat?: number, userLng?: number) => {
    const listingsWithCoords = tourListings.filter(
      (l) => l.location.lat != null && l.location.lng != null
    );

    if (listingsWithCoords.length === 0) return null;

    // If only one stop, simple directions
    if (listingsWithCoords.length === 1) {
      const dest = listingsWithCoords[0];
      const address = `${dest.location.lat},${dest.location.lng}`;
      let url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
      if (userLat != null && userLng != null) {
        url += `&origin=${userLat},${userLng}`;
      }
      return url;
    }

    // Multiple stops: last one is destination, others are waypoints
    const destination = listingsWithCoords[listingsWithCoords.length - 1];
    const waypoints = listingsWithCoords.slice(0, -1);

    const waypointStr = waypoints
      .map((l) => `${l.location.lat},${l.location.lng}`)
      .join("|");

    let url = `https://www.google.com/maps/dir/?api=1&destination=${destination.location.lat},${destination.location.lng}&waypoints=${encodeURIComponent(waypointStr)}`;
    
    if (userLat != null && userLng != null) {
      url += `&origin=${userLat},${userLng}`;
    }

    return url;
  }, [tourListings]);

  // Generate shareable tour link
  const generateShareUrl = useCallback(() => {
    const ids = tourListings.map((l) => l.id).join(",");
    return `${window.location.origin}/browse?tour=${encodeURIComponent(ids)}`;
  }, [tourListings]);

  // Load tour from URL params
  const loadTourFromIds = useCallback((ids: string[], allListings: Listing[]) => {
    const listings = ids
      .map((id) => allListings.find((l) => l.id === id))
      .filter((l): l is Listing => l != null);
    setTourListings(listings);
  }, []);

  return {
    tourListings,
    tourCount: tourListings.length,
    maxStops: MAX_TOUR_STOPS,
    isFull: tourListings.length >= MAX_TOUR_STOPS,
    addToTour,
    removeFromTour,
    clearTour,
    isInTour,
    reorderTour,
    optimizeRoute,
    generateGoogleMapsUrl,
    generateShareUrl,
    loadTourFromIds,
  };
}
