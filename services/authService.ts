import { ApiRoutes } from "@/constants/apiRoutes";
import { JWTResponse } from "@/interfaces/jwt.interface";
import axiosClient from "./axiosClient";

export const login = async (
  email: string,
  password: string,
  rememberMe?: boolean
) => {
  const { data } = await axiosClient.post<JWTResponse>(`${ApiRoutes.LOGIN}`, {
    email,
    password,
    rememberMe,
  });
  console.log("Data login", data);

  return data;
};

export const loginFirebase = async (
  id_token: string,
  provider: string = "google.com"
) => {
  const { data } = await axiosClient.post<JWTResponse>(
    `${ApiRoutes.LOGIN_FIREBASE}`,
    {
      id_token,
      provider,
    }
  );

  return data;
};
