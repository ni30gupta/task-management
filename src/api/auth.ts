import client from './client';
import type { ApiResponse, User } from '../types';

export const login = async (userId: string, password: string, signal?: AbortSignal): Promise<{ token: string; user: User }> => {
  const res = await client.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { userId, password }, { signal });
  return res.data.data;
};
