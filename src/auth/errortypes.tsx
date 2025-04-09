export interface ApiError {
    response?: {
      status?: number;
      data?: any;
    };
    message?: string;
  }
  
  export function isApiError(error: unknown): error is ApiError {
    return typeof error === 'object' && error !== null && 'response' in error;
  }