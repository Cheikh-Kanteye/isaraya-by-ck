import { mockUsers } from "@/data/mockUsers";

// Initialize dummy users in localStorage (application data, not session-specific)
export const initializeDummyUsers = () => {
  const existingUsers = localStorage.getItem("isaraya_users");
  if (!existingUsers) {
    localStorage.setItem("isaraya_users", JSON.stringify(mockUsers));
  }
};
