import { api } from './axiosInstance';

export interface LoginInput {
    username: string;
    password?: string;
}

export interface AuthResponse {
    status: string;
    message: string;
    data: {
        token: string;
        user: {
            id: number;
            username: string;
            name: string;
            role : string
        };
    };
}

export const loginResponse = async (credentials: LoginInput): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

