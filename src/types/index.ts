export interface User {
  id: string;
  userId: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

export interface SubTopic {
  id: string;
  name: string;
  topic_id: string;
}

export interface Test {
  id: string;
  name: string;
  type?: string;
  subject: string;
  topics: string[];
  sub_topics?: string[] ;
  correct_marks?: number;
  wrong_marks?: number;
  unattempt_marks?: number;
  difficulty?: string;
  total_time?: number;
  total_marks?: number;
  total_questions?: number;
  status: 'draft' | 'live' | null;
  created_at?: string;
  questions?: string[];
}

export interface Question {
  id?: string;
  type: 'mcq';
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: 'option1' | 'option2' | 'option3' | 'option4';
  explanation?: string;
  difficulty?: string;
  test_id?: string;
  topic?: string;
  sub_topic?: string;
  media_url?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiFieldError {
  type: string;
  msg: string;
  path: string;
  location: string;
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
  errors?: ApiFieldError[];
}

/** Parse an axios error into a structured ApiErrorResponse */
export function parseApiError(err: unknown): ApiErrorResponse {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    (err as { response?: { data?: unknown } }).response?.data
  ) {
    const data = (err as { response: { data: unknown } }).response.data;
    if (data && typeof data === 'object' && 'message' in data) {
      return data as ApiErrorResponse;
    }
  }
  return { status: 'error', message: 'An unexpected error occurred.' };
}
