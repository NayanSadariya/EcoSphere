import { useState, useEffect, useCallback, useRef } from 'react';

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * useQuery — a generic data-fetching hook with loading/error states and
 * automatic refetch capability. Services already handle mock fallback,
 * so the UI always gets data even when the backend is unreachable.
 */
export function useQuery<T>(fetcher: () => Promise<T>, deps: unknown[] = []): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const depKey = deps.map((d) => String(d)).join('|');

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.resolve()
      .then(() => fetcherRef.current())
      .then((d) => setData(d))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to fetch'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/** useMutation — for write operations (create/update/delete/redeem) */
export function useMutation<T, V = void>(mutator: (vars: V) => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (vars: V): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutator(vars);
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Operation failed');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutator]
  );

  return { mutate, loading, error };
}
