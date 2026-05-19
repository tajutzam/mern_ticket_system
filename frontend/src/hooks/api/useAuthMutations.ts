import { useMutation, useQuery } from '@tanstack/react-query';
import { loginResponse, LoginInput, AuthResponse } from '../../api/auth';
import { api } from '@/api/axiosInstance';

export const useLoginMutation = () => {

    return useMutation<AuthResponse, Error, LoginInput>({
        mutationFn: (credentials) => loginResponse(credentials),
        onSuccess: (response) => {
            const token = response.data.token;
            localStorage.setItem('token', token);
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Login gagal, silakan coba lagi.';
            alert(errorMessage); 
        }
    });
};

export const useCurrentUser = () => {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            if (!token) return null; 
            
            const response = await api.get('/auth/me');
            return response.data;
        },
        retry: false,
        staleTime: 1000 * 60 * 15, 
        
    });
};