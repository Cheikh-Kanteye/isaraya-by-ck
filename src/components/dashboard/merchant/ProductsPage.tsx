import React, { useState, useMemo, useCallback } from "react";
import { Plus, Search, Package } from "lucide-react";
import { useAuthStore } from "@/stores";
import {
  useProductsByMerchant,
  useDeleteProduct,
} from "@/hooks/queries/useProductQueries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Product } from "@/types";
import ProductForm from "./ProductForm";
import { FilterBar, FilterState } from "../shared/FilterBar";
import { Pagination } from "../shared/Pagination";
import { DataTable } from "../shared/DataTable";
import { columns, ProductColumn } from "./products/columns";

const ProductsPage: React.FC = () => {
  const { user } = useAuthStore();

  const {
    data: products = [],
    isLoading,
    error,
  } = useProductsByMerchant(user?.id || "");
  const deleteProductMutation = useDeleteProduct();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    category: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">(
    "create"
  );

  const getStockStatus = useCallback((stock: number) => {
    if (stock === 0) return "rupture";
    if (stock < 10) return "faible";
    return "en stock";
  }, []);

  const filteredProducts = useMemo(() => {
    return (products || []).filter((product) => {
      const searchMatch = product.name
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const statusMatch =
        filters.status.length === 0 ||
        filters.status.includes(getStockStatus(product.stock));
      return searchMatch && statusMatch;
    });
  }, [products, filters, getStockStatus]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleCreateProduct = useCallback(() => {
    setSelectedProduct(null);
    setDialogMode("create");
    setIsDialogOpen(true);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setDialogMode("edit");
    setIsDialogOpen(true);
  }, []);

  const handleViewProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setDialogMode("view");
    setIsDialogOpen(true);
  }, []);

  const handleDeleteProduct = useCallback(
    (productId: string) => {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
        deleteProductMutation.mutate(productId, {
          onSuccess: () => {
            toast.success("Produit supprimé avec succès");
          },
          onError: () => {
            toast.error("Erreur lors de la suppression du produit");
          },
        });
      }
    },
    [deleteProductMutation]
  );

  const productsForDataTable: ProductColumn[] = useMemo(() => {
    return paginatedProducts.map((product) => ({
      ...product,
      onEdit: handleEditProduct,
      onDelete: handleDeleteProduct,
      onView: handleViewProduct,
    }));
  }, [
    paginatedProducts,
    handleEditProduct,
    handleDeleteProduct,
    handleViewProduct,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <ProductsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Erreur lors du chargement des produits.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des produits</h1>
        <Button onClick={handleCreateProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vos produits</CardTitle>
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            statusOptions={[
              { value: "en stock", label: "En stock" },
              { value: "faible", label: "Stock faible" },
              { value: "rupture", label: "Rupture" },
            ]}
          />
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={productsForDataTable} />
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Aucun produit trouvé
              </p>
              <p className="text-sm text-muted-foreground">
                {filters.search || filters.status.length > 0
                  ? "Essayez de modifier vos filtres"
                  : "Commencez par ajouter votre premier produit"}
              </p>
            </div>
          )}
        </CardContent>
        {totalPages > 1 && (
          <div className="border-t p-4">
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
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" && "Ajouter un produit"}
              {dialogMode === "edit" && "Modifier le produit"}
              {dialogMode === "view" && "Détails du produit"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            mode={dialogMode}
            product={selectedProduct}
            onSuccess={() => setIsDialogOpen(false)}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProductsPageSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-9 w-1/4" />
      <Skeleton className="h-10 w-40" />
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-grow" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ProductsPage;
