'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Settings,
  Building2,
  Palette,
  Globe,
  Shield,
  Bell,
  Database,
  Upload,
  Image,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Edit,
  X,
  Download,
  RefreshCw,
  Lock,
  Users,
  FileText,
  Calendar,
  Activity,
} from 'lucide-react';

interface OrganizationSettings {
  id: string;
  name: string;
  registration_number?: string;
  logo?: string;
  primary_color?: string;
  secondary_color?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  timezone?: string;
  date_format?: string;
  currency?: string;
  language?: string;
  notes?: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  appointment_reminders: boolean;
  report_completion_alerts: boolean;
  emergency_response_alerts: boolean;
  system_maintenance_alerts: boolean;
}

interface SecuritySettings {
  session_timeout: number;
  require_mfa: boolean;
  password_min_length: number;
  password_require_special: boolean;
  password_require_numbers: boolean;
  failed_login_attempts: number;
  account_lockout_duration: number;
}

interface DataSettings {
  backup_frequency: string;
  retention_period: number;
  auto_export: boolean;
  export_format: string;
  data_encryption: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showSuccess, setShowSuccess] = useState(false);

  // Organization settings
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>({
    id: '',
    name: '',
    registration_number: '',
    logo: '',
    primary_color: '#0d9488',
    secondary_color: '#f59e0b',
    website_url: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    country: 'South Africa',
    postal_code: '',
    timezone: 'Africa/Johannesburg',
    date_format: 'DD/MM/YYYY',
    currency: 'ZAR',
    language: 'en',
    notes: '',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: false,
    appointment_reminders: true,
    report_completion_alerts: true,
    emergency_response_alerts: true,
    system_maintenance_alerts: false,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    session_timeout: 30,
    require_mfa: false,
    password_min_length: 8,
    password_require_special: true,
    password_require_numbers: true,
    failed_login_attempts: 5,
    account_lockout_duration: 15,
  });

  // Data settings
  const [dataSettings, setDataSettings] = useState<DataSettings>({
    backup_frequency: 'daily',
    retention_period: 7,
    auto_export: false,
    export_format: 'CSV',
    data_encryption: true,
  });

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // TODO: Get organization ID from user context or URL params
      const organizationId = '1'; // Replace with actual organization ID
      
      const response = await fetch(`/api/settings?organization_id=${organizationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      setOrgSettings(data.organization);
      setNotificationSettings(data.notifications);
      setSecuritySettings(data.security);
      setDataSettings(data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Fallback to default values if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Logo file size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Handle logo upload first if there's a new logo
      if (logoFile) {
        await uploadLogo();
      }

      // Save all settings
      const organizationId = orgSettings.id || '1'; // Replace with actual organization ID
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: orgSettings,
          notifications: notificationSettings,
          security: securitySettings,
          data: dataSettings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('logo', logoFile);
      formData.append('organization_id', orgSettings.id || '1');

      const response = await fetch('/api/settings/logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      const data = await response.json();
      
      // Update the logo URL in settings
      setOrgSettings(prev => ({
        ...prev,
        logo: data.logo_url
      }));
      
      setLogoFile(null);
      setLogoPreview('');
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!orgSettings.logo) return;

    if (!confirm('Are you sure you want to remove the organization logo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/logo?organization_id=${orgSettings.id || '1'}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove logo');
      }

      // Remove logo from settings
      setOrgSettings(prev => ({
        ...prev,
        logo: ''
      }));
    } catch (error) {
      console.error('Error removing logo:', error);
      alert('Failed to remove logo. Please try again.');
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      // Reset to default values
      setOrgSettings({
        id: '',
        name: '',
        registration_number: '',
        logo: '',
        primary_color: '#0d9488',
        secondary_color: '#f59e0b',
        website_url: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        city: '',
        country: 'South Africa',
        postal_code: '',
        timezone: 'Africa/Johannesburg',
        date_format: 'DD/MM/YYYY',
        currency: 'ZAR',
        language: 'en',
        notes: '',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <span className="ml-2 text-gray-600">Loading settings...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your organization's configuration and preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            {showSuccess && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span>Settings saved successfully!</span>
              </div>
            )}
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Information
                </CardTitle>
                <CardDescription>
                  Basic organization details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      value={orgSettings.name}
                      onChange={(e) => setOrgSettings(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter organization name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registration_number">Registration Number</Label>
                    <Input
                      id="registration_number"
                      value={orgSettings.registration_number}
                      onChange={(e) => setOrgSettings(prev => ({ ...prev, registration_number: e.target.value }))}
                      placeholder="Enter registration number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={orgSettings.contact_email}
                      onChange={(e) => setOrgSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                      placeholder="contact@organization.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={orgSettings.contact_phone}
                      onChange={(e) => setOrgSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="+27 12 345 6789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      value={orgSettings.website_url}
                      onChange={(e) => setOrgSettings(prev => ({ ...prev, website_url: e.target.value }))}
                      placeholder="https://www.organization.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={orgSettings.timezone}
                      onValueChange={(value) => setOrgSettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (GMT+2)</SelectItem>
                        <SelectItem value="Africa/Cairo">Africa/Cairo (GMT+2)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={orgSettings.address}
                    onChange={(e) => setOrgSettings(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter street address"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={orgSettings.city}
                      onChange={(e) => setOrgSettings(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={orgSettings.country}
                      onValueChange={(value) => setOrgSettings(prev => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="South Africa">South Africa</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={orgSettings.postal_code}
                      onChange={(e) => setOrgSettings(prev => ({ ...prev, postal_code: e.target.value }))}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={orgSettings.notes}
                    onChange={(e) => setOrgSettings(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about the organization"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Settings */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Branding & Logo
                </CardTitle>
                <CardDescription>
                  Customize your organization's visual identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <Label>Organization Logo</Label>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      {(orgSettings.logo || logoPreview) && (
                        <div className="relative">
                          <img
                            src={logoPreview || orgSettings.logo}
                            alt="Organization logo"
                            className="w-24 h-24 object-contain border-2 border-gray-200 rounded-lg"
                          />
                          {logoPreview && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0"
                              onClick={() => {
                                setLogoPreview('');
                                setLogoFile(null);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                          {orgSettings.logo && !logoPreview && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0"
                              onClick={handleRemoveLogo}
                              title="Remove logo"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                            disabled={uploadingLogo}
                            className="flex items-center gap-2"
                          >
                            {uploadingLogo ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                          </Button>
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          Recommended: 200x200px, PNG or JPG, max 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Color Scheme */}
                <div className="space-y-4">
                  <Label>Color Scheme</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color">Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primary_color"
                          type="color"
                          value={orgSettings.primary_color}
                          onChange={(e) => setOrgSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={orgSettings.primary_color}
                          onChange={(e) => setOrgSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                          placeholder="#0d9488"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondary_color">Secondary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="secondary_color"
                          type="color"
                          value={orgSettings.secondary_color}
                          onChange={(e) => setOrgSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={orgSettings.secondary_color}
                          onChange={(e) => setOrgSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                          placeholder="#f59e0b"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Display Preferences */}
                <div className="space-y-4">
                  <Label>Display Preferences</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="date_format">Date Format</Label>
                      <Select
                        value={orgSettings.date_format}
                        onValueChange={(value) => setOrgSettings(prev => ({ ...prev, date_format: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={orgSettings.currency}
                        onValueChange={(value) => setOrgSettings(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ZAR">ZAR (South African Rand)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                          <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={orgSettings.language}
                        onValueChange={(value) => setOrgSettings(prev => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="af">Afrikaans</SelectItem>
                          <SelectItem value="zu">Zulu</SelectItem>
                          <SelectItem value="xh">Xhosa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Communication Channels</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email_notifications">Email Notifications</Label>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <input
                          id="email_notifications"
                          type="checkbox"
                          checked={notificationSettings.email_notifications}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, email_notifications: e.target.checked }))}
                          className="h-4 w-4 text-teal-600 rounded border-gray-300"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms_notifications">SMS Notifications</Label>
                          <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                        </div>
                        <input
                          id="sms_notifications"
                          type="checkbox"
                          checked={notificationSettings.sms_notifications}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, sms_notifications: e.target.checked }))}
                          className="h-4 w-4 text-teal-600 rounded border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Notification Types</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="appointment_reminders">Appointment Reminders</Label>
                          <p className="text-sm text-gray-500">Reminders for upcoming appointments</p>
                        </div>
                        <input
                          id="appointment_reminders"
                          type="checkbox"
                          checked={notificationSettings.appointment_reminders}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, appointment_reminders: e.target.checked }))}
                          className="h-4 w-4 text-teal-600 rounded border-gray-300"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="report_completion_alerts">Report Completion Alerts</Label>
                          <p className="text-sm text-gray-500">Alerts when medical reports are completed</p>
                        </div>
                        <input
                          id="report_completion_alerts"
                          type="checkbox"
                          checked={notificationSettings.report_completion_alerts}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, report_completion_alerts: e.target.checked }))}
                          className="h-4 w-4 text-teal-600 rounded border-gray-300"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emergency_response_alerts">Emergency Response Alerts</Label>
                          <p className="text-sm text-gray-500">Critical alerts for emergency situations</p>
                        </div>
                        <input
                          id="emergency_response_alerts"
                          type="checkbox"
                          checked={notificationSettings.emergency_response_alerts}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, emergency_response_alerts: e.target.checked }))}
                          className="h-4 w-4 text-teal-600 rounded border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Configuration
                </CardTitle>
                <CardDescription>
                  Manage security settings and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Session Management</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                        <Select
                          value={securitySettings.session_timeout.toString()}
                          onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, session_timeout: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeout" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                            <SelectItem value="480">8 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="require_mfa">Require Multi-Factor Authentication</Label>
                          <p className="text-sm text-gray-500">Enforce MFA for all users</p>
                        </div>
                        <input
                          id="require_mfa"
                          type="checkbox"
                          checked={securitySettings.require_mfa}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, require_mfa: e.target.checked }))}
                          className="h-4 w-4 text-teal-600 rounded border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Password Policy</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="password_min_length">Minimum Password Length</Label>
                        <Select
                          value={securitySettings.password_min_length.toString()}
                          onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, password_min_length: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select length" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">6 characters</SelectItem>
                            <SelectItem value="8">8 characters</SelectItem>
                            <SelectItem value="10">10 characters</SelectItem>
                            <SelectItem value="12">12 characters</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="password_require_special">Require Special Characters</Label>
                          <p className="text-sm text-gray-500">Passwords must contain special characters</p>
                        </div>
                        <input
                          id="password_require_special"
                          type="checkbox"
                          checked={securitySettings.password_require_special}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, password_require_special: e.target.checked }))}
                          className="h-4 w-4 text-teal-600 rounded border-gray-300"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="password_require_numbers">Require Numbers</Label>
                          <p className="text-sm text-gray-500">Passwords must contain numbers</p>
                        </div>
                        <input
                          id="password_require_numbers"
                          type="checkbox"
                          checked={securitySettings.password_require_numbers}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, password_require_numbers: e.target.checked }))}
                          className="h-4 w-4 text-teal-600 rounded border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Account Protection</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="failed_login_attempts">Failed Login Attempts Before Lockout</Label>
                      <Select
                        value={securitySettings.failed_login_attempts.toString()}
                        onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, failed_login_attempts: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select attempts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 attempts</SelectItem>
                          <SelectItem value="5">5 attempts</SelectItem>
                          <SelectItem value="10">10 attempts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account_lockout_duration">Account Lockout Duration (minutes)</Label>
                      <Select
                        value={securitySettings.account_lockout_duration.toString()}
                        onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, account_lockout_duration: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="1440">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Settings */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Configure data backup, retention, and export settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Backup & Retention</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="backup_frequency">Backup Frequency</Label>
                        <Select
                          value={dataSettings.backup_frequency}
                          onValueChange={(value) => setDataSettings(prev => ({ ...prev, backup_frequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="retention_period">Data Retention Period (days)</Label>
                        <Select
                          value={dataSettings.retention_period.toString()}
                          onValueChange={(value) => setDataSettings(prev => ({ ...prev, retention_period: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="365">1 year</SelectItem>
                            <SelectItem value="2555">7 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="data_encryption">Data Encryption</Label>
                          <p className="text-sm text-gray-500">Encrypt data at rest and in transit</p>
                        </div>
                        <input
                          id="data_encryption"
                          type="checkbox"
                          checked={dataSettings.data_encryption}
                          onChange={(e) => setDataSettings(prev => ({ ...prev, data_encryption: e.target.checked }))}
                          className="h-4 w-4 text-teal-600 rounded border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Export & Integration</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto_export">Automatic Data Export</Label>
                          <p className="text-sm text-gray-500">Automatically export data on schedule</p>
                        </div>
                        <input
                          id="auto_export"
                          type="checkbox"
                          checked={dataSettings.auto_export}
                          onChange={(e) => setDataSettings(prev => ({ ...prev, auto_export: e.target.checked }))}
                          className="h-4 w-4 text-teal-600 rounded border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="export_format">Export Format</Label>
                        <Select
                          value={dataSettings.export_format}
                          onValueChange={(value) => setDataSettings(prev => ({ ...prev, export_format: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CSV">CSV</SelectItem>
                            <SelectItem value="JSON">JSON</SelectItem>
                            <SelectItem value="XML">XML</SelectItem>
                            <SelectItem value="PDF">PDF</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Data Actions</h3>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => alert('Export functionality will be implemented')}
                    >
                      <Download className="h-4 w-4" />
                      Export All Data
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => alert('Import functionality will be implemented')}
                    >
                      <Upload className="h-4 w-4" />
                      Import Data
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => alert('Backup functionality will be implemented')}
                    >
                      <Database className="h-4 w-4" />
                      Create Manual Backup
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
