import { useMutation, useQuery } from "@tanstack/react-query";
import { loginResponse, LoginInput, AuthResponse } from "../../api/auth";
import { api } from "@/api/axiosInstance";

export const useLoginMutation = () => {
  return useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: (credentials) => loginResponse(credentials),
    onSuccess: (response) => {
      console.log(response);
      const token = response.token;
      localStorage.setItem("token", token);
    },
    onError: (error: any) => {
      console.log(error);
      const errorMessage = error.response?.data?.message || "Login gagal, silakan coba lagi.";
      alert(errorMessage);
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No token found");
      }

      const response = await api.get("/auth/me");
      if (response.status == 200) {
        return response.data;
      }
      throw new Error('unauthenticated');
    },
    retry: false,
    staleTime: 1000 * 60 * 15,
  });
};
