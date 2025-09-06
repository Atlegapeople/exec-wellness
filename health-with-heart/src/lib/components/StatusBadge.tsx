'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  moduleName: string;
  displayName: string;
  recordCount: number;
  isActive: boolean;
  onClick: () => void;
  position: { x: number; y: number };
}

export default function StatusBadge({
  displayName,
  recordCount,
  isActive,
  onClick,
  position
}: StatusBadgeProps) {
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      onClick={onClick}
    >
      <div
        className="w-16 h-16 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 group-hover:z-30 flex flex-col items-center justify-center relative active:scale-95"
        style={{
          backgroundColor: isActive ? 'rgba(180, 202, 188, 0.9)' : 'rgba(234, 183, 92, 0.9)',
          borderColor: isActive ? 'var(--sage)' : 'var(--daisy)',
          borderWidth: '1px',
          borderStyle: 'solid',
          boxShadow: isActive 
            ? '0 10px 15px -3px rgba(180, 202, 188, 0.3)' 
            : '0 10px 15px -3px rgba(234, 183, 92, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isActive ? 'var(--sage)' : 'var(--daisy)';
          e.currentTarget.style.boxShadow = isActive 
            ? '0 25px 25px -5px rgba(180, 202, 188, 0.4)' 
            : '0 25px 25px -5px rgba(234, 183, 92, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isActive ? 'rgba(180, 202, 188, 0.9)' : 'rgba(234, 183, 92, 0.9)';
          e.currentTarget.style.boxShadow = isActive 
            ? '0 10px 15px -3px rgba(180, 202, 188, 0.3)' 
            : '0 10px 15px -3px rgba(234, 183, 92, 0.3)';
        }}
      >
        {/* Content */}
        <div className="flex flex-col items-center justify-center h-full">
          <div 
            className="text-[8px] font-bold leading-tight mb-1 text-center px-0.5 w-full"
            style={{ color: isActive ? 'var(--forest)' : 'var(--forest)' }}
          >
            {displayName}
          </div>
          <div 
            className="text-[10px] font-bold leading-none mb-0.5 rounded-full px-1.5 py-0.5"
            style={{ color: isActive ? 'var(--forest)' : 'var(--forest)' }}
          >
            {recordCount > 99 ? '99+' : recordCount}
          </div>
          <div 
            className="text-[6px] font-semibold uppercase tracking-wide leading-none rounded-full px-1 py-0.5"
            style={{ color: isActive ? 'var(--fern)' : 'var(--fern)' }}
          >
            {isActive ? 'Done' : 'Pending'}
          </div>
        </div>
      </div>
    </div>
  );
}