import { ApiRoutes } from "@/constants/apiRoutes";
import { Event } from "@/interfaces/event.interface";
import { PaginationResponse } from "@/interfaces/response.interface";
import { getQueryParams } from "@/utils/functions";
import axiosClient from "./axiosClient";
interface extraParams {
  date?: string;
  severity?: string;
}

const eventRoute = ApiRoutes.EVENT;

export const getEvents = async (extraParams?: extraParams) => {
  const { data } = await axiosClient.get<{ data: PaginationResponse<Event> }>(
    `${eventRoute}?${getQueryParams(extraParams)}`
  );
  return data;
};
