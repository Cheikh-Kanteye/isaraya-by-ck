import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores";
import { useCreateProduct, useUpdateProduct } from "@/hooks/queries/useProductQueries";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CategorySelect } from "@/components/ui/category-select";
import { BrandSelect } from "@/components/ui/brand-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import type { Product, Image } from "@/types"; // Importation de Image
import ImageUpload from "@/components/ui/ImageUpload";
import FallbackImage from "@/components/shared/FallbackImage"; // Importation du composant FallbackImage
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const productSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  title: z.string().min(1, "Le titre est requis"), // Added title
  sku: z.string().min(1, "Le SKU est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.number().min(0, "Le prix doit être positif"),
  originalPrice: z.number().optional().nullable().default(0), // Ajout de originalPrice comme optionnel
  stock: z.number().min(0, "Le stock doit être positif"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  brandId: z.string().min(1, "La marque est requise"),
  condition: z.enum(["neuf", "occasion", "reconditionne"]),
  image: z.any().optional(), // Pour le fichier d'image unique
  // Les champs suivants sont nécessaires pour la compatibilité avec Product, mais non modifiés directement par le formulaire
  images: z
    .array(z.object({ url: z.string(), altText: z.string().optional() }))
    .optional(),
  tags: z.array(z.string()).optional(),
  reviews: z.array(z.any()).optional(), // Simplifié pour l'exemple
  attributes: z.record(z.string(), z.string()).optional(),
  status: z
    .enum(["disponible", "indisponible", "bientôt disponible"])
    .optional(),
  specifications: z
    .array(z.object({ name: z.string(), value: z.string() }))
    .optional(),
  id: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  rating: z.number().optional(),
  merchantId: z.string().optional(),
  reports: z.number().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  mode: "create" | "edit" | "view";
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  mode,
  product,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuthStore();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      title: "", // Added title default value
      sku: "",
      description: "",
      price: 0,
      originalPrice: 0, // Ajout de la valeur par défaut pour originalPrice
      stock: 0,
      categoryId: "",
      brandId: "",
      condition: "neuf",
      image: null,
    },
  });

  useEffect(() => {
    if (product && (mode === "edit" || mode === "view")) {
      form.reset({
        name: product.name,
        title: product.title, // Added title
        sku: product.sku,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice || 0, // originalPrice est maintenant géré
        stock: product.stock,
        categoryId: product.categoryId,
        brandId: product.brandId,
        condition: product.condition,
        image: product.images?.[0]?.url || null,
        // S'assurer que les autres champs sont inclus pour la réinitialisation si le produit existe
        images: product.images,
        tags: product.tags,
        reviews: product.reviews,
        attributes: product.attributes,
        status: product.status,
        specifications: product.specifications,
        id: product.id,
        rating: product.rating,
        merchantId: product.merchantId,
        reports: product.reports,
      });
    }
  }, [product, mode, form]);

  const onSubmit = async (data: ProductFormData) => {
    if (mode === "view") return;

    if (!user) {
      toast.error("Vous devez être connecté pour effectuer cette action.");
      return;
    }

    setIsSubmitting(true);
    let uploadedImageData: { publicId: string; url: string } | null = null;

    try {
      // Step 1: Upload image if provided
      let imageUrl = "";
      if (data.image && data.image instanceof File) {
        toast.info("Téléchargement de l'image...");
        const uploadResponse = await apiService.images.upload(data.image);
        
        if (uploadResponse.success && uploadResponse.data) {
          uploadedImageData = uploadResponse.data;
          imageUrl = uploadedImageData.url;
          toast.success("Image téléchargée avec succès");
        } else {
          throw new Error("Échec du téléchargement de l'image");
        }
      } else {
        // Use existing image URL if no new image is uploaded
        imageUrl = (data.image as string) || product?.images?.[0]?.url || "";
      }

      // Step 2: Create product data
      const productData = {
        name: data.name,
        title: data.title,
        sku: data.sku,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
        categoryId: data.categoryId,
        brandId: data.brandId,
        rating: data.rating || 0,
        images: imageUrl
          ? [{ url: String(imageUrl), altText: data.name }]
          : [],
        tags: data.tags || [],
        condition: data.condition || "neuf",
        attributes: data.attributes || {},
        status: data.status || "disponible",
        specifications: data.specifications || [],
        originalPrice: data.originalPrice === null ? 0 : Number(data.originalPrice || 0),
        merchantId: user.id,
      };

      // Step 3: Create or update product
      try {
        if (mode === "create") {
          await createProductMutation.mutateAsync(productData as any);
          toast.success("Produit créé avec succès");
        } else if (mode === "edit" && product) {
          await updateProductMutation.mutateAsync({
            id: product.id,
            data: productData as any
          });
          toast.success("Produit mis à jour avec succès");
        }

        onSuccess();
      } catch (productError) {
        // Step 4: Rollback - Delete uploaded image if product creation fails
        if (uploadedImageData && uploadedImageData.publicId) {
          try {
            await apiService.images.delete(uploadedImageData.publicId);
            console.log("Image supprimée après échec de création du produit");
          } catch (deleteError) {
            console.error("Erreur lors de la suppression de l'image:", deleteError);
          }
        }
        throw productError; // Re-throw to be caught by outer catch
      }

    } catch (error) {
      console.error('Product submission error:', error);
      toast.error(
        `Erreur lors de ${
          mode === "create" ? "la création" : "la mise à jour"
        } du produit`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "view" && product) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nom du produit</Label>
            <div className="mt-1 p-2 bg-muted rounded-md">{product.name}</div>
          </div>
          <div>
            <Label>SKU</Label>
            <div className="mt-1 p-2 bg-muted rounded-md">{product.sku}</div>
          </div>
          <div>
            <Label>Titre</Label>
            <div className="mt-1 p-2 bg-muted rounded-md">{product.title}</div>
          </div>
          <div>
            <Label>Prix</Label>
            <div className="mt-1 p-2 bg-muted rounded-md">
              {product.price.toFixed(2)} €
            </div>
          </div>
          <div>
            <Label>Stock</Label>
            <div className="mt-1 p-2 bg-muted rounded-md">{product.stock}</div>
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <div className="mt-1 p-2 bg-muted rounded-md">
            {product.description}
          </div>
        </div>
        {product.images?.[0] && (
          <div>
            <Label>Image</Label>
            <FallbackImage // Remplacement de <img> par <FallbackImage>
              src={product.images[0].url}
              alt={product.name}
              className="mt-2 w-32 h-32 object-cover rounded-md"
            />
          </div>
        )}
        <div className="flex justify-end">
          <Button onClick={onCancel}>Fermer</Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du produit *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: iPhone 14 Pro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre du produit *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Smartphone Apple" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: SKU-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (€) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Removed originalPrice FormField */}

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>État *</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'état" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neuf">Neuf</SelectItem>
                      <SelectItem value="occasion">Occasion</SelectItem>
                      <SelectItem value="reconditionne">
                        Reconditionné
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie *</FormLabel>
                <FormControl>
                  <CategorySelect
                    onValueChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marque *</FormLabel>
                <FormControl>
                  <BrandSelect
                    onValueChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description détaillée du produit..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image du produit</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "En cours..."
              : mode === "create"
              ? "Créer le produit"
              : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
