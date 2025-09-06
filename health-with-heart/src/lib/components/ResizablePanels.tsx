'use client';

import { useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResizablePanelsProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  className?: string;
}

export default function ResizablePanels({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 40,
  minLeftWidth = 20,
  maxLeftWidth = 80,
  className = ''
}: ResizablePanelsProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain within min/max bounds
    const constrainedWidth = Math.min(Math.max(newLeftWidth, minLeftWidth), maxLeftWidth);
    setLeftWidth(constrainedWidth);
  }, [isResizing, minLeftWidth, maxLeftWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={containerRef}
      className={cn('flex h-full w-full', className)}
    >
      {/* Left Panel */}
      <div 
        style={{ width: `${leftWidth}%` }}
        className="flex-shrink-0 overflow-hidden pr-2 relative"
      >
        <div className="h-full overflow-y-auto">
          {leftPanel}
        </div>
      </div>

      {/* Resizable Divider */}
      <div
        className="flex-shrink-0 w-2 transition-colors duration-200 cursor-col-resize relative group z-20"
        style={{
          backgroundColor: isResizing ? '#B6D9CE' : '#D7D9D9'
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B6D9CE'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isResizing ? '#B6D9CE' : '#D7D9D9'}
      >
        {/* Visual indicator */}
        <div 
          className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 transition-colors duration-200"
          style={{ backgroundColor: 'rgba(215, 217, 217, 0.8)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(183, 214, 206, 0.6)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(215, 217, 217, 0.8)'}
        />
        
        {/* Hover area */}
        <div className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize z-20" />
      </div>

      {/* Right Panel */}
      <div 
        style={{ width: `${100 - leftWidth}%` }}
        className="flex-1 overflow-hidden relative"
      >
        <div className="h-full overflow-y-auto">
          {rightPanel}
        </div>
      </div>
    </div>
  );
}