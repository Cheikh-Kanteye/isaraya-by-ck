/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useSearchPerformance.ts
import React, { useMemo, useCallback, useRef, useEffect } from "react";

// Hook pour optimiser les performances de recherche
export function useSearchPerformance() {
  const renderCountRef = useRef(0);
  const lastSearchRef = useRef<string>("");

  // Compteur de rendus pour le debug
  useEffect(() => {
    renderCountRef.current += 1;
    if (process.env.NODE_ENV === "development") {
      console.log(`Search component rendered: ${renderCountRef.current} times`);
    }
  });

  // Mémoriser les options de tri pour éviter les re-créations
  const sortByItems = useMemo(
    () => [
      { label: "Pertinence", value: "products" },
      { label: "Prix croissant", value: "products:price:asc" },
      { label: "Prix décroissant", value: "products:price:desc" },
      { label: "Nom A-Z", value: "products:name:asc" },
      { label: "Nom Z-A", value: "products:name:desc" },
    ],
    []
  );

  // Classes CSS mémorisées pour le dark mode
  const darkModeClasses = useMemo(
    () => ({
      searchBox: {
        root: "relative",
        form: "relative",
        input:
          "w-full px-4 py-3 text-lg bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200",
      },
      refinementList: {
        list: "space-y-2",
        item: "flex items-center",
        label:
          "flex items-center cursor-pointer hover:text-primary transition-colors group w-full",
        checkbox: "mr-2 accent-primary",
        labelText:
          "text-sm text-muted-foreground group-hover:text-foreground flex-grow",
        count:
          "ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full",
      },
      stats: {
        root: "text-sm text-muted-foreground",
      },
      sortBy: {
        select:
          "px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent",
      },
      hits: {
        root: "mb-8",
        list: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
        item: "",
      },
      clearRefinements: {
        button: "text-sm text-primary hover:underline transition-colors",
      },
    }),
    []
  );

  // Fonction pour optimiser les hit components
  const createOptimizedHitComponent = useCallback(
    (HitComponent: React.ComponentType<any>) => {
      const OptimizedHit = React.memo(({ hit }: { hit: any }) => {
        return <HitComponent product={hit} />;
      });

      OptimizedHit.displayName = "OptimizedHit";
      return OptimizedHit;
    },
    []
  );

  // Debounce pour les requêtes de recherche
  const debounceSearch = useCallback(
    (callback: Function, delay: number = 300) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback.apply(null, args), delay);
      };
    },
    []
  );

  return {
    sortByItems,
    darkModeClasses,
    createOptimizedHitComponent,
    debounceSearch,
    renderCount: renderCountRef.current,
  };
}
