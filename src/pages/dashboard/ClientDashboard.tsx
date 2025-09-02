import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import OrderHistory from "@/components/dashboard/client/OrderHistory";
import Favorites from "@/components/dashboard/client/Favorites";
import Profile from "@/components/dashboard/client/Profile";
import Notifications from "@/components/dashboard/client/Notifications";
import { useAuthStore } from "@/stores";
import {
  ClientRecentOrders,
  QuickActions,
  StatsGrid,
} from "@/components/dashboard/client";
import { tabItems } from "@/data/tabItems";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      switch (user.roles[0].name) { // Access the 'name' property of the role object
        case "ADMIN":
          navigate("/dashboard/admin");
          break;
        case "CLIENT":
          // No navigation needed for client, they are already on the client dashboard
          break;
        default:
          // Fallback or handle other roles if necessary
          break;
      }
    }
  }, [user]);

  if (!user) {
    return <div>Chargement...</div>;
  }

  const stats = {
    totalOrders: 12,
    pendingOrders: 2,
    completedOrders: 8,
    cancelledOrders: 2,
    totalSpent: 2450000,
    favoriteItems: 15,
    unreadNotifications: 3,
  };

  const handleLogout = () => {
    console.log("Déconnexion");
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour, {user.firstName} !
            </h1>
            <p className="text-gray-700 font-medium">
              Gérez vos commandes et préférences depuis votre espace personnel
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-white border-2 border-gray-300 text-gray-800 font-medium hover:bg-gray-50 hover:border-gray-400 shadow-sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6"
        >
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 border pb-2 border-gray-300 rounded-lg">
            {tabItems(stats).map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center pb-1 gap-2 text-gray-700 font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
              >
                {tab.icon}
                {tab.label}
                {tab.badge && (
                  <Badge
                    variant="destructive"
                    className="w-5 text-xs flex justify-center items-center bg-red-600 text-white border-red-600 shadow-sm"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatsGrid stats={stats} />
            <ClientRecentOrders />
            <QuickActions />
          </TabsContent>

          <TabsContent value="orders">
            <OrderHistory />
          </TabsContent>

          <TabsContent value="favorites">
            <Favorites />
          </TabsContent>

          <TabsContent value="profile">
            <Profile />
          </TabsContent>

          <TabsContent value="notifications">
            <Notifications />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
