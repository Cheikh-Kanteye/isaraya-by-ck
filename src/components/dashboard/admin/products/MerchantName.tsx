import { useMerchant } from "@/hooks/queries/useUserQueries";
import { Skeleton } from "@/components/ui/skeleton";

export const MerchantName = ({ merchantId }: { merchantId?: string }) => {
  const { data: merchant, isLoading } = useMerchant(merchantId || "");

  if (isLoading) return <span>Chargement...</span>;
  if (!merchantId) return <>N/A</>;

  return <>{merchant ? `${merchant.firstName} ${merchant.lastName}` : "N/A"}</>;
};
