import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UploadProgress {
  total: number;
  completed: number;
  failed: number;
  currentFile: string;
  status: 'idle' | 'uploading' | 'complete' | 'error';
  errors: string[];
}

interface UploadResult {
  urls: string[];
  errors: string[];
}

const MAX_CONCURRENT_UPLOADS = 3;
const MAX_RETRIES = 2;

async function uploadSingleImage(
  file: File,
  listingId: string,
  editToken?: string,
  retries = 0
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('listingId', listingId);
    if (editToken) {
      formData.append('editToken', editToken);
    }

    const { data, error } = await supabase.functions.invoke('upload-listing-image', {
      body: formData,
    });

    if (error) {
      // Check if it's a rate limit error and we should retry
      if (error.message?.includes('rate') && retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (retries + 1)));
        return uploadSingleImage(file, listingId, editToken, retries + 1);
      }
      return { success: false, error: error.message || 'Upload failed' };
    }

    if (!data?.success) {
      // Retry on server errors
      if (retries < MAX_RETRIES && data?.error?.includes('server')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
        return uploadSingleImage(file, listingId, editToken, retries + 1);
      }
      return { success: false, error: data?.error || 'Upload failed' };
    }

    return { success: true, url: data.url };
  } catch (err: any) {
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
      return uploadSingleImage(file, listingId, editToken, retries + 1);
    }
    return { success: false, error: err.message || 'Network error' };
  }
}

export function useImageUpload() {
  const [progress, setProgress] = useState<UploadProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    currentFile: '',
    status: 'idle',
    errors: [],
  });
  
  const abortRef = useRef(false);

  const resetProgress = useCallback(() => {
    setProgress({
      total: 0,
      completed: 0,
      failed: 0,
      currentFile: '',
      status: 'idle',
      errors: [],
    });
    abortRef.current = false;
  }, []);

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  const uploadImages = useCallback(async (
    files: File[],
    listingId: string,
    editToken?: string
  ): Promise<UploadResult> => {
    if (files.length === 0) {
      return { urls: [], errors: [] };
    }

    abortRef.current = false;
    const urls: string[] = [];
    const errors: string[] = [];
    
    setProgress({
      total: files.length,
      completed: 0,
      failed: 0,
      currentFile: files[0].name,
      status: 'uploading',
      errors: [],
    });

    // Process files in batches with concurrency limit
    const queue = [...files];
    let activeUploads = 0;
    let fileIndex = 0;
    const results: (string | null)[] = new Array(files.length).fill(null);
    
    const processNext = async (): Promise<void> => {
      if (abortRef.current || fileIndex >= queue.length) return;
      
      const currentIndex = fileIndex++;
      const file = queue[currentIndex];
      activeUploads++;
      
      setProgress(prev => ({
        ...prev,
        currentFile: file.name,
      }));

      const result = await uploadSingleImage(file, listingId, editToken);
      
      if (result.success && result.url) {
        results[currentIndex] = result.url;
        setProgress(prev => ({
          ...prev,
          completed: prev.completed + 1,
        }));
      } else {
        const errorMsg = `${file.name}: ${result.error}`;
        errors.push(errorMsg);
        setProgress(prev => ({
          ...prev,
          failed: prev.failed + 1,
          errors: [...prev.errors, errorMsg],
        }));
      }
      
      activeUploads--;
    };

    // Use a pool of concurrent uploads
    const runUploadPool = async (): Promise<void> => {
      const workers: Promise<void>[] = [];
      
      for (let i = 0; i < Math.min(MAX_CONCURRENT_UPLOADS, files.length); i++) {
        const worker = async () => {
          while (!abortRef.current && fileIndex < queue.length) {
            await processNext();
          }
        };
        workers.push(worker());
      }
      
      await Promise.all(workers);
    };

    await runUploadPool();

    // Collect successful URLs in order
    for (const url of results) {
      if (url) urls.push(url);
    }

    setProgress(prev => ({
      ...prev,
      status: errors.length === files.length ? 'error' : 'complete',
      currentFile: '',
    }));

    return { urls, errors };
  }, []);

  const getProgressText = useCallback((): string => {
    const { status, total, completed, failed, currentFile } = progress;
    
    if (status === 'idle') return '';
    if (status === 'complete') {
      if (failed > 0) {
        return `Uploaded ${completed} of ${total} photos (${failed} failed)`;
      }
      return `All ${total} photos uploaded successfully`;
    }
    if (status === 'error') {
      return `Upload failed: ${failed} of ${total} photos could not be uploaded`;
    }
    
    // Uploading
    const remaining = total - completed - failed;
    if (currentFile) {
      return `Uploading ${currentFile} (${completed + 1}/${total})...`;
    }
    return `Uploading photos (${completed}/${total})...`;
  }, [progress]);

  return {
    progress,
    uploadImages,
    resetProgress,
    abort,
    getProgressText,
    isUploading: progress.status === 'uploading',
  };
}

// Helper function for simple usage without hook
export async function uploadListingImagesWithProgress(
  files: File[],
  listingId: string,
  editToken?: string,
  onProgress?: (completed: number, total: number, currentFile: string) => void
): Promise<{ urls: string[]; errors: string[] }> {
  if (files.length === 0) {
    return { urls: [], errors: [] };
  }

  const urls: string[] = [];
  const errors: string[] = [];
  const results: (string | null)[] = new Array(files.length).fill(null);
  
  let fileIndex = 0;
  
  const processNext = async (): Promise<void> => {
    if (fileIndex >= files.length) return;
    
    const currentIndex = fileIndex++;
    const file = files[currentIndex];
    
    onProgress?.(currentIndex, files.length, file.name);

    const result = await uploadSingleImage(file, listingId, editToken);
    
    if (result.success && result.url) {
      results[currentIndex] = result.url;
    } else {
      errors.push(`${file.name}: ${result.error}`);
    }
  };

  // Use a pool of concurrent uploads
  const workers: Promise<void>[] = [];
  
  for (let i = 0; i < Math.min(MAX_CONCURRENT_UPLOADS, files.length); i++) {
    const worker = async () => {
      while (fileIndex < files.length) {
        await processNext();
      }
    };
    workers.push(worker());
  }
  
  await Promise.all(workers);

  // Collect successful URLs in order
  for (const url of results) {
    if (url) urls.push(url);
  }

  return { urls, errors };
}
