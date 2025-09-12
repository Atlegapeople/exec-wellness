'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Heart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Stethoscope,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Building2,
  Shield,
} from 'lucide-react';
import { ButtonLoading } from '@/components/ui/loading';
// import { supabase } from '@/lib/supabase'; // Commented out for local database migration
import Footer from '@/components/Footer';
import Lottie from 'lottie-react';
import { toast } from 'sonner';

type AuthMode = 'login' | 'signup' | 'reset';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [animationData, setAnimationData] = useState(null);
  const [medicalReportsAnimationData, setMedicalReportsAnimationData] =
    useState(null);
  const [calendarAnimationData, setCalendarAnimationData] = useState(null);
  const [medicalAssessmentsAnimationData, setMedicalAssessmentsAnimationData] =
    useState(null);
  const [multiOrganizationAnimationData, setMultiOrganizationAnimationData] =
    useState(null);
  const [popiaComplianceAnimationData, setPopiaComplianceAnimationData] =
    useState(null);
  const [healthAnalyticsLoading, setHealthAnalyticsLoading] = useState(true);
  const [healthAnalyticsError, setHealthAnalyticsError] = useState(false);
  const [medicalReportsLoading, setMedicalReportsLoading] = useState(true);
  const [medicalReportsError, setMedicalReportsError] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState(false);
  const [medicalAssessmentsLoading, setMedicalAssessmentsLoading] =
    useState(true);
  const [medicalAssessmentsError, setMedicalAssessmentsError] = useState(false);
  const [multiOrganizationLoading, setMultiOrganizationLoading] =
    useState(true);
  const [multiOrganizationError, setMultiOrganizationError] = useState(false);
  const [popiaComplianceLoading, setPopiaComplianceLoading] = useState(true);
  const [popiaComplianceError, setPopiaComplianceError] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load the Lottie animation data for Health Analytics
    fetch(`/animation/Market Analysis.json?v=${Date.now()}`)
      .then(response => response.json())
      .then(data => {
        setAnimationData(data);
        setHealthAnalyticsLoading(false);
      })
      .catch(error => {
        console.error('Error loading animation:', error);
        setHealthAnalyticsError(true);
        setHealthAnalyticsLoading(false);
      });

    // Load the medical reports animation
    fetch(`/animation/med-reports.json?v=${Date.now()}`)
      .then(response => response.json())
      .then(data => {
        setMedicalReportsAnimationData(data);
        setMedicalReportsLoading(false);
      })
      .catch(error => {
        console.error('Error loading medical reports animation:', error);
        setMedicalReportsError(true);
        setMedicalReportsLoading(false);
      });

    // Load the calendar animation
    fetch(`/animation/calendar.json?v=${Date.now()}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(
            `Failed to load calendar animation: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then(data => {
        setCalendarAnimationData(data);
        setCalendarLoading(false);
      })
      .catch(error => {
        console.error('Error loading calendar animation:', error);
        setCalendarError(true);
        setCalendarLoading(false);
      });

    // Load the medical assessments animation
    fetch(`/animation/stethoscope.json?v=${Date.now()}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(
            `Failed to load medical assessments animation: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then(data => {
        setMedicalAssessmentsAnimationData(data);
        setMedicalAssessmentsLoading(false);
      })
      .catch(error => {
        console.error('Error loading medical assessments animation:', error);
        setMedicalAssessmentsError(true);
        setMedicalAssessmentsLoading(false);
      });

    // Load the multi-organization animation
    fetch(`/animation/Building Lottie animation.json?v=${Date.now()}`)
      .then(response => {
        console.log(
          'Multi-organization animation response:',
          response.status,
          response.statusText
        );
        if (!response.ok) {
          throw new Error(
            `Failed to load multi-organization animation: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then(data => {
        console.log(
          'Multi-organization animation data loaded successfully:',
          !!data,
          'layers:',
          data?.layers?.length
        );
        setMultiOrganizationAnimationData(data);
        setMultiOrganizationLoading(false);
      })
      .catch(error => {
        console.error('Error loading multi-organization animation:', error);
        setMultiOrganizationError(true);
        setMultiOrganizationLoading(false);
      });

    // Load the POPIA compliance animation
    fetch(`/animation/shield.json?v=${Date.now()}`)
      .then(response => {
        console.log(
          'POPIA compliance animation response:',
          response.status,
          response.statusText
        );
        if (!response.ok) {
          throw new Error(
            `Failed to load POPIA compliance animation: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then(data => {
        console.log(
          'POPIA compliance animation data loaded successfully:',
          !!data,
          'layers:',
          data?.layers?.length
        );
        setPopiaComplianceAnimationData(data);
        setPopiaComplianceLoading(false);
      })
      .catch(error => {
        console.error('Error loading POPIA compliance animation:', error);
        setPopiaComplianceError(true);
        setPopiaComplianceLoading(false);
      });
  }, []);

  const linkUserAccount = async (user: any) => {
    if (!user?.email || !user?.id) return;

    try {
      // Find matching user in database
      const response = await fetch('/api/users');
      if (!response.ok) return;

      const usersData = await response.json();
      const matchingUser = usersData.users?.find(
        (dbUser: any) => dbUser.email.toLowerCase() === user.email.toLowerCase()
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
          date_updated: new Date().toISOString(),
        }),
      });

      if (updateResponse.ok) {
        console.log(
          `Successfully linked user: ${matchingUser.name} ${matchingUser.surname}`
        );
      }
    } catch (error) {
      console.error('Error linking user account:', error);
      // Don't throw - continue with login even if linking fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        // Supabase authentication commented out for local database migration
        // const { data, error } = await supabase.auth.signInWithPassword({
        //   email,
        //   password,
        // });

        // if (error) throw error;

        // toast.success('Login successful! Setting up your account...');

        // Check and link user account automatically
        // await linkUserAccount(data.user);

        // toast.success('Redirecting to your dashboard...');
        // Redirect to dashboard
        // window.location.href = '/my-dashboard';

        // TODO: Implement local database authentication
        toast.success(
          'Login functionality temporarily disabled during migration'
        );

        // Temporary redirect to dashboard for testing
        setTimeout(() => {
          window.location.href = '/my-dashboard';
        }, 1500);
      } else if (mode === 'signup') {
        // Supabase signup commented out for local database migration
        // const { data, error } = await supabase.auth.signUp({
        //   email,
        //   password,
        // });

        // if (error) throw error;

        // toast.success('Check your email for verification link!');

        // TODO: Implement local database user registration
        toast.success(
          'Signup functionality temporarily disabled during migration'
        );
      } else if (mode === 'reset') {
        // Supabase password reset commented out for local database migration
        // const { data, error } = await supabase.auth.resetPasswordForEmail(
        //   email,
        //   {
        //     redirectTo: `${window.location.origin}/auth/reset-password`,
        //   }
        // );

        // if (error) throw error;

        // toast.success('Password reset email sent!');

        // TODO: Implement local database password reset
        toast.success(
          'Password reset functionality temporarily disabled during migration'
        );
      }
    } catch (error: any) {
      toast.error(error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      // Supabase magic link commented out for local database migration
      // const { data, error } = await supabase.auth.signInWithOtp({
      //   email,
      //   options: {
      //     emailRedirectTo: `${window.location.origin}/auth/callback`,
      //   },
      // });

      // if (error) throw error;

      // toast.success('Check your email for the magic link!');

      // TODO: Implement local database magic link authentication
      toast.success(
        'Magic link functionality temporarily disabled during migration'
      );
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className='relative overflow-hidden'
      style={{ backgroundColor: '#F2EFED' }}
    >
      {/* Artistic Background Elements - Minimal and intentional placement */}
      <div className='fixed inset-0 pointer-events-none z-0'>
        {/* Single elegant image - top right corner */}
        <div className='absolute top-16 right-16 w-64 h-64 opacity-[0.45]'>
          <Image
            src='/branding/health-with-heart-corporate-wellness-header-image.png'
            alt='Background element'
            width={256}
            height={256}
            className='w-full h-full object-cover object-center'
          />
        </div>

        {/* Single elegant image - bottom left corner */}
        <div className='absolute bottom-16 left-16 w-56 h-56 opacity-[0.42]'>
          <Image
            src='/branding/health-with-heart-corporate-wellness-side-image.png'
            alt='Background element'
            width={224}
            height={224}
            className='w-full h-full object-cover object-center'
          />
        </div>

        {/* Subtle accent - far top left */}
        <div className='absolute top-8 left-8 w-32 h-32 opacity-[0.38]'>
          <Image
            src='/branding/health-with-heart-corporate-wellness-cta-image-600x607.png'
            alt='Background element'
            width={128}
            height={128}
            className='w-full h-full object-cover object-center'
          />
        </div>

        {/* Center image - left side of center */}
        <div className='absolute top-1/3 left-1/4 w-48 h-48 opacity-[0.40]'>
          <Image
            src='/branding/hwh-corporate-services-archive-side-image.png'
            alt='Background element'
            width={192}
            height={192}
            className='w-full h-full object-cover object-center'
          />
        </div>

        {/* Center image - right side of center */}
        <div className='absolute top-1/2 right-1/4 w-52 h-52 opacity-[0.42]'>
          <Image
            src='/branding/health-with-heart-corporate-services-archive-cta.png'
            alt='Background element'
            width={208}
            height={208}
            className='w-full h-full object-cover object-center'
          />
        </div>

        {/* Top center image */}
        <div className='absolute top-8 left-1/2 w-40 h-40 opacity-[0.39]'>
          <Image
            src='/branding/health-with-heart-corporate-wellness-cta-image-600x607.png'
            alt='Background element'
            width={160}
            height={160}
            className='w-full h-full object-cover object-center'
          />
        </div>

        {/* Top left area image */}
        <div className='absolute top-12 left-1/3 w-36 h-36 opacity-[0.41]'>
          <Image
            src='/branding/health-with-heart-corporate-wellness-side-image.png'
            alt='Background element'
            width={144}
            height={144}
            className='w-full h-full object-cover object-center'
          />
        </div>

        {/* Bottom right - behind login form */}
        <div className='absolute bottom-32 right-32 w-44 h-44 opacity-[0.38]'>
          <Image
            src='/branding/hwh-corporate-services-archive-side-image.png'
            alt='Background element'
            width={176}
            height={176}
            className='w-full h-full object-cover object-center'
          />
        </div>

        {/* Behind cards - closer to login form */}
        <div className='absolute bottom-40 right-20 w-36 h-36 opacity-[0.36]'>
          <Image
            src='/branding/health-with-heart-corporate-wellness-cta-image-600x607.png'
            alt='Background element'
            width={144}
            height={144}
            className='w-full h-full object-cover object-center'
          />
        </div>

        {/* Bottom center image */}
        <div className='absolute bottom-16 left-1/2 w-48 h-48 opacity-[0.37]'>
          <Image
            src='/branding/health-with-heart-corporate-services-archive-cta.png'
            alt='Background element'
            width={192}
            height={192}
            className='w-full h-full object-cover object-center'
          />
        </div>

        {/* Behind appointment management card */}
        <div className='absolute top-1/2 left-16 w-40 h-40 opacity-[0.35]'>
          <Image
            src='/branding/health-with-heart-corporate-wellness-header-image.png'
            alt='Background element'
            width={160}
            height={160}
            className='w-full h-full object-cover object-center'
          />
        </div>
      </div>

      {/* Hero Section - Full Viewport Height */}
      <div className='h-screen flex items-center justify-center px-4 relative z-10'>
        <div className='max-w-7xl mx-auto w-full relative z-10'>
          <div className='grid lg:grid-cols-3 gap-8 items-stretch'>
            {/* Left Side - Branding & Features */}
            <div className='lg:col-span-2 space-y-8'>
              {/* Logo */}
              <div className='flex items-center gap-4 mb-6'>
                <Image
                  src='/Logo-Health-With-Heart-Logo-Registered.svg'
                  alt='Health With Heart'
                  width={64}
                  height={64}
                  className='h-16 w-auto'
                />
              </div>

              <div className='space-y-4'>
                <h2
                  className='text-5xl font-yrsa-bold leading-tight text-balance'
                  style={{
                    color: '#586D6A',
                    textShadow:
                      '2px 2px 4px rgba(242, 239, 237, 0.8), 0 0 8px rgba(242, 239, 237, 0.6)',
                  }}
                >
                  Executive Medical Report Platform
                </h2>
                <p
                  className='text-xl font-work-sans-regular leading-relaxed'
                  style={{
                    color: '#586D6A',
                    textShadow:
                      '1px 1px 3px rgba(242, 239, 237, 0.9), 0 0 6px rgba(242, 239, 237, 0.7)',
                  }}
                >
                  Comprehensive executive wellness solutions for corporate
                  health programs, ensuring optimal performance and compliance
                  for your leadership team.
                </p>
              </div>

              <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
                <div
                  className='flex flex-col items-center text-center p-6 rounded-xl hover-lift backdrop-blur-sm'
                  style={{
                    backgroundColor: '#F2EFED',
                    border: '1px solid #B6D9CE',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div className='w-40 h-40 mb-3'>
                    {medicalAssessmentsLoading ? (
                      <div
                        className='w-full h-full flex items-center justify-center'
                        style={{
                          backgroundColor: '#F2EFED',
                          borderRadius: '8px',
                        }}
                      >
                        <div
                          className='w-8 h-8 border-2 border-gray-300 rounded-full animate-spin'
                          style={{ borderTopColor: '#586D6A' }}
                        ></div>
                      </div>
                    ) : medicalAssessmentsError ? (
                      <div
                        className='w-full h-full flex items-center justify-center'
                        style={{
                          backgroundColor: '#586D6A',
                          borderRadius: '8px',
                        }}
                      >
                        <Stethoscope
                          className='h-10 w-10'
                          style={{ color: '#FFFFFF' }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <Lottie
                          animationData={medicalAssessmentsAnimationData}
                          loop={true}
                          autoplay={true}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                  <h3
                    className='font-yrsa-bold text-lg mb-2'
                    style={{
                      color: '#586D6A',
                      textShadow:
                        '1px 1px 3px rgba(242, 239, 237, 0.9), 0 0 6px rgba(242, 239, 237, 0.7)',
                    }}
                  >
                    Medical Assessments
                  </h3>
                </div>

                <div
                  className='flex flex-col items-center text-center p-6 rounded-xl hover-lift backdrop-blur-sm'
                  style={{
                    backgroundColor: '#F2EFED',
                    border: '1px solid #B6D9CE',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div className='w-40 h-40 mb-3'>
                    {medicalReportsLoading ? (
                      <div
                        className='w-full h-full flex items-center justify-center'
                        style={{
                          backgroundColor: '#F2EFED',
                          borderRadius: '8px',
                        }}
                      >
                        <div
                          className='w-8 h-8 border-2 border-gray-300 rounded-full animate-spin'
                          style={{ borderTopColor: '#586D6A' }}
                        ></div>
                      </div>
                    ) : medicalReportsError ? (
                      <div
                        className='w-full h-full flex items-center justify-center'
                        style={{
                          backgroundColor: '#586D6A',
                          borderRadius: '8px',
                        }}
                      >
                        <FileText
                          className='h-10 w-10'
                          style={{ color: '#FFFFFF' }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <Lottie
                          animationData={medicalReportsAnimationData}
                          loop={true}
                          autoplay={true}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                  <h3
                    className='font-yrsa-bold text-lg mb-2'
                    style={{
                      color: '#586D6A',
                      textShadow:
                        '1px 1px 3px rgba(242, 239, 237, 0.9), 0 0 6px rgba(242, 239, 237, 0.7)',
                    }}
                  >
                    Medical Reports
                  </h3>
                </div>

                <div
                  className='flex flex-col items-center text-center p-6 rounded-xl hover-lift backdrop-blur-sm'
                  style={{
                    backgroundColor: '#F2EFED',
                    border: '1px solid #B6D9CE',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div className='w-40 h-40 mb-3'>
                    {calendarLoading ? (
                      <div
                        className='w-full h-full flex items-center justify-center'
                        style={{
                          backgroundColor: '#F2EFED',
                          borderRadius: '8px',
                        }}
                      >
                        <div
                          className='w-8 h-8 border-2 border-gray-300 rounded-full animate-spin'
                          style={{ borderTopColor: '#586D6A' }}
                        ></div>
                      </div>
                    ) : calendarError ? (
                      <div
                        className='w-full h-full flex items-center justify-center'
                        style={{
                          backgroundColor: '#586D6A',
                          borderRadius: '8px',
                        }}
                      >
                        <Calendar
                          className='h-10 w-10'
                          style={{ color: '#FFFFFF' }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          transform: 'scale(1.9)',
                          transformOrigin: 'center',
                        }}
                      >
                        <Lottie
                          animationData={calendarAnimationData}
                          loop={true}
                          autoplay={true}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                  <h3
                    className='font-yrsa-bold text-lg mb-2'
                    style={{
                      color: '#586D6A',
                      textShadow:
                        '1px 1px 3px rgba(242, 239, 237, 0.9), 0 0 6px rgba(242, 239, 237, 0.7)',
                    }}
                  >
                    Appointments
                  </h3>
                </div>

                <div
                  className='flex flex-col items-center text-center p-6 rounded-xl hover-lift backdrop-blur-sm'
                  style={{
                    backgroundColor: '#F2EFED',
                    border: '1px solid #B6D9CE',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div className='w-40 h-40 mb-3'>
                    {healthAnalyticsLoading ? (
                      <div
                        className='w-full h-full flex items-center justify-center'
                        style={{
                          backgroundColor: '#F2EFED',
                          borderRadius: '8px',
                        }}
                      >
                        <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin'></div>
                      </div>
                    ) : healthAnalyticsError ? (
                      <div
                        className='w-full h-full flex items-center justify-center'
                        style={{
                          backgroundColor: '#E19985',
                          borderRadius: '8px',
                        }}
                      >
                        <BarChart3
                          className='h-10 w-10'
                          style={{ color: '#586D6A' }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <Lottie
                          animationData={animationData}
                          loop={true}
                          autoplay={true}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                  <h3
                    className='font-yrsa-bold text-lg mb-2'
                    style={{
                      color: '#586D6A',
                      textShadow:
                        '1px 1px 3px rgba(242, 239, 237, 0.9), 0 0 6px rgba(242, 239, 237, 0.7)',
                    }}
                  >
                    Health Analytics
                  </h3>
                </div>

                <div
                  className='flex flex-col items-center text-center p-6 rounded-xl hover-lift backdrop-blur-sm'
                  style={{
                    backgroundColor: '#F2EFED',
                    border: '1px solid #B6D9CE',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div className='w-40 h-40 mb-3'>
                    {multiOrganizationLoading ? (
                      <div
                        className='w-full h-full flex items-center justify-center'
                        style={{
                          backgroundColor: '#F2EFED',
                          borderRadius: '8px',
                        }}
                      >
                        <div
                          className='w-8 h-8 border-2 border-gray-300 rounded-full animate-spin'
                          style={{ borderTopColor: '#586D6A' }}
                        ></div>
                      </div>
                    ) : multiOrganizationError ? (
                      <div
                        className='w-full h-full flex items-center justify-center'
                        style={{
                          backgroundColor: '#586D6A',
                          borderRadius: '8px',
                        }}
                      >
                        <Building2
                          className='h-10 w-10'
                          style={{ color: '#FFFFFF' }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <Lottie
                          animationData={multiOrganizationAnimationData}
                          loop={true}
                          autoplay={true}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                  <h3
                    className='font-yrsa-bold text-lg mb-2'
                    style={{
                      color: '#586D6A',
                      textShadow:
                        '1px 1px 3px rgba(242, 239, 237, 0.9), 0 0 6px rgba(242, 239, 237, 0.7)',
                    }}
                  >
                    Multi-Organization
                  </h3>
                </div>

                <div
                  className='flex flex-col items-center text-center p-6 rounded-xl hover-lift backdrop-blur-sm'
                  style={{
                    backgroundColor: '#F2EFED',
                    border: '1px solid #B6D9CE',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div className='w-40 h-40 mb-3'>
                    {popiaComplianceLoading ? (
                      <div
                        className='w-full h-full flex items-center justify-center'
                        style={{
                          backgroundColor: '#F2EFED',
                          borderRadius: '8px',
                        }}
                      >
                        <div
                          className='w-8 h-8 border-2 border-gray-300 rounded-full animate-spin'
                          style={{ borderTopColor: '#D65241' }}
                        ></div>
                      </div>
                    ) : popiaComplianceError ? (
                      <div
                        className='w-full h-full flex items-center justify-center'
                        style={{
                          backgroundColor: '#D65241',
                          borderRadius: '8px',
                        }}
                      >
                        <Shield
                          className='h-10 w-10'
                          style={{ color: '#FFFFFF' }}
                        />
                      </div>
                    ) : popiaComplianceAnimationData ? (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          filter:
                            'saturate(1.15) contrast(1.05) hue-rotate(5deg)',
                        }}
                      >
                        <Lottie
                          animationData={popiaComplianceAnimationData}
                          loop={true}
                          autoplay={true}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    ) : (
                      <div
                        className='w-full h-full flex items-center justify-center'
                        style={{
                          backgroundColor: '#F2EFED',
                          borderRadius: '8px',
                        }}
                      >
                        <div className='text-xs' style={{ color: '#D65241' }}>
                          No Data
                        </div>
                      </div>
                    )}
                  </div>
                  <h3
                    className='font-yrsa-bold text-lg mb-2'
                    style={{
                      color: '#586D6A',
                      textShadow:
                        '1px 1px 3px rgba(242, 239, 237, 0.9), 0 0 6px rgba(242, 239, 237, 0.7)',
                    }}
                  >
                    POPIA Compliance
                  </h3>
                </div>
              </div>
            </div>

            {/* Right Side - Auth  */}
            <div
              className='w-full max-w-sm mx-auto relative z-20 flex flex-col justify-center'
              style={{ marginTop: '260px', height: 'calc(100% - 260px)' }}
            >
              <Card
                className='shadow-2xl border-0 backdrop-blur-sm rounded-xl relative z-10'
                style={{
                  backgroundColor: '#F2EFED',
                  border: '1px solid #B6D9CE',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                }}
              >
                <CardHeader className='text-center pb-6'>
                  <CardTitle
                    className='text-2xl font-yrsa-bold'
                    style={{ color: '#586D6A' }}
                  >
                    {mode === 'login' && 'Welcome Back'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'reset' && 'Reset Password'}
                  </CardTitle>
                  <CardDescription
                    className='font-work-sans-regular'
                    style={{ color: '#759282' }}
                  >
                    {mode === 'login' && 'Sign in to access your dashboard'}
                    {mode === 'signup' && 'Get started with Health with Heart'}
                    {mode === 'reset' &&
                      'Enter your email to reset your password'}
                  </CardDescription>
                </CardHeader>

                <CardContent className='space-y-6'>
                  <form onSubmit={handleSubmit} className='space-y-4'>
                    {/* Email Field */}
                    <div className='space-y-2'>
                      <Label
                        htmlFor='email'
                        className='font-work-sans-medium'
                        style={{ color: '#586D6A' }}
                      >
                        Email Address
                      </Label>
                      <div className='relative'>
                        <Mail
                          className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4'
                          style={{ color: '#759282' }}
                        />
                        <Input
                          id='email'
                          type='email'
                          placeholder='your.email@healthwithheart.co.za'
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className='pl-10 font-work-sans-regular rounded-lg'
                          style={{
                            borderColor: '#B6D9CE',
                            backgroundColor: '#F2EFED',
                            color: '#586D6A',
                            border: '1px solid #B6D9CE',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                          }}
                          required
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    {mode !== 'reset' && (
                      <div className='space-y-2'>
                        <Label
                          htmlFor='password'
                          className='font-work-sans-medium'
                          style={{ color: '#586D6A' }}
                        >
                          Password
                        </Label>
                        <div className='relative'>
                          <Lock
                            className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4'
                            style={{ color: '#759282' }}
                          />
                          <Input
                            id='password'
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Enter your password'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className='pl-10 pr-10 font-work-sans-regular rounded-lg'
                            style={{
                              borderColor: '#B6D9CE',
                              backgroundColor: '#F2EFED',
                              color: '#586D6A',
                              border: '1px solid #B6D9CE',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                            }}
                            required
                          />
                          <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-80 transition-opacity'
                            style={{ color: '#759282' }}
                          >
                            {showPassword ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type='submit'
                      className='w-full font-work-sans-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95'
                      style={{
                        backgroundColor: '#178089',
                        color: '#FFFFFF',
                        border: 'none',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#1A8F99';
                        e.currentTarget.style.boxShadow =
                          '0 8px 20px rgba(23, 128, 137, 0.4)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#178089';
                        e.currentTarget.style.boxShadow =
                          '0 4px 6px rgba(0, 0, 0, 0.05)';
                      }}
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
                          <ArrowRight className='ml-2 h-4 w-4' />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Magic Link Option */}
                  {mode === 'login' && (
                    <>
                      <div className='relative'>
                        <div className='absolute inset-0 flex items-center'>
                          <Separator style={{ backgroundColor: '#B6D9CE' }} />
                        </div>
                        <div className='relative flex justify-center text-xs uppercase'>
                          <span
                            className='px-2 font-work-sans-regular'
                            style={{
                              backgroundColor: '#F2EFED',
                              color: '#759282',
                            }}
                          >
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <Button
                        type='button'
                        className='w-full font-work-sans-semibold rounded-lg hover-lift'
                        style={{
                          backgroundColor: '#F2EFED',
                          color: '#178089',
                          border: `1px solid #178089`,
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        }}
                        onClick={handleMagicLink}
                        disabled={loading}
                      >
                        <Mail className='mr-2 h-4 w-4' />
                        Send Magic Link
                      </Button>
                    </>
                  )}

                  {/* Mode Switching */}
                  <div className='text-center text-sm space-y-2'>
                    {mode === 'login' && (
                      <>
                        <div>
                          <button
                            type='button'
                            onClick={() => setMode('reset')}
                            className='font-work-sans-regular hover:underline transition-all'
                            style={{ color: '#178089' }}
                          >
                            Forgot your password?
                          </button>
                        </div>
                        <div
                          className='font-work-sans-regular'
                          style={{ color: '#759282' }}
                        >
                          Don't have an account?{' '}
                          <button
                            type='button'
                            onClick={() => setMode('signup')}
                            className='font-work-sans-semibold hover:underline transition-all'
                            style={{ color: '#178089' }}
                          >
                            Sign up
                          </button>
                        </div>
                      </>
                    )}

                    {mode === 'signup' && (
                      <div
                        className='font-work-sans-regular'
                        style={{ color: '#759282' }}
                      >
                        Already have an account?{' '}
                        <button
                          type='button'
                          onClick={() => setMode('login')}
                          className='font-work-sans-semibold hover:underline transition-all'
                          style={{ color: '#178089' }}
                        >
                          Sign in
                        </button>
                      </div>
                    )}

                    {mode === 'reset' && (
                      <div
                        className='font-work-sans-regular'
                        style={{ color: '#759282' }}
                      >
                        Remember your password?{' '}
                        <button
                          type='button'
                          onClick={() => setMode('login')}
                          className='font-work-sans-semibold hover:underline transition-all'
                          style={{ color: '#178089' }}
                        >
                          Back to sign in
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div
        className='py-8 text-center relative z-10'
        style={{ backgroundColor: '#178089' }}
      >
        <div className='max-w-4xl mx-auto px-4'>
          <p
            className='text-sm font-work-sans-regular'
            style={{ color: '#FFFFFF' }}
          >
            This system contains confidential medical information. Authorized
            access only. All activities are monitored.
          </p>
        </div>
      </div>

      {/* Footer - Below the fold */}
      <div className='relative z-10'>
        <Footer />
      </div>
    </div>
  );
}
