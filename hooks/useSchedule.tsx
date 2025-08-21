import { Schedule } from "@/interfaces/schedule.interface";
import { getSchedules } from "@/services/scheduleService";
import { convertDatesInObject } from "@/utils/functions";
import { useCallback, useEffect, useState } from "react";

interface Params {
  start_date: string;
  end_date: string;
  route_id?: number;
  driver_id?: number;
}

export const useSchedule = (params: Params) => {
  const [data, setData] = useState<Schedule[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getSchedules({
        ...params,
      });
      const formattedData = convertDatesInObject(result.data);
      console.log("SCHEDULES", formattedData);

      setData(formattedData as Schedule[]);
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
