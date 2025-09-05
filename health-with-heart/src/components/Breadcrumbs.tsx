'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

function toTitleCase(text: string): string {
  return text
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function getSegmentLabel(segment: string): string {
  const labelMap: Record<string, string> = {
    '': 'Dashboard',
    'my-dashboard': 'My Dashboard',
    'analytics': 'Analytics',
    'appointments': 'Appointments',
    'assessments': 'Assessments',
    'calendar': 'Calendar',
    'cost-centers': 'Cost Centers',
    'employees': 'Employees',
    'emergency-responses': 'Emergency Responses',
    'lab-tests': 'Lab Tests',
    'locations': 'Locations',
    'lifestyle': 'Lifestyle',
    'managers': 'Managers',
    'medical-history': 'Medical History',
    'medical-staff': 'Medical Staff',
    'mens-health': "Men's Health",
    'organizations': 'Organizations',
    'reports': 'Reports',
    'settings': 'Settings',
    'sites': 'Sites',
    'special-investigations': 'Special Investigations',
    'users': 'Users',
    'user-profile': 'User Profile',
    'vital-statistics': 'Vital Statistics',
    'vitals': 'Vitals',
    'womens-health': "Women's Health",
    'new': 'New',
    'edit': 'Edit',
    'create': 'Create',
  };

  if (labelMap[segment]) return labelMap[segment];

  // IDs or UUID-like segments
  if (/^\d+$/.test(segment)) return 'Details';
  if (/^[0-9a-fA-F-]{8,}$/.test(segment)) return 'Details';

  return toTitleCase(segment);
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const STORAGE_KEY = 'breadcrumbsHistory';
  const searchParams = useSearchParams();

  const readStoredHistory = () => {
    if (typeof window === 'undefined') return [] as { href: string; label: string }[];
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return [] as { href: string; label: string }[];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [] as { href: string; label: string }[];
      return parsed as { href: string; label: string }[];
    } catch {
      return [] as { href: string; label: string }[];
    }
  };

  const [historyCrumbs, setHistoryCrumbs] = useState<{ href: string; label: string }[]>(() => readStoredHistory());

  useEffect(() => {

    // Build label for current route
    const currentLabel = getSegmentLabel(segments[segments.length - 1] || '');
    const search = searchParams?.toString() || '';
    const currentEntry = {
      href: (pathname || '/') + (search ? `?${search}` : ''),
      label: segments.length === 0 ? 'Dashboard' : currentLabel,
    };

    // Read existing history
    let existing: { href: string; label: string }[] = readStoredHistory();

    // Ensure root exists and is first
    const ensureRoot = (list: { href: string; label: string }[]) => {
      const rootItem = { href: '/', label: 'Dashboard' };
      const filtered = list.filter(c => c.href !== '/');
      return [rootItem, ...filtered];
    };

    // Navigation stack behavior:
    // - If current path already exists in history, trim everything after it (back navigation)
    // - Otherwise, append it (forward navigation)
    let next = ensureRoot(existing);
    const existingIndex = next.findIndex(c => c.href === currentEntry.href);
    if (existingIndex >= 0) {
      next = next.slice(0, existingIndex + 1);
    } else {
      next = [...next, currentEntry];
    }

    // Limit length (keep root + last N-1)
    const MAX = 8;
    const root = next[0]?.href === '/' ? next[0] : { href: '/', label: 'Dashboard' };
    const others = next.filter((c, i) => i !== 0);
    const trimmed = [root, ...others.slice(Math.max(others.length - (MAX - 1), 0))] as {
      href: string;
      label: string;
    }[];

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    setHistoryCrumbs(trimmed);
  }, [pathname]);

  const pathBasedItems = [
    { href: '/', label: 'Dashboard' },
    ...segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      return { href, label: getSegmentLabel(segment) };
    }),
  ];

  const items = historyCrumbs.length > 0 ? historyCrumbs : pathBasedItems;

  return (
    <div className="pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[10vw] py-2">
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <BreadcrumbItem key={`${item.href}-${idx}`}>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
                {!isLast && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}


