'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { User } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { useUser } from '@/contexts/UserContext';
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  User as UserIcon,
  UserCheck,
  Stethoscope,
  ShieldCheck,
  HeartHandshake,
  Activity,
  FileText,
  Settings,
  Edit3,
  Key,
  Award,
  Camera,
  Upload,
  X,
  ArrowLeft,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageLoading } from '@/components/ui/loading';
import { useBreadcrumbBack } from '@/hooks/useBreadcrumbBack';

interface UserWithMetadata extends User {
  created_by_name?: string;
  updated_by_name?: string;
  profileImage?: string;
}

function UserProfileContent() {
  const { currentUser, updateProfileImage, loading } = useUser();
  const goBack = useBreadcrumbBack();
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setUploading(true);

    try {
      // Simulate API call for image upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you would upload to your server/cloud storage
      // const formData = new FormData();
      // formData.append('profileImage', selectedImage);
      // const response = await fetch('/api/upload-profile-image', {
      //   method: 'POST',
      //   body: formData,
      // });

      // Update user profile with new image using context
      if (previewUrl) {
        updateProfileImage(previewUrl);
      }

      // Clean up
      setSelectedImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'Doctor':
        return <Stethoscope className='h-3 w-3' />;
      case 'Nurse':
        return <HeartHandshake className='h-3 w-3' />;
      case 'Administrator':
        return <ShieldCheck className='h-3 w-3' />;
      case 'Ergonomist':
        return <Activity className='h-3 w-3' />;
      default:
        return <UserIcon className='h-3 w-3' />;
    }
  };

  const getUserTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'Doctor':
        return 'default';
      case 'Nurse':
        return 'secondary';
      case 'Administrator':
        return 'outline';
      case 'Ergonomist':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading || !currentUser) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
            <Card>
              <CardContent>
                <PageLoading
                  text='Loading Profile'
                  subtitle='Fetching your profile details...'
                />
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!currentUser) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Card className='w-96'>
          <CardContent className='flex items-center justify-center py-12'>
            <div className='text-center space-y-4'>
              <UserIcon className='h-12 w-12 text-muted-foreground mx-auto' />
              <p className='text-muted-foreground'>User not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-6'>
          {/* Back Button */}
          <div className='mb-6'>
            <Button
              variant='outline'
              size='sm'
              onClick={goBack}
              className='flex items-center space-x-2'
            >
              <ArrowLeft className='h-4 w-4' />
              <span>Back</span>
            </Button>
          </div>

          <div className='space-y-6 animate-slide-up'>
            {/* Page Header */}
            <div className='flex items-center gap-3'>
              <UserIcon className='h-8 w-8 text-primary' />
              <h1 className='text-3xl font-bold medical-heading'>My Profile</h1>
            </div>

            {/* User Profile Header */}
            <Card className='glass-effect'>
              <CardHeader className='pb-3'>
                <div className='flex items-center gap-6'>
                  {/* Profile Picture Section */}
                  <div className='relative group'>
                    <Avatar className='h-24 w-24 cursor-pointer transition-all duration-200 hover:opacity-80'>
                      {currentUser.profileImage ? (
                        <AvatarImage
                          src={currentUser.profileImage}
                          alt={`${currentUser.name} ${currentUser.surname}`}
                        />
                      ) : previewUrl ? (
                        <AvatarImage src={previewUrl} alt='Preview' />
                      ) : (
                        <AvatarFallback className='bg-primary text-primary-foreground text-2xl font-semibold'>
                          {currentUser.name?.[0]}
                          {currentUser.surname?.[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    {/* Upload Overlay */}
                    <div className='absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center'>
                      <Camera className='h-8 w-8 text-white' />
                    </div>

                    {/* Upload Button */}
                    <Button
                      variant='outline'
                      size='sm'
                      className='absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full bg-background border-2 border-primary hover:bg-primary hover:text-primary-foreground'
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className='h-4 w-4' />
                    </Button>

                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleImageSelect}
                      className='hidden'
                    />
                  </div>

                  {/* Profile Info */}
                  <div className='space-y-2 flex-1'>
                    <CardTitle className='text-3xl medical-heading'>
                      {currentUser.name} {currentUser.surname}
                    </CardTitle>
                    <CardDescription className='flex items-center gap-2'>
                      <Badge
                        variant={getUserTypeBadgeVariant(currentUser.type)}
                        className='flex items-center gap-1 text-sm'
                      >
                        {getUserTypeIcon(currentUser.type)}
                        {currentUser.type}
                      </Badge>
                      {currentUser.signature && (
                        <Badge
                          variant='outline'
                          className='flex items-center gap-1'
                        >
                          <Award className='h-3 w-3' />
                          {currentUser.signature}
                        </Badge>
                      )}
                    </CardDescription>
                    {/* Last Updated Information */}
                    <div className='text-xs text-muted-foreground mt-2'>
                      <span>Last updated by </span>
                      <span className='font-medium'>
                        {currentUser.updated_by_name || 'Unknown'}
                      </span>
                      <span> on </span>
                      <span className='font-medium'>
                        {currentUser.date_updated
                          ? new Date(currentUser.date_updated).toLocaleString()
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  {/* Image Upload Actions */}
                  {selectedImage && (
                    <div className='flex flex-col gap-2'>
                      <Button
                        onClick={handleImageUpload}
                        disabled={uploading}
                        className='hover-lift'
                      >
                        {uploading ? (
                          <>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className='h-4 w-4 mr-2' />
                            Upload
                          </>
                        )}
                      </Button>
                      <Button
                        variant='outline'
                        onClick={handleRemoveImage}
                        className='hover-lift'
                      >
                        <X className='h-4 w-4 mr-2' />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Contact Information */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm'>{currentUser.email}</span>
                  </div>
                  {currentUser.mobile && (
                    <div className='flex items-center gap-2'>
                      <Phone className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm'>{currentUser.mobile}</span>
                    </div>
                  )}
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm'>
                      Created: {formatDate(currentUser.date_created)}
                    </span>
                  </div>
                  {currentUser.date_updated && (
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm'>
                        Updated: {formatDate(currentUser.date_updated)}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Statistics */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-primary'>12</div>
                    <div className='text-xs text-muted-foreground'>Reports</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-primary'>8</div>
                    <div className='text-xs text-muted-foreground'>
                      Appointments
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-primary'>15</div>
                    <div className='text-xs text-muted-foreground'>
                      Assessments
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-primary'>6</div>
                    <div className='text-xs text-muted-foreground'>
                      Documents
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Details Tabs */}
            <Card className='glass-effect'>
              <CardContent className='p-0'>
                <Tabs defaultValue='overview' className='w-full'>
                  <TabsList className='grid w-full grid-cols-4'>
                    <TabsTrigger value='overview'>Overview</TabsTrigger>
                    <TabsTrigger value='activity'>Activity</TabsTrigger>
                    <TabsTrigger value='documents'>Documents</TabsTrigger>
                    <TabsTrigger value='settings'>Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value='overview' className='p-6 space-y-4'>
                    <div className='space-y-4'>
                      <div className='flex items-center gap-2'>
                        <UserIcon className='h-4 w-4 text-muted-foreground' />
                        <h3 className='font-medium'>Profile Information</h3>
                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                        <div>
                          <span className='text-muted-foreground'>
                            Full Name:
                          </span>
                          <span className='ml-2 font-medium'>
                            {currentUser.name} {currentUser.surname}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>
                            User Type:
                          </span>
                          <span className='ml-2 font-medium'>
                            {currentUser.type}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>Email:</span>
                          <span className='ml-2 font-medium'>
                            {currentUser.email}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>Mobile:</span>
                          <span className='ml-2 font-medium'>
                            {currentUser.mobile || 'Not provided'}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>
                            User ID:
                          </span>
                          <span className='ml-2 font-mono text-xs'>
                            {currentUser.id}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>
                            Created By:
                          </span>
                          <span className='ml-2 font-medium'>
                            {currentUser.created_by_name || 'System'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value='activity' className='p-6 space-y-4'>
                    <div className='space-y-4'>
                      <div className='flex items-center gap-2'>
                        <Activity className='h-4 w-4 text-muted-foreground' />
                        <h3 className='font-medium'>Recent Activity</h3>
                      </div>
                      <div className='space-y-3'>
                        <div className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg'>
                          <div className='w-2 h-2 bg-primary rounded-full'></div>
                          <div className='flex-1'>
                            <p className='text-sm font-medium'>
                              Created medical report for Employee #123
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              2 hours ago
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg'>
                          <div className='w-2 h-2 bg-secondary rounded-full'></div>
                          <div className='flex-1'>
                            <p className='text-sm font-medium'>
                              Updated patient assessment
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              1 day ago
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                          <div className='flex-1'>
                            <p className='text-sm font-medium'>
                              Scheduled appointment with Employee #456
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              3 days ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value='documents' className='p-6 space-y-4'>
                    <div className='space-y-4'>
                      <div className='flex items-center gap-2'>
                        <FileText className='h-4 w-4 text-muted-foreground' />
                        <h3 className='font-medium'>Documents & Files</h3>
                      </div>
                      <div className='space-y-3'>
                        <div className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg'>
                          <FileText className='h-4 w-4 text-primary' />
                          <div className='flex-1'>
                            <p className='text-sm font-medium'>
                              Medical Report - Employee #123
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              PDF • 2.3 MB • Created 2 hours ago
                            </p>
                          </div>
                          <Button variant='outline' size='sm'>
                            Download
                          </Button>
                        </div>
                        <div className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg'>
                          <FileText className='h-4 w-4 text-primary' />
                          <div className='flex-1'>
                            <p className='text-sm font-medium'>
                              Assessment Form - Employee #456
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              PDF • 1.8 MB • Created 1 day ago
                            </p>
                          </div>
                          <Button variant='outline' size='sm'>
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value='settings' className='p-6 space-y-4'>
                    <div className='space-y-4'>
                      <div className='flex items-center gap-2'>
                        <Settings className='h-4 w-4 text-muted-foreground' />
                        <h3 className='font-medium'>Account Settings</h3>
                      </div>
                      <div className='space-y-3'>
                        <Button
                          variant='outline'
                          className='w-full justify-start'
                        >
                          <Edit3 className='h-4 w-4 mr-2' />
                          Edit Profile
                        </Button>
                        <Button
                          variant='outline'
                          className='w-full justify-start'
                        >
                          <Key className='h-4 w-4 mr-2' />
                          Change Password
                        </Button>
                        <Button
                          variant='outline'
                          className='w-full justify-start'
                        >
                          <ShieldCheck className='h-4 w-4 mr-2' />
                          Privacy Settings
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense
      fallback={
        <ProtectedRoute>
          <DashboardLayout>
            <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
              <Card>
                <CardContent>
                  <PageLoading
                    text='Loading Profile'
                    subtitle='Preparing your profile...'
                  />
                </CardContent>
              </Card>
            </div>
          </DashboardLayout>
        </ProtectedRoute>
      }
    >
      <UserProfileContent />
    </Suspense>
  );
}
