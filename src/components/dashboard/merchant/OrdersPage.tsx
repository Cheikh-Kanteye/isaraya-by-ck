import React, { useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/stores";
import { useOrdersByMerchant, useUsers, useUpdateOrder } from "@/hooks/queries";
import { DataTable } from "@/components/dashboard/shared/DataTable";
import {
  FilterBar,
  FilterState,
} from "@/components/dashboard/shared/FilterBar";
import { Pagination } from "@/components/dashboard/shared/Pagination";
import { columns, OrderColumn } from "./columns";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { MerchantOrder, User } from "@/types";
import { ORDER_STATUS_OPTIONS, ORDER_STATUS } from "@/constants/orderStatus";
import { queryClient, queryKeys } from "@/hooks/queries";

const OrdersPage: React.FC = () => {
  const { user } = useAuthStore();
  const merchantId = user?.id || ""; // Corrected from userId to id
  const { data: orders = [], isLoading: isLoadingOrders } =
    useOrdersByMerchant(merchantId);
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();
  const updateOrderMutation = useUpdateOrder();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    category: "",
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleStatusUpdate = useCallback(
    async (orderId: string, newStatus: MerchantOrder["status"]) => {
      try {
        await updateOrderMutation.mutateAsync(
          {
            id: orderId,
            data: { status: newStatus },
          },
          {
            onSuccess: () => {
              // Rafraîchir les données après la mise à jour
              queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
              queryClient.invalidateQueries({ queryKey: queryKeys.orders.byMerchant(user?.id || '') });
            },
          }
        );
        toast.success("Statut de la commande mis à jour avec succès");
      } catch (err) {
        console.error("Erreur lors de la mise à jour du statut:", err);
        toast.error(
          // @ts-ignore
          err.response?.data?.message || "Erreur lors de la mise à jour du statut"
        );
      }
    },
    [updateOrderMutation, queryClient, user?.id]
  );

  const formattedOrders: OrderColumn[] = useMemo(() => {
    const usersMap = new Map(users.map((u) => [u.id, u]));
    return orders.map((order) => {
      const user = usersMap.get(order.clientId);

      // Parse deliveryDetails JSON string
      let deliveryInfo = null;
      try {
        deliveryInfo = JSON.parse(order.deliveryDetails);
      } catch (e) {
        console.error("Failed to parse deliveryDetails:", e);
      }

      return {
        id: order.id,
        productTitle: `Commande #${order.id.substring(0, 8)}`, // Temporary placeholder
        total: order.merchantTotal,
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString("fr-FR"),
        user: user
          ? {
              id: user.id,
              firstname: user.firstName,
              lastname: user.lastName,
              email: user.email,
            }
          : deliveryInfo
          ? {
              id: order.clientId,
              firstname: deliveryInfo.firstName || "",
              lastname: deliveryInfo.lastName || "",
              email: deliveryInfo.email || "",
            }
          : null,
        onStatusChange: handleStatusUpdate,
      };
    });
  }, [orders, users, handleStatusUpdate]);

  const filteredOrders = useMemo(() => {
    return formattedOrders.filter((order: OrderColumn) => {
      const searchMatch =
        filters.search === "" ||
        order.productTitle
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        (order.user &&
          `${order.user.firstname} ${order.user.lastname}`
            .toLowerCase()
            .includes(filters.search.toLowerCase()));

      const statusMatch =
        filters.status.length === 0 || filters.status.includes(order.status);

      return searchMatch && statusMatch;
    });
  }, [formattedOrders, filters]);

  const paginatedOrders = useMemo(() => {
    const startIndex = pagination.pageIndex * pagination.pageSize;
    return filteredOrders.slice(startIndex, startIndex + pagination.pageSize);
  }, [filteredOrders, pagination]);

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const isLoading = isLoadingOrders || isLoadingUsers;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Commandes</h1>

      <FilterBar
        filters={filters}
        onFiltersChange={handleFilterChange}
        statusOptions={ORDER_STATUS_OPTIONS}
      />

      <Card>
        <CardContent>
          <DataTable columns={columns} data={paginatedOrders} />
        </CardContent>
      </Card>

      <Pagination
        currentPage={pagination.pageIndex + 1}
        totalPages={Math.ceil(filteredOrders.length / pagination.pageSize)}
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
        }
        itemsPerPage={pagination.pageSize}
        onItemsPerPageChange={(size) =>
          setPagination({ pageIndex: 0, pageSize: size })
        }
        totalItems={filteredOrders.length}
      />
    </div>
  );
};

export default OrdersPage;
