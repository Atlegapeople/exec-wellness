import { useState, useEffect } from 'react';

export function useAPI<T>(url: string | null, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Don't fetch if URL is null or empty
    if (!url) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Add timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        setData(result);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('API Error:', err);
        if (err instanceof Error && err.name === 'AbortError') {
          setError('Request timeout - please try again');
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }

        // Auto-retry on network errors (up to 2 retries)
        if (
          retryCount < 2 &&
          err instanceof Error &&
          !err.message.includes('HTTP error')
        ) {
          setTimeout(
            () => {
              setRetryCount(prev => prev + 1);
            },
            1000 * (retryCount + 1)
          ); // Exponential backoff
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, retryCount, ...dependencies]);

  const retry = () => {
    setRetryCount(0);
    setError(null);
  };

  return { data, loading, error, retry };
}
