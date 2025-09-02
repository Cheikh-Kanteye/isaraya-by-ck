import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingSkeletonProps {
  count?: number;
  type?: "product" | "filter" | "stats" | "search";
}

interface CatalogLoadingStatesProps {
  children: ReactNode;
  isLoading: boolean;
  error?: string | null;
  fallback?: ReactNode;
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2 mb-3" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </CardContent>
    </Card>
  );
}

// Filter Section Skeleton
export function FilterSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>

      {/* Price Range Skeleton */}
      <div>
        <Skeleton className="h-4 w-12 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Categories Skeleton */}
      <div>
        <Skeleton className="h-5 w-24 mb-2" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Brands Skeleton */}
      <div>
        <Skeleton className="h-5 w-20 mb-2" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stats Skeleton
export function StatsSkeleton() {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Search Actions Skeleton
export function SearchActionsSkeleton() {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search Bar Skeleton */}
            <div className="flex-1 max-w-md">
              <Skeleton className="h-10 w-full" />
            </div>

            {/* View Mode Toggle Skeleton */}
            <Skeleton className="h-10 w-20" />
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <Skeleton className="h-4 w-32" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Generic Loading Skeleton based on type
export function LoadingSkeleton({
  count = 1,
  type = "product",
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case "product":
        return <ProductCardSkeleton />;
      case "filter":
        return <FilterSkeleton />;
      case "stats":
        return <StatsSkeleton />;
      case "search":
        return <SearchActionsSkeleton />;
      default:
        return <ProductCardSkeleton />;
    }
  };

  if (type === "product") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }, (_, i) => (
          <div key={i}>{renderSkeleton()}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}

// Main Catalog Loading States Wrapper
export function CatalogLoadingStates({
  children,
  isLoading,
  error,
  fallback,
}: CatalogLoadingStatesProps) {
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      fallback || (
        <div className="space-y-6">
          <SearchActionsSkeleton />
          <StatsSkeleton />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <FilterSkeleton />
            </aside>
            <main className="lg:col-span-3">
              <LoadingSkeleton count={6} type="product" />
            </main>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Transition wrapper for smooth loading states
export function SmoothTransition({
  children,
  isVisible = true,
  duration = 300,
}: {
  children: ReactNode;
  isVisible?: boolean;
  duration?: number;
}) {
  return (
    <div
      className={`transition-all ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// Staggered animation for product grids
export function StaggeredGrid({
  children,
  staggerDelay = 50,
}: {
  children: ReactNode[];
  staggerDelay?: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children.map((child, index) => (
        <div
          key={index}
          className="animate-fade-in"
          style={{
            animationDelay: `${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
