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
import { themes, provinces, Theme } from "@/data/mockListings";

interface SearchFiltersProps {
  onFilterChange: (filters: {
    search: string;
    theme: Theme | 'all';
    province: string;
    suburb: string;
  }) => void;
}

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<Theme | 'all'>('all');
  const [province, setProvince] = useState("");
  const [suburb, setSuburb] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = () => {
    onFilterChange({ search, theme, province, suburb });
  };

  const clearFilters = () => {
    setSearch("");
    setTheme('all');
    setProvince("");
    setSuburb("");
    onFilterChange({ search: "", theme: 'all', province: "", suburb: "" });
  };

  const hasActiveFilters = search || theme !== 'all' || province || suburb;

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
        
        <Select 
          value={theme} 
          onValueChange={(value) => {
            setTheme(value as Theme | 'all');
            setTimeout(handleFilterChange, 0);
          }}
        >
          <SelectTrigger className="w-full sm:w-48 bg-secondary border-border h-12">
            <SelectValue placeholder="All Themes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Themes</SelectItem>
            {themes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.emoji} {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showFilters ? "default" : "outline"}
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
          className="h-12"
        >
          <SlidersHorizontal className="h-5 w-5 mr-2" />
          Filters
        </Button>
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <div className="p-4 bg-secondary rounded-lg border border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Province</label>
              <Select 
                value={province} 
                onValueChange={(value) => {
                  setProvince(value);
                  setTimeout(handleFilterChange, 0);
                }}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="All Provinces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Provinces</SelectItem>
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
