import { UserPayload } from "./user.interface";

export interface JWTResponse {
  success: boolean;
  message: string;
  error: string;
  data?: Data;
}

interface Data {
  token_data: {
    token: string;
    type: string;
    expires_at: string;
  };
  user: UserPayload;
}
