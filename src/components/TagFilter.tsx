import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tagCategories } from "@/data/listingTags";
import { Tags, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagFilter({ selectedTags, onTagsChange }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  return (
    <div className="space-y-3">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between bg-background border-border",
              selectedTags.length > 0 && "border-christmas/50"
            )}
          >
            <span className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              {selectedTags.length > 0
                ? `${selectedTags.length} tag${selectedTags.length !== 1 ? "s" : ""} selected`
                : "Filter by tags"}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <ScrollArea className="h-80">
            <div className="p-4 space-y-4">
              {tagCategories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {category.name}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {category.tags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all duration-200 text-xs",
                            isSelected
                              ? "bg-christmas/20 text-christmas border-christmas/50 hover:bg-christmas/30"
                              : "hover:bg-secondary hover:border-foreground/30"
                          )}
                          onClick={() => toggleTag(tag)}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 mr-1" />}
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="bg-christmas/20 text-christmas border border-christmas/30 hover:bg-christmas/30 cursor-pointer transition-colors text-xs"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllTags}
            className="text-muted-foreground hover:text-foreground h-auto py-1 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
