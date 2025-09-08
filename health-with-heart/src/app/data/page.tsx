'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Database,
  Upload,
  Download,
  RefreshCw,
  Shield,
  HardDrive,
  FileText,
  Archive,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { PageLoading } from '@/components/ui/loading';
import { useBreadcrumbBack } from '@/hooks/useBreadcrumbBack';

interface BackupInfo {
  id: string;
  type: 'full' | 'incremental';
  size: string;
  date: string;
  status: 'completed' | 'in_progress' | 'failed';
  duration: string;
}

function DataPageContent() {
  const goBack = useBreadcrumbBack();
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackupRunning, setIsBackupRunning] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock data - replace with actual API calls
  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock backup history
      const mockBackups: BackupInfo[] = [
        {
          id: '1',
          type: 'full',
          size: '2.4 GB',
          date: '2024-08-25T03:00:00.000Z',
          status: 'completed',
          duration: '45 minutes',
        },
        {
          id: '2',
          type: 'incremental',
          size: '156 MB',
          date: '2024-08-24T03:00:00.000Z',
          status: 'completed',
          duration: '8 minutes',
        },
        {
          id: '3',
          type: 'full',
          size: '2.3 GB',
          date: '2024-08-23T03:00:00.000Z',
          status: 'completed',
          duration: '42 minutes',
        },
      ];

      setBackups(mockBackups);
      setLoading(false);
    };

    fetchData();
  }, [mounted]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'in_progress':
        return <Clock className='h-4 w-4 text-blue-600' />;
      case 'failed':
        return <AlertTriangle className='h-4 w-4 text-red-600' />;
      default:
        return <Clock className='h-4 w-4 text-gray-600' />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className='bg-green-100 text-green-800 border-green-200'>
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className='bg-blue-100 text-blue-800 border-blue-200'>
            In Progress
          </Badge>
        );
      case 'failed':
        return (
          <Badge className='bg-red-100 text-red-800 border-red-200'>
            Failed
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const handleStartBackup = () => {
    setIsBackupRunning(true);
    setBackupProgress(0);

    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackupRunning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  // Always show loading during SSR and initial client render
  if (!mounted) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
            <Card>
              <CardContent>
                <PageLoading
                  text='Loading Data Management'
                  subtitle='Initializing backup and data management system...'
                />
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Show loading screen when mounted but data is still loading
  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
            <Card>
              <CardContent>
                <PageLoading
                  text='Loading Data Management'
                  subtitle='Fetching backup history and system status...'
                />
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[10vw] py-6 max-w-full overflow-hidden'>
          {/* Back Button */}
          <div className='mb-6'>
            <Button
              variant='outline'
              size='sm'
              onClick={goBack}
              className='flex items-center space-x-2'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='h-4 w-4'
              >
                <path
                  fillRule='evenodd'
                  d='M7.53 3.97a.75.75 0 010 1.06L3.56 9h12.69a6.75 6.75 0 110 13.5H6a.75.75 0 010-1.5h10.25a5.25 5.25 0 000-10.5H3.56l3.97 3.97a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z'
                  clipRule='evenodd'
                />
              </svg>
              <span>Back</span>
            </Button>
          </div>

          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
                <Database className='h-8 w-8' />
                Data Management
              </h1>
              <p className='text-muted-foreground'>
                Data import/export and backup management
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <Badge
                variant='outline'
                className='bg-blue-50 text-blue-700 border-blue-200'
              >
                <Shield className='h-3 w-3 mr-1' />
                Admin Only
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Database Size
                </CardTitle>
                <HardDrive className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>2.4 GB</div>
                <p className='text-xs text-muted-foreground'>
                  Current database size
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Last Backup
                </CardTitle>
                <Archive className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>Today</div>
                <p className='text-xs text-muted-foreground'>
                  3:00 AM - Full backup
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Records
                </CardTitle>
                <FileText className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>45,231</div>
                <p className='text-xs text-muted-foreground'>
                  Across all tables
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Backup Status
                </CardTitle>
                <CheckCircle className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-green-600'>Healthy</div>
                <p className='text-xs text-muted-foreground'>
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards */}
          <div className='grid gap-6 md:grid-cols-2 mb-6'>
            {/* Backup Management */}
            <Card className='hover-lift'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Archive className='h-5 w-5' />
                  Backup Management
                </CardTitle>
                <CardDescription>
                  Create and manage database backups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {isBackupRunning && (
                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span>Backup in progress...</span>
                        <span>{backupProgress}%</span>
                      </div>
                      <Progress value={backupProgress} className='w-full' />
                    </div>
                  )}

                  <div className='flex gap-2'>
                    <Button
                      onClick={handleStartBackup}
                      disabled={isBackupRunning}
                      className='hover-lift'
                    >
                      <Archive className='h-4 w-4 mr-2' />
                      {isBackupRunning ? 'Backing up...' : 'Start Backup'}
                    </Button>
                    <Button variant='outline' className='hover-lift'>
                      <RefreshCw className='h-4 w-4 mr-2' />
                      Schedule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Import/Export */}
            <Card className='hover-lift'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Database className='h-5 w-5' />
                  Data Import/Export
                </CardTitle>
                <CardDescription>
                  Import and export data in various formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex gap-2'>
                    <Button variant='outline' className='hover-lift'>
                      <Upload className='h-4 w-4 mr-2' />
                      Import Data
                    </Button>
                    <Button variant='outline' className='hover-lift'>
                      <Download className='h-4 w-4 mr-2' />
                      Export Data
                    </Button>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    Supported formats: CSV, Excel, JSON, XML
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Backup History */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-2xl'>
                <Calendar className='h-6 w-6' />
                Backup History
              </CardTitle>
              <CardDescription>
                Recent backup operations and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <div className='text-center py-12'>
                  <Archive className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-foreground mb-2'>
                    No backup history
                  </h3>
                  <p className='text-muted-foreground'>
                    No backup operations have been performed yet.
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {backups.map(backup => (
                    <div
                      key={backup.id}
                      className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'
                    >
                      <div className='flex items-center gap-4'>
                        {getStatusIcon(backup.status)}
                        <div>
                          <div className='flex items-center gap-2 mb-1'>
                            <h4 className='font-medium capitalize'>
                              {backup.type} Backup
                            </h4>
                            {getStatusBadge(backup.status)}
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {formatDate(backup.date)} • {backup.size} •{' '}
                            {backup.duration}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button variant='ghost' size='sm'>
                          <Download className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='sm'>
                          <RefreshCw className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Notice */}
          <Card className='mt-6 border-amber-200 bg-amber-50'>
            <CardContent className='p-6'>
              <div className='flex items-center gap-2 mb-2'>
                <Shield className='h-5 w-5 text-amber-600' />
                <h3 className='font-semibold text-amber-800'>
                  Administrator Access Required
                </h3>
              </div>
              <p className='text-amber-700 text-sm'>
                This page will be restricted to administrators only in future
                releases. Data management operations require elevated privileges
                and will include advanced features like automated backups, data
                validation, and audit trails.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function DataPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Card>
            <CardContent>
              <PageLoading
                text='Initializing Data Management'
                subtitle='Setting up backup and data management tools...'
              />
            </CardContent>
          </Card>
        </div>
      }
    >
      <DataPageContent />
    </Suspense>
  );
}
