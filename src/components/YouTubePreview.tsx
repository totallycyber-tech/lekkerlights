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

const YouTubeEmbed = ({ videoId, className }: { videoId: string; className?: string }) => (
  <div className={`relative overflow-hidden rounded-lg bg-secondary ${className}`}>
    <div className="aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
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
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Video Preview</p>
      
      {validVideos.length === 1 && (
        <YouTubeEmbed videoId={validVideos[0].id} />
      )}

      {validVideos.length === 2 && (
        <div className="space-y-3">
          <YouTubeEmbed videoId={validVideos[0].id} />
          <YouTubeEmbed videoId={validVideos[1].id} className="max-w-md" />
        </div>
      )}

      {validVideos.length === 3 && (
        <div className="space-y-3">
          <YouTubeEmbed videoId={validVideos[0].id} />
          <div className="grid grid-cols-2 gap-3">
            <YouTubeEmbed videoId={validVideos[1].id} />
            <YouTubeEmbed videoId={validVideos[2].id} />
          </div>
        </div>
      )}
    </div>
  );
}
