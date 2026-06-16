import client from './client';
import type { ApiResponse, Test } from '../types';

export const getAllTests = (signal?: AbortSignal) =>
  client.get<ApiResponse<Test[]>>('/tests', { signal });

export const getTestById = (id: string, signal?: AbortSignal) =>
  client.get<ApiResponse<Test>>(`/tests/${id}`, { signal });

export const createTest = (data: Partial<Test>, signal?: AbortSignal) =>
  client.post<ApiResponse<Test>>('/tests', data, { signal });

export const updateTest = (id: string, data: Partial<Test>, signal?: AbortSignal) =>
  client.put<ApiResponse<Test>>(`/tests/${id}`, data, { signal });
