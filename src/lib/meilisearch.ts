import config from "@/config";
import { apiService } from "@/services/api";
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";

// Initialize Meilisearch client
export const { searchClient } = instantMeiliSearch(
  config.meilisearch.host,
  config.meilisearch.apiKey
);

// Function to initialize Meilisearch index
export const initializeMeilisearchIndex = async () => {
  try {
    // Fetch products data
    const productsData = await apiService.products.getAll();
    console.log("Products to index:", productsData.slice(0, 5));

    // Step 1: Delete the index if it exists
    const deleteResponse = await fetch(
      `${config.meilisearch.host}/indexes/produit`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${config.meilisearch.apiKey}`,
        },
      }
    );

    if (deleteResponse.ok) {
      console.log("Existing index 'produit' deleted successfully");
    } else if (deleteResponse.status !== 404) {
      const errorData = await deleteResponse.json();
      console.error("Failed to delete index:", errorData);
      return;
    } else {
      console.log("Index 'produit' does not exist, proceeding to create");
    }

    // Step 2: Create the index with explicit primary key
    const createIndexResponse = await fetch(
      `${config.meilisearch.host}/indexes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.meilisearch.apiKey}`,
        },
        body: JSON.stringify({ uid: "produit", primaryKey: "id" }),
      }
    );

    if (!createIndexResponse.ok) {
      const errorData = await createIndexResponse.json();
      console.error("Failed to create index:", errorData);
      return;
    }
    console.log("Index 'produit' created successfully with primaryKey 'id'");

    // Step 3: Add documents to the index
    const addDocumentsResponse = await fetch(
      `${config.meilisearch.host}/indexes/produit/documents`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.meilisearch.apiKey}`,
        },
        body: JSON.stringify(productsData), // Send array of products
      }
    );

    const addDocumentsData = await addDocumentsResponse.json();
    console.log("Document indexing task:", addDocumentsData);

    if (!addDocumentsResponse.ok) {
      console.error("Failed to add documents:", addDocumentsData);
      return;
    }

    // Step 4: Check task status
    const taskId = addDocumentsData.taskUid;
    let taskStatus = "enqueued";
    while (taskStatus === "enqueued" || taskStatus === "processing") {
      const taskResponse = await fetch(
        `${config.meilisearch.host}/tasks/${taskId}`,
        {
          headers: { Authorization: `Bearer ${config.meilisearch.apiKey}` },
        }
      );
      const taskData = await taskResponse.json();
      taskStatus = taskData.status;
      console.log("Task status:", taskStatus);

      if (taskStatus === "succeeded") {
        console.log("Documents indexed successfully");
      } else if (taskStatus === "failed") {
        console.error("Indexing failed:", taskData.error);
        return;
      }
      // Wait briefly before polling again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Step 5: Configure search settings
    const settingsResponse = await fetch(
      `${config.meilisearch.host}/indexes/produit/settings`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.meilisearch.apiKey}`,
        },
        body: JSON.stringify({
          filterableAttributes: [
            "brandId",
            "categoryId",
            "condition",
            "price",
            "tags",
          ],
          rankingRules: [
            "words",
            "typo",
            "proximity",
            "attribute",
            "sort",
            "exactness",
          ],
          sortableAttributes: ["price", "createdAt"],
        }),
      }
    );

    if (!settingsResponse.ok) {
      const errorData = await settingsResponse.json();
      console.error("Failed to apply settings:", errorData);
      return;
    }

    const settingsTask = await settingsResponse.json();
    console.log("Settings update task:", settingsTask);

    const settingsTaskId = settingsTask.taskUid;
    let settingsTaskStatus = "enqueued";
    while (
      settingsTaskStatus === "enqueued" ||
      settingsTaskStatus === "processing"
    ) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const taskResponse = await fetch(
        `${config.meilisearch.host}/tasks/${settingsTaskId}`,
        {
          headers: { Authorization: `Bearer ${config.meilisearch.apiKey}` },
        }
      );
      const taskData = await taskResponse.json();
      settingsTaskStatus = taskData.status;
      console.log("Settings task status:", settingsTaskStatus);
    }

    if (settingsTaskStatus === "succeeded") {
      console.log("Search settings applied successfully");
    } else {
      console.error("Settings task failed:", settingsTaskStatus);
    }
  } catch (error) {
    console.error("Error connecting to Meilisearch:", error);
  }
};

let indexEnsured = false;

// Ensure the 'produit' index exists before queries
export const ensureProductsIndex = async () => {
  if (indexEnsured) return;

  try {
    const res = await fetch(`${config.meilisearch.host}/indexes/produit`, {
      headers: { Authorization: `Bearer ${config.meilisearch.apiKey}` },
    });
    if (res.status === 404) {
      console.warn("Meilisearch index 'produit' not found. Initializing...");
      await initializeMeilisearchIndex();
    }
    indexEnsured = true;
  } catch (e) {
    console.error("Failed to verify Meilisearch index:", e);
  }
};
