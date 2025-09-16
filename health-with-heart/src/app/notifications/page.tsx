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
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Settings,
  Filter,
  Check,
  Trash2,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { useBreadcrumbBack } from '@/hooks/useBreadcrumbBack';
import { PageLoading } from '@/components/ui/loading';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

function NotificationsPageContent() {
  const goBack = useBreadcrumbBack();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

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

      // Mock notifications
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'warning',
          title: 'System Maintenance Scheduled',
          message:
            'System maintenance is scheduled for tonight at 2:00 AM. Expected downtime: 30 minutes.',
          timestamp: '2024-08-25T10:30:00.000Z',
          read: false,
          priority: 'high',
        },
        {
          id: '2',
          type: 'info',
          title: 'New Employee Added',
          message: 'John Doe has been added to the Manufacturing department.',
          timestamp: '2024-08-25T09:15:00.000Z',
          read: false,
          priority: 'medium',
        },
        {
          id: '3',
          type: 'success',
          title: 'Backup Completed',
          message: 'Daily backup completed successfully at 3:00 AM.',
          timestamp: '2024-08-25T03:00:00.000Z',
          read: true,
          priority: 'low',
        },
      ];

      setNotifications(mockNotifications);
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className='h-5 w-5 text-yellow-600' />;
      case 'error':
        return <AlertTriangle className='h-5 w-5 text-red-600' />;
      case 'success':
        return <CheckCircle className='h-5 w-5 text-green-600' />;
      default:
        return <Info className='h-5 w-5 text-blue-600' />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant='destructive'>High</Badge>;
      case 'medium':
        return (
          <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
            Medium
          </Badge>
        );
      case 'low':
        return <Badge variant='outline'>Low</Badge>;
      default:
        return <Badge variant='outline'>{priority}</Badge>;
    }
  };

  // Always show loading during SSR and initial client render
  if (!mounted) {
    return (
      // <ProtectedRoute>
      <DashboardLayout>
        <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
          <Card>
            <CardContent>
              <PageLoading
                text='Loading Notifications'
                subtitle='Fetching system notifications and alerts...'
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
      // </ProtectedRoute>
    );
  }

  // Show loading screen when mounted but data is still loading
  if (loading) {
    return (
      // <ProtectedRoute>
      <DashboardLayout>
        <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
          <Card>
            <CardContent>
              <PageLoading
                text='Loading Notifications'
                subtitle='Fetching system notifications and alerts...'
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
      // </ProtectedRoute>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    // <ProtectedRoute>
    <DashboardLayout>
      <div className='pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[10vw] py-6 max-w-full overflow-hidden'>
        {/* Back Button */}
        <div className='mb-4'>
          <Button variant='outline' onClick={goBack} className='hover-lift'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back
          </Button>
        </div>

        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
              <Bell className='h-8 w-8' />
              Notifications
            </h1>
            <p className='text-muted-foreground'>
              System alerts and notifications
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
            <Button variant='outline' className='hover-lift'>
              <Settings className='h-4 w-4 mr-2' />
              Settings
            </Button>
            <Button variant='outline' className='hover-lift'>
              <Filter className='h-4 w-4 mr-2' />
              Filter
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-3 mb-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Notifications
              </CardTitle>
              <Bell className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{notifications.length}</div>
              <p className='text-xs text-muted-foreground'>
                System notifications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Unread</CardTitle>
              <AlertTriangle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{unreadCount}</div>
              <p className='text-xs text-muted-foreground'>Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                High Priority
              </CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {notifications.filter(n => n.priority === 'high').length}
              </div>
              <p className='text-xs text-muted-foreground'>
                Urgent notifications
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card className='hover-lift'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-2xl'>
              <Bell className='h-6 w-6' />
              Recent Notifications
            </CardTitle>
            <CardDescription>
              System alerts and administrative notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className='text-center py-12'>
                <Bell className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-medium text-foreground mb-2'>
                  No notifications
                </h3>
                <p className='text-muted-foreground'>
                  All caught up! No new notifications to display.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-colors hover:bg-muted/50 ${
                      !notification.read
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-background'
                    }`}
                  >
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex items-start gap-3 flex-1'>
                        {getNotificationIcon(notification.type)}
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-1'>
                            <h4 className='font-medium'>
                              {notification.title}
                            </h4>
                            {getPriorityBadge(notification.priority)}
                            {!notification.read && (
                              <Badge variant='outline' className='text-xs'>
                                New
                              </Badge>
                            )}
                          </div>
                          <p className='text-sm text-muted-foreground mb-2'>
                            {notification.message}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {formatDate(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {!notification.read && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              console.log('Mark as read:', notification.id);
                            }}
                          >
                            <Check className='h-4 w-4' />
                          </Button>
                        )}
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            console.log(
                              'Delete notification:',
                              notification.id
                            );
                          }}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
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
              releases. Full notification management features will be available
              to admin users.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
    // </ProtectedRoute>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Card>
            <CardContent>
              <PageLoading
                text='Initializing Notifications'
                subtitle='Setting up notification management system...'
              />
            </CardContent>
          </Card>
        </div>
      }
    >
      <NotificationsPageContent />
    </Suspense>
  );
}
