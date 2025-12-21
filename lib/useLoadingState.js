import { useLoading } from '../context/LoadingContext';

/**
 * Hook for running an async operation with loading state
 * Usage: const runWithLoading = useLoadingState();
 *        await runWithLoading(async () => { ... }, "Optional message");
 */
export const useLoadingState = () => {
  const { showLoading, hideLoading } = useLoading();

  const runWithLoading = async (asyncFn, message = '') => {
    try {
      showLoading(message);
      const result = await asyncFn();
      return result;
    } catch (error) {
      console.error('Error during operation:', error);
      throw error;
    } finally {
      // Add small delay to prevent flashing
      setTimeout(() => {
        hideLoading();
      }, 300);
    }
  };

  return runWithLoading;
};
