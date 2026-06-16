import client from './client';
import type { ApiResponse, Question } from '../types';

export const bulkCreateQuestions = (questions: object[], signal?: AbortSignal) =>
  client.post<ApiResponse<Question[]>>('/questions/bulk', { questions }, { signal });

export const fetchBulkQuestions = (question_ids: string[], signal?: AbortSignal) =>
  client.post<ApiResponse<Question[]>>('/questions/fetchBulk', { question_ids }, { signal });
