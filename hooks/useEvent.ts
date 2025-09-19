import { Event } from "@/interfaces/event.interface";
import { getEvents } from "@/services/event.Service";
import { useCallback, useEffect, useState } from "react";

interface Params {
  page?: number;
  search?: string;
  perPage?: number;
  date?: string;
  severity?: string;
}

export const useEvents = (params?: Params) => {
  const [data, setData] = useState<Event[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getEvents({
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
