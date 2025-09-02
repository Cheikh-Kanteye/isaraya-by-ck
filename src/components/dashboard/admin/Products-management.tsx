import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MoreHorizontal,
  Eye,
  Flag,
  Trash2,
  AlertTriangle,
  Filter,
  X,
  Package,
  TrendingUp,
  Users,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/hooks/queries/useProductQueries";
import { useCategories } from "@/hooks/queries/useCategoryQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Product, Category } from "@/types";
import { DataTable } from "@/components/dashboard/shared/DataTable";
import { columns } from "./produit/columns";

interface FilterState {
  search: string;
  status: string[];
  category: string;
  priceRange: { min: number; max: number };
  dateRange: string;
  hasReports: boolean | null;
}

const StatsCards = ({ products = [] }: { products?: Product[] }) => {
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === "disponible").length;
    const outOfStock = products.filter(
      (p) => p.status === "indisponible"
    ).length;
    const reported = products.filter((p) => (p.reports || 0) > 0).length;
    return { total, active, outOfStock, reported };
  }, [products]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="glass-card border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">
            Total des produits
          </CardTitle>
          <Package className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-muted-foreground">
            {stats.total}
          </div>
        </CardContent>
      </Card>
      <Card className="glass-card border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">
            Produits actifs
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-muted-foreground">
            {stats.active}
          </div>
        </CardContent>
      </Card>
      <Card className="glass-card border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">
            Produits indisponibles
          </CardTitle>
          <Users className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-muted-foreground">
            {stats.outOfStock}
          </div>
        </CardContent>
      </Card>
      <Card className="glass-card border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">
            Produits signalés
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-muted-foreground">
            {stats.reported}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FilterBar = ({
  filters,
  onFiltersChange,
  categories = [],
}: {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories?: Category[];
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: [],
      category: "",
      priceRange: { min: 0, max: 1000000 },
      dateRange: "",
      hasReports: null,
    });
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground" />
        <Input
          placeholder="Rechercher un produit..."
          value={filters.search}
          onChange={handleInputChange}
          className="pl-10 w-full glass-card border-slate-700 focus:ring-slate-500"
        />
      </div>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="glass-card border-slate-700 hover:bg-slate-800"
            >
              <Filter className="mr-2 h-4 w-4" />
              Statut
              {filters.status.length > 0 && ` (${filters.status.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-card border-slate-700">
            <DropdownMenuCheckboxItem
              checked={filters.status.includes("disponible")}
              onCheckedChange={() => handleStatusChange("disponible")}
            >
              Disponible
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.status.includes("indisponible")}
              onCheckedChange={() => handleStatusChange("indisponible")}
            >
              Indisponible
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.status.includes("bientôt disponible")}
              onCheckedChange={() => handleStatusChange("bientôt disponible")}
            >
              Bientôt disponible
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Select onValueChange={handleCategoryChange} value={filters.category}>
          <SelectTrigger className="w-[180px] glass-card border-slate-700 hover:bg-slate-800">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent className="glass-card border-slate-700">
            <SelectItem value="">Toutes les catégories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filters.search || filters.status.length > 0 || filters.category) && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="hover:bg-slate-800"
          >
            <X className="mr-2 h-4 w-4" />
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
};

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}) => {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-foreground">
        {totalItems} produits au total
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-slate-300">
            Produits par page
          </p>
          <Select
            value={`${itemsPerPage}`}
            onValueChange={(value) => {
              onItemsPerPageChange(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px] glass-card border-slate-700">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent side="top" className="glass-card border-slate-700">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium text-slate-300">
          Page {currentPage} sur {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex glass-card border-slate-700"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 glass-card border-slate-700"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 glass-card border-slate-700"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex glass-card border-slate-700"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProductsManagement = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    category: "",
    priceRange: { min: 0, max: 1000000 },
    dateRange: "",
    hasReports: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) =>
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      )
      .filter(
        (p) =>
          filters.status.length === 0 || filters.status.includes(p.status || "")
      )
      .filter((p) => !filters.category || p.categoryId === filters.category);
  }, [products, filters]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <ProductsManagementSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-muted-foreground p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Gestion des Produits</h1>
          <p className="text-foreground mt-1">
            Gérez, ajoutez et suivez les produits de votre boutique.
          </p>
        </header>

        <StatsCards products={filteredProducts} />

        <Card className="glass-card border-slate-700">
          <CardHeader>
            <CardTitle>Liste des produits</CardTitle>
            <CardDescription>
              {filteredProducts.length} produits trouvés
            </CardDescription>
            <div className="mt-4">
              <FilterBar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                categories={categories}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <DataTable columns={columns} data={paginatedProducts} />
            </div>

            {filteredProducts.length > 0 && (
              <div className="border-t border-slate-700 p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProducts.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ProductsManagementSkeleton = () => (
  <div className="min-h-screen bg-slate-900 p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Skeleton className="h-9 w-1/3 bg-slate-700" />
        <Skeleton className="h-5 w-1/2 mt-2 bg-slate-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-card border-slate-700">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2 bg-slate-700" />
              <Skeleton className="h-8 w-16 bg-slate-700" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-slate-700">
        <CardHeader>
          <Skeleton className="h-7 w-48 bg-slate-700" />
          <Skeleton className="h-5 w-1/3 bg-slate-700" />
          <div className="flex items-center space-x-2 mt-4">
            <Skeleton className="h-10 w-64 bg-slate-700" />
            <Skeleton className="h-10 w-24 bg-slate-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4">
                <Skeleton className="h-5 w-1/4 bg-slate-700" />
                <Skeleton className="h-5 w-1/6 bg-slate-700" />
                <Skeleton className="h-5 w-1/6 bg-slate-700" />
                <Skeleton className="h-5 w-1/6 bg-slate-700" />
                <Skeleton className="h-5 w-1/6 bg-slate-700" />
                <Skeleton className="h-8 w-8 rounded-full bg-slate-700" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default ProductsManagement;
