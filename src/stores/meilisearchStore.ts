import { create } from "zustand";
import { ensureProductsIndex } from "@/lib/meilisearch";

interface MeilisearchState {
  isIndexReady: boolean;
  initialize: () => Promise<void>;
}

let initializationStarted = false;

export const useMeilisearchStore = create<MeilisearchState>((set, get) => ({
  isIndexReady: false,
  initialize: async () => {
    if (get().isIndexReady || initializationStarted) {
      return;
    }
    initializationStarted = true;
    try {
      console.log("Starting Meilisearch index initialization...");
      await ensureProductsIndex();
      set({ isIndexReady: true });
      console.log("Meilisearch index is ready.");
    } catch (error) {
      console.error("Meilisearch initialization failed:", error);
      initializationStarted = false; // Allow retries
    }
  },
}));
