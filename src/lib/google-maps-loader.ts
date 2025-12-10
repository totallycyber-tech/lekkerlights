// Singleton Google Maps loader to prevent multiple script loads
let loadPromise: Promise<void> | null = null;
let isLoaded = false;

export function loadGoogleMaps(apiKey: string): Promise<void> {
  // Already loaded
  if (isLoaded && window.google?.maps) {
    return Promise.resolve();
  }

  // Already loading - return existing promise
  if (loadPromise) {
    return loadPromise;
  }

  // Check if script already exists (loaded elsewhere)
  const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
  if (existingScript) {
    loadPromise = new Promise((resolve) => {
      const checkLoaded = () => {
        if (window.google?.maps) {
          isLoaded = true;
          resolve();
        } else {
          setTimeout(checkLoaded, 50);
        }
      };
      checkLoaded();
    });
    return loadPromise;
  }

  // Load the script
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isLoaded = true;
      resolve();
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return isLoaded && !!window.google?.maps;
}
