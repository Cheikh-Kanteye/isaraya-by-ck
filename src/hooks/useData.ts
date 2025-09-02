import useSWR from "swr";
import { api } from "@/lib/api";

const fetcher = (url: string) => api.get(url);

export function useData<T>(endpoint: string) {
  const { data, error, isLoading } = useSWR<T>(endpoint, fetcher);

  return {
    data,
    isLoading,
    isError: error,
  };
}
