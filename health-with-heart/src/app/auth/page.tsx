'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Stethoscope,
  Shield,
  Users
} from 'lucide-react';
import { ButtonLoading } from '@/components/ui/loading';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

type AuthMode = 'login' | 'signup' | 'reset';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        setMessage('Login successful! Redirecting...');
        // Redirect to dashboard
        window.location.href = '/my-dashboard';
        
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        setMessage('Check your email for verification link!');
        
      } else if (mode === 'reset') {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        
        if (error) throw error;
        
        setMessage('Password reset email sent!');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/my-dashboard`,
        },
      });
      
      if (error) throw error;
      
      setMessage('Check your email for the magic link!');
    } catch (error: any) {
      setError(error.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2EFED' }}>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Health with Heart</h1>
                <p className="text-sm text-muted-foreground">OHMS Dashboard</p>
              </div>
            </div>
            
            <Badge variant="secondary" className="gap-2">
              <Shield className="h-3 w-3" />
              Secure Access
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Branding & Features */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-900">
                  Occupational Health Management System
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Streamline medical assessments, manage employee health records, 
                  and generate comprehensive medical reports with our integrated platform.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/60">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Medical Assessments</h3>
                    <p className="text-sm text-gray-600">Comprehensive health evaluations and screenings</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/60">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Employee Records</h3>
                    <p className="text-sm text-gray-600">Centralized health data management</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full max-w-md mx-auto">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl">
                    {mode === 'login' && 'Welcome Back'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'reset' && 'Reset Password'}
                  </CardTitle>
                  <CardDescription>
                    {mode === 'login' && 'Sign in to access your dashboard'}
                    {mode === 'signup' && 'Get started with Health with Heart'}
                    {mode === 'reset' && 'Enter your email to reset your password'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Messages */}
                  {message && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                      {message}
                    </div>
                  )}
                  
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@healthwithheart.co.za"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    {mode !== 'reset' && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <ButtonLoading />
                          {mode === 'login' && 'Signing in...'}
                          {mode === 'signup' && 'Creating account...'}
                          {mode === 'reset' && 'Sending email...'}
                        </>
                      ) : (
                        <>
                          {mode === 'login' && 'Sign In'}
                          {mode === 'signup' && 'Create Account'}
                          {mode === 'reset' && 'Send Reset Email'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Magic Link Option */}
                  {mode === 'login' && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleMagicLink}
                        disabled={loading}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Send Magic Link
                      </Button>
                    </>
                  )}

                  {/* Mode Switching */}
                  <div className="text-center text-sm space-y-2">
                    {mode === 'login' && (
                      <>
                        <div>
                          <button
                            type="button"
                            onClick={() => setMode('reset')}
                            className="text-primary hover:underline"
                          >
                            Forgot your password?
                          </button>
                        </div>
                        <div>
                          Don't have an account?{' '}
                          <button
                            type="button"
                            onClick={() => setMode('signup')}
                            className="text-primary hover:underline font-medium"
                          >
                            Sign up
                          </button>
                        </div>
                      </>
                    )}
                    
                    {mode === 'signup' && (
                      <div>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setMode('login')}
                          className="text-primary hover:underline font-medium"
                        >
                          Sign in
                        </button>
                      </div>
                    )}
                    
                    {mode === 'reset' && (
                      <div>
                        Remember your password?{' '}
                        <button
                          type="button"
                          onClick={() => setMode('login')}
                          className="text-primary hover:underline font-medium"
                        >
                          Back to sign in
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Security Notice */}
              <div className="mt-6 text-center text-xs text-muted-foreground">
                <p>This system contains confidential medical information.</p>
                <p>Authorized access only. All activities are monitored.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-primary" />
              <span>© 2025 Health with Heart. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}