import {
  InstantSearch,
  Hits,
  Pagination,
  RefinementList,
  ClearRefinements,
  SearchBox,
  Configure,
  RangeInput,
  Stats,
  SortBy,
} from "react-instantsearch";
import { searchClient } from "@/lib/meilisearch";
import "instantsearch.css/themes/satellite.css";
import { Product, Category, Brand } from "@/types";
import ProductCard from "../shared/ProductCard";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { useMeilisearchStore } from "@/stores/meilisearchStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import { InstantMeiliSearchInstance } from "@meilisearch/instant-meilisearch";

const Hit = ({ hit }: { hit: Product }) => <ProductCard product={hit} />;

export function SearchInterface() {
  const { isIndexReady, initialize } = useMeilisearchStore();

  // Initialize Meilisearch index on component mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Fetch categories and brands with React Query
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiService.categories.getAll(),
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: () => apiService.brands.getAll(),
  });

  // Transform categoryId to category name
  const transformCategoryItems = (items: RefinementListItem[]) => {
    console.log("Category items before transform:", items);
    console.log("Categories data:", categories);

    if (!items || items.length === 0) {
      console.log("No category items to transform");
      return [];
    }

    return items.map((item) => {
      const category = categories.find(
        (c) => c.id === item.label || c.id.toString() === item.label
      );
      console.log(
        `Transforming category ${item.label} to:`,
        category?.name || item.label
      );
      return {
        ...item,
        label: category?.name || item.label,
      };
    });
  };

  // Transform brandId to brand name
  const transformBrandItems = (items: RefinementListItem[]) => {
    console.log("Brand items before transform:", items);
    console.log("Brands data:", brands);

    if (!items || items.length === 0) {
      console.log("No brand items to transform");
      return [];
    }

    return items.map((item) => {
      const brand = brands.find(
        (b) => b.id === item.label || b.id.toString() === item.label
      );
      console.log(
        `Transforming brand ${item.label} to:`,
        brand?.name || item.label
      );
      return {
        ...item,
        label: brand?.name || item.label,
      };
    });
  };

  if (!isIndexReady) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-lg text-muted-foreground">
          Préparation de la recherche...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-background min-h-screen">
      <InstantSearch searchClient={searchClient as never} indexName="products">
        <Configure hitsPerPage={15} />

        {/* En-tête avec barre de recherche */}
        <header className="mb-8">
          <div className="relative">
            <SearchBox
              placeholder="Rechercher des produits..."
              classNames={{
                root: "relative",
                input:
                  "w-full p-4 pl-12 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none transition-shadow shadow-sm",
                submitIcon:
                  "absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground",
                resetIcon: "hidden",
              }}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtres (Desktop) */}
          <aside className="hidden lg:block">
            <div className="space-y-6 sticky top-24">
              <FilterCard title="Catégories">
                <RefinementList
                  attribute="categoryId"
                  transformItems={transformCategoryItems}
                  classNames={{
                    list: "space-y-2",
                    item: "flex items-center",
                    label: "flex items-center cursor-pointer",
                    labelText: "ml-2 text-sm",
                    checkbox:
                      "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary",
                    count:
                      "ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground",
                  }}
                />
              </FilterCard>

              <FilterCard title="Marques">
                <RefinementList
                  attribute="brandId"
                  transformItems={transformBrandItems}
                  classNames={{
                    list: "space-y-2",
                    item: "flex items-center",
                    label: "flex items-center cursor-pointer",
                    labelText: "ml-2 text-sm",
                    checkbox:
                      "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary",
                    count:
                      "ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground",
                  }}
                />
              </FilterCard>

              <FilterCard title="Condition">
                <RefinementList
                  attribute="condition"
                  classNames={{
                    list: "space-y-2",
                    item: "flex items-center",
                    label: "flex items-center cursor-pointer",
                    labelText: "ml-2 text-sm",
                    checkbox:
                      "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary",
                    count:
                      "ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground",
                  }}
                />
              </FilterCard>

              <FilterCard title="Prix">
                <RangeInput attribute="price" />
              </FilterCard>

              <ClearRefinements
                classNames={{
                  button:
                    "w-full text-center px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted",
                  disabledButton: "opacity-50 cursor-not-allowed",
                }}
                translations={{
                  resetButtonText: "Effacer les filtres",
                }}
              />
            </div>
          </aside>

          {/* Contenu principal (Produits) */}
          <main className="lg:col-span-3">
            {/* Bouton de filtre (Mobile) */}
            <div className="lg:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[300px] sm:w-[400px] bg-background p-0"
                >
                  <SheetHeader className="p-4 border-b border-border sticky top-0 bg-background z-10">
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="p-4 space-y-6 overflow-y-auto">
                    <FilterCard title="Catégories">
                      <RefinementList
                        attribute="categoryId"
                        transformItems={transformCategoryItems}
                        classNames={{
                          list: "space-y-2",
                          item: "flex items-center",
                          label: "flex items-center cursor-pointer",
                          labelText: "ml-2 text-sm",
                          checkbox:
                            "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary",
                          count:
                            "ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground",
                        }}
                      />
                    </FilterCard>

                    <FilterCard title="Marques">
                      <RefinementList
                        attribute="brandId"
                        transformItems={transformBrandItems}
                        classNames={{
                          list: "space-y-2",
                          item: "flex items-center",
                          label: "flex items-center cursor-pointer",
                          labelText: "ml-2 text-sm",
                          checkbox:
                            "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary",
                          count:
                            "ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground",
                        }}
                      />
                    </FilterCard>

                    <FilterCard title="Condition">
                      <RefinementList
                        attribute="condition"
                        classNames={{
                          list: "space-y-2",
                          item: "flex items-center",
                          label: "flex items-center cursor-pointer",
                          labelText: "ml-2 text-sm",
                          checkbox:
                            "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary",
                          count:
                            "ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground",
                        }}
                      />
                    </FilterCard>

                    <FilterCard title="Prix">
                      <RangeInput attribute="price" />
                    </FilterCard>

                    <ClearRefinements
                      classNames={{
                        button:
                          "w-full text-center px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted",
                        disabledButton: "opacity-50 cursor-not-allowed",
                      }}
                      translations={{
                        resetButtonText: "Effacer les filtres",
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex justify-between items-center mb-4">
              <Stats />
              <SortBy
                items={[
                  { label: "Pertinence", value: "products" },
                  { label: "Prix croissant", value: "products:price:asc" },
                  { label: "Prix décroissant", value: "products:price:desc" },
                  { label: "Nom A-Z", value: "products:name:asc" },
                  { label: "Nom Z-A", value: "products:name:desc" },
                ]}
              />
            </div>

            <Hits
              hitComponent={Hit}
              classNames={{
                list: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6",
              }}
            />

            <div className="mt-8">
              <Pagination
                classNames={{
                  root: "flex justify-center",
                  list: "flex items-center space-x-2",
                  item: "px-2 py-1",
                  link: "text-sm",
                  selectedItem: "font-bold text-primary",
                  disabledItem: "opacity-50",
                }}
              />
            </div>
          </main>
        </div>
      </InstantSearch>
    </div>
  );
}

interface FilterCardProps {
  title: string;
  children: React.ReactNode;
}

function FilterCard({ title, children }: FilterCardProps) {
  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
