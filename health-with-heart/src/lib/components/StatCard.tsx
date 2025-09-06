import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: 'teal' | 'sage' | 'sunset' | 'fern' | 'soft-teal' | 'duck-egg' | 'coral' | 'daisy';
  subtitle?: string;
}

const colorStyles = {
  teal: {
    bg: 'var(--teal)',
    bgLight: 'rgba(23, 128, 137, 0.1)',
    text: 'var(--teal)',
    border: 'var(--teal)'
  },
  sage: {
    bg: 'var(--sage)',
    bgLight: 'rgba(180, 202, 188, 0.1)',
    text: 'var(--sage)',
    border: 'var(--sage)'
  },
  sunset: {
    bg: 'var(--sunset)',
    bgLight: 'rgba(214, 82, 65, 0.1)',
    text: 'var(--sunset)',
    border: 'var(--sunset)'
  },
  fern: {
    bg: 'var(--fern)',
    bgLight: 'rgba(117, 146, 130, 0.1)',
    text: 'var(--fern)',
    border: 'var(--fern)'
  },
  'soft-teal': {
    bg: 'var(--soft-teal)',
    bgLight: 'rgba(86, 150, 157, 0.1)',
    text: 'var(--soft-teal)',
    border: 'var(--soft-teal)'
  },
  'duck-egg': {
    bg: 'var(--duck-egg)',
    bgLight: 'rgba(182, 217, 206, 0.1)',
    text: 'var(--teal)',
    border: 'var(--duck-egg)'
  },
  coral: {
    bg: 'var(--coral)',
    bgLight: 'rgba(225, 153, 133, 0.1)',
    text: 'var(--coral)',
    border: 'var(--coral)'
  },
  daisy: {
    bg: 'var(--daisy)',
    bgLight: 'rgba(234, 183, 92, 0.1)',
    text: 'var(--daisy)',
    border: 'var(--daisy)'
  }
};

export default function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const colorStyle = colorStyles[color];
  
  return (
    <div 
      className="p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-all hover-lift"
      style={{ borderColor: colorStyle.border }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm body-text-medium" style={{ color: 'var(--fern)' }}>{title}</p>
          <p className="text-3xl heading-primary mt-2" style={{ color: colorStyle.text }}>{value}</p>
          {subtitle && (
            <p className="text-sm body-text mt-1" style={{ color: 'var(--fern)' }}>{subtitle}</p>
          )}
        </div>
        <div 
          className="text-4xl p-3 rounded-full"
          style={{ 
            backgroundColor: colorStyle.bgLight,
            color: colorStyle.text
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}