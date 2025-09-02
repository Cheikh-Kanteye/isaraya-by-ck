import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "../shared/DataTable";
import { columns } from "./orders/columns";
import { FilterBar, FilterState } from "../shared/FilterBar";
import { Pagination } from "../shared/Pagination";
import { useOrders } from "@/hooks/queries";

const OrdersManagement = () => {
  const { data: orders, isLoading, error } = useOrders();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    category: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredOrders = useMemo(() => {
    // Fournir un tableau vide si les commandes sont indéfinies
    return (orders || []).filter((order) => {
      const searchMatch =
        filters.search === "" ||
        order.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.clientId.toLowerCase().includes(filters.search.toLowerCase()) ||
        (order.merchantId && order.merchantId.toLowerCase().includes(filters.search.toLowerCase()));
      const statusMatch =
        filters.status.length === 0 || filters.status.includes(order.status);
      return searchMatch && statusMatch;
    });
  }, [orders, filters]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur de chargement des commandes.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Gestion des commandes
        </h1>
        <p className="text-muted-foreground">
          Surveillez toutes les commandes de la plateforme
        </p>
      </div>

      <Card className="glass-card-2 border-slate-700">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="text-muted-foreground">Commandes</CardTitle>
          <CardDescription className="text-foreground">
            Liste de toutes les commandes passées sur la plateforme
          </CardDescription>
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            statusOptions={[
              { value: "pending", label: "En attente" },
              { value: "confirmed", label: "Confirmée" },
              { value: "shipped", label: "Expédiée" },
              { value: "delivered", label: "Livrée" },
              { value: "cancelled", label: "Annulée" },
            ]}
          />
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={paginatedOrders} />
          <div className="border-t border-slate-700 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page: number) => setCurrentPage(page)}
              onItemsPerPageChange={(items: number) => setItemsPerPage(items)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersManagement;
