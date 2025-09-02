import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Flag,
  Trash2,
  AlertTriangle,
  Package,
  TrendingUp,
  Users,
  AlertCircle,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProducts } from "@/hooks/queries/useProductQueries";
import { useCategories } from "@/hooks/queries/useCategoryQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Product, Category } from "@/types";
import { DataTable } from "@/components/dashboard/shared/DataTable";
import { columns } from "./products/columns";
import { Table as TanstackTable } from "@tanstack/react-table";
import {
  FilterBar,
  FilterState,
} from "@/components/dashboard/shared/FilterBar";
import { Pagination } from "@/components/dashboard/shared/Pagination";

const StatsCards = ({ products = [] }: { products?: Product[] }) => {
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === "disponible").length;
    const reported = products.filter((p) => (p.reports || 0) > 0).length;
    const pending = products.filter(
      (p) => p.status === "bientôt disponible"
    ).length;

    return { total, active, reported, pending };
  }, [products]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="glass-card border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Total Produits</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {stats.total}
              </p>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Produits Actifs</p>
              <p className="text-2xl font-bold text-green-400">
                {stats.active}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">En Attente</p>
              <p className="text-2xl font-bold text-yellow-400">
                {stats.pending}
              </p>
            </div>
            <Users className="h-8 w-8 text-yellow-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Signalés</p>
              <p className="text-2xl font-bold text-red-400">
                {stats.reported}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProductsManagement = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    category: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: categories } = useCategories();

  const { data: products, isLoading, isError, error } = useProducts();

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      // Search filter
      if (
        filters.search &&
        !product.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (
        filters.status.length > 0 &&
        !filters.status.includes(product.status || "disponible")
      ) {
        return false;
      }

      // Category filter
      if (filters.category && product.categoryId !== filters.category) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const renderProductActions = (table: TanstackTable<Product>) => {
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    const handleStatusChange = (status: Product["status"]) => {
      console.log(
        `Changement du statut à "${status}" pour les produits:`,
        selectedRows.map((r) => r.id)
      );
      // Mettez ici la logique de mutation pour changer le statut
      table.resetRowSelection();
    };

    const handleDelete = () => {
      console.log(
        "Suppression des produits:",
        selectedRows.map((r) => r.id)
      );
      // Mettez ici la logique de mutation pour supprimer
      table.resetRowSelection();
    };

    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Changer le statut ({selectedRows.length})
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card">
            <DropdownMenuItem onClick={() => handleStatusChange("disponible")}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Disponible
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("indisponible")}
            >
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              Indisponible
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("bientôt disponible")}
            >
              <Clock className="mr-2 h-4 w-4 text-yellow-500" />
              Bientôt disponible
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={selectedRows.length === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer ({selectedRows.length})
        </Button>
      </div>
    );
  };

  if (isLoading) return <ProductsManagementSkeleton />;

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-900/20 border-red-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-red-400">Erreur</AlertTitle>
        <AlertDescription className="text-red-300">
          Impossible de charger les produits. Veuillez réessayer plus tard.
          {error && (
            <pre className="mt-2 text-xs">{(error as Error).message}</pre>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-muted-foreground mb-2">
            Gestion des produits
          </h1>
          <p className="text-foreground">
            Surveillez et modérez tous les produits de la plateforme
          </p>
        </div>

        <StatsCards products={filteredProducts} />

        <Card className="glass-card-2 border-slate-700">
          <CardHeader className="border-b border-slate-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-muted-foreground">
                  Produits
                </CardTitle>
                <CardDescription className="text-foreground">
                  Liste de tous les produits publiés sur la plateforme
                </CardDescription>
              </div>
            </div>

            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              statusOptions={[
                { value: "disponible", label: "Disponible" },
                { value: "indisponible", label: "Indisponible" },
                { value: "bientôt disponible", label: "Bientôt disponible" },
              ]}
              categoryOptions={categories?.map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))}
            />
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={paginatedProducts}
                renderRowSelectionActions={renderProductActions}
              />
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
