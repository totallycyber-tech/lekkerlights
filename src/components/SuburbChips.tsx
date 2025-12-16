import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Listing } from "@/data/mockListings";

interface SuburbChipsProps {
  listings: Listing[];
  selectedSuburb: string;
  selectedProvince: string;
  onSuburbSelect: (suburb: string) => void;
}

export function SuburbChips({ 
  listings, 
  selectedSuburb, 
  selectedProvince,
  onSuburbSelect 
}: SuburbChipsProps) {
  // Extract unique suburbs with counts, filtered by province if selected
  const suburbData = useMemo(() => {
    const filteredListings = selectedProvince 
      ? listings.filter(l => l.location.province === selectedProvince)
      : listings;
    
    const suburbCounts = filteredListings.reduce((acc, listing) => {
      const suburb = listing.location.suburb;
      if (suburb) {
        acc[suburb] = (acc[suburb] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Sort by count (descending) then alphabetically
    return Object.entries(suburbCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([suburb, count]) => ({ suburb, count }));
  }, [listings, selectedProvince]);

  // Don't render if no suburbs available
  if (suburbData.length === 0) return null;

  const totalCount = listings.filter(l => 
    !selectedProvince || l.location.province === selectedProvince
  ).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>Quick filter by suburb:</span>
      </div>
      
      {/* Scrollable container with fade edges */}
      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none sm:hidden" />
        
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none sm:hidden" />
        
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-1 sm:flex-wrap sm:overflow-visible">
          {/* All Areas Chip */}
          <button
            onClick={() => onSuburbSelect("")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shrink-0",
              "border hover:scale-105 active:scale-95",
              !selectedSuburb
                ? "bg-christmas text-christmas-foreground border-christmas shadow-md shadow-christmas/20"
                : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground hover:border-christmas/50"
            )}
          >
            <span>All Areas</span>
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              !selectedSuburb 
                ? "bg-christmas-foreground/20 text-christmas-foreground" 
                : "bg-muted text-muted-foreground"
            )}>
              {totalCount}
            </span>
          </button>

          {/* Suburb Chips */}
          {suburbData.map(({ suburb, count }) => {
            const isSelected = selectedSuburb.toLowerCase() === suburb.toLowerCase();
            
            return (
              <button
                key={suburb}
                onClick={() => onSuburbSelect(isSelected ? "" : suburb)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shrink-0",
                  "border hover:scale-105 active:scale-95",
                  isSelected
                    ? "bg-christmas text-christmas-foreground border-christmas shadow-md shadow-christmas/20"
                    : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground hover:border-christmas/50"
                )}
              >
                <span>{suburb}</span>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  isSelected 
                    ? "bg-christmas-foreground/20 text-christmas-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
