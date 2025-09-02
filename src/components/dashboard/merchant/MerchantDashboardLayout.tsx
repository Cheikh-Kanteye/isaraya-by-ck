import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar, Header } from "@/components/dashboard/sidebar";
import ProductsPage from "@/components/dashboard/merchant/ProductsPage";
import OrdersPage from "@/components/dashboard/merchant/OrdersPage";
import AnalyticsPage from "@/components/dashboard/merchant/AnalyticsPage";
import CustomersPage from "@/components/dashboard/merchant/CustomersPage";
import SettingsPage from "@/components/dashboard/merchant/SettingsPage";
import MerchantDashboard from "@/pages/dashboard/MerchantDashboard";

const MerchantDashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-background/95 overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<MerchantDashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="*"
              element={<Navigate to="/dashboard/merchant" replace />}
            />
          </Routes>
        </main>
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

export default MerchantDashboardLayout;
