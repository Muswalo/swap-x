// Error handling utilities for the SwapX app

export type AppError = {
  message: string;
  code?: string;
  details?: any;
  isRetryable?: boolean;
};

export type ErrorCategory = 
  | 'network'
  | 'authentication'
  | 'validation'
  | 'database'
  | 'file_upload'
  | 'unknown';

/**
 * Parse and categorize errors from various sources
 */
export function parseError(error: any): AppError {
  // Network errors
  if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return {
      message: 'Network connection issue. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      details: error,
      isRetryable: true,
    };
  }

  // Supabase authentication errors
  if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
    return {
      message: 'Your session has expired. Please log in again.',
      code: 'AUTH_ERROR',
      details: error,
      isRetryable: false,
    };
  }

  // Supabase database errors
  if (error?.code?.startsWith('23')) {
    // PostgreSQL constraint violations
    if (error.code === '23505') {
      return {
        message: 'This record already exists.',
        code: 'DUPLICATE_ERROR',
        details: error,
        isRetryable: false,
      };
    }
    if (error.code === '23503') {
      return {
        message: 'Related record not found.',
        code: 'FOREIGN_KEY_ERROR',
        details: error,
        isRetryable: false,
      };
    }
    return {
      message: 'Database constraint violation.',
      code: 'CONSTRAINT_ERROR',
      details: error,
      isRetryable: false,
    };
  }

  // Validation errors
  if (error?.message?.includes('invalid') || error?.message?.includes('required')) {
    return {
      message: error.message || 'Invalid input. Please check your data.',
      code: 'VALIDATION_ERROR',
      details: error,
      isRetryable: false,
    };
  }

  // File upload errors
  if (error?.message?.includes('upload') || error?.message?.includes('storage')) {
    return {
      message: 'Failed to upload file. Please try again.',
      code: 'UPLOAD_ERROR',
      details: error,
      isRetryable: true,
    };
  }

  // Default error
  return {
    message: error?.message || 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    details: error,
    isRetryable: true,
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: any): string {
  const parsedError = parseError(error);
  return parsedError.message;
}

/**
 * Determine error category
 */
export function categorizeError(error: any): ErrorCategory {
  const parsedError = parseError(error);
  
  if (parsedError.code?.includes('NETWORK')) return 'network';
  if (parsedError.code?.includes('AUTH')) return 'authentication';
  if (parsedError.code?.includes('VALIDATION')) return 'validation';
  if (parsedError.code?.includes('UPLOAD')) return 'file_upload';
  if (parsedError.code?.includes('CONSTRAINT') || parsedError.code?.includes('FOREIGN_KEY') || parsedError.code?.includes('DUPLICATE')) {
    return 'database';
  }
  
  return 'unknown';
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: any): boolean {
  const parsedError = parseError(error);
  return parsedError.isRetryable ?? false;
}

/**
 * Retry mechanism for async operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, onRetry } = options;
  
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry if error is not retryable
      if (!isRetryable(error)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Call retry callback
      if (onRetry) {
        onRetry(attempt, error);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw lastError;
}

/**
 * Log error for debugging (can be extended to send to error tracking service)
 */
export function logError(error: any, context?: string) {
  const parsedError = parseError(error);
  console.error(`[${context || 'Error'}]`, {
    message: parsedError.message,
    code: parsedError.code,
    details: parsedError.details,
    timestamp: new Date().toISOString(),
  });
}
