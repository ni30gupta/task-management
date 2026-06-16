import { useEffect, useRef } from 'react';

/**
 * Returns an AbortController that is automatically aborted when the
 * component unmounts (or when the effect re-runs).
 *
 * Usage:
 *   const { signal } = useAbortController();
 *   useEffect(() => { fetchData(signal); }, []);
 *
 * Pass `signal` to any api function to automatically cancel the request
 * on unmount. Aborted requests throw an error with `name === 'CanceledError'`
 * (axios) or `name === 'AbortError'` (fetch) — both are safe to ignore.
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    // Create a fresh controller for each mount
    controllerRef.current = new AbortController();
    return () => {
      controllerRef.current.abort();
    };
  }, []);

  return {
    signal: controllerRef.current.signal,
    abort: () => controllerRef.current.abort(),
  };
}

/**
 * Returns true if an error is an abort/cancel — safe to swallow silently.
 */
export function isAbortError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; code?: string };
  return e.name === 'AbortError' || e.name === 'CanceledError' || e.code === 'ERR_CANCELED';
}
