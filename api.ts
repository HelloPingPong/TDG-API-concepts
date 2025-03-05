/**
 * Base API client for making HTTP requests to the backend
 */

// Base API URL - should be configured based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/tdg/api';

// API response interface
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// HTTP request options
interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

/**
 * Send an HTTP request to the API
 * @param endpoint The API endpoint
 * @param options Request options
 * @returns Promise with the response data
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions
): Promise<ApiResponse<T>> {
  const { method, headers = {}, body, params } = options;
  
  // Build URL with query parameters if provided
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  // Default headers
  const requestHeaders: Record<string, string> = {
    'Accept': 'application/json',
    ...headers,
  };
  
  // Add Content-Type for requests with body
  if (body && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }
  
  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include', // Include cookies in requests if needed
  };
  
  // Add body to request if provided
  if (body) {
    if (body instanceof FormData) {
      requestOptions.body = body;
    } else {
      requestOptions.body = JSON.stringify(body);
    }
  }
  
  try {
    // Make the request
    const response = await fetch(url, requestOptions);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    // Parse response data
    let data: any = null;
    if (isJson) {
      data = await response.json();
    } else if (response.status !== 204) {
      // If not JSON and not No Content, get as text
      data = await response.text();
    }
    
    // Return structured response
    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data?.message || response.statusText,
      status: response.status
    };
  } catch (error) {
    // Handle network errors
    console.error('API request failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0
    };
  }
}

/**
 * HTTP GET request
 * @param endpoint API endpoint
 * @param params Query parameters
 * @returns Promise with response data
 */
export async function get<T = any>(
  endpoint: string,
  params?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'GET',
    params
  });
}

/**
 * HTTP POST request
 * @param endpoint API endpoint
 * @param data Request body
 * @param params Query parameters
 * @returns Promise with response data
 */
export async function post<T = any>(
  endpoint: string,
  data?: any,
  params?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data,
    params
  });
}

/**
 * HTTP PUT request
 * @param endpoint API endpoint
 * @param data Request body
 * @returns Promise with response data
 */
export async function put<T = any>(
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data
  });
}

/**
 * HTTP DELETE request
 * @param endpoint API endpoint
 * @returns Promise with response data
 */
export async function del<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE'
  });
}

/**
 * Upload a file
 * @param endpoint API endpoint
 * @param file File to upload
 * @param additionalData Additional form data
 * @returns Promise with response data
 */
export async function uploadFile<T = any>(
  endpoint: string,
  file: File,
  fieldName: string = 'file',
  additionalData?: Record<string, string>
): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: formData
  });
}

/**
 * Download a file from the API
 * @param endpoint API endpoint
 * @param filename Filename to save as
 * @param params Query parameters
 */
export async function downloadFile(
  endpoint: string,
  filename: string,
  params?: Record<string, string>
): Promise<boolean> {
  try {
    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return true;
  } catch (error) {
    console.error('File download failed:', error);
    return false;
  }
}
