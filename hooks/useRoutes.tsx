import { Route } from "@/interfaces/schedule.interface";
import { getRoutes } from "@/services/routeService";
import { useCallback, useEffect, useState } from "react";

interface Params {
  search?: string;
  perPage?: number;
}

export const useRoutes = (params: Params) => {
  const [data, setData] = useState<Route[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getRoutes({
        ...params,
      });
      setData(result.data.data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => {
    fetchData();
  };

  return { data, isLoading, error, refresh };
};
