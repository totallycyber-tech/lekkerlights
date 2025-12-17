import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import { provinces } from "@/data/mockListings";
import { TagFilter } from "@/components/TagFilter";

export interface SearchFilters {
  search: string;
  province: string;
  suburb: string;
  address: string;
  tags: string[];
}

interface ListingForSearch {
  id: string;
  street_number: string;
  street_name: string;
  suburb: string;
  city: string;
  province: string;
  complex_name?: string | null;
  unit_no?: string | null;
}

interface SearchFiltersProps {
  onFilterChange: (filters: SearchFilters) => void;
  listings?: ListingForSearch[];
}

export function SearchFilters({ onFilterChange, listings = [] }: SearchFiltersProps) {
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  const [suburb, setSuburb] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter listings for address suggestions based on main search input
  const addressSuggestions = useMemo(() => {
    if (!search || search.length < 2) return [];
    
    const searchLower = search.toLowerCase();
    return listings
      .filter(listing => {
        const fullAddress = `${listing.street_number} ${listing.street_name}`.toLowerCase();
        const streetName = listing.street_name.toLowerCase();
        const streetNumber = listing.street_number.toLowerCase();
        
        return fullAddress.includes(searchLower) || 
               streetName.includes(searchLower) || 
               streetNumber.includes(searchLower);
      })
      .slice(0, 5) // Limit to 5 suggestions
      .map(listing => {
        let addressParts = [`${listing.street_number} ${listing.street_name}`];
        if (listing.complex_name) {
          addressParts.push(listing.complex_name);
        }
        if (listing.unit_no) {
          addressParts.unshift(`Unit ${listing.unit_no}`);
        }
        return {
          id: listing.id,
          display: addressParts.join(", "),
          fullAddress: `${listing.street_number} ${listing.street_name}`,
          suburb: listing.suburb,
          city: listing.city,
        };
      });
  }, [search, listings]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    setShowSuggestions(false);
    onFilterChange({ search, province, suburb, address: "", tags: selectedTags });
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  const handleSuggestionClick = (suggestion: { fullAddress: string; suburb: string }) => {
    setSearch(suggestion.fullAddress);
    setShowSuggestions(false);
    // Trigger search immediately with the selected address
    onFilterChange({ 
      search: suggestion.fullAddress, 
      province, 
      suburb, 
      address: "", 
      tags: selectedTags 
    });
  };

  const clearFilters = () => {
    setSearch("");
    setProvince("");
    setSuburb("");
    setSelectedTags([]);
    onFilterChange({ search: "", province: "", suburb: "", address: "", tags: [] });
  };

  const hasActiveFilters = search || province || suburb || selectedTags.length > 0;
  const activeFilterCount = 
    (province ? 1 : 0) + 
    (suburb ? 1 : 0) +
    selectedTags.length;

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search by street address, suburb, city or any keyword..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 bg-secondary border-border h-12"
          />
          
          {/* Live Address Suggestions Dropdown */}
          {showSuggestions && addressSuggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border bg-muted/50">
                Matching addresses
              </div>
              {addressSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-2.5 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0 flex items-start gap-2"
                >
                  <MapPin className="h-4 w-4 mt-0.5 text-christmas shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{suggestion.display}</div>
                    <div className="text-xs text-muted-foreground">
                      {suggestion.suburb}, {suggestion.city}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant={showFilters ? "default" : "outline"}
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
          className="h-12"
        >
          <SlidersHorizontal className="h-5 w-5 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-christmas text-christmas-foreground text-xs px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <Button
          size="lg"
          onClick={handleSearch}
          className="h-12 bg-christmas hover:bg-christmas/90"
        >
          <Search className="h-5 w-5 mr-2" />
          Search
        </Button>
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <div className="p-4 bg-secondary rounded-lg border border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Province</label>
              <Select 
                value={province || "all"} 
                onValueChange={(value) => setProvince(value === "all" ? "" : value)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="All Provinces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  {provinces.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Suburb / Area</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter suburb..."
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 bg-background border-border"
                />
              </div>
            </div>
          </div>

          {/* Tag Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Tags</label>
            <TagFilter 
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
            />
          </div>

          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
