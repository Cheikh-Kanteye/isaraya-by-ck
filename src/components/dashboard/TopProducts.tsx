import { formatPrice } from "@/lib/utils";
import { TopProduct } from "@/types";
import React from "react";

interface TopProductsProps {
  products: TopProduct[];
}

const TopProducts: React.FC<TopProductsProps> = ({ products }) => {
  return (
    <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <h2 className="text-xl font-bold text-foreground">
          Meilleurs produits
        </h2>
        <p className="text-sm text-muted-foreground">
          Vos produits les plus performants
        </p>
      </div>
      <div className="p-6 space-y-4">
        {products.map((product, index) => (
          <div
            key={product.produitId}
            className="p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    #{index + 1}
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {product.nom}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{product.totalSold} vendus</span>
                  <span>•</span>
                  <span>Prix moyen: {formatPrice(product.averagePrice)}</span>
                </div>
              </div>
            </div>
            <div className="text-right flex justify-between items-center mt-2">
              <p className="text-sm font-bold text-foreground">
                {formatPrice(product.revenue)}
              </p>
              <p className="text-xs text-muted-foreground">
                {product.totalSold > 0
                  ? formatPrice(product.revenue / product.totalSold)
                  : formatPrice(0)}
                /unité
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;
