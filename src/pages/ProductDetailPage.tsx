import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useProduct, useBrands, useCategory } from "@/hooks/useApi";
import { useMerchant } from "@/hooks/queries/useUserQueries"; // Corrected import path
import { useCart } from "../contexts/CartContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "../components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { Image } from "@/types";
import FallbackImage from "@/components/shared/FallbackImage"; // Importation du composant FallbackImage

interface ProductSpecification {
  name: string;
  value: string;
}

interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  // const [isImageLoading, setIsImageLoading] = useState(true); // Supprimé, géré par FallbackImage

  const productId = id;
  const {
    data: product,
    loading: productLoading,
    error: productError,
  } = useProduct(productId!);

  const {
    data: brands = [],
    loading: brandsLoading,
    error: brandsError,
  } = useBrands();

  const brand =
    product?.brandId && Array.isArray(brands)
      ? brands.find((b) => b.id === product.brandId) || null
      : null;

  const merchantId = product?.merchantId || ""; // Renamed from vendorId
  const { data: merchant } = useMerchant(merchantId); // Renamed from vendor
  const categoryId = product?.categoryId || "";
  // const { data: category } = useCategory(categoryId);

  const handleAddToCart = useCallback(() => {
    if (product) {
      addToCart(product, quantity);
      toast({
        title: "Produit ajouté au panier",
        description: `${quantity} x ${product.title} ajouté(s) au panier`,
      });
    }
  }, [product, quantity, addToCart]);

  const handleAddToWishlist = useCallback(() => {
    if (product) {
      toast({
        title: "Produit ajouté aux favoris",
        description: `${product.title} ajouté à votre liste de souhaits`,
      });
    }
  }, [product]);

  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien du produit a été copié dans le presse-papiers",
      });
    }
  };

  // const handleImageLoad = () => {
  //   setIsImageLoading(false);
  // }; // Supprimé, géré par FallbackImage

  // useEffect(() => {
  //   if (productId) {
  //     setIsImageLoading(true);
  //     setSelectedImageIndex(0);
  //   }
  // }, [productId]);

  const productAttributes = product?.attributes
    ? Object.entries(product.attributes)
    : [];
  const productSpecifications = product?.specifications || [];
  const productReviews = product?.reviews
    ? product.reviews.map((review) => ({
        ...review,
        author: review.userName,
      }))
    : [];
  const productImages = product?.images || [];

  const handleQuantityDecrease = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const handleQuantityIncrease = useCallback(() => {
    setQuantity((prev) => Math.min(product?.stock || 0, prev + 1));
  }, [product?.stock]);

  const breadcrumb = ["Catalogue"];
  // if (category) breadcrumb.push(category.name);
  if (product) breadcrumb.push(product.title);

  if (productLoading || brandsLoading) {
    return <ProductDetailSkeleton />;
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Produit non trouvé
          </h1>
          <p className="text-gray-600 mb-6">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => navigate("/catalog")}>
            Retour au catalogue
          </Button>
        </div>
      </div>
    );
  }

  if (brandsError) {
    console.warn("Erreur lors du chargement des marques:", brandsError);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <nav className="text-sm text-muted-foreground">
              {breadcrumb.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="mx-2">/</span>}
                  <span
                    className={
                      index === breadcrumb.length - 1
                        ? "text-foreground font-medium"
                        : ""
                    }
                  >
                    {item}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-card border border-border">
              {/* {isImageLoading && (
                <div className="w-full h-full bg-gray-100 animate-pulse" />
              )} */}
              <FallbackImage // Remplacement de <img> par <FallbackImage>
                src={
                  productImages[selectedImageIndex]?.url || "/placeholder.svg"
                }
                alt={
                  productImages[selectedImageIndex]?.altText || product.title
                }
                className="w-full h-full object-cover"
                // onLoad={handleImageLoad} // Supprimé, géré par FallbackImage
                // onError={handleImageLoad} // Supprimé, géré par FallbackImage
              />
            </div>
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image: Image, index: number) => (
                  <button
                    key={image.id || index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <FallbackImage // Remplacement de <img> par <FallbackImage>
                      src={image.url}
                      alt={image.altText}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {brand ? (
                  <Badge variant="outline">{brand.name}</Badge>
                ) : (
                  <Badge variant="outline">Marque inconnue</Badge>
                )}
                <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                  {product.stock > 0
                    ? `${product.stock} en stock`
                    : "Rupture de stock"}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-5 w-5 ${
                        index < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {product.rating} ({productReviews.length} avis)
                  </span>
                </div>
              </div>
              <div className="text-4xl font-bold text-primary mb-6">
                {formatPrice(product.price)}
              </div>
            </div>

            <Separator />

            {/* Attributes */}
            {productAttributes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Caractéristiques</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productAttributes.map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <span className="text-muted-foreground min-w-[120px]">
                        {key}:
                      </span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Specifications */}
            {productSpecifications.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Spécifications techniques
                </h3>
                <div className="space-y-2">
                  {productSpecifications.map((spec, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-muted-foreground">{spec.name}</span>
                      <span className="font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium">Quantité:</label>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleQuantityDecrease}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleQuantityIncrease}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock === 0
                    ? "Rupture de stock"
                    : "Ajouter au panier"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAddToWishlist}
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Merchant Info */} {/* Renamed from Vendor Info */}
            {/* {merchant && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vendu par</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{merchant.name}</h4>
                      <p className="text-sm text-gray-600">
                        {merchant.description}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Voir le marchand
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )} */}

            {/* Service Icons */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <Truck className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">Livraison rapide</p>
                <p className="text-xs text-muted-foreground">
                  2-3 jours ouvrés
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Garantie</p>
                <p className="text-xs text-muted-foreground">
                  2 ans constructeur
                </p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-sm font-medium">Retour gratuit</p>
                <p className="text-xs text-muted-foreground">30 jours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Spécifications</TabsTrigger>
              <TabsTrigger value="reviews">
                Avis ({productReviews.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-foreground leading-relaxed">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {productSpecifications.length > 0 ? (
                    <div className="space-y-3">
                      {productSpecifications.map(
                        (spec: ProductSpecification, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between py-2 border-b border-border last:border-0"
                          >
                            <span className="font-medium text-foreground">
                              {spec.name}
                            </span>
                            <span className="text-muted-foreground">
                              {spec.value}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Aucune spécification disponible
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {productReviews.length > 0 ? (
                    <div className="space-y-6">
                      {productReviews.map(
                        (review: ProductReview & { author: string }, index) => (
                          <div key={review.id || index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{review.author}</div>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < (review.rating || 0)
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {review.comment}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              {new Date(review.date).toLocaleDateString()}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Aucun avis disponible
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

const ProductDetailSkeleton = React.memo(() => {
  return (
    <div className="min-h-screen bg-background dark">
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Skeleton className="h-8 w-20 mr-4" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductDetailSkeleton.displayName = "ProductDetailSkeleton";
