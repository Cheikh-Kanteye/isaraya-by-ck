// Configuration de l'application
const config = {
  // Configuration de l'API
  api: {
    url: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  },

  // Configuration de MeiliSearch
  meilisearch: {
    host: import.meta.env.VITE_MEILISEARCH_HOST || "http://localhost:7700",
    apiKey: import.meta.env.VITE_MEILISEARCH_API_KEY || "masterkey",
  },

  // Configuration de l'environnement
  env: {
    mode: import.meta.env.MODE || "development",
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
  },
};

export default config;
