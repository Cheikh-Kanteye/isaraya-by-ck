import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Shield, Truck } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useNavigate } from "react-router-dom";
import FallbackImage from "@/components/shared/FallbackImage"; // Importation du composant FallbackImage

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 overflow-hidden">
      {/* Background Image with higher opacity for light theme */}
      <div className="absolute inset-0 opacity-20">
        <FallbackImage // Remplacement de <img> par <FallbackImage>
          src={heroImage}
          alt="iSaraya Marketplace"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Bienvenue sur <span className="text-orange-500">iSaraya</span>
              </h1>
              <p className="text-xl text-gray-700 leading-relaxed">
                La marketplace de référence au Sénégal. Achetez et vendez vos
                produits neufs et d'occasion en toute confiance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/search")}
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 hover:shadow-lg transition-all duration-300"
              >
                <Search className="mr-2 h-5 w-5" />
                Explorer les produits
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white text-lg px-8 py-6 transition-all duration-300"
                onClick={() => navigate("/onboarding/merchant")}
              >
                Devenir marchand
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900">Croissance</h3>
              </div>
              <p className="text-sm text-gray-600">
                Plus de 10,000 produits disponibles et des milliers
                d'utilisateurs actifs
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Shield className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900">Sécurisé</h3>
              </div>
              <p className="text-sm text-gray-600">
                Transactions sécurisées et marchands vérifiés pour votre
                tranquillité
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 sm:col-span-2">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Truck className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Livraison rapide
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Livraison dans tout Dakar et les principales villes du Sénégal
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
