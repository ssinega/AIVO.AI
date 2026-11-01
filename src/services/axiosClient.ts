import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export interface ApiErrorResponse {
  error: {
    code: string;
    status_code: number;
    message: string;
    details?: any;
    timestamp: string;
    path?: string;
  };
}

export class AppApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;
  timestamp: string;

  constructor(statusCode: number, message: string, code: string = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'AppApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor: Attach headers or logs
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers['X-Request-Timestamp'] = new Date().toISOString();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Normalize 4xx and 5xx API Errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      let message = 'An unexpected server error occurred.';
      let code = 'SERVER_ERROR';
      let details = null;

      if (data && data.error) {
        message = data.error.message || message;
        code = data.error.code || `HTTP_${status}`;
        details = data.error.details || null;
      } else if (typeof data === 'string') {
        message = data;
      } else if ((data as any)?.detail) {
        message = typeof (data as any).detail === 'string' ? (data as any).detail : JSON.stringify((data as any).detail);
      }

      console.error(`[API Error ${status}] [${code}]:`, message, details);
      return Promise.reject(new AppApiError(status, message, code, details));
    } else if (error.request) {
      console.error('[API Network Error]: No response received from server.');
      return Promise.reject(new AppApiError(503, 'Service unavailable. Please check backend connection.', 'NETWORK_ERROR'));
    } else {
      console.error('[API Configuration Error]:', error.message);
      return Promise.reject(new AppApiError(500, error.message || 'Request initialization failed.', 'CLIENT_ERROR'));
    }
  }
);
