import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ImageUploader({ 
  images, 
  onImagesChange, 
  maxImages = 10, 
  maxSizeMB = 5 
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `${file.name} is not a supported image type. Use JPEG, PNG, WebP, or GIF.`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `${file.name} is too large. Maximum size is ${maxSizeMB}MB.`;
    }
    return null;
  }, [maxSizeMB]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const remainingSlots = maxImages - images.length;
    
    if (remainingSlots <= 0) {
      toast({
        title: "Maximum images reached",
        description: `You can only upload up to ${maxImages} images.`,
        variant: "destructive",
      });
      return;
    }

    const filesToAdd: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray.slice(0, remainingSlots)) {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        filesToAdd.push(file);
      }
    }

    if (errors.length > 0) {
      toast({
        title: "Some files couldn't be added",
        description: errors[0],
        variant: "destructive",
      });
    }

    if (filesToAdd.length > 0) {
      onImagesChange([...images, ...filesToAdd]);
    }

    if (fileArray.length > remainingSlots) {
      toast({
        title: "Some files were skipped",
        description: `Only ${remainingSlots} more image(s) can be added.`,
        variant: "destructive",
      });
    }
  }, [images, maxImages, onImagesChange, validateFile]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  }, [addFiles]);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <label
        className={cn(
          "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragging 
            ? "border-primary bg-primary/10" 
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          images.length >= maxImages && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <Upload className={cn(
            "w-10 h-10 mb-3",
            isDragging ? "text-primary" : "text-muted-foreground"
          )} />
          <p className="mb-2 text-sm text-foreground">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP or GIF (max {maxSizeMB}MB each)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {images.length}/{maxImages} images
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          onChange={handleFileSelect}
          disabled={images.length >= maxImages}
        />
      </label>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative group aspect-square">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span>The first image will be used as the cover photo</span>
        </div>
      )}
    </div>
  );
}
