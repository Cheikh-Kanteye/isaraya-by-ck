import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar, Header } from "@/components/dashboard/sidebar";
import AdminDashboard from "@/pages/dashboard/AdminDashboard"; 
import ProductsManagement from "./ProductsManagement";
import OrdersManagement from "./OrdersManagement";
import SystemSettings from "./SystemSettings";
import Analytics from "./Analytics";
import OrderDetailsPage from "@/pages/dashboard/admin/orders/OrderDetailsPage";
import ProductDetailsPage from "@/pages/dashboard/admin/products/ProductDetailsPage";
import { GlobalSearch } from "../shared/GlobalSearch";
import UsersPage from "@/pages/dashboard/admin/UsersPage";

const AdminDashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <div className="relative flex h-screen bg-gradient-to-br from-background via-background to-background/95">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className="transition-all flex-1 duration-300 ease-in-out z-0 bg-background">
        <div className="flex flex-col h-full">
          <Header setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-6">
            <GlobalSearch />
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="products" element={<ProductsManagement />} />
              <Route
                path="products/:productId"
                element={<ProductDetailsPage />}
              />
              <Route path="orders" element={<OrdersManagement />} />
              <Route path="orders/:orderId" element={<OrderDetailsPage />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="*" element={<Navigate to="" replace />} />
            </Routes>
          </main>
        </div>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboardLayout;
