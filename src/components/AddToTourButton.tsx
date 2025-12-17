import { Button } from "@/components/ui/button";
import { Route, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AddToTourButtonProps {
  isInTour: boolean;
  isFull: boolean;
  onAdd: () => void;
  onRemove: () => void;
  listingTitle?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
  showLabel?: boolean;
}

export function AddToTourButton({
  isInTour,
  isFull,
  onAdd,
  onRemove,
  listingTitle,
  size = "sm",
  variant = "outline",
  className,
  showLabel = true,
}: AddToTourButtonProps) {
  const handleClick = () => {
    if (isInTour) {
      onRemove();
      toast({
        title: "Removed from tour",
        description: `${listingTitle || "Display"} removed from your tour.`,
      });
    } else if (isFull) {
      toast({
        title: "Tour is full",
        description: "Remove a stop to add more (max 10 stops).",
        variant: "destructive",
      });
    } else {
      onAdd();
      toast({
        title: "Added to tour!",
        description: `${listingTitle || "Display"} added to your tour.`,
      });
    }
  };

  return (
    <Button
      size={size}
      variant={isInTour ? "default" : variant}
      onClick={handleClick}
      disabled={!isInTour && isFull}
      className={cn(
        isInTour && "bg-christmas hover:bg-christmas/90",
        className
      )}
    >
      {isInTour ? (
        <>
          <Check className="h-4 w-4 mr-1.5" />
          {showLabel && "In Tour"}
        </>
      ) : (
        <>
          <Route className="h-4 w-4 mr-1.5" />
          {showLabel && "Add to Tour"}
        </>
      )}
    </Button>
  );
}
