'use client';

import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/DashboardLayout';
import {
  ArrowLeft,
  Users,
  UserRoundPlus,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Heart,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface FormData {
  // Personal Information
  name: string;
  surname: string;
  id_number: string;
  passport_number: string;
  gender: string;
  date_of_birth: string;
  ethnicity: string;
  marriage_status: string;
  no_of_children: string;
  personal_email_address: string;
  mobile_number: string;

  // Medical Information
  medical_aid: string;
  medical_aid_number: string;
  main_member: boolean;
  main_member_name: string;

  // Work Information
  work_email: string;
  employee_number: string;
  organisation: string;
  organisation_name: string;
  workplace: string;
  workplace_name: string;
  job: string;
  work_startdate: string;

  // Notes
  notes_text: string;
}

export default function NewEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    surname: '',
    id_number: '',
    passport_number: '',
    gender: '',
    date_of_birth: '',
    ethnicity: '',
    marriage_status: '',
    no_of_children: '',
    personal_email_address: '',
    mobile_number: '',
    medical_aid: '',
    medical_aid_number: '',
    main_member: false,
    main_member_name: '',
    work_email: '',
    employee_number: '',
    organisation: '',
    organisation_name: '',
    workplace: '',
    workplace_name: '',
    job: '',
    work_startdate: '',
    notes_text: '',
  });

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/employees');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create employee');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/employees');
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className='pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[10vw] py-6'>
          <Card className='max-w-2xl mx-auto'>
            <CardContent className='p-12 text-center'>
              <div className='space-y-4'>
                <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='h-8 w-8 text-green-600' />
                </div>
                <h2 className='text-2xl font-semibold text-foreground'>
                  Employee Created Successfully!
                </h2>
                <p className='text-muted-foreground'>
                  The new employee has been added to the system. Redirecting to
                  employees list...
                </p>
                <div className='pt-4'>
                  <Loader2 className='h-6 w-6 animate-spin text-primary mx-auto' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[10vw] py-6'>
        {/* Header */}
        <div className='mb-8'>
          <Button
            variant='ghost'
            onClick={handleBack}
            className='mb-4 hover-lift'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Employees
          </Button>

          <div className='flex items-center gap-3 mb-2'>
            <div className='p-2 bg-teal-100 rounded-lg'>
              <UserRoundPlus className='h-6 w-6 text-teal-600' />
            </div>
            <h1 className='text-3xl font-bold text-foreground'>
              Add New Employee
            </h1>
          </div>
          <p className='text-muted-foreground text-lg'>
            Register a new employee in the OHMS Health Management System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Personal Information */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 heading-montserrat-bold text-xl'>
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <Users className='h-5 w-5 text-blue-600' />
                </div>
                <span className='medical-heading'>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Basic personal details and identification information
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>First Name *</Label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder='Enter first name'
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='surname'>Surname *</Label>
                  <Input
                    id='surname'
                    value={formData.surname}
                    onChange={e => handleInputChange('surname', e.target.value)}
                    placeholder='Enter surname'
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='id_number'>ID Number</Label>
                  <Input
                    id='id_number'
                    value={formData.id_number}
                    onChange={e =>
                      handleInputChange('id_number', e.target.value)
                    }
                    placeholder='Enter ID number'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='passport_number'>Passport Number</Label>
                  <Input
                    id='passport_number'
                    value={formData.passport_number}
                    onChange={e =>
                      handleInputChange('passport_number', e.target.value)
                    }
                    placeholder='Enter passport number'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='gender'>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={value => handleInputChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select gender' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Male'>Male</SelectItem>
                      <SelectItem value='Female'>Female</SelectItem>
                      <SelectItem value='Other'>Other</SelectItem>
                      <SelectItem value='Prefer not to say'>
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='date_of_birth'>Date of Birth</Label>
                  <Input
                    id='date_of_birth'
                    type='date'
                    value={formData.date_of_birth}
                    onChange={e =>
                      handleInputChange('date_of_birth', e.target.value)
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='ethnicity'>Ethnicity</Label>
                  <Input
                    id='ethnicity'
                    value={formData.ethnicity}
                    onChange={e =>
                      handleInputChange('ethnicity', e.target.value)
                    }
                    placeholder='Enter ethnicity'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='marriage_status'>Marital Status</Label>
                  <Select
                    value={formData.marriage_status}
                    onValueChange={value =>
                      handleInputChange('marriage_status', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select marital status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Single'>Single</SelectItem>
                      <SelectItem value='Married'>Married</SelectItem>
                      <SelectItem value='Divorced'>Divorced</SelectItem>
                      <SelectItem value='Widowed'>Widowed</SelectItem>
                      <SelectItem value='Separated'>Separated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='no_of_children'>Number of Children</Label>
                  <Input
                    id='no_of_children'
                    type='number'
                    min='0'
                    value={formData.no_of_children}
                    onChange={e =>
                      handleInputChange('no_of_children', e.target.value)
                    }
                    placeholder='0'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 heading-montserrat-bold text-xl'>
                <div className='p-2 bg-green-100 rounded-lg'>
                  <Mail className='h-5 w-5 text-green-600' />
                </div>
                <span className='medical-heading'>Contact Information</span>
              </CardTitle>
              <CardDescription>
                Personal contact details and communication preferences
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='personal_email_address'>Personal Email</Label>
                  <Input
                    id='personal_email_address'
                    type='email'
                    value={formData.personal_email_address}
                    onChange={e =>
                      handleInputChange(
                        'personal_email_address',
                        e.target.value
                      )
                    }
                    placeholder='Enter personal email address'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='mobile_number'>Mobile Number</Label>
                  <Input
                    id='mobile_number'
                    value={formData.mobile_number}
                    onChange={e =>
                      handleInputChange('mobile_number', e.target.value)
                    }
                    placeholder='Enter mobile number'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 heading-montserrat-bold text-xl'>
                <div className='p-2 bg-red-100 rounded-lg'>
                  <Heart className='h-5 w-5 text-red-600' />
                </div>
                <span className='medical-heading'>Medical Information</span>
              </CardTitle>
              <CardDescription>
                Medical aid details and health-related information
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='medical_aid'>Medical Aid Provider</Label>
                  <Input
                    id='medical_aid'
                    value={formData.medical_aid}
                    onChange={e =>
                      handleInputChange('medical_aid', e.target.value)
                    }
                    placeholder='Enter medical aid provider'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='medical_aid_number'>Medical Aid Number</Label>
                  <Input
                    id='medical_aid_number'
                    value={formData.medical_aid_number}
                    onChange={e =>
                      handleInputChange('medical_aid_number', e.target.value)
                    }
                    placeholder='Enter medical aid number'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='main_member'>Main Member</Label>
                  <Select
                    value={formData.main_member ? 'true' : 'false'}
                    onValueChange={value =>
                      handleInputChange('main_member', value === 'true')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select main member status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='true'>Yes</SelectItem>
                      <SelectItem value='false'>No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='main_member_name'>Main Member Name</Label>
                  <Input
                    id='main_member_name'
                    value={formData.main_member_name}
                    onChange={e =>
                      handleInputChange('main_member_name', e.target.value)
                    }
                    placeholder='Enter main member name'
                    disabled={!formData.main_member}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 heading-montserrat-bold text-xl'>
                <div className='p-2 bg-purple-100 rounded-lg'>
                  <Briefcase className='h-5 w-5 text-purple-600' />
                </div>
                <span className='medical-heading'>Work Information</span>
              </CardTitle>
              <CardDescription>
                Employment details and workplace information
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='work_email'>Work Email *</Label>
                  <Input
                    id='work_email'
                    type='email'
                    value={formData.work_email}
                    onChange={e =>
                      handleInputChange('work_email', e.target.value)
                    }
                    placeholder='Enter work email address'
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='employee_number'>Employee Number</Label>
                  <Input
                    id='employee_number'
                    value={formData.employee_number}
                    onChange={e =>
                      handleInputChange('employee_number', e.target.value)
                    }
                    placeholder='Enter employee number'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='organisation'>Organisation</Label>
                  <Input
                    id='organisation'
                    value={formData.organisation}
                    onChange={e =>
                      handleInputChange('organisation', e.target.value)
                    }
                    placeholder='Enter organisation'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='organisation_name'>Organisation Name</Label>
                  <Input
                    id='organisation_name'
                    value={formData.organisation_name}
                    onChange={e =>
                      handleInputChange('organisation_name', e.target.value)
                    }
                    placeholder='Enter organisation name'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='workplace'>Workplace</Label>
                  <Input
                    id='workplace'
                    value={formData.workplace}
                    onChange={e =>
                      handleInputChange('workplace', e.target.value)
                    }
                    placeholder='Enter workplace'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='workplace_name'>Workplace Name</Label>
                  <Input
                    id='workplace_name'
                    value={formData.workplace_name}
                    onChange={e =>
                      handleInputChange('workplace_name', e.target.value)
                    }
                    placeholder='Enter workplace name'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='job'>Job Title</Label>
                  <Input
                    id='job'
                    value={formData.job}
                    onChange={e => handleInputChange('job', e.target.value)}
                    placeholder='Enter job title'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='work_startdate'>Work Start Date</Label>
                  <Input
                    id='work_startdate'
                    type='date'
                    value={formData.work_startdate}
                    onChange={e =>
                      handleInputChange('work_startdate', e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 heading-montserrat-bold text-xl'>
                <div className='p-2 bg-gray-100 rounded-lg'>
                  <FileText className='h-5 w-5 text-gray-600' />
                </div>
                <span className='medical-heading'>Additional Notes</span>
              </CardTitle>
              <CardDescription>
                Any additional information or special requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <Label htmlFor='notes_text'>Notes</Label>
                <Textarea
                  id='notes_text'
                  value={formData.notes_text}
                  onChange={e =>
                    handleInputChange('notes_text', e.target.value)
                  }
                  placeholder='Enter any additional notes or special requirements...'
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className='border-red-200 bg-red-50'>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2 text-red-700'>
                  <AlertCircle className='h-5 w-5' />
                  <span className='font-medium'>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className='flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={handleBack}
              className='hover-lift'
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading} className='hover-lift'>
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Creating Employee...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Create Employee
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
