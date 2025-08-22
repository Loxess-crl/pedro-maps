import { ApiRoutes } from "@/constants/apiRoutes";
import { PaginationResponse } from "@/interfaces/response.interface";
import { Route } from "@/interfaces/schedule.interface";
import { getQueryParams } from "@/utils/functions";
import axiosClient from "./axiosClient";
interface extraParams {
  search?: string;
  perPage?: number;
}

const apiRoute = ApiRoutes.ROUTE;

export const getRoutes = async (extraParams?: extraParams) => {
  const { data } = await axiosClient.get<{ data: PaginationResponse<Route> }>(
    `${apiRoute}?${getQueryParams(extraParams)}`
  );
  return data;
};
