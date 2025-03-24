import { queryClient } from "./queryClient";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

interface ApiError extends Error {
  status?: number;
  data?: any;
}

// Generic function to make API requests
export async function apiRequest<T = any>(
  method: string,
  endpoint: string,
  data?: unknown,
  options?: FetchOptions
): Promise<T> {
  const url = new URL(`/api${endpoint}`, window.location.origin);
  
  // Add query parameters if provided
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add authentication token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url.toString(), {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
      ...options,
    });
    
    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const error = new Error(
        errorData?.error?.message || errorData?.message || response.statusText || 'API request failed'
      ) as ApiError;
      
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    
    // Parse JSON response if available, otherwise return empty object
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return {} as T;
  } catch (error) {
    if ((error as ApiError).status === 401) {
      // Clear token on unauthorized
      localStorage.removeItem('token');
      queryClient.clear();
      window.location.href = '/login';
    }
    
    throw error;
  }
}

// Shorthand methods for common API requests
export const api = {
  get: <T = any>(endpoint: string, options?: FetchOptions) => 
    apiRequest<T>('GET', endpoint, undefined, options),
    
  post: <T = any>(endpoint: string, data?: unknown, options?: FetchOptions) => 
    apiRequest<T>('POST', endpoint, data, options),
    
  put: <T = any>(endpoint: string, data?: unknown, options?: FetchOptions) => 
    apiRequest<T>('PUT', endpoint, data, options),
    
  patch: <T = any>(endpoint: string, data?: unknown, options?: FetchOptions) => 
    apiRequest<T>('PATCH', endpoint, data, options),
    
  delete: <T = any>(endpoint: string, options?: FetchOptions) => 
    apiRequest<T>('DELETE', endpoint, undefined, options),
};
