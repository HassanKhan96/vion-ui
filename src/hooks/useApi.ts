import { useState } from 'react';
import api from '../lib/axios';
import type { User } from '../interfaces/user.interface';

interface LoginInput {
    email: string;
    password: string;
}

interface RegisterInput {
    username: string;
    email: string;
    password: string;
}

interface AuthResponse {
    user: User;
    accessToken: string;
}

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (input: LoginInput): Promise<AuthResponse> => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post<AuthResponse>('/auth/login', input);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Login failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const register = async (input: RegisterInput): Promise<AuthResponse> => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post<AuthResponse>('/auth/register', input);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/auth/refresh-token');

            return data.accessToken;
        } catch (error: any) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await api.get('/auth/logout');
        } catch (error: any) {
            setError(error.message);
            throw error;
        }
        finally {
            setLoading(false)
        }
    }



    return {
        login,
        register,
        refreshToken,
        logout,
        loading,
        error,
    };
};
