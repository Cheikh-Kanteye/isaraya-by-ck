import { useCategory } from "@/hooks/queries/useCategoryQueries";
import { Skeleton } from "@/components/ui/skeleton";

export const CategoryName = ({ categoryId }: { categoryId: string }) => {
  const { data: category, isLoading } = useCategory(categoryId);
  if (isLoading) return <Skeleton className="h-4 w-24 bg-slate-700" />;
  return <>{category?.name}</>;
};
