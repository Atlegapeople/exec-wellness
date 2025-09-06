'use client';

import { cn } from '@/lib/utils';
import { Loader2, Stethoscope } from 'lucide-react';

interface LoadingProps {
  /**
   * Size variant for the loading spinner
   * - xs: 12px (for small buttons)
   * - sm: 16px (for inline elements)  
   * - md: 24px (for cards/sections)
   * - lg: 32px (for page sections)
   * - xl: 48px (for full page loading)
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Loading text to display
   */
  text?: string;
  
  /**
   * Whether to show the medical stethoscope overlay
   */
  showMedicalIcon?: boolean;
  
  /**
   * Layout variant
   * - inline: For use within buttons or inline elements
   * - centered: For centered loading in cards/sections  
   * - fullscreen: For full page loading with padding
   */
  variant?: 'inline' | 'centered' | 'fullscreen';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Subtitle text for more context
   */
  subtitle?: string;
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4', 
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const medicalIconSizes = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-3 w-3', 
  lg: 'h-4 w-4',
  xl: 'h-6 w-6'
};

const textSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg', 
  xl: 'text-xl'
};

export function Loading({
  size = 'md',
  text,
  showMedicalIcon = false,
  variant = 'centered',
  className,
  subtitle
}: LoadingProps) {
  const spinnerClasses = cn(
    'animate-spin',
    sizeClasses[size],
    className
  );
  
  const medicalIconClasses = cn(
    medicalIconSizes[size],
    'opacity-30'
  );

  const LoadingSpinner = () => (
    <div className="relative">
      <Loader2 
        className={spinnerClasses}
        style={{ color: 'var(--teal)' }}
      />
      {showMedicalIcon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Stethoscope 
            className={medicalIconClasses}
            style={{ color: 'var(--teal)' }}
          />
        </div>
      )}
    </div>
  );

  // Inline variant (for buttons, inline elements)
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2">
        <LoadingSpinner />
        {text && (
          <span className={cn('font-medium', textSizes[size])} style={{ color: 'var(--forest)' }}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Fullscreen variant (for full page loading)
  if (variant === 'fullscreen') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          {text && (
            <div className="space-y-2">
              <h3 className={cn('font-semibold', textSizes[size])} style={{ color: 'var(--forest)' }}>
                {text}
              </h3>
              {subtitle && (
                <p className="text-sm" style={{ color: 'var(--fern)' }}>
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Centered variant (default - for cards, sections)
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <LoadingSpinner />
      {text && (
        <div className="text-center space-y-1">
          <p className={cn('font-medium', textSizes[size])} style={{ color: 'var(--forest)' }}>
            {text}
          </p>
          {subtitle && (
            <p className="text-sm" style={{ color: 'var(--fern)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Convenience components for common use cases
export function PageLoading({ text = 'Loading', subtitle }: { text?: string; subtitle?: string }) {
  return (
    <Loading 
      size="xl" 
      variant="fullscreen" 
      text={text}
      subtitle={subtitle}
      showMedicalIcon={true}
    />
  );
}

export function SectionLoading({ text }: { text?: string }) {
  return (
    <Loading 
      size="lg" 
      variant="centered" 
      text={text}
    />
  );
}

export function InlineLoading({ text, size = 'sm' }: { text?: string; size?: LoadingProps['size'] }) {
  return (
    <Loading 
      size={size} 
      variant="inline" 
      text={text}
    />
  );
}

export function ButtonLoading() {
  return (
    <Loading 
      size="sm" 
      variant="inline"
    />
  );
}