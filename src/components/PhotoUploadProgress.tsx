import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UploadProgress } from '@/hooks/use-image-upload';

interface PhotoUploadProgressProps {
  progress: UploadProgress;
  className?: string;
}

export function PhotoUploadProgress({ progress, className }: PhotoUploadProgressProps) {
  const { status, total, completed, failed, currentFile, errors } = progress;

  if (status === 'idle' || total === 0) return null;

  const percentage = Math.round(((completed + failed) / total) * 100);

  return (
    <div className={cn("space-y-2 p-4 rounded-lg border bg-card", className)}>
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        {status === 'uploading' && (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        )}
        {status === 'complete' && failed === 0 && (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        )}
        {status === 'complete' && failed > 0 && (
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        )}
        {status === 'error' && (
          <XCircle className="h-5 w-5 text-destructive" />
        )}
        
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">
              {status === 'uploading' && currentFile 
                ? `Uploading: ${currentFile}` 
                : status === 'complete' 
                  ? 'Upload complete' 
                  : 'Upload failed'}
            </span>
            <span className="text-muted-foreground">
              {completed}/{total} photos
            </span>
          </div>
          
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-300",
                status === 'error' ? "bg-destructive" : 
                failed > 0 ? "bg-yellow-500" : "bg-primary"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status text */}
      <div className="text-sm text-muted-foreground">
        {status === 'uploading' && (
          <span>Uploading {completed + 1} of {total} photos...</span>
        )}
        {status === 'complete' && failed === 0 && (
          <span className="text-green-600">All {total} photos uploaded successfully!</span>
        )}
        {status === 'complete' && failed > 0 && (
          <span className="text-yellow-600">
            {completed} photos uploaded, {failed} failed
          </span>
        )}
        {status === 'error' && (
          <span className="text-destructive">
            Upload failed. {completed > 0 ? `${completed} photos were saved.` : 'Please try again.'}
          </span>
        )}
      </div>

      {/* Error details */}
      {errors.length > 0 && (
        <div className="mt-2 text-xs text-destructive space-y-1 max-h-20 overflow-y-auto">
          {errors.slice(0, 3).map((error, i) => (
            <div key={i} className="flex items-start gap-1">
              <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          ))}
          {errors.length > 3 && (
            <div className="text-muted-foreground">
              ...and {errors.length - 3} more errors
            </div>
          )}
        </div>
      )}
    </div>
  );
}
