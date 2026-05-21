import { api } from "./axiosInstance";

export interface LoginInput {
  email: string;
  password?: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  token: string;
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
  };
}

export const loginResponse = async (credentials: LoginInput): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", credentials);
  console.log(response);
  return response.data;
};
