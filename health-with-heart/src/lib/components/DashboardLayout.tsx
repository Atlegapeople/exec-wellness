'use client';

import { ReactNode, useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardContent({ children }: DashboardLayoutProps) {
  const { sidebarWidth } = useSidebar();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        {/* Sidebar - Sticky position, internally scrollable */}
        <div className="sticky top-0 h-screen flex-shrink-0 overflow-hidden">
          <Sidebar />
        </div>
        
        {/* Main Content Area - Natural scrolling */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation - Sticky at top */}
          <div className="sticky top-0 z-20 bg-background">
            <Navigation />
          </div>
          
          {/* Page Content - Natural document flow */}
          <main className="flex-1">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
          
          {/* Footer - At bottom of content, only visible after scrolling */}
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Sticky position, internally scrollable */}
      <div className="sticky top-0 h-screen flex-shrink-0 overflow-hidden">
        <Sidebar />
      </div>
      
      {/* Main Content Area - Natural scrolling */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation - Sticky at top */}
        <div className="sticky top-0 z-20 bg-background">
          <Navigation />
        </div>
        
        {/* Page Content - Natural document flow */}
        <main className="flex-1">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        
        {/* Footer - At bottom of content, only visible after scrolling */}
        <Footer />
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
    </ErrorBoundary>
  );
}