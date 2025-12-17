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
import { Search, MapPin, SlidersHorizontal, X, Home } from "lucide-react";
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
  const [address, setAddress] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter listings for address suggestions
  const addressSuggestions = useMemo(() => {
    if (!address || address.length < 2) return [];
    
    const searchLower = address.toLowerCase();
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
  }, [address, listings]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node)
      ) {
        setShowAddressSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    onFilterChange({ search, province, suburb, address, tags: selectedTags });
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  const handleAddressSuggestionClick = (suggestion: { fullAddress: string; suburb: string }) => {
    setAddress(suggestion.fullAddress);
    setShowAddressSuggestions(false);
    // Auto-fill suburb if empty
    if (!suburb) {
      setSuburb(suggestion.suburb);
    }
    // Trigger search immediately
    onFilterChange({ 
      search, 
      province, 
      suburb: suburb || suggestion.suburb, 
      address: suggestion.fullAddress, 
      tags: selectedTags 
    });
  };

  const clearFilters = () => {
    setSearch("");
    setProvince("");
    setSuburb("");
    setAddress("");
    setSelectedTags([]);
    onFilterChange({ search: "", province: "", suburb: "", address: "", tags: [] });
  };

  const hasActiveFilters = search || province || suburb || address || selectedTags.length > 0;
  const activeFilterCount = 
    (province ? 1 : 0) + 
    (suburb ? 1 : 0) + 
    (address ? 1 : 0) +
    selectedTags.length;

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by street address, suburb, city or any keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 bg-secondary border-border h-12"
          />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Street Address</label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  ref={addressInputRef}
                  type="text"
                  placeholder="e.g. 11 Eland Street"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setShowAddressSuggestions(true);
                  }}
                  onFocus={() => setShowAddressSuggestions(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 bg-background border-border"
                />
                
                {/* Address Suggestions Dropdown */}
                {showAddressSuggestions && addressSuggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
                  >
                    {addressSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => handleAddressSuggestionClick(suggestion)}
                        className="w-full px-3 py-2 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0"
                      >
                        <div className="font-medium text-sm">{suggestion.display}</div>
                        <div className="text-xs text-muted-foreground">
                          {suggestion.suburb}, {suggestion.city}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
