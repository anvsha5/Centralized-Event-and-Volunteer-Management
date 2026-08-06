import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to poll an async fetcher function at specified interval (default 4000ms).
 */
export function usePolling(fetcherFn, intervalMs = 4000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const savedFetcher = useRef(fetcherFn);

  useEffect(() => {
    savedFetcher.current = fetcherFn;
  }, [fetcherFn]);

  useEffect(() => {
    let isMounted = true;

    async function executeFetch() {
      try {
        const result = await savedFetcher.current();
        if (isMounted) {
          setData(result);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Polling error');
          setLoading(false);
        }
      }
    }

    // Initial fetch
    executeFetch();

    // Polling interval
    const timer = setInterval(executeFetch, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [intervalMs]);

  return { data, loading, error };
}

export default usePolling;
