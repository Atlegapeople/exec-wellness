'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function buildRouteKey(pathname: string, searchParams: ReadonlyURLSearchParams | null): string {
  const search = searchParams?.toString() || '';
  return (pathname || '/') + (search ? `?${search}` : '');
}

function readFromSession<T>(storageKey: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function useRouteState<T>(
  key: string,
  initialValue: T,
  options?: { scope?: 'path' | 'path+query' }
) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scope = options?.scope ?? 'path+query';
  const routeKey = buildRouteKey(pathname, scope === 'path+query' ? searchParams : null);
  const storageKey = useMemo(() => `routeState:${routeKey}:${key}`, [routeKey, key]);

  const [state, setState] = useState<T>(() => {
    const stored = readFromSession<T>(storageKey);
    return stored !== null ? stored : initialValue;
  });

  // When the route changes, try to load existing value for the new route
  useEffect(() => {
    const stored = readFromSession<T>(storageKey);
    setState(stored !== null ? stored : initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Persist on change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }, [state, storageKey]);

  return [state, setState] as const;
}


