'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  // Initialize with optimistic authentication state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('supabase.auth.token');
      return !!session;
    }
    return true; // Default to true to prevent flash
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use getSession first (faster, uses cached session)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          setIsAuthenticated(false);
          window.location.href = '/';
          return;
        }

        if (session?.user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        window.location.href = '/';
      }
    };

    // Check auth immediately without loading state
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        window.location.href = '/';
      } else if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // No loading screen - let the app render immediately

  // Not authenticated - redirect silently without showing any screen
  if (isAuthenticated === false) {
    return null; // Don't render anything, just redirect
  }

  // Authenticated - render children
  return <>{children}</>;
}