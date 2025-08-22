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
  FileText,
  Users,
  Stethoscope,
  Heart,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  surname: string;
  work_email: string;
  workplace_name?: string;
}

interface FormData {
  type: string;
  sub_type: string;
  employee_id: string;
  doctor: string;
  nurse: string;
  site: string;
  report_work_status: string;
  notes_text: string;
  recommendation_text: string;
  employee_work_email: string;
  employee_personal_email: string;
  manager_email: string;
  doctor_email: string;
  line_manager: string;
  line_manager2: string;
}

export default function NewReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');

  const [formData, setFormData] = useState<FormData>({
    type: 'Executive Medical',
    sub_type: 'Initial Assessment',
    employee_id: '',
    doctor: '',
    nurse: '',
    site: '',
    report_work_status: 'In Progress',
    notes_text: '',
    recommendation_text: '',
    employee_work_email: '',
    employee_personal_email: '',
    manager_email: '',
    doctor_email: '',
    line_manager: '',
    line_manager2: '',
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees?page=1&limit=1000');
        const data = await response.json();
        setEmployees(data.employees || []);
        setFilteredEmployees(data.employees || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employeeSearch.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(employee => {
        const fullName = `${employee.name} ${employee.surname}`.toLowerCase();
        const email = employee.work_email.toLowerCase();
        const search = employeeSearch.toLowerCase();
        return fullName.includes(search) || email.includes(search);
      });
      setFilteredEmployees(filtered);
    }
  }, [employeeSearch, employees]);

  const handleInputChange = (field: keyof FormData, value: string) => {
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
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/reports');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create report');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/reports');
  };

  const getSelectedEmployee = () => {
    return employees.find(emp => emp.id === formData.employee_id);
  };

  const selectedEmployee = getSelectedEmployee();

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
                  Medical Report Created Successfully!
                </h2>
                <p className='text-muted-foreground'>
                  The new medical report has been added to the system.
                  Redirecting to reports list...
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
            Back to Reports
          </Button>

          <div className='flex items-center gap-3 mb-2'>
            <div className='p-2 bg-teal-100 rounded-lg'>
              <FileText className='h-6 w-6 text-teal-600' />
            </div>
            <h1 className='text-3xl font-bold text-foreground'>
              Create New Medical Report
            </h1>
          </div>
          <p className='text-muted-foreground text-lg'>
            Generate a new medical report in the OHMS Health Management System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Report Type */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 heading-montserrat-bold text-xl'>
                <div className='p-2 bg-purple-100 rounded-lg'>
                  <FileText className='h-5 w-5 text-purple-600' />
                </div>
                <span className='medical-heading'>Report Type</span>
              </CardTitle>
              <CardDescription>
                Select the type and subtype of medical report
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='type'>Report Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={value => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select report type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Executive Medical'>
                        Executive Medical
                      </SelectItem>
                      <SelectItem value='Follow-up'>Follow-up</SelectItem>
                      <SelectItem value='Initial Assessment'>
                        Initial Assessment
                      </SelectItem>
                      <SelectItem value='Review'>Review</SelectItem>
                      <SelectItem value='Emergency'>Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='sub_type'>Sub Type</Label>
                  <Select
                    value={formData.sub_type}
                    onValueChange={value =>
                      handleInputChange('sub_type', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select sub type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Initial Assessment'>
                        Initial Assessment
                      </SelectItem>
                      <SelectItem value='Follow-up'>Follow-up</SelectItem>
                      <SelectItem value='Annual Review'>
                        Annual Review
                      </SelectItem>
                      <SelectItem value='Return to Work'>
                        Return to Work
                      </SelectItem>
                      <SelectItem value='Fitness Assessment'>
                        Fitness Assessment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employee Selection */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 heading-montserrat-bold text-xl'>
                <div className='p-2 bg-green-100 rounded-lg'>
                  <Users className='h-5 w-5 text-green-600' />
                </div>
                <span className='medical-heading'>Employee Selection</span>
              </CardTitle>
              <CardDescription>
                Select the employee for this medical report
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='employee_search'>Search Employee</Label>
                <Input
                  id='employee_search'
                  type='text'
                  placeholder='Search by name or email...'
                  value={employeeSearch}
                  onChange={e => setEmployeeSearch(e.target.value)}
                  className='mb-3'
                />

                <Label htmlFor='employee_id'>Select Employee *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={value =>
                    handleInputChange('employee_id', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select an employee' />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEmployees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className='flex flex-col'>
                          <span className='font-medium'>
                            {employee.name} {employee.surname}
                          </span>
                          <span className='text-sm text-muted-foreground'>
                            {employee.work_email}
                          </span>
                          {employee.workplace_name && (
                            <span className='text-xs text-muted-foreground'>
                              {employee.workplace_name}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Employee Info */}
              {selectedEmployee && (
                <Card className='border-green-200 bg-green-50'>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-green-100 rounded-full'>
                        <User className='h-4 w-4 text-green-600' />
                      </div>
                      <div className='flex-1'>
                        <h4 className='font-medium text-green-900'>
                          {selectedEmployee.name} {selectedEmployee.surname}
                        </h4>
                        <p className='text-sm text-green-700'>
                          {selectedEmployee.work_email}
                        </p>
                        {selectedEmployee.workplace_name && (
                          <p className='text-xs text-green-600'>
                            📍 {selectedEmployee.workplace_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Report Details */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 heading-montserrat-bold text-xl'>
                <div className='p-2 bg-orange-100 rounded-lg'>
                  <Heart className='h-5 w-5 text-orange-600' />
                </div>
                <span className='medical-heading'>Report Details</span>
              </CardTitle>
              <CardDescription>
                Additional information and status for the report
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='site'>Site/Location</Label>
                  <Input
                    id='site'
                    value={formData.site}
                    onChange={e => handleInputChange('site', e.target.value)}
                    placeholder='Enter site or location'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='report_work_status'>Report Status</Label>
                  <Select
                    value={formData.report_work_status}
                    onValueChange={value =>
                      handleInputChange('report_work_status', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='In Progress'>In Progress</SelectItem>
                      <SelectItem value='Pending Review'>
                        Pending Review
                      </SelectItem>
                      <SelectItem value='Awaiting Doctor'>
                        Awaiting Doctor
                      </SelectItem>
                      <SelectItem value='Completed'>Completed</SelectItem>
                      <SelectItem value='On Hold'>On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Content */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 heading-montserrat-bold text-xl'>
                <div className='p-2 bg-gray-100 rounded-lg'>
                  <FileText className='h-5 w-5 text-gray-600' />
                </div>
                <span className='medical-heading'>Report Content</span>
              </CardTitle>
              <CardDescription>
                Medical notes and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='notes_text'>Medical Notes</Label>
                <Textarea
                  id='notes_text'
                  value={formData.notes_text}
                  onChange={e =>
                    handleInputChange('notes_text', e.target.value)
                  }
                  placeholder='Enter medical notes, observations, and findings...'
                  rows={6}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='recommendation_text'>Recommendations</Label>
                <Textarea
                  id='recommendation_text'
                  value={formData.recommendation_text}
                  onChange={e =>
                    handleInputChange('recommendation_text', e.target.value)
                  }
                  placeholder='Enter medical recommendations, treatment plans, and follow-up instructions...'
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
            <Button
              type='submit'
              disabled={loading || !formData.employee_id}
              className='hover-lift'
            >
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Creating Report...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Create Report
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
