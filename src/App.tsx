import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate, // Import useNavigate
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/QueryProvider";
import Index from "@/pages/Index";
import CatalogPage from "@/pages/CatalogPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import ClientDashboard from "@/pages/dashboard/ClientDashboard";
import { SearchPage } from "@/pages/SearchPage";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "./components/shared/Header";
import AuthForm from "./components/auth/AuthForm";
import Footer from "./components/shared/Footer";
import MerchantDashboardLayout from "./components/dashboard/merchant/MerchantDashboardLayout";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import { CartProvider } from "./contexts/CartContext";
import "./css/instant-search.css";
import AdminDashboardLayout from "./components/dashboard/admin/AdminDashboardLayout";
import MerchantOnboardingPage from "./pages/MerchantOnboardingPage"; // Renamed from VendorOnboardingPage
import PaymentStatusPage from "./pages/PaymentStatusPage"; // Import PaymentStatusPage
import { OrderSuccessToast } from "./components/shared/OrderSuccessToast"; // Import OrderSuccessToast
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore"; // Import useAuthStore
import { QueryErrorBoundary } from "./components/shared/QueryErrorBoundary";

function AppContent() {
  const { getCurrentUser, user } = useAuthStore(); // Removed isAuthCheckCompleted
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getCurrentUser(); // Simply call getCurrentUser on mount
  }, [getCurrentUser]);

  // Routes qui ne doivent pas afficher le header et footer
  const dashboardRoutes = [
    "/dashboard/client",
    "/dashboard/merchant",
    "/dashboard/admin",
  ];
  const isDashboardRoute = dashboardRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  // Removed: if (showAuth) { return <AuthForm onClose={() => setShowAuth(false)} />; }

  return (
    <div className="min-h-screen bg-background">
      {!isDashboardRoute && <Header />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/catalog/:category" element={<CatalogPage />} />
        <Route
          path="/catalog/:category/:subcategory"
          element={<CatalogPage />}
        />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/status/:status" element={<PaymentStatusPage />} />
        <Route
          path="/auth"
          element={<AuthForm onClose={() => navigate("/")} />}
        />{" "}
        {/* Updated Auth route with navigation */}
        <Route
          path="/onboarding/merchant"
          element={
            <ProtectedRoute requiredRole="CLIENT">
              <MerchantOnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute requiredRole="CLIENT">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/merchant/*"
          element={
            <ProtectedRoute requiredRole="MERCHANT">
              <MerchantDashboardLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/*"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboardLayout />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isDashboardRoute && <Footer />}
      <Toaster />
      <OrderSuccessToast />
    </div>
  );
}

function App() {
  return (
    <QueryProvider>
      <QueryErrorBoundary>
      <Router>
        <TooltipProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </TooltipProvider>
      </Router>
      </QueryErrorBoundary>
    </QueryProvider>
  );
}

export default App;
