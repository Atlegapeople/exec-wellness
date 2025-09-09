'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Heart,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import { EmergencyResponse } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageLoading } from '@/components/ui/loading';
import { useBreadcrumbBack } from '@/hooks/useBreadcrumbBack';

const EMERGENCY_TYPES = ['Medical', 'Injury', 'Accident', 'Other'];

function EmergencyResponsesPageContent() {
  const goBack = useBreadcrumbBack();
  const [emergencyResponses, setEmergencyResponses] = useState<
    EmergencyResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] =
    useState<EmergencyResponse | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [responseToDelete, setResponseToDelete] =
    useState<EmergencyResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState<Partial<EmergencyResponse>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const itemsPerPage = 50;

  const fetchEmergencyResponses = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        search: search,
        _t: Date.now().toString(),
      });

      const response = await fetch(`/api/emergency-responses?${params}`);
      const data = await response.json();

      console.log('Emergency Responses API Response:', data);
      console.log(
        'Total emergency responses fetched:',
        data.emergencyResponses?.length || 0
      );

      if (response.ok && data.emergencyResponses) {
        setEmergencyResponses(data.emergencyResponses);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Failed to fetch emergency responses:', data.error);
        setEmergencyResponses([]);
      }
    } catch (error) {
      console.error('Error fetching emergency responses:', error);
      setEmergencyResponses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyResponses(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchEmergencyResponses(1, searchTerm);
  };

  const handleCreateResponse = async () => {
    try {
      setFormErrors({});

      if (!formData.employee_id || !formData.emergency_type) {
        setFormErrors({
          employee_id: !formData.employee_id ? 'Employee ID is required' : '',
          emergency_type: !formData.emergency_type
            ? 'Emergency type is required'
            : '',
        });
        return;
      }

      const response = await fetch('/api/emergency-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setFormData({});
        fetchEmergencyResponses(currentPage, searchTerm);
      } else {
        const errorData = await response.json();
        console.error('Failed to create emergency response:', errorData);
      }
    } catch (error) {
      console.error('Error creating emergency response:', error);
    }
  };

  const handleEditResponse = async () => {
    try {
      setFormErrors({});

      if (!formData.employee_id || !formData.emergency_type) {
        setFormErrors({
          employee_id: !formData.employee_id ? 'Employee ID is required' : '',
          emergency_type: !formData.emergency_type
            ? 'Emergency type is required'
            : '',
        });
        return;
      }

      const response = await fetch('/api/emergency-responses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: selectedResponse?.id }),
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        setSelectedResponse(null);
        setFormData({});
        fetchEmergencyResponses(currentPage, searchTerm);
      } else {
        const errorData = await response.json();
        console.error('Failed to update emergency response:', errorData);
      }
    } catch (error) {
      console.error('Error updating emergency response:', error);
    }
  };

  const handleDeleteResponse = async (response: EmergencyResponse) => {
    setResponseToDelete(response);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!responseToDelete) return;

    try {
      const deleteResponse = await fetch(
        `/api/emergency-responses?id=${responseToDelete.id}`,
        {
          method: 'DELETE',
        }
      );

      if (deleteResponse.ok) {
        setIsDeleteModalOpen(false);
        setResponseToDelete(null);
        fetchEmergencyResponses(currentPage, searchTerm);
      } else {
        const errorData = await deleteResponse.json();
        console.error('Failed to delete emergency response:', errorData);
      }
    } catch (error) {
      console.error('Error deleting emergency response:', error);
    }
  };

  const getEmergencyTypeBadgeColor = (type?: string) => {
    switch (type) {
      case 'Medical':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'Injury':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'Accident':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (time?: string) => {
    if (!time) return 'N/A';
    return time;
  };

  const openCreateModal = () => {
    setFormData({});
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (response: EmergencyResponse) => {
    setSelectedResponse(response);

    // Helper function to safely format date
    const formatDateForInput = (date?: Date | string) => {
      if (!date) return '';
      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return '';
        return dateObj.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error formatting date:', error);
        return '';
      }
    };

    setFormData({
      employee_id: response.employee_id,
      report_id: response.report_id,
      injury_date: formatDateForInput(response.injury_date) as any,
      injury_time: response.injury_time,
      arrival_time: response.arrival_time,
      location_id: response.location_id,
      place: response.place,
      emergency_type: response.emergency_type,
      injury: response.injury,
      main_complaint: response.main_complaint,
      diagnosis: response.diagnosis,
      findings: response.findings,
      intervention: response.intervention,
      patient_history: response.patient_history,
      plan: response.plan,
      outcome: response.outcome,
      reference: response.reference,
      manager: response.manager,
      sendemail: response.sendemail,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
            <Card>
              <CardContent>
                <PageLoading
                  text='Loading Emergency Responses'
                  subtitle='Fetching emergency response data from OHMS database...'
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
        <div className='space-y-6 p-6'>
          {/* Back Button */}
          <div className='mb-6'>
            <Button
              variant='outline'
              size='sm'
              onClick={goBack}
              className='flex items-center space-x-2 hover-lift'
            >
              <ArrowLeft className='h-4 w-4' />
              <span>Back</span>
            </Button>
          </div>

          {/* Header */}
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight text-primary'>
                Emergency Responses
              </h1>
              <p className='text-muted-foreground'>
                Manage emergency response records and incident reports
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className='glass-effect mb-4'>
            <CardContent className='p-4'>
              <form onSubmit={handleSearch} className='flex gap-4'>
                <div className='flex-1 relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    type='text'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder='Search by ID, employee, type, complaint, diagnosis...'
                    className='pl-9'
                  />
                </div>
                <Button type='submit' className='hover-lift'>
                  Search
                </Button>
                {searchTerm && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setSearchTerm('');
                      fetchEmergencyResponses(1, '');
                    }}
                    className='hover-lift'
                  >
                    Clear
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]'>
            {/* List Panel */}
            <div className='lg:col-span-2'>
              <Card className='h-full'>
                <CardHeader>
                  <div className='flex justify-between items-center'>
                    <CardTitle className='flex items-center gap-2 text-primary'>
                      <AlertTriangle className='h-5 w-5' />
                      Emergency Responses ({emergencyResponses.length})
                    </CardTitle>
                    <Button onClick={openCreateModal} className='hover-lift'>
                      <Plus className='mr-2 h-4 w-4' />
                      New Emergency Response
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='h-full overflow-hidden'>
                  <div className='h-[650px] overflow-y-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow className='bg-muted/50'>
                          <TableHead className='text-base font-semibold text-primary py-4'>
                            Date
                          </TableHead>
                          <TableHead className='text-base font-semibold text-primary py-4'>
                            Employee
                          </TableHead>
                          <TableHead className='text-base font-semibold text-primary py-4'>
                            Type
                          </TableHead>
                          <TableHead className='text-base font-semibold text-primary py-4'>
                            Complaint
                          </TableHead>
                          <TableHead className='text-base font-semibold text-primary py-4'>
                            Diagnosis
                          </TableHead>
                          <TableHead className='text-base font-semibold text-primary py-4'>
                            Location
                          </TableHead>
                          <TableHead className='text-base font-semibold text-primary py-4'>
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emergencyResponses.map(response => (
                          <TableRow
                            key={response.id}
                            className='cursor-pointer hover:bg-muted/50'
                            onClick={() => setSelectedResponse(response)}
                          >
                            <TableCell>
                              {formatDate(response.injury_date)}
                            </TableCell>
                            <TableCell>
                              <div className='font-medium'>
                                {response.employee_name}{' '}
                                {response.employee_surname}
                              </div>
                              <div className='text-sm text-muted-foreground'>
                                {response.employee_work_email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getEmergencyTypeBadgeColor(
                                  response.emergency_type
                                )}
                              >
                                {response.emergency_type || 'Unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell className='max-w-[200px] truncate'>
                              {response.main_complaint || 'N/A'}
                            </TableCell>
                            <TableCell className='max-w-[200px] truncate'>
                              {response.diagnosis || 'N/A'}
                            </TableCell>
                            <TableCell className='max-w-[150px] truncate'>
                              {response.place || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className='flex gap-2'>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  className='hover:border hover:border-border'
                                  onClick={e => {
                                    e.stopPropagation();
                                    openEditModal(response);
                                  }}
                                >
                                  <Edit className='h-3 w-3' />
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  className='hover:border hover:border-border text-red-600 hover:text-red-700 hover:bg-red-50'
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteResponse(response);
                                  }}
                                >
                                  <Trash2 className='h-3 w-3' />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {emergencyResponses.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className='text-center py-8 text-muted-foreground'
                            >
                              No emergency response records found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className='mt-4 flex justify-between items-center border-t pt-4'>
                    <p className='text-sm text-muted-foreground'>
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setCurrentPage(prev => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setCurrentPage(prev => Math.min(totalPages, prev + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Details Panel */}
            <div>
              <Card className='h-full'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <FileText className='h-5 w-5' />
                    Emergency Response Details
                  </CardTitle>
                </CardHeader>
                <CardContent className='h-full overflow-hidden'>
                  <div className='h-[650px] overflow-y-auto'>
                    {selectedResponse ? (
                      <Tabs defaultValue='basic' className='w-full'>
                        <TabsList className='grid w-full grid-cols-2'>
                          <TabsTrigger value='basic'>Basic Info</TabsTrigger>
                          <TabsTrigger value='medical'>Medical</TabsTrigger>
                        </TabsList>

                        <TabsContent value='basic' className='space-y-4 mt-4'>
                          <Card>
                            <CardHeader>
                              <CardTitle className='text-sm flex items-center gap-2'>
                                <User className='h-4 w-4' />
                                Employee Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-2 text-sm'>
                              <div>
                                <span className='font-medium'>Name:</span>{' '}
                                {selectedResponse.employee_name}{' '}
                                {selectedResponse.employee_surname}
                              </div>
                              <div>
                                <span className='font-medium'>Email:</span>{' '}
                                {selectedResponse.employee_work_email || 'N/A'}
                              </div>
                              <div>
                                <span className='font-medium'>
                                  Employee ID:
                                </span>{' '}
                                {selectedResponse.employee_id}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className='text-sm flex items-center gap-2'>
                                <Calendar className='h-4 w-4' />
                                Incident Details
                              </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-2 text-sm'>
                              <div>
                                <span className='font-medium'>
                                  Emergency Type:
                                </span>{' '}
                                <Badge
                                  className={getEmergencyTypeBadgeColor(
                                    selectedResponse.emergency_type
                                  )}
                                >
                                  {selectedResponse.emergency_type || 'Unknown'}
                                </Badge>
                              </div>
                              <div>
                                <span className='font-medium'>
                                  Injury Date:
                                </span>{' '}
                                {formatDate(selectedResponse.injury_date)}
                              </div>
                              <div>
                                <span className='font-medium'>
                                  Injury Time:
                                </span>{' '}
                                {formatTime(selectedResponse.injury_time)}
                              </div>
                              <div>
                                <span className='font-medium'>
                                  Arrival Time:
                                </span>{' '}
                                {formatTime(selectedResponse.arrival_time)}
                              </div>
                              <div>
                                <span className='font-medium'>Location:</span>{' '}
                                {selectedResponse.place || 'N/A'}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className='text-sm flex items-center gap-2'>
                                <Activity className='h-4 w-4' />
                                Response & Treatment
                              </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3 text-sm'>
                              <div>
                                <span className='font-medium'>
                                  Intervention:
                                </span>
                                <p className='mt-1 text-muted-foreground text-xs'>
                                  {selectedResponse.intervention || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <span className='font-medium'>Outcome:</span>
                                <p className='mt-1 text-muted-foreground text-xs'>
                                  {selectedResponse.outcome || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <span className='font-medium'>Manager:</span>{' '}
                                {selectedResponse.manager || 'N/A'}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value='medical' className='space-y-4 mt-4'>
                          <Card>
                            <CardHeader>
                              <CardTitle className='text-sm flex items-center gap-2'>
                                <Heart className='h-4 w-4' />
                                Medical Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3 text-sm'>
                              <div>
                                <span className='font-medium'>
                                  Main Complaint:
                                </span>
                                <p className='mt-1 text-muted-foreground text-xs'>
                                  {selectedResponse.main_complaint || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <span className='font-medium'>Diagnosis:</span>
                                <p className='mt-1 text-muted-foreground text-xs'>
                                  {selectedResponse.diagnosis || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <span className='font-medium'>Findings:</span>
                                <p className='mt-1 text-muted-foreground text-xs'>
                                  {selectedResponse.findings || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <span className='font-medium'>
                                  Patient History:
                                </span>
                                <p className='mt-1 text-muted-foreground text-xs'>
                                  {selectedResponse.patient_history || 'N/A'}
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className='text-sm'>
                                Additional Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3 text-sm'>
                              <div>
                                <span className='font-medium'>
                                  Treatment Plan:
                                </span>
                                <p className='mt-1 text-muted-foreground text-xs'>
                                  {selectedResponse.plan || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <span className='font-medium'>Reference:</span>{' '}
                                {selectedResponse.reference || 'N/A'}
                              </div>
                              <div>
                                <span className='font-medium'>Report ID:</span>{' '}
                                {selectedResponse.report_id || 'N/A'}
                              </div>
                              <div>
                                <span className='font-medium'>Created:</span>{' '}
                                {formatDate(selectedResponse.date_created)}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className='flex items-center justify-center h-full text-muted-foreground'>
                        Select an emergency response to view details
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Create Modal */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Create New Emergency Response</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue='basic' className='w-full'>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='basic'>Basic Info</TabsTrigger>
                  <TabsTrigger value='medical'>Medical</TabsTrigger>
                  <TabsTrigger value='response'>Response</TabsTrigger>
                  <TabsTrigger value='additional'>Additional</TabsTrigger>
                </TabsList>

                <TabsContent value='basic' className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='employee_id'>Employee ID *</Label>
                      <Input
                        id='employee_id'
                        value={formData.employee_id || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            employee_id: e.target.value,
                          }))
                        }
                        className={
                          formErrors.employee_id ? 'border-red-500' : ''
                        }
                      />
                      {formErrors.employee_id && (
                        <p className='text-sm text-red-600 mt-1'>
                          {formErrors.employee_id}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor='emergency_type'>Emergency Type *</Label>
                      <Select
                        value={formData.emergency_type || ''}
                        onValueChange={value =>
                          setFormData(prev => ({
                            ...prev,
                            emergency_type: value,
                          }))
                        }
                      >
                        <SelectTrigger
                          className={
                            formErrors.emergency_type ? 'border-red-500' : ''
                          }
                        >
                          <SelectValue placeholder='Select emergency type' />
                        </SelectTrigger>
                        <SelectContent>
                          {EMERGENCY_TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.emergency_type && (
                        <p className='text-sm text-red-600 mt-1'>
                          {formErrors.emergency_type}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor='injury_date'>Injury Date</Label>
                      <Input
                        id='injury_date'
                        type='date'
                        value={
                          typeof formData.injury_date === 'string'
                            ? formData.injury_date
                            : ''
                        }
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            injury_date: e.target.value as any,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='injury_time'>Injury Time</Label>
                      <Input
                        id='injury_time'
                        type='time'
                        value={formData.injury_time || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            injury_time: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='arrival_time'>Arrival Time</Label>
                      <Input
                        id='arrival_time'
                        type='time'
                        value={formData.arrival_time || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            arrival_time: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='place'>Location/Place</Label>
                      <Input
                        id='place'
                        value={formData.place || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            place: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='medical' className='space-y-4'>
                  <div>
                    <Label htmlFor='main_complaint'>Main Complaint</Label>
                    <Textarea
                      id='main_complaint'
                      value={formData.main_complaint || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          main_complaint: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor='diagnosis'>Diagnosis</Label>
                    <Textarea
                      id='diagnosis'
                      value={formData.diagnosis || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          diagnosis: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor='findings'>Findings</Label>
                    <Textarea
                      id='findings'
                      value={formData.findings || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          findings: e.target.value,
                        }))
                      }
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor='patient_history'>Patient History</Label>
                    <Textarea
                      id='patient_history'
                      value={formData.patient_history || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          patient_history: e.target.value,
                        }))
                      }
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value='response' className='space-y-4'>
                  <div>
                    <Label htmlFor='intervention'>Intervention</Label>
                    <Textarea
                      id='intervention'
                      value={formData.intervention || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          intervention: e.target.value,
                        }))
                      }
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor='plan'>Treatment Plan</Label>
                    <Textarea
                      id='plan'
                      value={formData.plan || ''}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, plan: e.target.value }))
                      }
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor='outcome'>Outcome</Label>
                    <Textarea
                      id='outcome'
                      value={formData.outcome || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          outcome: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value='additional' className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='report_id'>Report ID</Label>
                      <Input
                        id='report_id'
                        value={formData.report_id || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            report_id: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='location_id'>Location ID</Label>
                      <Input
                        id='location_id'
                        value={formData.location_id || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            location_id: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='reference'>Reference</Label>
                      <Input
                        id='reference'
                        value={formData.reference || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            reference: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='manager'>Manager</Label>
                      <Input
                        id='manager'
                        value={formData.manager || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            manager: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='injury'>Injury</Label>
                      <Input
                        id='injury'
                        value={formData.injury || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            injury: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='sendemail'>Send Email</Label>
                      <Input
                        id='sendemail'
                        value={formData.sendemail || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            sendemail: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateResponse}>
                  Create Emergency Response
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Edit Emergency Response</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue='basic' className='w-full'>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='basic'>Basic Info</TabsTrigger>
                  <TabsTrigger value='medical'>Medical</TabsTrigger>
                  <TabsTrigger value='response'>Response</TabsTrigger>
                  <TabsTrigger value='additional'>Additional</TabsTrigger>
                </TabsList>

                <TabsContent value='basic' className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='edit_employee_id'>Employee ID *</Label>
                      <Input
                        id='edit_employee_id'
                        value={formData.employee_id || ''}
                        disabled
                        className='bg-gray-50 text-gray-500 cursor-not-allowed'
                      />
                      <p className='text-xs text-muted-foreground mt-1'>
                        Employee ID cannot be changed
                      </p>
                    </div>
                    <div>
                      <Label htmlFor='edit_emergency_type'>
                        Emergency Type *
                      </Label>
                      <Select
                        value={formData.emergency_type || ''}
                        onValueChange={value =>
                          setFormData(prev => ({
                            ...prev,
                            emergency_type: value,
                          }))
                        }
                      >
                        <SelectTrigger
                          className={
                            formErrors.emergency_type ? 'border-red-500' : ''
                          }
                        >
                          <SelectValue placeholder='Select emergency type' />
                        </SelectTrigger>
                        <SelectContent>
                          {EMERGENCY_TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.emergency_type && (
                        <p className='text-sm text-red-600 mt-1'>
                          {formErrors.emergency_type}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor='edit_injury_date'>Injury Date</Label>
                      <Input
                        id='edit_injury_date'
                        type='date'
                        value={
                          typeof formData.injury_date === 'string'
                            ? formData.injury_date
                            : ''
                        }
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            injury_date: e.target.value as any,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='edit_injury_time'>Injury Time</Label>
                      <Input
                        id='edit_injury_time'
                        type='time'
                        value={formData.injury_time || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            injury_time: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='edit_arrival_time'>Arrival Time</Label>
                      <Input
                        id='edit_arrival_time'
                        type='time'
                        value={formData.arrival_time || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            arrival_time: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='edit_place'>Location/Place</Label>
                      <Input
                        id='edit_place'
                        value={formData.place || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            place: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='medical' className='space-y-4'>
                  <div>
                    <Label htmlFor='edit_main_complaint'>Main Complaint</Label>
                    <Textarea
                      id='edit_main_complaint'
                      value={formData.main_complaint || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          main_complaint: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor='edit_diagnosis'>Diagnosis</Label>
                    <Textarea
                      id='edit_diagnosis'
                      value={formData.diagnosis || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          diagnosis: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor='edit_findings'>Findings</Label>
                    <Textarea
                      id='edit_findings'
                      value={formData.findings || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          findings: e.target.value,
                        }))
                      }
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor='edit_patient_history'>
                      Patient History
                    </Label>
                    <Textarea
                      id='edit_patient_history'
                      value={formData.patient_history || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          patient_history: e.target.value,
                        }))
                      }
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value='response' className='space-y-4'>
                  <div>
                    <Label htmlFor='edit_intervention'>Intervention</Label>
                    <Textarea
                      id='edit_intervention'
                      value={formData.intervention || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          intervention: e.target.value,
                        }))
                      }
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor='edit_plan'>Treatment Plan</Label>
                    <Textarea
                      id='edit_plan'
                      value={formData.plan || ''}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, plan: e.target.value }))
                      }
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor='edit_outcome'>Outcome</Label>
                    <Textarea
                      id='edit_outcome'
                      value={formData.outcome || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          outcome: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value='additional' className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='edit_report_id'>Report ID</Label>
                      <Input
                        id='edit_report_id'
                        value={formData.report_id || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            report_id: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='edit_location_id'>Location ID</Label>
                      <Input
                        id='edit_location_id'
                        value={formData.location_id || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            location_id: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='edit_reference'>Reference</Label>
                      <Input
                        id='edit_reference'
                        value={formData.reference || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            reference: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='edit_manager'>Manager</Label>
                      <Input
                        id='edit_manager'
                        value={formData.manager || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            manager: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='edit_injury'>Injury</Label>
                      <Input
                        id='edit_injury'
                        value={formData.injury || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            injury: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='edit_sendemail'>Send Email</Label>
                      <Input
                        id='edit_sendemail'
                        value={formData.sendemail || ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            sendemail: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditResponse}>
                  Update Emergency Response
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Modal */}
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2 text-red-600'>
                  <Trash2 className='h-5 w-5' />
                  Delete Emergency Response
                </DialogTitle>
              </DialogHeader>
              <div className='py-4'>
                <p className='text-sm text-muted-foreground mb-4'>
                  Are you sure you want to delete this emergency response
                  record? This action cannot be undone.
                </p>
                {responseToDelete && (
                  <div className='bg-muted/50 p-3 rounded-md'>
                    <p className='text-sm font-medium'>
                      {responseToDelete.employee_name}{' '}
                      {responseToDelete.employee_surname}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {responseToDelete.emergency_type} -{' '}
                      {formatDate(responseToDelete.injury_date)}
                    </p>
                  </div>
                )}
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setResponseToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant='destructive' onClick={confirmDelete}>
                  Delete Emergency Response
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
export default function EmergencyResponsesPage() {
  return (
    <Suspense
      fallback={
        <ProtectedRoute>
          <DashboardLayout>
            <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
              <Card>
                <CardContent>
                  <PageLoading
                    text='Loading Emergency Responses'
                    subtitle='Fetching emergency response data from OHMS database...'
                  />
                </CardContent>
              </Card>
            </div>
          </DashboardLayout>
        </ProtectedRoute>
      }
    >
      <EmergencyResponsesPageContent />
    </Suspense>
  );
}
