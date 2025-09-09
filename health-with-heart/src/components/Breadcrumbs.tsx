'use client';

import { useEffect, useMemo, useState, Fragment } from 'react';
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

function basePathFromHref(href: string): string {
  return href.split('?')[0] || href;
}

// Detect if a path segment looks like an ID (numeric or UUID-like)
function isIdSegment(segment: string): boolean {
  return /^\d+$/.test(segment) || /^[0-9a-fA-F-]{8,}$/.test(segment);
}

// Map path resources to API endpoints and label builders
async function fetchLabelForResource(
  resource: string,
  id: string
): Promise<string | null> {
  try {
    switch (resource) {
      case 'employees': {
        const res = await fetch(`/api/employees/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        const fullName = [data.name, data.surname]
          .filter(Boolean)
          .join(' ')
          .trim();
        return fullName || null;
      }
      case 'users': {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        const fullName = [data.name, data.surname]
          .filter(Boolean)
          .join(' ')
          .trim();
        return fullName || data.email || null;
      }
      case 'organizations':
      case 'organisations': {
        const res = await fetch(`/api/organizations/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.name || null;
      }
      case 'sites': {
        const res = await fetch(`/api/sites/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.name || null;
      }
      case 'locations': {
        const res = await fetch(`/api/locations/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.name || null;
      }
      case 'managers': {
        const res = await fetch(`/api/managers/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.manager_name || null;
      }
      case 'medical-staff': {
        const res = await fetch(`/api/medical-staff/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        const fullName = [data.name, data.surname]
          .filter(Boolean)
          .join(' ')
          .trim();
        return fullName || null;
      }
      case 'appointments': {
        const res = await fetch(`/api/appointments/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        const fullName = [data.employee_name, data.employee_surname]
          .filter(Boolean)
          .join(' ')
          .trim();
        return fullName ? `Appointment: ${fullName}` : `Appointment ${id}`;
      }
      case 'reports': {
        const res = await fetch(`/api/reports/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        const fullName = [data.employee_name, data.employee_surname]
          .filter(Boolean)
          .join(' ')
          .trim();
        return fullName ? `Report: ${fullName}` : `Report ${id}`;
      }
      case 'lab-tests': {
        const res = await fetch(`/api/lab-tests/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.type ? `Lab Test: ${data.type}` : `Lab Test ${id}`;
      }
      case 'special-investigations': {
        const res = await fetch(`/api/special-investigations/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.type
          ? `Investigation: ${data.type}`
          : `Investigation ${id}`;
      }
      case 'cost-centers': {
        const res = await fetch(`/api/cost-centers/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.name || `Cost Center ${id}`;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function toTitleCase(text: string): string {
  return text
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function getSegmentLabel(segment: string): string {
  const labelMap: Record<string, string> = {
    '': 'Dashboard',
    'my-dashboard': 'My Dashboard',
    analytics: 'Analytics',
    appointments: 'Appointments',
    assessments: 'Assessments',
    calendar: 'Calendar',
    'cost-centers': 'Cost Centers',
    employees: 'Employees',
    'emergency-responses': 'Emergency Responses',
    'lab-tests': 'Lab Tests',
    locations: 'Locations',
    lifestyle: 'Lifestyle',
    managers: 'Managers',
    'medical-history': 'Medical History',
    'medical-staff': 'Medical Staff',
    'mens-health': "Men's Health",
    organizations: 'Organizations',
    reports: 'Reports',
    settings: 'Settings',
    sites: 'Sites',
    'special-investigations': 'Special Investigations',
    users: 'Users',
    'user-profile': 'User Profile',
    'vital-statistics': 'Vital Statistics',
    vitals: 'Vitals',
    'womens-health': "Women's Health",
    new: 'New',
    edit: 'Edit',
    create: 'Create',
  };

  if (labelMap[segment]) return labelMap[segment];

  // IDs or UUID-like segments
  if (/^\d+$/.test(segment)) return 'Details';
  if (/^[0-9a-fA-F-]{8,}$/.test(segment)) return 'Details';

  return toTitleCase(segment);
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = useMemo(
    () => pathname.split('/').filter(Boolean),
    [pathname]
  );
  const STORAGE_KEY = 'breadcrumbsHistory';
  const searchParams = useSearchParams();

  const readStoredHistory = () => {
    if (typeof window === 'undefined')
      return [] as { href: string; label: string }[];
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return [] as { href: string; label: string }[];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed))
        return [] as { href: string; label: string }[];
      return parsed as { href: string; label: string }[];
    } catch {
      return [] as { href: string; label: string }[];
    }
  };

  const [historyCrumbs, setHistoryCrumbs] = useState<
    { href: string; label: string }[]
  >(() => readStoredHistory());

  useEffect(() => {
    const run = async () => {
      // Build label for current route (with fetch-by-id support)
      let currentLabel = getSegmentLabel(segments[segments.length - 1] || '');
      const lastSegment = segments[segments.length - 1] || '';
      const penultimate = segments[segments.length - 2] || '';
      if (isIdSegment(lastSegment) && penultimate) {
        const fetched = await fetchLabelForResource(penultimate, lastSegment);
        if (fetched) {
          currentLabel = fetched;
        }
      }

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

      // Collapse consecutive items of the same base path and keep only the last
      // occurrence for each base path while preserving order.
      const dedupedRightToLeft: { href: string; label: string }[] = [];
      const seenBases = new Set<string>();
      for (let i = next.length - 1; i >= 0; i--) {
        const item = next[i];
        const base = basePathFromHref(item.href);
        if (!seenBases.has(base)) {
          dedupedRightToLeft.push(item);
          seenBases.add(base);
        }
      }
      next = dedupedRightToLeft.reverse();

      // Limit length (keep root + last N-1)
      const MAX = 8;
      const root =
        next[0]?.href === '/' ? next[0] : { href: '/', label: 'Dashboard' };
      const others = next.filter((c, i) => i !== 0);
      const trimmed = [
        root,
        ...others.slice(Math.max(others.length - (MAX - 1), 0)),
      ] as {
        href: string;
        label: string;
      }[];

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      setHistoryCrumbs(trimmed);
    };
    run();
  }, [pathname, searchParams, segments]);

  const pathBasedItems = [
    { href: '/', label: 'Dashboard' },
    ...segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      return { href, label: getSegmentLabel(segment) };
    }),
  ];

  const items = historyCrumbs.length > 0 ? historyCrumbs : pathBasedItems;

  return (
    <div className='pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[10vw] py-2'>
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <Fragment key={`${item.href}-${idx}`}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
