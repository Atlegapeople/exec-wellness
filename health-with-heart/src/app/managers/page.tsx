'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRouteState } from '@/hooks/useRouteState';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Building2,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  X,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { PageLoading } from '@/components/ui/loading';

interface Manager {
  id: string;
  date_created: string;
  date_updated: string;
  user_created: string | null;
  user_updated: string | null;
  organisation_id: string | null;
  manager_type: string | null;
  manager_name: string | null;
  manager_email: string | null;
  manager_contact_number: string | null;
  notes_text: string | null;
  created_by_name?: string;
  updated_by_name?: string;
  organisation_name?: string;
}

interface Organization {
  id: string;
  name: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function ManagersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filter parameters from URL
  const organizationFilter = searchParams.get('organization');
  const organizationName = searchParams.get('organizationName');
  const returnUrl = searchParams.get('returnUrl');

  const [managers, setManagers] = useState<Manager[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [formData, setFormData] = useState<Partial<Manager>>({});
  const [submitting, setSubmitting] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useRouteState<number>(
    'leftPanelWidth',
    60,
    { scope: 'path' }
  );
  const [isResizing, setIsResizing] = useState(false);

  // Delete modal state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<Manager | null>(null);

  // Sub-section edit states
  const [isEditingManagerInfo, setIsEditingManagerInfo] = useState(false);
  const [isEditingContactInfo, setIsEditingContactInfo] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingRecordInfo, setIsEditingRecordInfo] = useState(false);

  // Sub-section form data
  const [managerInfoData, setManagerInfoData] = useState({
    manager_name: '',
    manager_type: '',
    organisation_name: '',
  });
  const [contactInfoData, setContactInfoData] = useState({
    manager_email: '',
    manager_contact_number: '',
  });
  const [notesData, setNotesData] = useState({
    notes_text: '',
  });
  const [recordInfoData, setRecordInfoData] = useState({
    date_created: '',
    date_updated: '',
  });

  const managerTypes = [
    'Line Manager',
    'Senior Manager',
    'Department Manager',
    'Regional Manager',
    'General Manager',
    'Operations Manager',
    'Project Manager',
    'HR Manager',
  ];

  const fetchManagers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      let url = `/api/managers?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(search)}`;

      if (organizationFilter) {
        url += `&organization=${encodeURIComponent(organizationFilter)}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch managers');

      const data = await response.json();
      setManagers(data.managers);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching managers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch organizations');

      const data = await response.json();
      setOrganizations(data.organizations);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  useEffect(() => {
    fetchManagers();
    fetchOrganizations();
  }, []);

  // Populate sub-section form data when manager is selected
  useEffect(() => {
    if (selectedManager) {
      setManagerInfoData({
        manager_name: selectedManager.manager_name || '',
        manager_type: selectedManager.manager_type || '',
        organisation_name: selectedManager.organisation_name || '',
      });
      setContactInfoData({
        manager_email: selectedManager.manager_email || '',
        manager_contact_number: selectedManager.manager_contact_number || '',
      });
      setNotesData({
        notes_text: selectedManager.notes_text || '',
      });
      setRecordInfoData({
        date_created: selectedManager.date_created || '',
        date_updated: selectedManager.date_updated || '',
      });
    }
  }, [selectedManager]);

  const handleSearch = () => {
    fetchManagers(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchManagers(newPage, searchTerm);
  };

  // Sub-section save functions
  const handleSaveManagerInfo = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/managers/${selectedManager?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(managerInfoData),
      });

      if (response.ok) {
        setIsEditingManagerInfo(false);
        fetchManagers();
      }
    } catch (error) {
      console.error('Error saving manager info:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveContactInfo = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/managers/${selectedManager?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactInfoData),
      });

      if (response.ok) {
        setIsEditingContactInfo(false);
        fetchManagers();
      }
    } catch (error) {
      console.error('Error saving contact info:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/managers/${selectedManager?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notesData),
      });

      if (response.ok) {
        setIsEditingNotes(false);
        fetchManagers();
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveRecordInfo = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/managers/${selectedManager?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordInfoData),
      });

      if (response.ok) {
        setIsEditingRecordInfo(false);
        fetchManagers();
      }
    } catch (error) {
      console.error('Error saving record info:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateManager = async () => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/managers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          organisation_id:
            formData.organisation_id === 'none'
              ? null
              : formData.organisation_id,
          user_created: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to create manager');

      setIsCreateDialogOpen(false);
      setFormData({});
      fetchManagers(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error creating manager:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditManager = async () => {
    if (!selectedManager) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/managers/${selectedManager.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          organisation_id:
            formData.organisation_id === 'none'
              ? null
              : formData.organisation_id,
          user_updated: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to update manager');

      setIsEditDialogOpen(false);
      setFormData({});
      setSelectedManager(null);
      fetchManagers(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error updating manager:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteManager = async (id: string) => {
    try {
      const response = await fetch(`/api/managers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete manager');

      fetchManagers(pagination.page, searchTerm);
      if (selectedManager?.id === id) {
        setSelectedManager(null);
      }
    } catch (error) {
      console.error('Error deleting manager:', error);
    }
  };

  const openDeleteDialog = (manager: Manager) => {
    setManagerToDelete(manager);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteManager = async () => {
    if (!managerToDelete) return;
    try {
      setSubmitting(true);
      const response = await fetch(`/api/managers/${managerToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete manager');

      setIsDeleteDialogOpen(false);
      setManagerToDelete(null);
      fetchManagers(pagination.page, searchTerm);
      if (selectedManager?.id === managerToDelete.id) {
        setSelectedManager(null);
      }
    } catch (error) {
      console.error('Error deleting manager:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (manager: Manager) => {
    setFormData({
      ...manager,
      organisation_id: manager.organisation_id || 'none',
    });
    setSelectedManager(manager);
    setIsEditDialogOpen(true);
  };

  const [selectedManagerId, setSelectedManagerId] = useRouteState<
    string | null
  >('selectedManagerId', null, { scope: 'path' });

  const handleManagerClick = (manager: Manager) => {
    setSelectedManager(manager);
    setSelectedManagerId(manager.id);
  };

  // Restore selected manager if present in route state once managers are loaded
  useEffect(() => {
    const restore = async () => {
      if (!selectedManager && selectedManagerId) {
        const found = managers.find(m => m.id === selectedManagerId);
        if (found) {
          setSelectedManager(found);
          return;
        }
        // Fallback: fetch by id
        try {
          const res = await fetch(`/api/managers/${selectedManagerId}`);
          if (res.ok) {
            const data = await res.json();
            setSelectedManager(data);
          } else {
            setSelectedManagerId(null);
          }
        } catch {
          setSelectedManagerId(null);
        }
      }
    };
    restore();
  }, [managers, selectedManagerId, selectedManager]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  // Resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector('.managers-container');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 30% and 80%
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 30), 80);
      setLeftPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  if (loading && managers.length === 0) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
            <Card>
              <CardContent>
                <PageLoading
                  text='Loading Managers'
                  subtitle='Fetching manager data from OHMS database...'
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
        <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-6'>
          {/* Back Button and Filter Info */}
          <div className='mb-6'>
            <div className='flex items-center gap-4'>
              <Button
                variant='outline'
                onClick={() =>
                  returnUrl
                    ? router.push(decodeURIComponent(returnUrl))
                    : router.back()
                }
                className='flex items-center gap-2 hover-lift'
              >
                <ArrowLeft className='h-4 w-4' />
                {returnUrl ? (
                  <>
                    Back to{' '}
                    {returnUrl === '/organizations'
                      ? 'Organizations'
                      : 'Previous Page'}
                  </>
                ) : (
                  'Back'
                )}
              </Button>

              {organizationFilter && organizationName && (
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outline'
                    className='bg-blue-50 text-blue-700 border-blue-200'
                  >
                    <Building2 className='h-3 w-3 mr-1' />
                    Filtered by: {decodeURIComponent(organizationName)}
                  </Badge>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      const params = new URLSearchParams(
                        searchParams.toString()
                      );
                      params.delete('organization');
                      params.delete('organizationName');
                      router.push(`/managers?${params.toString()}`);
                    }}
                    className='h-6 w-6 p-0'
                  >
                    <X className='h-3 w-3' />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Managers
                </CardTitle>
                <UserCheck className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{pagination.total}</div>
                <p className='text-xs text-muted-foreground'>
                  Registered managers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Line Managers
                </CardTitle>
                <UserCheck className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {
                    managers.filter(m => m.manager_type === 'Line Manager')
                      .length
                  }
                </div>
                <p className='text-xs text-muted-foreground'>
                  Direct supervisors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  With Organizations
                </CardTitle>
                <Building2 className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {managers.filter(m => m.organisation_id).length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Assigned to organizations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  With Contact Info
                </CardTitle>
                <Phone className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {
                    managers.filter(
                      m => m.manager_contact_number || m.manager_email
                    ).length
                  }
                </div>
                <p className='text-xs text-muted-foreground'>
                  Have contact details
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className='glass-effect my-6'>
            <CardContent className='p-4'>
              <div className='flex gap-4'>
                <div className='flex-1 relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    type='text'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder='Search by name, email, or manager type...'
                    className='pl-9'
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} className='hover-lift'>
                  Search
                </Button>
                {searchTerm && (
                  <Button
                    variant='outline'
                    onClick={() => {
                      setSearchTerm('');
                      fetchManagers(1, '');
                    }}
                    className='hover-lift'
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          <div className='managers-container flex gap-1 min-h-[600px]'>
            {/* Left Panel - Managers Table */}
            <div
              className='space-y-4'
              style={{ width: selectedManager ? `${leftPanelWidth}%` : '100%' }}
            >
              {/* Managers Table */}
              <Card className='hover-lift'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='flex items-center gap-2 text-2xl text-primary'>
                        <UserCheck className='h-6 w-6 text-primary' />
                        Managers ({pagination.total})
                      </CardTitle>
                      <CardDescription>
                        Manager records and information
                      </CardDescription>
                    </div>
                    <Dialog
                      open={isCreateDialogOpen}
                      onOpenChange={setIsCreateDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className={`hover-lift ${selectedManager ? 'rounded-full w-10 h-10 p-0' : ''}`}
                          title={selectedManager ? 'Add Manager' : undefined}
                        >
                          <Plus
                            className={`h-4 w-4 ${selectedManager ? '' : 'mr-2'}`}
                          />
                          {!selectedManager && 'Add Manager'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='max-w-2xl'>
                        <DialogHeader>
                          <DialogTitle>Create New Manager</DialogTitle>
                          <DialogDescription>
                            Add a new manager to the system
                          </DialogDescription>
                        </DialogHeader>

                        <div className='grid grid-cols-2 gap-4 py-4'>
                          <div className='space-y-2'>
                            <Label htmlFor='manager_name'>Manager Name</Label>
                            <Input
                              id='manager_name'
                              value={formData.manager_name || ''}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  manager_name: e.target.value,
                                })
                              }
                              placeholder='Enter manager name'
                            />
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='manager_email'>Email Address</Label>
                            <Input
                              id='manager_email'
                              type='email'
                              value={formData.manager_email || ''}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  manager_email: e.target.value,
                                })
                              }
                              placeholder='Enter email address'
                            />
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='manager_type'>Manager Type</Label>
                            <Select
                              value={formData.manager_type || ''}
                              onValueChange={value =>
                                setFormData({
                                  ...formData,
                                  manager_type: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Select manager type' />
                              </SelectTrigger>
                              <SelectContent>
                                {managerTypes.map(type => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='manager_contact_number'>
                              Contact Number
                            </Label>
                            <Input
                              id='manager_contact_number'
                              value={formData.manager_contact_number || ''}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  manager_contact_number: e.target.value,
                                })
                              }
                              placeholder='Enter contact number'
                            />
                          </div>

                          <div className='space-y-2 col-span-2'>
                            <Label htmlFor='organisation_id'>
                              Organization
                            </Label>
                            <Select
                              value={formData.organisation_id || ''}
                              onValueChange={value =>
                                setFormData({
                                  ...formData,
                                  organisation_id: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Select organization' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='none'>
                                  No Organization
                                </SelectItem>
                                {organizations.map(org => (
                                  <SelectItem key={org.id} value={org.id}>
                                    {org.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className='space-y-2 col-span-2'>
                            <Label htmlFor='notes_text'>Notes</Label>
                            <Textarea
                              id='notes_text'
                              value={formData.notes_text || ''}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  notes_text: e.target.value,
                                })
                              }
                              placeholder='Enter any additional notes'
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='outline'
                            onClick={() => {
                              setIsCreateDialogOpen(false);
                              setFormData({});
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreateManager}
                            disabled={submitting}
                          >
                            {submitting && (
                              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                            )}
                            Create Manager
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {managers.length === 0 ? (
                    <div className='text-center py-12'>
                      <UserCheck className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                      <h3 className='text-lg font-medium text-foreground mb-2'>
                        No managers found
                      </h3>
                      <p className='text-muted-foreground'>
                        {searchTerm
                          ? 'Try adjusting your search criteria.'
                          : 'No managers available.'}
                      </p>
                    </div>
                  ) : (
                    <div className='max-h-[500px] overflow-auto scrollbar-premium'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Manager</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Organization</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {managers.map(manager => (
                            <TableRow
                              key={manager.id}
                              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                selectedManager?.id === manager.id
                                  ? 'bg-muted border-l-4 border-l-primary'
                                  : ''
                              }`}
                              onClick={() => handleManagerClick(manager)}
                            >
                              <TableCell>
                                <div>
                                  <div className='font-medium'>
                                    {manager.manager_name || 'Unnamed Manager'}
                                  </div>
                                  <div className='text-sm text-muted-foreground'>
                                    ID: {manager.id.substring(0, 8)}...
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant='secondary'>
                                  {manager.manager_type || 'Not specified'}
                                </Badge>
                              </TableCell>
                              <TableCell className='text-sm'>
                                {manager.manager_email || 'N/A'}
                              </TableCell>
                              <TableCell className='text-sm'>
                                {manager.organisation_name || 'N/A'}
                              </TableCell>
                              <TableCell className='text-sm'>
                                {manager.manager_contact_number || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <div className='flex items-center gap-2'>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={e => {
                                      e.stopPropagation();
                                      openEditDialog(manager);
                                    }}
                                  >
                                    <Edit className='h-4 w-4' />
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={e => {
                                      e.stopPropagation();
                                      openDeleteDialog(manager);
                                    }}
                                    className='hover-lift text-destructive hover:text-destructive hover:bg-transparent'
                                    title='Delete manager'
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t gap-2'>
                      <div className='text-sm text-muted-foreground'>
                        Showing {(pagination.page - 1) * pagination.limit + 1}{' '}
                        to{' '}
                        {Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )}{' '}
                        of {pagination.total} results
                      </div>
                      <div className='flex items-center space-x-1 flex-wrap'>
                        {/* First Page */}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handlePageChange(1)}
                          disabled={pagination.page === 1}
                          className='hover-lift'
                          title='Go to first page'
                        >
                          <ChevronsLeft className='h-4 w-4' />
                          <span
                            className={`${selectedManager && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
                          >
                            First
                          </span>
                        </Button>

                        {/* Previous Page */}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={!pagination.hasPreviousPage}
                          className='hover-lift'
                          title='Go to previous page'
                        >
                          <ChevronLeft className='h-4 w-4' />
                          <span
                            className={`${selectedManager && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
                          >
                            Previous
                          </span>
                        </Button>

                        {/* Page Numbers */}
                        {Array.from(
                          {
                            length: Math.min(
                              selectedManager && leftPanelWidth < 50 ? 3 : 5,
                              pagination.totalPages
                            ),
                          },
                          (_, i) => {
                            const startPage = Math.max(
                              1,
                              pagination.page -
                                (selectedManager && leftPanelWidth < 50 ? 1 : 2)
                            );
                            const page = startPage + i;
                            if (page > pagination.totalPages) return null;

                            return (
                              <Button
                                key={`appointments-page-${page}`}
                                variant={
                                  page === pagination.page
                                    ? 'default'
                                    : 'outline'
                                }
                                size='sm'
                                onClick={() => handlePageChange(page)}
                                className='hover-lift min-w-[40px]'
                                title={`Go to page ${page}`}
                              >
                                {page}
                              </Button>
                            );
                          }
                        )}

                        {/* Next Page */}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={!pagination.hasNextPage}
                          className='hover-lift'
                          title='Go to next page'
                        >
                          <span
                            className={`${selectedManager && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
                          >
                            Next
                          </span>
                          <ChevronRight className='h-4 w-4' />
                        </Button>

                        {/* Last Page */}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            handlePageChange(pagination.totalPages)
                          }
                          disabled={pagination.page === pagination.totalPages}
                          className='hover-lift'
                          title='Go to last page'
                        >
                          <span
                            className={`${selectedManager && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
                          >
                            Last
                          </span>
                          <ChevronsRight className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Resize Handle */}
            {selectedManager && (
              <div
                className='w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0'
                onMouseDown={handleMouseDown}
                style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
              />
            )}

            {/* Right Panel - Manager Details */}
            {selectedManager && (
              <div
                className='space-y-4 animate-slide-up'
                style={{ width: `${100 - leftPanelWidth}%` }}
              >
                <Card className='glass-effect'>
                  <CardHeader className='pb-3'>
                    <div className='flex justify-between items-start'>
                      <div className='space-y-1'>
                        <CardTitle className='text-2xl medical-heading'>
                          {selectedManager.manager_name || 'Unnamed Manager'}
                        </CardTitle>
                        <CardDescription className='flex items-center gap-2'>
                          <Badge variant='outline'>
                            {selectedManager.manager_type || 'Not specified'}
                          </Badge>
                          {selectedManager.organisation_name && (
                            <Badge variant='secondary'>
                              {selectedManager.organisation_name}
                            </Badge>
                          )}
                        </CardDescription>
                        {/* Last Updated Information */}
                        <div className='text-xs text-muted-foreground mt-2'>
                          <span>Last updated by </span>
                          <span className='font-medium'>
                            {selectedManager.updated_by_name ||
                              selectedManager.user_updated ||
                              'Unknown'}
                          </span>
                          <span> on </span>
                          <span className='font-medium'>
                            {selectedManager.date_updated
                              ? new Date(
                                  selectedManager.date_updated
                                ).toLocaleString()
                              : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => openDeleteDialog(selectedManager)}
                          className='hover-lift text-destructive hover:text-destructive hover:bg-transparent'
                          title='Delete manager'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setSelectedManager(null);
                            setSelectedManagerId(null);
                          }}
                          className='hover-lift'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium'>
                    {/* Manager Information */}
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <UserCheck className='h-4 w-4' />
                          Manager Information
                        </h3>
                        {isEditingManagerInfo ? (
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setIsEditingManagerInfo(false)}
                              className='hover-lift'
                            >
                              Cancel
                            </Button>
                            <Button
                              size='sm'
                              onClick={handleSaveManagerInfo}
                              disabled={submitting}
                              className='hover-lift'
                            >
                              {submitting ? (
                                <>
                                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className='mr-2 h-4 w-4' />
                                  Save
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setIsEditingManagerInfo(true)}
                            className='hover-lift'
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Full Name:
                          </span>
                          <span className='font-medium'>
                            {selectedManager.manager_name || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Manager Type:
                          </span>
                          <Badge variant='outline'>
                            {selectedManager.manager_type || 'N/A'}
                          </Badge>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Organization:
                          </span>
                          <span className='font-medium'>
                            {selectedManager.organisation_name || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <Mail className='h-4 w-4' />
                          Contact Information
                        </h3>
                        {isEditingContactInfo ? (
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setIsEditingContactInfo(false)}
                              className='hover-lift'
                            >
                              Cancel
                            </Button>
                            <Button
                              size='sm'
                              onClick={handleSaveContactInfo}
                              disabled={submitting}
                              className='hover-lift'
                            >
                              {submitting ? (
                                <>
                                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className='mr-2 h-4 w-4' />
                                  Save
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setIsEditingContactInfo(true)}
                            className='hover-lift'
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                      <div className='space-y-3 text-sm'>
                        <div className='flex gap-2'>
                          <Mail className='h-4 w-4 text-muted-foreground mt-0.5' />
                          <div className='flex-1'>
                            <div className='text-muted-foreground text-xs'>
                              Email Address
                            </div>
                            <span className='font-medium text-xs break-all'>
                              {selectedManager.manager_email || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className='flex gap-2'>
                          <Phone className='h-4 w-4 text-muted-foreground mt-0.5' />
                          <div className='flex-1'>
                            <div className='text-muted-foreground text-xs'>
                              Contact Number
                            </div>
                            <span className='font-medium'>
                              {selectedManager.manager_contact_number || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {selectedManager.notes_text && (
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                            <FileText className='h-4 w-4' />
                            Notes
                          </h3>
                          {isEditingNotes ? (
                            <div className='flex items-center gap-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setIsEditingNotes(false)}
                                className='hover-lift'
                              >
                                Cancel
                              </Button>
                              <Button
                                size='sm'
                                onClick={handleSaveNotes}
                                disabled={submitting}
                                className='hover-lift'
                              >
                                {submitting ? (
                                  <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className='mr-2 h-4 w-4' />
                                    Save
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => setIsEditingNotes(true)}
                              className='hover-lift'
                            >
                              <Edit className='h-3 w-3' />
                            </Button>
                          )}
                        </div>
                        <div className='text-sm p-3 bg-muted rounded-lg'>
                          {selectedManager.notes_text}
                        </div>
                      </div>
                    )}

                    {/* System Information */}
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                          Record Information
                        </h3>
                      </div>
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Created:
                          </span>
                          <span className='font-medium'>
                            {formatDate(selectedManager.date_created)}
                          </span>
                        </div>
                        {selectedManager.created_by_name && (
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Created By:
                            </span>
                            <span className='font-medium'>
                              {selectedManager.created_by_name}
                            </span>
                          </div>
                        )}
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Last Updated:
                          </span>
                          <span className='font-medium'>
                            {formatDate(selectedManager.date_updated)}
                          </span>
                        </div>
                        {selectedManager.updated_by_name && (
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Updated By:
                            </span>
                            <span className='font-medium'>
                              {selectedManager.updated_by_name}
                            </span>
                          </div>
                        )}
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Manager ID:
                          </span>
                          <span className='font-mono text-xs'>
                            {selectedManager.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Edit Manager</DialogTitle>
                <DialogDescription>
                  Update manager information
                </DialogDescription>
              </DialogHeader>

              <div className='grid grid-cols-2 gap-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='edit_manager_name'>Manager Name</Label>
                  <Input
                    id='edit_manager_name'
                    value={formData.manager_name || ''}
                    onChange={e =>
                      setFormData({ ...formData, manager_name: e.target.value })
                    }
                    placeholder='Enter manager name'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='edit_manager_email'>Email Address</Label>
                  <Input
                    id='edit_manager_email'
                    type='email'
                    value={formData.manager_email || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        manager_email: e.target.value,
                      })
                    }
                    placeholder='Enter email address'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='edit_manager_type'>Manager Type</Label>
                  <Select
                    value={formData.manager_type || ''}
                    onValueChange={value =>
                      setFormData({ ...formData, manager_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select manager type' />
                    </SelectTrigger>
                    <SelectContent>
                      {managerTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='edit_manager_contact_number'>
                    Contact Number
                  </Label>
                  <Input
                    id='edit_manager_contact_number'
                    value={formData.manager_contact_number || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        manager_contact_number: e.target.value,
                      })
                    }
                    placeholder='Enter contact number'
                  />
                </div>

                <div className='space-y-2 col-span-2'>
                  <Label htmlFor='edit_organisation_id'>Organization</Label>
                  <Select
                    value={formData.organisation_id || ''}
                    onValueChange={value =>
                      setFormData({ ...formData, organisation_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select organization' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>No Organization</SelectItem>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2 col-span-2'>
                  <Label htmlFor='edit_notes_text'>Notes</Label>
                  <Textarea
                    id='edit_notes_text'
                    value={formData.notes_text || ''}
                    onChange={e =>
                      setFormData({ ...formData, notes_text: e.target.value })
                    }
                    placeholder='Enter any additional notes'
                    rows={3}
                  />
                </div>
              </div>

              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setFormData({});
                    setSelectedManager(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditManager} disabled={submitting}>
                  {submitting && (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  )}
                  Update Manager
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2'>
                  <AlertCircle className='h-5 w-5 text-destructive' />
                  Delete Manager
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete{' '}
                  <span className='font-medium'>
                    {managerToDelete?.manager_name || 'this manager'}
                  </span>
                  ? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant='destructive'
                  onClick={handleConfirmDeleteManager}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete Manager
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function ManagersPage() {
  return (
    <Suspense
      fallback={
        <ProtectedRoute>
          <DashboardLayout>
            <div className='min-h-screen bg-background flex items-center justify-center'>
              <Card>
                <CardContent>
                  <PageLoading
                    text='Initializing Managers'
                    subtitle='Setting up manager management system...'
                  />
                </CardContent>
              </Card>
            </div>
          </DashboardLayout>
        </ProtectedRoute>
      }
    >
      <ManagersPageContent />
    </Suspense>
  );
}
