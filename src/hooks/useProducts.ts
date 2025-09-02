import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { slugToCategoryMap, categoryToSlugMap } from "@/data/categories";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  condition: "neuf" | "occasion";
  merchantId: string; // Renamed from vendorId
  merchantName: string;
  stock: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
}

export const useProducts = () => {
  const { category: urlCategory } = useParams<{ category?: string }>();
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialiser la catégorie sélectionnée basée sur l'URL
  useEffect(() => {
    if (urlCategory) {
      const categoryName = slugToCategoryMap[urlCategory] || "Tous";
      setSelectedCategory(categoryName);
    } else {
      setSelectedCategory("Tous");
    }
  }, [urlCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Chargement des produits...");

      const products = await api.get("/produit"); // Changé de "/produit"
      console.log("Produits reçus:", products);

      const activeProducts = products.filter(
        (product: Product) => product.isActive
      );
      console.log("Produits actifs:", activeProducts.length);

      setAllProducts(activeProducts);
      // No need to set filteredProducts here as the useEffect will handle it
      console.log("Dummy products loaded:", activeProducts.length);
    } catch (err) {
      console.error("Error loading products:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts().catch((error) => {
      console.error("useEffect: Error loading products:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    });
  }, []);

  // Effect pour appliquer les filtres quand la catégorie change
  // Single effect for category filtering
  useEffect(() => {
    const categoryMap: { [key: string]: string } = {
      Électronique: "electronics",
      Mode: "fashion",
      Maison: "home",
      Sport: "sport",
      Véhicules: "vehicles",
      Emploi: "jobs",
      Immobilier: "realestate",
    };

    if (selectedCategory.toLowerCase() === "tous") {
      setFilteredProducts(allProducts);
    } else {
      const englishCategory =
        categoryMap[selectedCategory] || selectedCategory.toLowerCase();

      const filtered = allProducts.filter(
        (product) => product.category.toLowerCase() === englishCategory
      );
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, allProducts]);

  const addProduct = async (
    productData: Omit<Product, "id" | "createdAt" | "rating" | "reviewCount">
  ) => {
    try {
      const newProduct = {
        ...productData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        rating: 0,
        reviewCount: 0,
        isActive: true,
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      setAllProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to add product"
      );
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      setAllProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      const updatedProduct = allProducts.find((p) => p.id === id);
      return updatedProduct;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update product"
      );
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      setAllProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete product"
      );
    }
  };

  const getProductsByMerchant = (merchantId: string) => {
    return allProducts.filter((product) => product.merchantId === merchantId);
  };

  const getProductsByCategory = (category: string) => {
    if (category === "Tous") {
      navigate("/products"); // Rétabli à "/products"
    } else {
      const slug = categoryToSlugMap[category];
      if (slug) {
        navigate(`/products/${slug}`); // Rétabli à `/products/${slug}`
      }
    }
  };

  return {
    products: filteredProducts,
    loading,
    error,
    selectedCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsByMerchant,
    getProductsByCategory,
    refetch: fetchProducts,
  };
};
