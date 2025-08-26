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
  moduleName,
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
        className={cn(
          "w-16 h-16 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 group-hover:z-30 flex flex-col items-center justify-center relative",
          "active:scale-95",
          isActive 
            ? "bg-teal-100/90 border border-teal-300/60 shadow-lg shadow-teal-200/30 hover:bg-teal-50 hover:shadow-xl" 
            : "bg-amber-100/90 border border-amber-300/60 shadow-lg shadow-amber-200/30 hover:bg-amber-50 hover:shadow-xl"
        )}
      >
        {/* Content */}
        <div className="flex flex-col items-center justify-center h-full">
          <div className={cn(
            "text-[8px] font-bold leading-tight mb-1 text-center px-0.5 w-full",
            isActive ? "text-teal-800" : "text-amber-800"
          )}>
            {displayName}
          </div>
          <div className={cn(
            "text-[10px] font-bold leading-none mb-0.5 bg-white/60 rounded-full px-1.5 py-0.5",
            isActive ? "text-teal-700" : "text-amber-700"
          )}>
            {recordCount > 99 ? '99+' : recordCount}
          </div>
          <div className={cn(
            "text-[6px] font-semibold uppercase tracking-wide leading-none bg-white/40 rounded-full px-1 py-0.5",
            isActive ? "text-teal-600" : "text-amber-600"
          )}>
            {isActive ? 'Done' : 'Pending'}
          </div>
        </div>
      </div>
    </div>
  );
}