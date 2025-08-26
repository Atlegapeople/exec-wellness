'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User } from '@/types';
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
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search,
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Stethoscope,
  ShieldCheck,
  HeartHandshake,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Save,
  Plus,
} from 'lucide-react';

interface UserWithMetadata extends User {
  created_by_name?: string;
  updated_by_name?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UserFormData {
  name: string;
  surname: string;
  email: string;
  mobile: string;
  type: 'Doctor' | 'Nurse' | 'Administrator' | 'Ergonomist';
  signature: string;
}

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allUsers, setAllUsers] = useState<UserWithMetadata[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithMetadata[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<UserWithMetadata[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 29,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const [selectedUser, setSelectedUser] = useState<UserWithMetadata | null>(
    null
  );
  const [leftWidth, setLeftWidth] = useState(40);
  const [isResizing, setIsResizing] = useState(false);

  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithMetadata | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    surname: '',
    email: '',
    mobile: '',
    type: 'Nurse',
    signature: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all users data once
  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/users', window.location.origin);
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '10000'); // Get all users

      const response = await fetch(url.toString());
      const data = await response.json();

      setAllUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filterUsers = useCallback(
    (users: UserWithMetadata[], search: string) => {
      if (!search) return users;

      return users.filter(user => {
        const fullName = `${user.name} ${user.surname}`.toLowerCase();
        const searchLower = search.toLowerCase();

        return (
          fullName.includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.type?.toLowerCase().includes(searchLower) ||
          user.mobile?.toLowerCase().includes(searchLower)
        );
      });
    },
    []
  );

  // Client-side pagination
  const paginateUsers = useCallback(
    (users: UserWithMetadata[], page: number, limit: number) => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = users.slice(startIndex, endIndex);

      const total = users.length;
      const totalPages = Math.ceil(total / limit);

      setPagination({
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      });

      return paginatedData;
    },
    []
  );

  // Smooth page transition
  const transitionToPage = useCallback(
    async (newPage: number) => {
      setPageTransitioning(true);

      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 150));

      const paginated = paginateUsers(filteredUsers, newPage, pagination.limit);
      setDisplayedUsers(paginated);

      setPageTransitioning(false);
    },
    [filteredUsers, pagination.limit, paginateUsers]
  );

  // Initial load
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Handle filtering when search term or all users change
  useEffect(() => {
    const filtered = filterUsers(allUsers, searchTerm);
    setFilteredUsers(filtered);

    // Reset to page 1 when filtering changes
    const page = searchTerm ? 1 : parseInt(searchParams.get('page') || '1');
    const paginated = paginateUsers(filtered, page, pagination.limit);
    setDisplayedUsers(paginated);
  }, [
    allUsers,
    searchTerm,
    filterUsers,
    paginateUsers,
    pagination.limit,
    searchParams,
  ]);

  // Handle page changes from URL
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    if (page !== pagination.page && filteredUsers.length > 0) {
      transitionToPage(page);
    }
  }, [searchParams, pagination.page, filteredUsers.length, transitionToPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL(1, searchTerm);
  };

  const updateURL = useCallback(
    (page: number, search: string) => {
      const params = new URLSearchParams();
      if (page > 1) params.set('page', page.toString());
      if (search) params.set('search', search);

      const newURL = `/users${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(newURL, { scroll: false });
    },
    [router]
  );

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, searchTerm);
    transitionToPage(newPage);
  };

  const handleUserClick = (user: UserWithMetadata) => {
    setSelectedUser(user);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
      email: '',
      mobile: '',
      type: 'Nurse',
      signature: '',
    });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_created: 'system', // You can change this to current user ID
        }),
      });

      if (response.ok) {
        setIsAddDialogOpen(false);
        resetForm();
        fetchAllUsers(); // Refresh the list
      } else {
        console.error('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_updated: 'system', // You can change this to current user ID
        }),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        setEditingUser(null);
        resetForm();
        fetchAllUsers(); // Refresh the list
        setSelectedUser(null); // Close preview panel
      } else {
        console.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAllUsers(); // Refresh the list
        setSelectedUser(null); // Close preview panel if deleted user was selected
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const openEditDialog = (user: UserWithMetadata) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      surname: user.surname,
      email: user.email,
      mobile: user.mobile || '',
      type: user.type,
      signature: user.signature || '',
    });
    setIsEditDialogOpen(true);
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'Doctor':
        return <Stethoscope className='h-4 w-4' />;
      case 'Nurse':
        return <HeartHandshake className='h-4 w-4' />;
      case 'Administrator':
        return <ShieldCheck className='h-4 w-4' />;
      case 'Ergonomist':
        return <Users className='h-4 w-4' />;
      default:
        return <Users className='h-4 w-4' />;
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
        return 'outline';
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector('.users-container');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 20% and 80%
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
      setLeftWidth(constrainedWidth);
    },
    [isResizing]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Card className='w-96'>
          <CardContent className='flex items-center justify-center py-12'>
            <div className='text-center space-y-4'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
              <p className='text-muted-foreground'>Loading users...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-6'>
        <div className='users-container flex gap-1 min-h-[600px]'>
          {/* Left Panel - Users Table */}
          <div
            className='space-y-4 animate-slide-up'
            style={{
              width: selectedUser ? `${leftWidth}%` : '100%',
              maxWidth: selectedUser ? `${leftWidth}%` : '100%',
              paddingRight: selectedUser ? '12px' : '0',
            }}
          >
            {/* Search and Add Button */}
            <Card className='glass-effect'>
              <CardContent className='p-4'>
                <div className='flex gap-4'>
                  <form onSubmit={handleSearch} className='flex gap-4 flex-1'>
                    <div className='flex-1 relative'>
                      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      <Input
                        type='text'
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder='Search by name, email, type...'
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
                          updateURL(1, '');
                        }}
                        className='hover-lift'
                      >
                        Clear
                      </Button>
                    )}
                  </form>

                  {/* Add User Dialog */}
                  <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className='hover-lift'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-[425px]'>
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Create a new user account in the system.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddUser} className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                          <div className='space-y-2'>
                            <Label htmlFor='name'>First Name</Label>
                            <Input
                              id='name'
                              value={formData.name}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label htmlFor='surname'>Last Name</Label>
                            <Input
                              id='surname'
                              value={formData.surname}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  surname: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='email'>Email</Label>
                          <Input
                            id='email'
                            type='email'
                            value={formData.email}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='mobile'>Mobile</Label>
                          <Input
                            id='mobile'
                            value={formData.mobile}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                mobile: e.target.value,
                              })
                            }
                            placeholder='Optional'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='type'>User Type</Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value: any) =>
                              setFormData({ ...formData, type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='Doctor'>Doctor</SelectItem>
                              <SelectItem value='Nurse'>Nurse</SelectItem>
                              <SelectItem value='Administrator'>
                                Administrator
                              </SelectItem>
                              <SelectItem value='Ergonomist'>
                                Ergonomist
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='signature'>Signature Path</Label>
                          <Input
                            id='signature'
                            value={formData.signature}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                signature: e.target.value,
                              })
                            }
                            placeholder='Optional signature file path'
                          />
                        </div>
                        <div className='flex justify-end space-x-2'>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => setIsAddDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create User'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className='hover-lift'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-2xl medical-heading'>
                  <Users className='h-6 w-6' />
                  Users ({pagination.total})
                </CardTitle>
                <CardDescription>
                  System user accounts and access management
                </CardDescription>
              </CardHeader>
              <CardContent>
                {displayedUsers.length === 0 ? (
                  <div className='text-center py-12'>
                    <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-foreground mb-2'>
                      No users found
                    </h3>
                    <p className='text-muted-foreground'>
                      {searchTerm
                        ? 'Try adjusting your search criteria.'
                        : 'No users available.'}
                    </p>
                  </div>
                ) : (
                  <div className='max-h-[500px] overflow-auto scrollbar-premium'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody
                        className={`table-transition ${pageTransitioning ? 'transitioning' : ''}`}
                      >
                        {displayedUsers.map(user => (
                          <TableRow
                            key={user.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedUser?.id === user.id
                                ? 'bg-muted border-l-4 border-l-primary'
                                : ''
                            }`}
                            onClick={() => handleUserClick(user)}
                          >
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {user.name} {user.surname}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  Created: {formatDate(user.date_created)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className='text-sm'>
                              {user.email}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getUserTypeBadgeVariant(user.type)}
                                className='flex items-center gap-1 w-fit'
                              >
                                {getUserTypeIcon(user.type)}
                                {user.type}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-sm'>
                              {user.mobile || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    openEditDialog(user);
                                  }}
                                  className='hover-lift'
                                >
                                  <Edit3 className='h-4 w-4' />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={e => e.stopPropagation()}
                                      className='hover-lift text-destructive hover:text-destructive'
                                    >
                                      <Trash2 className='h-4 w-4' />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete User
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete{' '}
                                        {user.name} {user.surname}? This action
                                        cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <Button
                                        variant='destructive'
                                        onClick={() =>
                                          handleDeleteUser(user.id)
                                        }
                                      >
                                        <Trash2 className='mr-2 h-4 w-4' />
                                        Delete User
                                      </Button>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
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
                          className={`${selectedUser && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
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
                          className={`${selectedUser && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
                        >
                          Previous
                        </span>
                      </Button>

                      {/* Page Numbers */}
                      {Array.from(
                        {
                          length: Math.min(
                            selectedUser && leftWidth < 50 ? 3 : 5,
                            pagination.totalPages
                          ),
                        },
                        (_, i) => {
                          const startPage = Math.max(
                            1,
                            pagination.page -
                              (selectedUser && leftWidth < 50 ? 1 : 2)
                          );
                          const page = startPage + i;
                          if (page > pagination.totalPages) return null;

                          return (
                            <Button
                              key={`users-page-${page}`}
                              variant={
                                page === pagination.page ? 'default' : 'outline'
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
                          className={`${selectedUser && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
                        >
                          Next
                        </span>
                        <ChevronRight className='h-4 w-4' />
                      </Button>

                      {/* Last Page */}
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages}
                        className='hover-lift'
                        title='Go to last page'
                      >
                        <span
                          className={`${selectedUser && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
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
          {selectedUser && (
            <div
              className='w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0'
              onMouseDown={handleMouseDown}
              style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
            />
          )}

          {/* Right Panel - User Details */}
          {selectedUser && (
            <div
              className='space-y-4 animate-slide-up'
              style={{
                width: `${100 - leftWidth}%`,
                maxWidth: `${100 - leftWidth}%`,
                paddingLeft: '12px',
                overflow: 'visible',
              }}
            >
              <Card className='glass-effect max-h-screen overflow-y-auto scrollbar-premium'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div className='space-y-1'>
                      <CardTitle className='text-2xl medical-heading'>
                        {selectedUser.name} {selectedUser.surname}
                      </CardTitle>
                      <CardDescription className='flex items-center gap-2'>
                        <Badge
                          variant={getUserTypeBadgeVariant(selectedUser.type)}
                          className='flex items-center gap-1'
                        >
                          {getUserTypeIcon(selectedUser.type)}
                          {selectedUser.type}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => openEditDialog(selectedUser)}
                        className='hover-lift'
                      >
                        <Edit3 className='h-4 w-4 mr-2' />
                        Edit
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setSelectedUser(null)}
                        className='hover-lift'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Contact Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <Mail className='h-4 w-4' />
                      Contact Information
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Email:
                        </span>
                        <span className='font-medium break-all'>
                          {selectedUser.email}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Mobile:
                        </span>
                        <span className='font-medium'>
                          {selectedUser.mobile || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* System Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <Calendar className='h-4 w-4' />
                      Account Information
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          User ID:
                        </span>
                        <Badge variant='outline'>{selectedUser.id}</Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          User Type:
                        </span>
                        <Badge
                          variant={getUserTypeBadgeVariant(selectedUser.type)}
                          className='flex items-center gap-1 w-fit'
                        >
                          {getUserTypeIcon(selectedUser.type)}
                          {selectedUser.type}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Signature:
                        </span>
                        <span className='font-medium'>
                          {selectedUser.signature ? 'Available' : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Record Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <Calendar className='h-4 w-4' />
                      Record Information
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Created:
                        </span>
                        <span className='font-medium'>
                          {formatDateTime(selectedUser.date_created)}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Created By:
                        </span>
                        <span className='font-medium'>
                          {selectedUser.created_by_name ||
                            selectedUser.user_created ||
                            'N/A'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Last Updated:
                        </span>
                        <span className='font-medium'>
                          {formatDateTime(selectedUser.date_updated)}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Updated By:
                        </span>
                        <span className='font-medium'>
                          {selectedUser.updated_by_name ||
                            selectedUser.user_updated ||
                            'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user account information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-name'>First Name</Label>
                <Input
                  id='edit-name'
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-surname'>Last Name</Label>
                <Input
                  id='edit-surname'
                  value={formData.surname}
                  onChange={e =>
                    setFormData({ ...formData, surname: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-email'>Email</Label>
              <Input
                id='edit-email'
                type='email'
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-mobile'>Mobile</Label>
              <Input
                id='edit-mobile'
                value={formData.mobile}
                onChange={e =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                placeholder='Optional'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-type'>User Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Doctor'>Doctor</SelectItem>
                  <SelectItem value='Nurse'>Nurse</SelectItem>
                  <SelectItem value='Administrator'>Administrator</SelectItem>
                  <SelectItem value='Ergonomist'>Ergonomist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-signature'>Signature Path</Label>
              <Input
                id='edit-signature'
                value={formData.signature}
                onChange={e =>
                  setFormData({ ...formData, signature: e.target.value })
                }
                placeholder='Optional signature file path'
              />
            </div>
            <div className='flex justify-end space-x-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
