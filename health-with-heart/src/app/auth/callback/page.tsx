'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, Heart } from 'lucide-react';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL fragments
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data.session) {
          setMessage('Authentication successful! Linking your account...');
          
          // Link the user account
          await linkUserAccount(data.session.user);
          
          setStatus('success');
          setMessage('Account linked successfully! Redirecting...');
          
          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = '/my-dashboard';
          }, 1500);
        } else {
          throw new Error('No session found');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed');
        
        // Redirect to login after error
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    const linkUserAccount = async (user: any) => {
      if (!user?.email || !user?.id) return;
      
      try {
        // Find matching user in database
        const response = await fetch('/api/users');
        if (!response.ok) return;
        
        const usersData = await response.json();
        const matchingUser = usersData.users?.find((dbUser: any) => 
          dbUser.email.toLowerCase() === user.email.toLowerCase()
        );
        
        if (!matchingUser) {
          console.warn(`No database user found for email: ${user.email}`);
          return;
        }
        
        // Check if already linked
        if (matchingUser.auth_user_id === user.id) {
          console.log('User already linked');
          return;
        }
        
        // Update the database user with Supabase user ID
        const updateResponse = await fetch(`/api/users/${matchingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth_user_id: user.id,
            date_updated: new Date().toISOString()
          })
        });
        
        if (updateResponse.ok) {
          console.log(`Successfully linked user: ${matchingUser.name} ${matchingUser.surname}`);
        }
        
      } catch (error) {
        console.error('Error linking user account:', error);
        // Don't throw - continue even if linking fails
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
          
          {/* Logo */}
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
          
          {/* Status Icon */}
          {status === 'loading' && (
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          )}
          
          {status === 'error' && (
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          )}
          
          {/* Message */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              {status === 'loading' && 'Authenticating...'}
              {status === 'success' && 'Welcome Back!'}
              {status === 'error' && 'Authentication Failed'}
            </h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          
          {/* Health with Heart branding */}
          <div className="text-center text-xs text-muted-foreground">
            <p className="font-medium">Health with Heart</p>
            <p>OHMS Dashboard</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}