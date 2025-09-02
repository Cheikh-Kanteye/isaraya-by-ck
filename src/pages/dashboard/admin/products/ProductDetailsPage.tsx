import { useParams } from "react-router-dom";
import { useProduct, useUser, useCategory } from "@/hooks/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FallbackImage from "@/components/shared/FallbackImage"; // Importation du composant FallbackImage
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Product } from "@/types";

const ProductContent = ({ product }: { product: Product }) => {
  const { data: merchant } = useUser(product.merchantId!); // Renamed from vendor
  const { data: category } = useCategory(product.categoryId!);

  if (!product.merchantId || !product.categoryId) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
      <div className="flex items-center gap-4">
        <Badge variant="outline">{category?.name || "Catégorie"}</Badge>
        <span className="text-muted-foreground">Stock: {product.stock}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Product Images Carousel */}
          <Card className="glass-card-2">
            <CardContent className="p-4">
              <FallbackImage // Remplacement de <img> par <FallbackImage>
                src={product.images[0]?.url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-auto rounded-lg object-cover"
              />
            </CardContent>
          </Card>

          {/* Product Description */}
          <Card className="glass-card-2">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{product.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Price and Status */}
          <Card className="glass-card-2">
            <CardHeader>
              <CardTitle>Prix et Statut</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
              <Badge className="mt-2">{product.status}</Badge>
            </CardContent>
          </Card>

          {/* Vendor Information */}
          <Card className="glass-card-2">
            <CardHeader>
              <CardTitle>Vendeur</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={merchant?.avatarUrl} />
                <AvatarFallback>
                  {merchant?.firstname?.[0]}
                  {merchant?.lastname?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {merchant?.firstname} {merchant?.lastname}
                </p>
                <p className="text-sm text-foreground">{merchant?.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ProductDetailsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, isLoading, isError } = useProduct(productId!);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-red-500">
        Impossible de charger les détails du produit.
      </div>
    );
  }

  return <ProductContent product={product} />;
};

export default ProductDetailsPage;
