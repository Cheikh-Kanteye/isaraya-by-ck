import React, { useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/stores";
import { useOrdersByMerchant, useUsers } from "@/hooks/queries";
import { DataTable } from "@/components/dashboard/shared/DataTable";
import {
  FilterBar,
  FilterState,
} from "@/components/dashboard/shared/FilterBar";
import { Pagination } from "@/components/dashboard/shared/Pagination";
import { columns, Customer } from "./customers/columns";
import { Card, CardContent } from "@/components/ui/card";
import type { Order, User } from "@/types";

const CustomersPage: React.FC = () => {
  const { user } = useAuthStore();
  const merchantId = user?.userId || ""; // Renamed from vendorId
  const { data: orders = [], isLoading: isLoadingOrders } =
    useOrdersByMerchant(merchantId);
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    category: "",
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const customers = useMemo<Customer[]>(() => {
    if (isLoadingOrders || isLoadingUsers) return [];

    const usersMap = new Map(users.map((u) => [u.id, u]));
    const customerData: { [key: string]: { user: User; orders: Order[] } } = {};

    orders.forEach((order) => {
      const user = usersMap.get(order.userId);
      if (user) {
        if (!customerData[user.id]) {
          customerData[user.id] = { user, orders: [] };
        }
        customerData[user.id].orders.push(order);
      }
    });

    return Object.values(customerData).map(({ user, orders }) => {
      const totalSpent = orders.reduce(
        (acc, o) => acc + o.price * o.quantity,
        0
      );
      const lastOrderDate = orders.reduce(
        (latest, o) =>
          new Date(o.createdAt) > new Date(latest) ? o.createdAt : latest,
        orders[0].createdAt
      );

      return {
        id: user.id,
        user: user,
        orderCount: orders.length,
        totalSpent,
        lastOrderDate,
      };
    });
  }, [orders, users, isLoadingOrders, isLoadingUsers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const searchMatch =
        filters.search === "" ||
        `${customer.user.firstname} ${customer.user.lastname}`
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        customer.user.email
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      return searchMatch;
    });
  }, [customers, filters.search]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = pagination.pageIndex * pagination.pageSize;
    return filteredCustomers.slice(
      startIndex,
      startIndex + pagination.pageSize
    );
  }, [filteredCustomers, pagination]);

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Clients</h2>

      <FilterBar filters={filters} onFiltersChange={handleFilterChange} />

      <Card>
        <CardContent>
          <DataTable columns={columns} data={paginatedCustomers} />
        </CardContent>
      </Card>

      <Pagination
        currentPage={pagination.pageIndex + 1}
        totalPages={Math.ceil(filteredCustomers.length / pagination.pageSize)}
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
        }
        itemsPerPage={pagination.pageSize}
        onItemsPerPageChange={(size) =>
          setPagination({ pageIndex: 0, pageSize: size })
        }
        totalItems={filteredCustomers.length}
      />
    </div>
  );
};

export default CustomersPage;
