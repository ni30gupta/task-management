import client from './client';
import type { ApiResponse, Subject, Topic, SubTopic } from '../types';

export const getSubjects = (signal?: AbortSignal) =>
  client.get<ApiResponse<Subject[]>>('/subjects', { signal });

export const getTopicsBySubject = (subjectId: string | undefined, signal?: AbortSignal) =>
  client.get<ApiResponse<Topic[]>>(`/topics/subject/${subjectId}`, { signal });

export const getSubTopicsByTopics = (topicIds: string[], signal?: AbortSignal) =>
  client.post<ApiResponse<SubTopic[]>>('/sub-topics/multi-topics', { topicIds }, { signal });
