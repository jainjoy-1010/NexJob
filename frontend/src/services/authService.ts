import { api } from './api';
import { AuthResponse, UserSummary } from '../types';

export const authService = {
  async register(data: any): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async login(data: any): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  async getCurrentUser(): Promise<UserSummary> {
    const res = await api.get<UserSummary>('/auth/me');
    return res.data;
  },
};
