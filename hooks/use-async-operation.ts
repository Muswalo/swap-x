import { getUserFriendlyMessage, logError, retryOperation } from '@/utils/error-handler';
import { useCallback, useState } from 'react';

export type AsyncOperationState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
};

export type AsyncOperationOptions = {
  retry?: boolean;
  maxRetries?: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
};

/**
 * Hook for handling async operations with loading, error states, and retry logic
 */
export function useAsyncOperation<T = any>() {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (
      operation: () => Promise<T>,
      options: AsyncOperationOptions = {}
    ): Promise<T | null> => {
      const { retry = false, maxRetries = 3, onSuccess, onError } = options;

      setState({ data: null, error: null, isLoading: true });

      try {
        let result: T;

        if (retry) {
          result = await retryOperation(operation, {
            maxRetries,
            onRetry: (attempt, error) => {
              console.log(`Retry attempt ${attempt}:`, error);
            },
          });
        } else {
          result = await operation();
        }

        setState({ data: result, error: null, isLoading: false });
        
        if (onSuccess) {
          onSuccess();
        }

        return result;
      } catch (error) {
        const errorMessage = getUserFriendlyMessage(error);
        logError(error, 'useAsyncOperation');
        
        setState({ data: null, error: errorMessage, isLoading: false });
        
        if (onError) {
          onError(error);
        }

        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
