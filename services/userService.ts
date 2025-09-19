import { User } from "@/interfaces/user.interface";
import axiosClient from "./axiosClient";

export const getMe = async () => {
  const { data } = await axiosClient.get<{ data: User }>(`/auth/me`);
  return data;
};
