import React, { useMemo } from "react";
import { Order, Product, User, Category } from "@/types";
import {
  useOrders,
  useProducts,
  useUsers,
  useCategories,
} from "@/hooks/queries";
import {
  DollarSign,
  ShoppingCart,
  Users as UsersIcon,
  Package,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { formatPrice } from "@/lib/utils";
import CountUp from "react-countup";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  prefix = "",
  suffix = "",
  decimals = 0,
}) => (
  <div className="glass-card-2 p-6 rounded-lg shadow">
    <div className="flex items-center">
      <div className="bg-primary text-white p-3 rounded-full">
        <Icon className="h-6 w-6" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold">
          <CountUp
            end={value}
            duration={2.5}
            separator=","
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
          />
        </p>
      </div>
    </div>
  </div>
);

const Analytics: React.FC = () => {
  const { data: orders, isLoading: isLoadingOrders } = useOrders();
  const { data: products, isLoading: isLoadingProducts } = useProducts();
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  const isLoading =
    isLoadingOrders ||
    isLoadingProducts ||
    isLoadingUsers ||
    isLoadingCategories;

  const stats = useMemo(() => {
    const safeOrders = orders || [];
    const safeProducts = products || [];
    const safeUsers = users || [];

    const totalRevenue = safeOrders.reduce(
      (acc, order) => acc + order.price * order.quantity,
      0
    );
    const totalOrders = safeOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalCustomers = safeUsers.filter(
      (user) => user.role === "CLIENT"
    ).length;
    const totalProducts = safeProducts.length;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalCustomers,
      totalProducts,
    };
  }, [orders, users, products]);

  const { salesData, categoryData, topProducts } = useMemo(() => {
    const safeOrders = orders || [];
    const safeProducts = products || [];
    const safeCategories = categories || [];

    const salesByDate = safeOrders.reduce(
      (acc: { [key: string]: number }, order) => {
        const date = new Date(order.createdAt).toISOString().split("T")[0]; // Format YYYY-MM-DD
        acc[date] = (acc[date] || 0) + order.price * order.quantity;
        return acc;
      },
      {}
    );

    const salesChartData = Object.keys(salesByDate)
      .map((date) => ({
        date,
        revenue: salesByDate[date],
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const productsByCategory = safeProducts.reduce(
      (acc: { [key: string]: number }, product) => {
        const category = safeCategories.find(
          (c) => c.id === product.categoryId
        );
        if (category) {
          acc[category.name] = (acc[category.name] || 0) + 1;
        }
        return acc;
      },
      {}
    );

    const categoryChartData = Object.keys(productsByCategory).map((name) => ({
      name,
      value: productsByCategory[name],
    }));

    const salesByProduct = safeOrders.reduce(
      (acc: { [key: string]: number }, order) => {
        const product = safeProducts.find((p) => p.id === order.productId);
        if (product) {
          acc[product.name] = (acc[product.name] || 0) + order.quantity;
        }
        return acc;
      },
      {}
    );

    const topProductsChartData = Object.keys(salesByProduct)
      .map((name) => ({
        name,
        sales: salesByProduct[name],
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return {
      salesData: salesChartData,
      categoryData: categoryChartData,
      topProducts: topProductsChartData,
    };
  }, [orders, products, categories]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          suffix=" FCFA"
          decimals={2}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={UsersIcon}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="glass-card-2 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Sales Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card-2 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][index % 4]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card-2 p-6 rounded-lg shadow col-span-1 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Top 5 Selling Products</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
