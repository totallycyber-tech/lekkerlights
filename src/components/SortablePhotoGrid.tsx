import { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, ImageIcon, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortablePhotoProps {
  id: string;
  url: string;
  index: number;
  isCover: boolean;
  onRemove: () => void;
  onSetAsCover: () => void;
}

function SortablePhoto({ id, url, index, isCover, onRemove, onSetAsCover }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative aspect-square rounded-lg overflow-hidden group",
        isDragging && "z-50 opacity-90 ring-2 ring-christmas shadow-lg"
      )}
    >
      <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
      
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1.5 bg-background/80 rounded-full cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-foreground" />
      </div>
      
      {/* Remove button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 bg-destructive text-destructive-foreground rounded-full"
          title="Remove photo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Cover badge or Set as Cover button */}
      {isCover ? (
        <span className="absolute bottom-2 left-2 px-2 py-1 bg-christmas text-white text-xs rounded font-medium">
          Cover
        </span>
      ) : (
        <button
          type="button"
          onClick={onSetAsCover}
          className="absolute bottom-2 left-2 px-2 py-1 bg-background/90 hover:bg-christmas hover:text-white text-xs rounded font-medium flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
        >
          <ImageIcon className="h-3 w-3" />
          Set as Cover
        </button>
      )}
    </div>
  );
}

interface SortablePhotoGridProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onRemoveImage: (index: number) => void;
  onSetAsCover: (index: number) => void;
  compact?: boolean;
}

export function SortablePhotoGrid({
  images,
  onImagesChange,
  onRemoveImage,
  onSetAsCover,
  compact = false,
}: SortablePhotoGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredImages = useMemo(() => 
    images.filter(url => url !== ''), 
    [images]
  );

  const imageIds = useMemo(() => 
    filteredImages.map((url, index) => `${index}-${url.slice(-20)}`),
    [filteredImages]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = imageIds.indexOf(active.id as string);
      const newIndex = imageIds.indexOf(over.id as string);
      
      // Map back to actual indices in the original array
      const actualOldIndex = images.indexOf(filteredImages[oldIndex]);
      const actualNewIndex = images.indexOf(filteredImages[newIndex]);
      
      const newImages = arrayMove(images, actualOldIndex, actualNewIndex);
      onImagesChange(newImages);
    }
  };

  if (filteredImages.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={imageIds} strategy={rectSortingStrategy}>
        <div className={cn(
          "grid gap-3",
          compact 
            ? "grid-cols-3 sm:grid-cols-4 gap-2" 
            : "grid-cols-2 sm:grid-cols-3"
        )}>
          {filteredImages.map((url, displayIndex) => {
            const actualIndex = images.indexOf(url);
            const isCover = actualIndex === 0 && images[0] !== '';
            
            return (
              <SortablePhoto
                key={imageIds[displayIndex]}
                id={imageIds[displayIndex]}
                url={url}
                index={displayIndex}
                isCover={isCover}
                onRemove={() => onRemoveImage(actualIndex)}
                onSetAsCover={() => onSetAsCover(actualIndex)}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
