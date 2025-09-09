'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  sidebarWidth: string;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const sidebarWidth = isCollapsed ? 'pl-16' : 'pl-64';

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, setIsCollapsed, sidebarWidth }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
