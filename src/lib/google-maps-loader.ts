// Singleton Google Maps loader to prevent multiple script loads
let loadPromise: Promise<void> | null = null;
let isLoaded = false;
let usedApiKey: string | null = null;

export function loadGoogleMaps(apiKey: string): Promise<void> {
  // Reject empty API keys
  if (!apiKey || apiKey.trim() === '') {
    return Promise.reject(new Error('Invalid or empty API key'));
  }

  // Already loaded with same key
  if (isLoaded && window.google?.maps) {
    // If loaded with different key, just return (gracefully handle)
    if (usedApiKey && usedApiKey !== apiKey) {
      console.warn('Google Maps already loaded with different key, using existing');
    }
    return Promise.resolve();
  }

  // Already loading - return existing promise
  if (loadPromise) {
    return loadPromise;
  }

  // Store the API key being used
  usedApiKey = apiKey;

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
      usedApiKey = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return isLoaded && !!window.google?.maps;
}

// Reset the loader state (for refresh functionality)
export function resetGoogleMapsLoader(): void {
  // Remove existing script
  const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
  if (existingScript) {
    existingScript.remove();
  }
  // Clear google maps from window
  if (window.google?.maps) {
    delete (window as any).google.maps;
  }
  loadPromise = null;
  isLoaded = false;
  usedApiKey = null;
}
