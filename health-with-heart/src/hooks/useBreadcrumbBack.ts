'use client';

import { useCallback } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

type BreadcrumbEntry = { href: string; label: string };

function readBreadcrumbHistory(): BreadcrumbEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem('breadcrumbsHistory');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BreadcrumbEntry[]) : [];
  } catch {
    return [];
  }
}

function basePathFromHref(href: string): string {
  return href.split('?')[0] || href;
}

export function useBreadcrumbBack(fallbackHref: string = '/') {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(() => {
    const search = searchParams?.toString() || '';
    const currentHref = (pathname || '/') + (search ? `?${search}` : '');

    const history = readBreadcrumbHistory();
    if (history.length === 0) {
      router.push(fallbackHref);
      return;
    }

    // Jump to the previous entry whose base path differs from the current base.
    const currentBase = basePathFromHref(currentHref);
    let targetHref: string | null = null;

    // Find the index of the latest occurrence of the current base path
    let lastIndexOfCurrentBase = -1;
    for (let i = history.length - 1; i >= 0; i--) {
      if (basePathFromHref(history[i].href) === currentBase) {
        lastIndexOfCurrentBase = i;
        break;
      }
    }

    if (lastIndexOfCurrentBase > 0) {
      // Walk backward to the first previous entry with a different base path
      for (let i = lastIndexOfCurrentBase - 1; i >= 0; i--) {
        const prevBase = basePathFromHref(history[i].href);
        if (prevBase !== currentBase) {
          targetHref = history[i].href;
          break;
        }
      }
    }

    // If no different base path found, fallback to root or the earliest entry
    if (!targetHref) {
      targetHref = history[0]?.href || fallbackHref;
    }

    router.push(targetHref || fallbackHref);
  }, [router, pathname, searchParams, fallbackHref]);
}

export default useBreadcrumbBack;
