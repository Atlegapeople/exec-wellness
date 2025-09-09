'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';

function getRouteKey(
  pathname: string,
  searchParams: ReadonlyURLSearchParams | null
): string {
  const search = searchParams?.toString() || '';
  return (pathname || '/') + (search ? `?${search}` : '');
}

export default function RouteStateKeeper() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = getRouteKey(pathname, searchParams);
  const prevKeyRef = useRef<string | null>(null);

  // Restore scroll on route change
  useEffect(() => {
    // Save scroll for previous route
    if (prevKeyRef.current) {
      try {
        sessionStorage.setItem(
          `scroll:${prevKeyRef.current}`,
          String(window.scrollY)
        );
      } catch {}
    }

    // Restore scroll for current route
    try {
      const stored = sessionStorage.getItem(`scroll:${key}`);
      const y = stored ? parseInt(stored, 10) : 0;
      window.requestAnimationFrame(() => window.scrollTo(0, isNaN(y) ? 0 : y));
    } catch {
      window.scrollTo(0, 0);
    }

    prevKeyRef.current = key;
  }, [key]);

  // Persist on unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        sessionStorage.setItem(`scroll:${key}`, String(window.scrollY));
      } catch {}
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [key]);

  return null;
}
