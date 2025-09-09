'use client';

import { Suspense } from 'react';
import { useBreadcrumbBack } from '@/hooks/useBreadcrumbBack';

interface BreadcrumbBackWrapperProps {
  fallbackHref?: string;
  children: (goBack: () => void) => React.ReactNode;
}

function BreadcrumbBackContent({
  fallbackHref,
  children,
}: BreadcrumbBackWrapperProps) {
  const goBack = useBreadcrumbBack(fallbackHref);
  return <>{children(goBack)}</>;
}

export default function BreadcrumbBackWrapper({
  fallbackHref,
  children,
}: BreadcrumbBackWrapperProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BreadcrumbBackContent fallbackHref={fallbackHref}>
        {children}
      </BreadcrumbBackContent>
    </Suspense>
  );
}
