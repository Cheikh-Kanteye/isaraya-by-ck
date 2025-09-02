import React, { useMemo } from "react";
import { SearchableSelect } from "./searchable-select";
import { useBrands } from "@/hooks/queries";

interface BrandSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function BrandSelect({
  value,
  onValueChange,
  placeholder = "Sélectionner une marque",
  disabled = false,
  className,
}: BrandSelectProps) {
  const { data: brands = [], isLoading } = useBrands();

  const brandOptions = useMemo(() => {
    return brands.map((brand) => ({
      value: brand.id,
      label: brand.name,
    }));
  }, [brands]);

  if (isLoading) {
    return <div className="h-10 bg-gray-200 animate-pulse rounded"></div>;
  }

  return (
    <SearchableSelect
      options={brandOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Rechercher une marque..."
      disabled={disabled}
      className={className}
    />
  );
}
