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
  Calendar,
  Clock,
  User,
  FileText,
  MapPin,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  Stethoscope,
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  surname: string;
  work_email: string;
  workplace_name?: string;
  organisation_name?: string;
}

interface FormData {
  // Appointment Details
  type: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  notes: string;

  // Optional Report Link
  report_id: string;
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');

  const [formData, setFormData] = useState<FormData>({
    type: 'Executive Medical',
    employee_id: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    notes: '',
    report_id: '',
  });

  // Fetch employees for the dropdown
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

  // Filter employees based on search
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
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/appointments');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create appointment');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/appointments');
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
                  Appointment Scheduled Successfully!
                </h2>
                <p className='text-muted-foreground'>
                  The new appointment has been added to the system. Redirecting
                  to appointments list...
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
            Back to Appointments
          </Button>

          <div className='flex items-center gap-3 mb-2'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Calendar className='h-6 w-6 text-blue-600' />
            </div>
            <h1 className='text-3xl font-bold text-foreground'>
              Schedule New Appointment
            </h1>
          </div>
          <p className='text-muted-foreground text-lg'>
            Book a new appointment in the OHMS Health Management System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Appointment Type */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 heading-montserrat-bold text-xl'>
                <div className='p-2 bg-purple-100 rounded-lg'>
                  <FileText className='h-5 w-5 text-purple-600' />
                </div>
                <span className='medical-heading'>Appointment Type</span>
              </CardTitle>
              <CardDescription>
                Select the type of appointment to schedule
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='type'>Appointment Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={value => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select appointment type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Executive Medical'>
                      Executive Medical
                    </SelectItem>
                    <SelectItem value='Follow-up'>Follow-up</SelectItem>
                    <SelectItem value='Initial Consultation'>
                      Initial Consultation
                    </SelectItem>
                    <SelectItem value='Review'>Review</SelectItem>
                    <SelectItem value='Emergency'>Emergency</SelectItem>
                  </SelectContent>
                </Select>
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
                Select the employee for this appointment
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

          {/* Date and Time */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 heading-montserrat-bold text-xl'>
                <div className='p-2 bg-orange-100 rounded-lg'>
                  <Clock className='h-5 w-5 text-orange-600' />
                </div>
                <span className='medical-heading'>Date and Time</span>
              </CardTitle>
              <CardDescription>
                Set the appointment date and time
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='start_date'>Start Date *</Label>
                  <Input
                    id='start_date'
                    type='date'
                    value={formData.start_date}
                    onChange={e =>
                      handleInputChange('start_date', e.target.value)
                    }
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='end_date'>End Date</Label>
                  <Input
                    id='end_date'
                    type='date'
                    value={formData.end_date}
                    onChange={e =>
                      handleInputChange('end_date', e.target.value)
                    }
                    min={formData.start_date}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='start_time'>Start Time *</Label>
                  <Input
                    id='start_time'
                    type='time'
                    value={formData.start_time}
                    onChange={e =>
                      handleInputChange('start_time', e.target.value)
                    }
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='end_time'>End Time</Label>
                  <Input
                    id='end_time'
                    type='time'
                    value={formData.end_time}
                    onChange={e =>
                      handleInputChange('end_time', e.target.value)
                    }
                    min={formData.start_time}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Link (Optional) */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 heading-montserrat-bold text-xl'>
                <div className='p-2 bg-teal-100 rounded-lg'>
                  <Stethoscope className='h-5 w-5 text-teal-600' />
                </div>
                <span className='medical-heading'>Medical Report Link</span>
              </CardTitle>
              <CardDescription>
                Optionally link this appointment to an existing medical report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <Label htmlFor='report_id'>Report ID (Optional)</Label>
                <Input
                  id='report_id'
                  value={formData.report_id}
                  onChange={e => handleInputChange('report_id', e.target.value)}
                  placeholder='Enter report ID if linking to existing report'
                />
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
                Any additional information or special requirements for this
                appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <Label htmlFor='notes'>Notes</Label>
                <Textarea
                  id='notes'
                  value={formData.notes}
                  onChange={e => handleInputChange('notes', e.target.value)}
                  placeholder='Enter any additional notes, special requirements, or instructions for this appointment...'
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
              disabled={
                loading ||
                !formData.employee_id ||
                !formData.start_date ||
                !formData.start_time
              }
              className='hover-lift'
            >
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Scheduling Appointment...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Schedule Appointment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
