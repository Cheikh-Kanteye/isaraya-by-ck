import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Search,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Share2,
  Bookmark,
  Download,
  RefreshCw,
} from "lucide-react";

interface CatalogActionsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onRefresh: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
  resultsCount: number;
}

const sortOptions = [
  { value: "name-asc", label: "Nom (A-Z)", icon: SortAsc },
  { value: "name-desc", label: "Nom (Z-A)", icon: SortDesc },
  { value: "price-asc", label: "Prix croissant", icon: SortAsc },
  { value: "price-desc", label: "Prix décroissant", icon: SortDesc },
  { value: "rating-desc", label: "Mieux notés", icon: SortDesc },
  { value: "newest", label: "Plus récents", icon: SortDesc },
  { value: "popular", label: "Populaires", icon: SortDesc },
];

export function CatalogActions({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onRefresh,
  onShare,
  onBookmark,
  onExport,
  isLoading = false,
  resultsCount,
}: CatalogActionsProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearchQuery);
  };

  const handleSearchClear = () => {
    setLocalSearchQuery("");
    onSearchChange("");
  };

  const currentSortOption =
    sortOptions.find((option) => option.value === sortBy) || sortOptions[0];

  return (
    <div className="glass-card border rounded-lg p-4 mb-6 space-y-4">
      {/* Search Results Summary */}
      {searchQuery && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-primary">
              <Search className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Recherche active :{" "}
                <span className="font-medium">"{searchQuery}"</span>
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearchClear}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              Effacer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
