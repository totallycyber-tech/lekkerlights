import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { tagCategories } from "@/data/listingTags";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagSelector({ selectedTags, onTagsChange, maxTags = 20 }: TagSelectorProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Selected Tags Summary */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Selected tags ({selectedTags.length}/{maxTags})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllTags}
              className="text-muted-foreground hover:text-foreground h-auto py-1 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="bg-christmas/20 text-christmas border border-christmas/30 hover:bg-christmas/30 cursor-pointer transition-colors"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Category Accordions */}
      <div className="space-y-2">
        {tagCategories.map((category) => {
          const isOpen = openCategories.includes(category.name);
          const selectedInCategory = category.tags.filter((tag) =>
            selectedTags.includes(tag)
          ).length;

          return (
            <Collapsible
              key={category.name}
              open={isOpen}
              onOpenChange={() => toggleCategory(category.name)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-between h-auto py-3 px-4 bg-secondary/50 hover:bg-secondary border border-border rounded-lg"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-sm">{category.name}</span>
                    {selectedInCategory > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-christmas/20 text-christmas text-xs px-1.5 py-0"
                      >
                        {selectedInCategory}
                      </Badge>
                    )}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="flex flex-wrap gap-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
                  {category.tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    const isDisabled = !isSelected && selectedTags.length >= maxTags;

                    return (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={cn(
                          "cursor-pointer transition-all duration-200",
                          isSelected
                            ? "bg-christmas/20 text-christmas border-christmas/50 hover:bg-christmas/30"
                            : isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-secondary hover:border-foreground/30"
                        )}
                        onClick={() => !isDisabled && toggleTag(tag)}
                      >
                        {isSelected && <Check className="h-3 w-3 mr-1" />}
                        {tag}
                      </Badge>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {selectedTags.length >= maxTags && (
        <p className="text-xs text-muted-foreground text-center">
          Maximum of {maxTags} tags reached. Remove some to add more.
        </p>
      )}
    </div>
  );
}
