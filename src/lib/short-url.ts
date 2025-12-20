import { toast } from "@/hooks/use-toast";

/**
 * Get the base URL for short URLs
 */
export function getShortUrlBase(): string {
  // Use window.location.origin in browser, or default to production URL
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://lekkerlights.co.za';
}

/**
 * Generate a full short URL from a short code
 */
export function generateShortUrl(shortCode: string | undefined | null): string {
  if (!shortCode) {
    return '';
  }
  const baseUrl = getShortUrlBase();
  return `${baseUrl}/s/${shortCode}`;
}

/**
 * Copy the short URL to clipboard and show toast notification
 */
export async function copyShortUrl(shortCode: string | undefined | null, listingTitle?: string | null): Promise<boolean> {
  if (!shortCode) {
    toast({
      title: "Unable to copy link",
      description: "Short URL is not available for this listing.",
      variant: "destructive",
    });
    return false;
  }

  const shortUrl = generateShortUrl(shortCode);
  
  try {
    await navigator.clipboard.writeText(shortUrl);
    toast({
      title: "Short link copied!",
      description: `Share ${listingTitle || 'this display'} with friends and family using this easy-to-share link.`,
    });
    return true;
  } catch (error) {
    console.error('Failed to copy short URL:', error);
    toast({
      title: "Failed to copy",
      description: "Please try again.",
      variant: "destructive",
    });
    return false;
  }
}

/**
 * Format the short code for display (e.g., "LL-A1B2C3")
 */
export function formatShortCode(shortCode: string | undefined | null): string {
  if (!shortCode) {
    return '';
  }
  return shortCode;
}
