import axios from 'axios';
import { getToken } from '../utils/storage';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string || 'http://localhost:8000',
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
