import axios from "axios";
import type {
  Product,
  CreateProduitDto,
  UpdateProduitDto,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  Brand,
  CreateBrandDto,
  UpdateBrandDto,
  Order,
  CreateOrderDto,
  UpdateOrderStatusDto,
  User,
  RegisterDto,
  LoginDto,
  ProductsParams,
  MerchantProfile,
  CreateMerchantProfileDto,
  MerchantOrdersResponse,
  MerchantOrder,
  MerchantStatsResponse,
  AdminStatsResponse,
  AdminUsersResponse,
} from "@/types";
import type { CreateOrderResponse } from "@/stores/orderStore";
import config from "@/config";

const apiClient = axios.create({
  baseURL: config.api.url,
});

// Intercepteur pour ajouter le token JWT à chaque requête
apiClient.interceptors.request.use(
  (config) => {
    let token = null;

    // Récupérer le token depuis le store Zustand persisté dans localStorage
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        const parsedAuth = JSON.parse(authStorage);
        token = parsedAuth?.state?.accessToken;
      }
    } catch (error) {
      console.warn(
        "Erreur lors de la récupération du token depuis auth-storage:",
        error
      );
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// New function for image upload
async function uploadImage(
  file: File
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post<{
      data: { publicId: string; url: string };
    }>("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await apiClient.delete(`/upload/image/${publicId}`);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Failed to delete image");
  }
}

class ApiResourceService<T, C = Omit<T, "id" | "createdAt" | "updatedAt">> {
  protected endpoint: string; // Changé de private à protected

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(params?: ProductsParams): Promise<T[]> {
    const response = await apiClient.get<any>(`/${this.endpoint}`, { params }); // Changé à <any> pour la flexibilité
    // Gérer les réponses imbriquées si le backend renvoie { data: [...] } ou { items: [...] } ou { orders: [...] }
    if (Array.isArray(response.data)) {
      console.log(
        `[API Service] Raw array response for ${this.endpoint}:`,
        JSON.stringify(response.data.slice(0, 2)) + "..."
      );
      return response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      console.log(
        `[API Service] Nested 'data' array response for ${this.endpoint}:`,
        JSON.stringify(response.data.data.slice(0, 2)) + "..."
      );
      return response.data.data;
    } else if (response.data && Array.isArray(response.data.items)) {
      console.log(
        `[API Service] Nested 'items' array response for ${this.endpoint}:`,
        JSON.stringify(response.data.items.slice(0, 2)) + "..."
      );
      return response.data.items;
    } else if (response.data && Array.isArray(response.data.orders)) {
      console.log(
        `[API Service] Nested 'orders' array response for ${this.endpoint}:`,
        JSON.stringify(response.data.orders.slice(0, 2)) + "..."
      );
      return response.data.orders;
    } else {
      console.warn(
        "API Response for getAll is not a direct array or a known nested array structure:",
        response.data
      );
      return [];
    }
  }

  async get(id: string): Promise<T> {
    const response = await apiClient.get<T>(`/${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: C): Promise<T> {
    const response = await apiClient.post<T>(`/${this.endpoint}`, data);
    return response.data;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const response = await apiClient.put<T>(`/${this.endpoint}/${id}`, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete(`/${this.endpoint}/${id}`);
    
    // Handle different response structures
    if (response.data && typeof response.data === 'object') {
      const responseData = response.data as any;
      if (responseData.success === false) {
        throw new Error(responseData.message || 'Delete operation failed');
      }
    }
    
    // Return void for successful deletion
    return;
  }
}

export const apiService = {
  // Image upload services
  images: {
    validateFile(file: File): { isValid: boolean; error?: string } {
      // Allowed file types based on backend validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes.includes(file.type)) {
        return {
          isValid: false,
          error: `Type de fichier non supporté. Types acceptés: JPG, JPEG, PNG, GIF, SVG`
        };
      }
      
      if (file.size > maxSize) {
        return {
          isValid: false,
          error: `Fichier trop volumineux. Taille maximale: 5MB`
        };
      }
      
      return { isValid: true };
    },

    async upload(file: File): Promise<{ success: boolean; message: string; data: { publicId: string; url: string } }> {
      // Validate file before upload
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const formData = new FormData();
      formData.append('file', file); // Changed from 'image' to 'file'
      
      const response = await apiClient.post<{ success: boolean; message: string; data: { publicId: string; url: string } }>(
        '/upload/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },

    async delete(publicId: string): Promise<void> {
      await apiClient.delete(`/upload/image/${publicId}`);
    }
  },

  products: new (class extends ApiResourceService<Product> {
    constructor() {
      super("produit"); // Changé de "products" à "produit"
    }

    async createProduct(
      product: Omit<Product, "id" | "createdAt" | "updatedAt">
    ): Promise<Product> {
      // Map Product to CreateProduitDto format, excluding invalid properties
      const createDto: CreateProduitDto = {
        name: product.name,
        title: product.title,
        sku: product.sku,
        description: product.description,
        price: Number(product.price),
        stock: Number(product.stock),
        images: (product.images || []).map(img => ({
          url: String(img.url || ''),
          altText: String(img.altText || '')
        })),
        rating: Number(product.rating || 0),
        categoryId: product.categoryId,
        brandId: product.brandId,
        originalPrice: Number(product.originalPrice || 0),
        vendorId: product.merchantId || "", // Map merchantId to vendorId
        reports: Number(product.reports || 0),
        tags: product.tags || [],
        condition: product.condition || "neuf",
        reviews: product.reviews || [],
        attributes: product.attributes || {},
        status: product.status || "disponible",
        specifications: product.specifications || []
      };

      // Remove any undefined or null values
      const cleanDto = Object.fromEntries(
        Object.entries(createDto).filter(([_, value]) => value !== undefined && value !== null)
      );

      console.log('Sending product data:', cleanDto);
      const response = await apiClient.post<Product>(`/${this.endpoint}`, cleanDto);
      return response.data;
    }

    async getByCategory(categoryId: string): Promise<Product[]> {
      const response = await apiClient.get<Product[]>(
        `/api/produit?categoryId=${categoryId}`
      );
      if (response.status !== 200) {
        throw new Error(`Products for category ${categoryId} not found`);
      }
      return response.data;
    }
  })(),

  categories: new (class extends ApiResourceService<Category> {
    constructor() {
      super("produit/categories");
    }

    async getSubCategories(categoryId: string): Promise<Category[]> {
      const allCategories = await this.getAll();
      return allCategories.filter(
        (category) => category.parentId === categoryId
      );
    }
  })(),

  brands: new ApiResourceService<Brand>("produit/brands"), // Changé de "brands" à "produit/brands"

  orders: new (class extends ApiResourceService<Order> {
    constructor() {
      super("orders");
    }

    async get(id: string): Promise<Order> {
      const response = await apiClient.get<{ success: boolean; data: Order; message: string }>(`/orders/${id}`);
      console.log(response.data);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(`Order with ID ${id} not found`);
    }

    async getAllOrders(): Promise<Order[]> {
      try {
        const response = await apiClient.get<{ success: boolean; data: Order[]; message: string }>(`/orders`);
        
        // Handle different response structures
        if (response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          return response.data;
        } else {
          console.warn('Unexpected orders API response structure:', response.data);
          return [];
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        return []; // Return empty array to prevent blocking errors
      }
    }

    async createOrder(
      order: Omit<Order, "id" | "createdAt" | "updatedAt">
    ): Promise<CreateOrderResponse> {
      // L'API retourne maintenant CreateOrderResponse au lieu d'Order
      const response = await apiClient.post<CreateOrderResponse>(
        `/${this.endpoint}`,
        order
      );
      return response.data;
    }

    async getMerchantOrders(
      merchantId: string
    ): Promise<MerchantOrdersResponse> {
      const response = await apiClient.get<MerchantOrdersResponse>(
        `/orders/merchant`
      );

      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data;
      }

      console.warn(
        "API Response for getMerchantOrders is not in expected format:",
        response.data
      );
      return {
        success: false,
        data: [],
        message: "Failed to fetch merchant orders",
      };
    }

    async updateStatus(
      orderId: string,
      status: Order["status"]
    ): Promise<Order> {
      const response = await apiClient.put<{ data: Order }>(
        `/orders/status`,
        { 
          orderId, 
          status 
        }
      );
      return response.data.data;
    }
  })(),

  users: new (class {
    async getMerchants(): Promise<MerchantProfile[]> {
      const response = await apiClient.get<MerchantProfile[]>(
        `/auth/merchant/profiles`
      );
      if (response.status !== 200) {
        throw new Error(`Failed to fetch merchant profiles`);
      }
      return response.data; // The API returns MerchantProfile[] directly
    }

    async getMerchant(id: string): Promise<MerchantProfile> {
      const response = await apiClient.get<MerchantProfile>(
        `/auth/merchant/profile/${id}`
      ); // Assuming API supports direct fetch by ID
      if (response.status !== 200) {
        throw new Error(`Merchant profile with id ${id} not found`);
      }
      return response.data;
    }

    async getMerchantProfile(id: string): Promise<{ data: { data: MerchantProfile } }> {
      const response = await apiClient.get<{ data: { data: MerchantProfile } }>(
        `/auth/merchant/profile`
      );
      if (response.status !== 200) {
        throw new Error(`Failed to fetch merchant profile for user ${id}`);
      }
      return response.data;
    }

    async getMerchantStats(id: string): Promise<MerchantStatsResponse> {
      const response = await apiClient.get<MerchantStatsResponse>(
        `/merchant/stats`
      );
      if (response.status !== 200) {
        throw new Error(`Failed to fetch merchant stats for id ${id}`);
      }
      return response.data;
    }

    async getAdminStats(): Promise<AdminStatsResponse> {
      const response = await apiClient.get<AdminStatsResponse>(
        `/auth/admin/stats`
      );
      if (response.status !== 200) {
        throw new Error(`Failed to fetch admin stats`);
      }
      return response.data;
    }

    async getAdminUsers(): Promise<AdminUsersResponse> {
      const response = await apiClient.get<AdminUsersResponse>(
        `/auth/admin/users`
      );
      if (response.status !== 200) {
        throw new Error(`Failed to fetch admin users`);
      }
      return response.data;
    }
  })(),
};

export { uploadImage };
