'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-105 hover:z-10"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      onClick={onClick}
    >
      <Card
        className={cn(
          "glass-effect px-2 py-1.5 min-w-[100px] text-center shadow-md hover:shadow-lg transition-all",
          isActive 
            ? "border-green-500/50 bg-green-50/80 hover:bg-green-50" 
            : "border-gray-300/50 bg-gray-50/40 opacity-60 hover:opacity-80"
        )}
      >
        <div className="text-xs font-medium text-gray-900 mb-1 leading-tight truncate">
          {displayName}
        </div>
        <div className="flex items-center justify-center gap-1">
          <Badge 
            variant={isActive ? "default" : "secondary"}
            className={cn(
              "text-xs font-semibold px-1 py-0",
              isActive 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-gray-400"
            )}
          >
            {recordCount > 99 ? '99+' : recordCount}
          </Badge>
          <span className={cn(
            "text-xs font-medium",
            isActive ? "text-green-700" : "text-gray-500"
          )}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </Card>
    </div>
  );
}