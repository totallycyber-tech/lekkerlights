import { useMemo } from "react";

interface YouTubePreviewProps {
  urls: string[];
}

const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

const YouTubeEmbed = ({ videoId, className, index }: { videoId: string; className?: string; index?: number }) => (
  <div className={`relative overflow-hidden rounded-lg bg-secondary ${className}`}>
    <div className="aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={`Christmas lights video ${index !== undefined ? index + 1 : ''}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        loading="lazy"
      />
    </div>
  </div>
);

export function YouTubePreview({ urls }: YouTubePreviewProps) {
  const validVideos = useMemo(() => {
    return urls
      .map(url => ({ url, id: extractYouTubeId(url) }))
      .filter((v): v is { url: string; id: string } => v.id !== null);
  }, [urls]);

  if (validVideos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3" role="region" aria-label="Video previews">
      <p className="text-sm font-medium text-muted-foreground">Video Preview</p>
      
      {validVideos.length === 1 && (
        <YouTubeEmbed videoId={validVideos[0].id} index={0} />
      )}

      {validVideos.length === 2 && (
        <div className="space-y-3">
          <YouTubeEmbed videoId={validVideos[0].id} index={0} />
          <YouTubeEmbed videoId={validVideos[1].id} className="max-w-md" index={1} />
        </div>
      )}

      {validVideos.length === 3 && (
        <div className="space-y-3">
          <YouTubeEmbed videoId={validVideos[0].id} index={0} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <YouTubeEmbed videoId={validVideos[1].id} index={1} />
            <YouTubeEmbed videoId={validVideos[2].id} index={2} />
          </div>
        </div>
      )}
    </div>
  );
}
