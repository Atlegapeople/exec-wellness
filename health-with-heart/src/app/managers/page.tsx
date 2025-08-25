'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  X,
  ArrowLeft,
} from 'lucide-react';

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

export default function ManagersPage() {
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

  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [formData, setFormData] = useState<Partial<Manager>>({});
  const [submitting, setSubmitting] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(60);
  const [isResizing, setIsResizing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);

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

  const handleSearch = () => {
    fetchManagers(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchManagers(newPage, searchTerm);
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

      setIsCreateModalOpen(false);
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

      setIsEditModalOpen(false);
      setFormData({});
      setSelectedManager(null);
      fetchManagers(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error updating manager:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteManager = async () => {
    if (!editingManager) return;

    try {
      const response = await fetch(`/api/managers/${editingManager.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete manager');

      setIsDeleteModalOpen(false);
      setEditingManager(null);
      fetchManagers(pagination.page, searchTerm);
      if (selectedManager?.id === editingManager.id) {
        setSelectedManager(null);
      }
    } catch (error) {
      console.error('Error deleting manager:', error);
    }
  };

  const openCreateModal = () => {
    setFormData({});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (manager: Manager) => {
    setEditingManager(manager);
    setFormData({
      ...manager,
      organisation_id: manager.organisation_id || 'none',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (manager: Manager) => {
    setEditingManager(manager);
    setIsDeleteModalOpen(true);
  };

  const handleManagerClick = (manager: Manager) => {
    setSelectedManager(manager);
  };

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
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Card className='w-96'>
          <CardContent className='flex items-center justify-center py-12'>
            <div className='text-center space-y-4'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
              <p className='text-muted-foreground'>Loading managers...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-6'>
        {/* Back Button and Filter Info */}
        {(returnUrl || organizationFilter) && (
          <div className='mb-6'>
            <div className='flex items-center gap-4'>
              {returnUrl && (
                <Button
                  variant='outline'
                  onClick={() => router.push(decodeURIComponent(returnUrl))}
                  className='flex items-center gap-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Back to{' '}
                  {returnUrl === '/organizations'
                    ? 'Organizations'
                    : 'Previous Page'}
                </Button>
              )}

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
        )}

        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Managers</h1>
            <p className='text-muted-foreground'>
              Manage organizational managers and their information
            </p>
          </div>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className='hover-lift'>
                <Plus className='h-4 w-4 mr-2' />
                Add Manager
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
                      setFormData({ ...formData, manager_name: e.target.value })
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
                  <Label htmlFor='manager_contact_number'>Contact Number</Label>
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
                  <Label htmlFor='organisation_id'>Organization</Label>
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
                  <Label htmlFor='notes_text'>Notes</Label>
                  <Textarea
                    id='notes_text'
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
                    setIsCreateModalOpen(false);
                    setFormData({});
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateManager} disabled={submitting}>
                  {submitting && (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  )}
                  Create Manager
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className='managers-container flex gap-1 min-h-[600px]'>
          {/* Left Panel - Managers Table */}
          <div
            className='space-y-4'
            style={{ width: selectedManager ? `${leftPanelWidth}%` : '100%' }}
          >
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
            <Card className='glass-effect'>
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

            {/* Managers Table */}
            <Card className='hover-lift'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-2xl'>
                  <UserCheck className='h-6 w-6' />
                  Managers ({pagination.total})
                </CardTitle>
                <CardDescription>
                  Manager records and information
                </CardDescription>
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
                                    openEditModal(manager);
                                  }}
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    openDeleteModal(manager);
                                  }}
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
                  <div className='flex items-center justify-between pt-4 border-t'>
                    <div className='text-sm text-muted-foreground'>
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{' '}
                      of {pagination.total} results
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.page === 1}
                        className='hover-lift'
                      >
                        <ChevronsLeft className='h-4 w-4' />
                        First
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPreviousPage}
                        className='hover-lift'
                      >
                        <ChevronLeft className='h-4 w-4' />
                        Previous
                      </Button>

                      <div className='flex items-center gap-1'>
                        {Array.from(
                          { length: Math.min(5, pagination.totalPages) },
                          (_, i) => {
                            const startPage = Math.max(1, pagination.page - 2);
                            const page = startPage + i;
                            if (page > pagination.totalPages) return null;

                            return (
                              <Button
                                key={`managers-page-${page}`}
                                variant={
                                  page === pagination.page
                                    ? 'default'
                                    : 'outline'
                                }
                                size='sm'
                                onClick={() => handlePageChange(page)}
                                className='hover-lift min-w-[40px]'
                              >
                                {page}
                              </Button>
                            );
                          }
                        )}
                      </div>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className='hover-lift'
                      >
                        Next
                        <ChevronRight className='h-4 w-4' />
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages}
                        className='hover-lift'
                      >
                        Last
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
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setSelectedManager(null)}
                      className='hover-lift'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium'>
                  {/* Manager Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <UserCheck className='h-4 w-4' />
                      Manager Information
                    </h3>
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
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <Mail className='h-4 w-4' />
                      Contact Information
                    </h3>
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
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <FileText className='h-4 w-4' />
                        Notes
                      </h3>
                      <div className='text-sm p-3 bg-muted rounded-lg'>
                        {selectedManager.notes_text}
                      </div>
                    </div>
                  )}

                  {/* System Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                      Record Information
                    </h3>
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
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Edit Manager</DialogTitle>
              <DialogDescription>Update manager information</DialogDescription>
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
                    setFormData({ ...formData, manager_email: e.target.value })
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
                  setIsEditModalOpen(false);
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
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Delete Manager</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this manager? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>

            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setEditingManager(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={handleDeleteManager}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Deleting...
                  </>
                ) : (
                  'Delete Manager'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
