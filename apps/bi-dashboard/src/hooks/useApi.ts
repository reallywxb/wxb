import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiOptions {
  deps?: unknown[];
  refreshInterval?: number; // 自动刷新间隔（毫秒），0 表示不自动刷新
}

export function useApi<T>(
  fetchFn: () => Promise<T>,
  options: UseApiOptions = {},
) {
  const { deps = [], refreshInterval = 0 } = options;
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    setState({ data: null, loading: true, error: null })
    try {
      const data = await fetchFn()
      setState({ data, loading: false, error: null })
    } catch (error) {
      console.error('[useApi] 请求失败:', error)
      setState({ data: null, loading: false, error: error as Error })
    }
  }, deps);

  useEffect(() => {
    fetchData();

    // 定时刷新
    if (refreshInterval > 0) {
      timerRef.current = setInterval(fetchData, refreshInterval);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchData, refreshInterval]);

  return { ...state, refetch: fetchData };
}
