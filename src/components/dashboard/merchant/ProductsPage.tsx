import React, { useState, useMemo } from 'react';
import { Plus, Package, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores';
import {
  useProductsByMerchant,
  useDeleteProduct,
  useCreateProduct,
  useUpdateProduct,
} from '@/hooks/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OptimisticLoader, MutationStatus } from '@/components/shared/OptimisticLoader';
import { QueryErrorBoundary } from '@/components/shared/QueryErrorBoundary';
import type { Product } from '@/types';
import ProductForm from './ProductForm';
import { FilterBar, FilterState } from '../shared/FilterBar';
import { Pagination } from '../shared/Pagination';
import { DataTable } from '../shared/DataTable';
import { columns, ProductColumn } from './products/columns';

const ProductsPage: React.FC = () => {
  const { user } = useAuthStore();
  const merchantId = user?.id || '';

  // Requêtes React Query
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useProductsByMerchant(merchantId);

  // Mutations avec optimistic updates
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // État local pour l'UI
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    category: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');

  // Fonction pour obtenir le statut du stock
  const getStockStatus = (stock: number) => {
    if (stock === 0) return 'rupture';
    if (stock < 10) return 'faible';
    return 'en stock';
  };

  // Filtrage des produits
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchMatch = product.name
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const statusMatch =
        filters.status.length === 0 ||
        filters.status.includes(getStockStatus(product.stock));
      return searchMatch && statusMatch;
    });
  }, [products, filters]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Handlers pour les actions
  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setDialogMode('create');
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setDialogMode('view');
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  // Préparer les données pour le DataTable
  const productsForDataTable: ProductColumn[] = useMemo(() => {
    return paginatedProducts.map((product) => ({
      ...product,
      onEdit: handleEditProduct,
      onDelete: handleDeleteProduct,
      onView: handleViewProduct,
    }));
  }, [paginatedProducts]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <p className="text-destructive">Erreur lors du chargement des produits</p>
          <Button onClick={() => refetch()} variant="outline">
            <Loader2 className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <QueryErrorBoundary>
      <div className="space-y-6">
        {/* Header avec status des mutations */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des produits</h1>
            <div className="flex items-center gap-4 mt-2">
              <MutationStatus
                mutation={createProductMutation}
                successMessage="Produit créé avec succès"
              />
              <MutationStatus
                mutation={updateProductMutation}
                successMessage="Produit mis à jour"
              />
              <MutationStatus
                mutation={deleteProductMutation}
                successMessage="Produit supprimé"
              />
            </div>
          </div>
          <Button 
            onClick={handleCreateProduct}
            disabled={createProductMutation.isPending}
          >
            {createProductMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Ajouter un produit
          </Button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En stock</p>
                  <p className="text-2xl font-bold text-green-600">
                    {products.filter(p => p.stock > 0).length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock faible</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {products.filter(p => p.stock > 0 && p.stock < 10).length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rupture</p>
                  <p className="text-2xl font-bold text-red-600">
                    {products.filter(p => p.stock === 0).length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table des produits */}
        <Card>
          <CardHeader>
            <CardTitle>Vos produits</CardTitle>
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              statusOptions={[
                { value: 'en stock', label: 'En stock' },
                { value: 'faible', label: 'Stock faible' },
                { value: 'rupture', label: 'Rupture' },
              ]}
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <OptimisticLoader isLoading={true} />
              </div>
            ) : (
              <>
                <DataTable columns={columns} data={productsForDataTable} />
                
                {filteredProducts.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      Aucun produit trouvé
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {filters.search || filters.status.length > 0
                        ? 'Essayez de modifier vos filtres'
                        : 'Commencez par ajouter votre premier produit'}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
          
          {totalPages > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(items) => {
                  setItemsPerPage(items);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </Card>

        {/* Dialog pour le formulaire */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'create' && 'Ajouter un produit'}
                {dialogMode === 'edit' && 'Modifier le produit'}
                {dialogMode === 'view' && 'Détails du produit'}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              mode={dialogMode}
              product={selectedProduct}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </QueryErrorBoundary>
  );
};

export default ProductsPage;