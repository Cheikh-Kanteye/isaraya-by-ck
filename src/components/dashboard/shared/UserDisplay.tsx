"use client";

import { useUser } from "@/hooks/queries";

export const UserDisplay = ({ userId }: { userId: string }) => {
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) return <span className="text-foreground">Chargement...</span>;

  const fullName = user
    ? `${user.firstname || ""} ${user.lastname || ""}`.trim()
    : "Utilisateur inconnu";

  return <span>{fullName || "Utilisateur inconnu"}</span>;
};
