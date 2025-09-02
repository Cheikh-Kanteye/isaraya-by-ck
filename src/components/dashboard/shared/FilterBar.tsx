import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import type { Category } from "@/types";

// Définition générique des filtres pour la réutilisabilité
export interface FilterState {
  search: string;
  status: string[];
  category: string;
  // Ajoutez d'autres champs de filtre si nécessaire
}

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  statusOptions?: { value: string; label: string }[];
  categoryOptions?: { value: string; label: string }[];
  categoryLabel?: string;
}

export const FilterBar = ({
  filters,
  onFiltersChange,
  statusOptions = [],
  categoryOptions = [],
  categoryLabel = "Catégorie",
}: FilterBarProps) => {
  const handleFilterChange = (
    key: keyof FilterState,
    value: string | string[]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleStatusChange = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    handleFilterChange("status", newStatus);
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: [],
      category: "",
    });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status.length > 0 ||
    (filters.category !== "" && filters.category !== "all");

  return (
    <div className="flex-1 flex flex-col lg:flex-row items-center gap-4 pt-4">
      <div className="relative w-full lg:w-auto lg:flex-grow">
        <Input
          placeholder="Rechercher par mot-clé..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Statut
              {filters.status.length > 0 && (
                <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {filters.status.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card">
            {statusOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.status.includes(option.value)}
                onCheckedChange={() => handleStatusChange(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {categoryOptions.length > 0 && (
          <div>
            <Select
              value={filters.category || ""}
              onValueChange={(value) =>
                handleFilterChange("category", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={`Toutes les ${categoryLabel.toLowerCase()}s`}
                />
              </SelectTrigger>
              <SelectContent className="glass-card-2">
                <SelectItem value="all">
                  Toutes les {categoryLabel.toLowerCase()}s
                </SelectItem>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
};
