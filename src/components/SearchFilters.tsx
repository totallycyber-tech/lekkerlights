import { useState } from "react";
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
import { LocationFilter } from "@/components/LocationFilter";

export interface SearchFilters {
  search: string;
  province: string;
  suburb: string;
  tags: string[];
  location: { lat: number; lng: number; label: string } | null;
  radius: number | null;
}

interface SearchFiltersProps {
  onFilterChange: (filters: SearchFilters) => void;
}

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  const [suburb, setSuburb] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [radius, setRadius] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = () => {
    onFilterChange({ search, province, suburb, tags: selectedTags, location, radius });
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    onFilterChange({ search, province, suburb, tags, location, radius });
  };

  const handleLocationChange = (newLocation: { lat: number; lng: number; label: string } | null) => {
    setLocation(newLocation);
    onFilterChange({ search, province, suburb, tags: selectedTags, location: newLocation, radius });
  };

  const handleRadiusChange = (newRadius: number | null) => {
    setRadius(newRadius);
    onFilterChange({ search, province, suburb, tags: selectedTags, location, radius: newRadius });
  };

  const clearFilters = () => {
    setSearch("");
    setProvince("");
    setSuburb("");
    setSelectedTags([]);
    setLocation(null);
    setRadius(null);
    onFilterChange({ search: "", province: "", suburb: "", tags: [], location: null, radius: null });
  };

  const hasActiveFilters = search || province || suburb || selectedTags.length > 0 || location;
  const activeFilterCount = 
    (province ? 1 : 0) + 
    (suburb ? 1 : 0) + 
    selectedTags.length + 
    (location ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title, suburb, or city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setTimeout(handleFilterChange, 300);
            }}
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
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <div className="p-4 bg-secondary rounded-lg border border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Province</label>
              <Select 
                value={province || "all"} 
                onValueChange={(value) => {
                  setProvince(value === "all" ? "" : value);
                  setTimeout(handleFilterChange, 0);
                }}
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
                  onChange={(e) => {
                    setSuburb(e.target.value);
                    setTimeout(handleFilterChange, 300);
                  }}
                  className="pl-9 bg-background border-border"
                />
              </div>
            </div>
          </div>

          {/* Location / Distance Filter */}
          <LocationFilter
            location={location}
            radius={radius}
            onLocationChange={handleLocationChange}
            onRadiusChange={handleRadiusChange}
          />

          {/* Tag Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Tags</label>
            <TagFilter 
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
            />
          </div>

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
      )}
    </div>
  );
}
