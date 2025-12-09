import { useState, useEffect, useCallback } from "react";

const DIRECTIONS_KEY = "lekker-lights-directions";
const FAVORITES_KEY = "lekker-lights-favorites";

interface PopularityData {
  [listingId: string]: number;
}

export function usePopularity() {
  const [directionsCount, setDirectionsCount] = useState<PopularityData>({});
  const [favoritesCount, setFavoritesCount] = useState<PopularityData>({});

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedDirections = localStorage.getItem(DIRECTIONS_KEY);
      if (storedDirections) {
        setDirectionsCount(JSON.parse(storedDirections));
      }

      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        const favorites: string[] = JSON.parse(storedFavorites);
        const counts: PopularityData = {};
        favorites.forEach((id) => {
          counts[id] = (counts[id] || 0) + 1;
        });
        setFavoritesCount(counts);
      }
    } catch (error) {
      console.error("Error loading popularity data:", error);
    }
  }, []);

  // Track when someone clicks "Get Directions"
  const trackDirectionsClick = useCallback((listingId: string) => {
    setDirectionsCount((prev) => {
      const newCount = {
        ...prev,
        [listingId]: (prev[listingId] || 0) + 1,
      };
      try {
        localStorage.setItem(DIRECTIONS_KEY, JSON.stringify(newCount));
      } catch (error) {
        console.error("Error saving directions count:", error);
      }
      return newCount;
    });
  }, []);

  // Calculate popularity score (directions + favorites weight)
  const getPopularityScore = useCallback(
    (listingId: string) => {
      const directions = directionsCount[listingId] || 0;
      const favorites = favoritesCount[listingId] || 0;
      // Weight favorites more heavily (2x) since it's a stronger signal
      return directions + favorites * 2;
    },
    [directionsCount, favoritesCount]
  );

  // Check if listing is "popular" (score >= 3)
  const isPopular = useCallback(
    (listingId: string) => {
      return getPopularityScore(listingId) >= 3;
    },
    [getPopularityScore]
  );

  // Refresh favorites count (call this when favorites change)
  const refreshFavoritesCount = useCallback(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        const favorites: string[] = JSON.parse(storedFavorites);
        const counts: PopularityData = {};
        favorites.forEach((id) => {
          counts[id] = (counts[id] || 0) + 1;
        });
        setFavoritesCount(counts);
      }
    } catch (error) {
      console.error("Error refreshing favorites count:", error);
    }
  }, []);

  return {
    trackDirectionsClick,
    getPopularityScore,
    isPopular,
    refreshFavoritesCount,
    directionsCount,
  };
}
