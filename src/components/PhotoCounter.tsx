import { Camera, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoCounterProps {
  coverPhoto: File | null;
  existingImages?: number;
  additionalImages: number;
  maxAdditional?: number;
  className?: string;
}

export function PhotoCounter({
  coverPhoto,
  existingImages = 0,
  additionalImages,
  maxAdditional = 15,
  className,
}: PhotoCounterProps) {
  const hasCover = coverPhoto !== null || existingImages > 0;
  const totalAdditional = additionalImages + Math.max(0, existingImages - (hasCover ? 1 : 0));
  const totalPhotos = (hasCover ? 1 : 0) + totalAdditional;
  const isNearLimit = totalAdditional >= maxAdditional - 2;
  const isAtLimit = totalAdditional >= maxAdditional;

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <Camera className="h-4 w-4 text-muted-foreground" />
      <span className={cn(
        "font-medium",
        isAtLimit ? "text-destructive" : isNearLimit ? "text-yellow-600" : "text-muted-foreground"
      )}>
        {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''} 
        <span className="text-muted-foreground font-normal">
          {' '}(1 cover + {totalAdditional}/{maxAdditional} additional)
        </span>
      </span>
      {isNearLimit && !isAtLimit && (
        <span className="text-yellow-600 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Near limit
        </span>
      )}
      {isAtLimit && (
        <span className="text-destructive flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Limit reached
        </span>
      )}
    </div>
  );
}
