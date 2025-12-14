import { useState, useCallback } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CoverPhotoUploaderProps {
  image: File | null;
  onImageChange: (image: File | null) => void;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function CoverPhotoUploader({ 
  image, 
  onImageChange, 
  maxSizeMB = 5 
}: CoverPhotoUploaderProps) {
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

  const handleFile = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      toast({
        title: "Invalid file",
        description: error,
        variant: "destructive",
      });
      return;
    }
    onImageChange(file);
  }, [onImageChange, validateFile]);

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
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
      e.target.value = '';
    }
  }, [handleFile]);

  const removeImage = useCallback(() => {
    onImageChange(null);
  }, [onImageChange]);

  if (image) {
    return (
      <div className="relative group">
        <div className="aspect-video rounded-xl overflow-hidden border-2 border-christmas/50 shadow-lg">
          <img
            src={URL.createObjectURL(image)}
            alt="Cover photo preview"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          onClick={removeImage}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="absolute bottom-3 left-3 bg-christmas text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
          Cover Photo
        </div>
      </div>
    );
  }

  return (
    <label
      className={cn(
        "flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300",
        isDragging 
          ? "border-christmas bg-christmas/10 scale-[1.02]" 
          : "border-border hover:border-christmas/50 hover:bg-muted/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
        <div className={cn(
          "p-4 rounded-full mb-4 transition-colors",
          isDragging ? "bg-christmas/20" : "bg-muted"
        )}>
          <ImageIcon className={cn(
            "w-8 h-8",
            isDragging ? "text-christmas" : "text-muted-foreground"
          )} />
        </div>
        <p className="mb-2 text-sm text-foreground">
          <span className="font-semibold text-christmas">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">
          This will be displayed on listing cards
        </p>
        <p className="text-xs text-christmas mt-1 font-medium">
          Upload high quality photos taken in the evening when lights are on
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPEG, PNG, WebP or GIF (max {maxSizeMB}MB)
        </p>
      </div>
      <input
        type="file"
        className="hidden"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
      />
    </label>
  );
}
