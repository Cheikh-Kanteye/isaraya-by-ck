import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Search, ShoppingCart, Trash2, Star } from "lucide-react";
import config from "@/config";
import FallbackImage from "@/components/shared/FallbackImage"; // Importation du composant FallbackImage

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  condition: string;
  merchantName: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
}

const Favorites = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.api.url}/produit`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);

          // Simuler des favoris (normalement récupérés depuis l'API utilisateur)
          const mockFavorites = ["1", "2"]; // IDs des produits favoris
          setFavorites(mockFavorites);

          const favoriteProducts = data.filter((product: Product) =>
            mockFavorites.includes(product.id)
          );
          setFilteredFavorites(favoriteProducts);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des favoris:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const favoriteProducts = products.filter((product) =>
      favorites.includes(product.id)
    );

    if (searchTerm) {
      const filtered = favoriteProducts.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.merchantName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFavorites(filtered);
    } else {
      setFilteredFavorites(favoriteProducts);
    }
  }, [products, favorites, searchTerm]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleRemoveFromFavorites = (productId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
    // TODO: Appeler l'API pour supprimer des favoris
  };

  const handleAddToCart = (productId: string) => {
    console.log("Ajouter au panier:", productId);
    // TODO: Implémenter l'ajout au panier
  };

  const handleViewProduct = (productId: string) => {
    console.log("Voir produit:", productId);
    // TODO: Naviguer vers la page produit
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Heart className="h-8 w-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
            <p>Chargement de vos favoris...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mes favoris</CardTitle>
          <CardDescription>
            Retrouvez tous les produits que vous avez ajoutés à vos favoris
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans vos favoris..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{favorites.length}</p>
                    <p className="text-sm text-muted-foreground">
                      Articles favoris
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {filteredFavorites.filter((p) => p.isActive).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Disponibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {filteredFavorites.length > 0
                        ? (
                            filteredFavorites.reduce(
                              (acc, p) => acc + p.rating,
                              0
                            ) / filteredFavorites.length
                          ).toFixed(1)
                        : "0"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Note moyenne
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des favoris */}
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {favorites.length === 0 ? "Aucun favori" : "Aucun résultat"}
              </h3>
              <p className="text-muted-foreground">
                {favorites.length === 0
                  ? "Vous n'avez pas encore ajouté de produits à vos favoris."
                  : "Aucun favori ne correspond à votre recherche."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((product) => (
                <Card
                  key={product.id}
                  className="group hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <FallbackImage // Remplacement de <img> par <FallbackImage>
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />

                    {product.originalPrice && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-red-500 text-white">
                          -
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                          )}
                          %
                        </Badge>
                      </div>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                      onClick={() => handleRemoveFromFavorites(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        {product.condition}
                      </Badge>
                    </div>

                    <h3 className="font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>

                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({product.rating}) • {product.reviewCount} avis
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      par {product.merchantName}
                    </p>

                    <div className="space-y-1 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAddToCart(product.id)}
                        disabled={!product.isActive}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProduct(product.id)}
                      >
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Favorites;
