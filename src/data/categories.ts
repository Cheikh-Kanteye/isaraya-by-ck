// Configuration centralisée des catégories pour l'application Isaraya

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  order: number;
}

export interface SubCategory {
  id: string;
  name: string;
  image: string;
  slug: string;
}

export interface MainCategory {
  id: string;
  title: string;
  slug: string;
  subcategories: SubCategory[];
}

export interface PromoCategory {
  id: string;
  title: string;
  slug: string;
  items: SubCategory[];
}

// Mapping des slugs vers les noms de catégories
export const slugToCategoryMap: { [key: string]: string } = {
  electronique: "Électronique",
  mode: "Mode",
  maison: "Maison",
  sport: "Sport",
  vehicules: "Véhicules",
  emploi: "Emploi",
  immobilier: "Immobilier",
  "high-tech": "High-Tech",
  "cuisine-maison": "Cuisine et maison",
  "entretien-maison": "Entretenez votre maison",
  "jeux-videos": "Jeux vidéos",
  beaute: "Beauté",
  "fournitures-scolaires": "Fournitures scolaires",
  bureau: "Bureau",
};

// Mapping des noms de catégories vers les slugs
export const categoryToSlugMap: { [key: string]: string } = {
  Électronique: "electronique",
  Mode: "mode",
  Maison: "maison",
  Sport: "sport",
  Véhicules: "vehicules",
  Emploi: "emploi",
  Immobilier: "immobilier",
  "High-Tech": "high-tech",
  "Cuisine et maison": "cuisine-maison",
  "Entretenez votre maison": "entretien-maison",
  "Jeux vidéos": "jeux-videos",
  Beauté: "beaute",
  "Fournitures scolaires": "fournitures-scolaires",
  Bureau: "bureau",
};

// Catégories principales pour la page d'accueil et le catalogue
export const mainCategories: MainCategory[] = [
  {
    id: "1",
    title: "High-Tech",
    slug: "high-tech",
    subcategories: [
      {
        id: "1-1",
        name: "Ordinateurs",
        slug: "ordinateurs",
        image:
          "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=200&h=150&fit=crop",
      },
      {
        id: "1-2",
        name: "Téléphones",
        slug: "telephones",
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=150&fit=crop",
      },
      {
        id: "1-3",
        name: "Casques et écouteurs",
        slug: "casques-ecouteurs",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=150&fit=crop",
      },
      {
        id: "1-4",
        name: "Réalité virtuelle",
        slug: "realite-virtuelle",
        image:
          "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=200&h=150&fit=crop",
      },
    ],
  },
  {
    id: "2",
    title: "Cuisine et maison",
    slug: "cuisine-maison",
    subcategories: [
      {
        id: "2-1",
        name: "Petit électroménager",
        slug: "petit-electromenager",
        image:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=150&fit=crop",
      },
      {
        id: "2-2",
        name: "Cuisine",
        slug: "cuisine",
        image:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=150&fit=crop",
      },
      {
        id: "2-3",
        name: "Meubles",
        slug: "meubles",
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop",
      },
      {
        id: "2-4",
        name: "Rangements",
        slug: "rangements",
        image:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop",
      },
    ],
  },
  {
    id: "3",
    title: "Entretenez votre maison",
    slug: "entretien-maison",
    subcategories: [
      {
        id: "3-1",
        name: "Quincaillerie",
        slug: "quincaillerie",
        image:
          "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=200&h=150&fit=crop",
      },
      {
        id: "3-2",
        name: "Électricité",
        slug: "electricite",
        image:
          "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200&h=150&fit=crop",
      },
      {
        id: "3-3",
        name: "Outils",
        slug: "outils",
        image:
          "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=200&h=150&fit=crop",
      },
      {
        id: "3-4",
        name: "Jardin",
        slug: "jardin",
        image:
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=150&fit=crop",
      },
    ],
  },
  {
    id: "4",
    title: "Jeux vidéos",
    slug: "jeux-videos",
    subcategories: [
      {
        id: "4-1",
        name: "Moniteurs",
        slug: "moniteurs",
        image:
          "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=150&fit=crop",
      },
      {
        id: "4-2",
        name: "Bureaux",
        slug: "bureaux",
        image:
          "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=200&h=150&fit=crop",
      },
      {
        id: "4-3",
        name: "Accessoires gaming",
        slug: "accessoires-gaming",
        image:
          "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=200&h=150&fit=crop",
      },
      {
        id: "4-4",
        name: "Produits dérivés",
        slug: "produits-derives",
        image:
          "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=200&h=150&fit=crop",
      },
    ],
  },
];

// Catégories promotionnelles
export const promoCategories: PromoCategory[] = [
  {
    id: "promo-1",
    title: "Nos catégories à moins de 5000 FCFA",
    slug: "moins-5000-fcfa",
    items: [
      {
        id: "p1-1",
        name: "High-Tech",
        slug: "high-tech",
        image:
          "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=200&h=150&fit=crop",
      },
      {
        id: "p1-2",
        name: "Cuisine et maison",
        slug: "cuisine-maison",
        image:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=150&fit=crop",
      },
    ],
  },
  {
    id: "promo-2",
    title: "Bureau",
    slug: "bureau",
    items: [
      {
        id: "p2-1",
        name: "Ordinateurs de bureau",
        slug: "ordinateurs-bureau",
        image:
          "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=200&h=150&fit=crop",
      },
      {
        id: "p2-2",
        name: "Ordinateurs portables",
        slug: "ordinateurs-portables",
        image:
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=150&fit=crop",
      },
    ],
  },
  {
    id: "promo-3",
    title: "Beauté à moins de 2000 FCFA",
    slug: "beaute-moins-2000-fcfa",
    items: [
      {
        id: "p3-1",
        name: "Parfums",
        slug: "parfums",
        image:
          "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=150&fit=crop",
      },
      {
        id: "p3-2",
        name: "Soins des cheveux",
        slug: "soins-cheveux",
        image:
          "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=200&h=150&fit=crop",
      },
    ],
  },
  {
    id: "promo-4",
    title: "Fournitures scolaires",
    slug: "fournitures-scolaires",
    items: [
      {
        id: "p4-1",
        name: "Papeterie",
        slug: "papeterie",
        image:
          "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=150&fit=crop",
      },
      {
        id: "p4-2",
        name: "Classeurs",
        slug: "classeurs",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop",
      },
    ],
  },
];

// Catégories pour le filtre de produits (compatibilité avec l'existant)
export const filterCategories = [
  "Tous",
  "Électronique",
  "Mode",
  "Maison",
  "Sport",
  "Véhicules",
  "Emploi",
  "Immobilier",
];

// Fonction utilitaire pour obtenir une catégorie par slug
export const getCategoryBySlug = (
  slug: string
): MainCategory | PromoCategory | null => {
  const mainCategory = mainCategories.find((cat) => cat.slug === slug);
  if (mainCategory) return mainCategory;

  const promoCategory = promoCategories.find((cat) => cat.slug === slug);
  if (promoCategory) return promoCategory;

  return null;
};

// Fonction utilitaire pour obtenir toutes les catégories
export const getAllCategories = (): (MainCategory | PromoCategory)[] => {
  return [...mainCategories, ...promoCategories];
};

// Fonction utilitaire pour obtenir le slug d'une catégorie par son nom
export const getSlugByName = (name: string): string | null => {
  return categoryToSlugMap[name] || null;
};

// Fonction utilitaire pour obtenir le nom d'une catégorie par son slug
export const getNameBySlug = (slug: string): string | null => {
  return slugToCategoryMap[slug] || null;
};
