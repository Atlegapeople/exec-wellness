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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Settings as SettingsIcon,
  Shield,
  Globe,
  Bell,
  Database,
  Users,
  Lock,
  Mail,
  Palette,
  Clock,
  Save,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { PageLoading } from '@/components/ui/loading';
import { useBreadcrumbBack } from '@/hooks/useBreadcrumbBack';

interface SystemSettings {
  organization_name: string;
  timezone: string;
  date_format: string;
  language: string;
  theme: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  backup_frequency: string;
  session_timeout: string;
  password_policy: string;
}

function SettingsPageContent() {
  const goBack = useBreadcrumbBack();
  const [settings, setSettings] = useState<SystemSettings>({
    organization_name: '',
    timezone: '',
    date_format: '',
    language: '',
    theme: '',
    email_notifications: true,
    sms_notifications: false,
    backup_frequency: '',
    session_timeout: '',
    password_policy: '',
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

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

      // Mock settings data
      const mockSettings: SystemSettings = {
        organization_name: 'Health With Heart',
        timezone: 'Africa/Johannesburg',
        date_format: 'DD/MM/YYYY',
        language: 'en',
        theme: 'light',
        email_notifications: true,
        sms_notifications: false,
        backup_frequency: 'daily',
        session_timeout: '30',
        password_policy: 'medium',
      };

      setSettings(mockSettings);
      setLoading(false);
    };

    fetchData();
  }, [mounted]);

  const handleSave = async () => {
    setSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Settings saved:', settings);
    setSaving(false);
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      organization_name: 'Health With Heart',
      timezone: 'Africa/Johannesburg',
      date_format: 'DD/MM/YYYY',
      language: 'en',
      theme: 'light',
      email_notifications: true,
      sms_notifications: false,
      backup_frequency: 'daily',
      session_timeout: '30',
      password_policy: 'medium',
    });
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
                text='Loading Settings'
                subtitle='Fetching system configuration...'
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
                text='Loading Settings'
                subtitle='Fetching system configuration...'
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
      // </ProtectedRoute>
    );
  }

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
              <SettingsIcon className='h-8 w-8' />
              Settings
            </h1>
            <p className='text-muted-foreground'>
              System configuration and preferences
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
            <Button
              variant='outline'
              onClick={handleReset}
              className='hover-lift'
            >
              <RefreshCw className='h-4 w-4 mr-2' />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className='hover-lift'
            >
              <Save className='h-4 w-4 mr-2' />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-2'>
          {/* General Settings */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Globe className='h-5 w-5' />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic system configuration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='org_name'>Organization Name</Label>
                <Input
                  id='org_name'
                  value={settings.organization_name}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      organization_name: e.target.value,
                    })
                  }
                  placeholder='Enter organization name'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='timezone'>Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={value =>
                    setSettings({ ...settings, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select timezone' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Africa/Johannesburg'>
                      Africa/Johannesburg
                    </SelectItem>
                    <SelectItem value='UTC'>UTC</SelectItem>
                    <SelectItem value='America/New_York'>
                      America/New_York
                    </SelectItem>
                    <SelectItem value='Europe/London'>Europe/London</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='date_format'>Date Format</Label>
                <Select
                  value={settings.date_format}
                  onValueChange={value =>
                    setSettings({ ...settings, date_format: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select date format' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='DD/MM/YYYY'>DD/MM/YYYY</SelectItem>
                    <SelectItem value='MM/DD/YYYY'>MM/DD/YYYY</SelectItem>
                    <SelectItem value='YYYY-MM-DD'>YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='language'>Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={value =>
                    setSettings({ ...settings, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select language' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='en'>English</SelectItem>
                    <SelectItem value='af'>Afrikaans</SelectItem>
                    <SelectItem value='zu'>Zulu</SelectItem>
                    <SelectItem value='xh'>Xhosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Palette className='h-5 w-5' />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='theme'>Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={value =>
                    setSettings({ ...settings, theme: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select theme' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='light'>Light</SelectItem>
                    <SelectItem value='dark'>Dark</SelectItem>
                    <SelectItem value='auto'>Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>Theme Preview</h4>
                <div className='grid grid-cols-3 gap-2'>
                  <div className='p-3 border rounded bg-white'>
                    <div className='h-2 bg-gray-200 rounded mb-2'></div>
                    <div className='h-1 bg-gray-100 rounded'></div>
                  </div>
                  <div className='p-3 border rounded bg-gray-900'>
                    <div className='h-2 bg-gray-700 rounded mb-2'></div>
                    <div className='h-1 bg-gray-800 rounded'></div>
                  </div>
                  <div className='p-3 border rounded bg-gradient-to-br from-blue-50 to-indigo-100'>
                    <div className='h-2 bg-blue-200 rounded mb-2'></div>
                    <div className='h-1 bg-blue-100 rounded'></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='h-5 w-5' />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='email_notifications'>
                    Email Notifications
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Receive notifications via email
                  </p>
                </div>
                <input
                  type='checkbox'
                  id='email_notifications'
                  checked={settings.email_notifications}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      email_notifications: e.target.checked,
                    })
                  }
                  className='rounded border border-input'
                />
              </div>

              <Separator />

              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='sms_notifications'>SMS Notifications</Label>
                  <p className='text-sm text-muted-foreground'>
                    Receive notifications via SMS
                  </p>
                </div>
                <input
                  type='checkbox'
                  id='sms_notifications'
                  checked={settings.sms_notifications}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      sms_notifications: e.target.checked,
                    })
                  }
                  className='rounded border border-input'
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Lock className='h-5 w-5' />
                Security
              </CardTitle>
              <CardDescription>
                Security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='session_timeout'>
                  Session Timeout (minutes)
                </Label>
                <Input
                  id='session_timeout'
                  type='number'
                  value={settings.session_timeout}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      session_timeout: e.target.value,
                    })
                  }
                  placeholder='30'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password_policy'>Password Policy</Label>
                <Select
                  value={settings.password_policy}
                  onValueChange={value =>
                    setSettings({ ...settings, password_policy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select password policy' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='low'>
                      Low - 6 characters minimum
                    </SelectItem>
                    <SelectItem value='medium'>
                      Medium - 8 characters, mixed case
                    </SelectItem>
                    <SelectItem value='high'>
                      High - 12 characters, symbols required
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className='hover-lift lg:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Database className='h-5 w-5' />
                System Settings
              </CardTitle>
              <CardDescription>
                Advanced system configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='backup_frequency'>Backup Frequency</Label>
                  <Select
                    value={settings.backup_frequency}
                    onValueChange={value =>
                      setSettings({ ...settings, backup_frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select backup frequency' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='hourly'>Hourly</SelectItem>
                      <SelectItem value='daily'>Daily</SelectItem>
                      <SelectItem value='weekly'>Weekly</SelectItem>
                      <SelectItem value='monthly'>Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>System Status</Label>
                  <div className='flex items-center gap-2 p-2 border rounded'>
                    <div className='h-2 w-2 bg-green-500 rounded-full'></div>
                    <span className='text-sm'>All systems operational</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
              releases. System settings modifications require elevated
              privileges and will include advanced configuration options, user
              management, and security policies.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
    // </ProtectedRoute>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Card>
            <CardContent>
              <PageLoading
                text='Initializing Settings'
                subtitle='Loading system configuration...'
              />
            </CardContent>
          </Card>
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}
