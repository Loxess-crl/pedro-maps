import { ApiRoutes } from "@/constants/apiRoutes";
import { Schedule } from "@/interfaces/schedule.interface";
import { getQueryParams } from "@/utils/functions";
import axiosClient from "./axiosClient";
interface extraParams {
  start_date: string;
  end_date: string;
  route_id?: number;
  driver_id?: number;
}

const scheduleRoute = ApiRoutes.SCHEDULE;

export const getSchedules = async (extraParams?: extraParams) => {
  const { data } = await axiosClient.get<{ data: Schedule[] }>(
    `${scheduleRoute}?${getQueryParams(extraParams)}`
  );
  return data;
};
