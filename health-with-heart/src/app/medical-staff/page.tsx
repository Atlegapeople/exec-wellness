'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  FileText,
  Users,
  Mail,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  UserCog,
  X,
  Upload,
  Image
} from 'lucide-react';

interface MedicalStaff {
  id: string;
  date_created: string;
  date_updated: string;
  user_created: string;
  user_updated: string;
  name?: string;
  surname?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  type?: string;
  position?: string;
  department?: string;
  license_number?: string;
  qualification?: string;
  address?: string;
  signature?: string;
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

export default function MedicalStaffPage() {
  const [staff, setStaff] = useState<MedicalStaff[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<MedicalStaff | null>(null);
  const [formData, setFormData] = useState<Partial<MedicalStaff>>({});
  const [submitting, setSubmitting] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [currentSignaturePath, setCurrentSignaturePath] = useState<string | null>(null);
  const [signatureStatuses, setSignatureStatuses] = useState<Record<string, boolean>>({});

  const fetchStaff = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/medical-staff?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('Failed to fetch medical staff');
      
      const data = await response.json();
      console.log('API Response - first staff:', data.users[0]);
      setStaff(data.users);
      setPagination(data.pagination);
      
      // Check signature status for all users
      const statuses: Record<string, boolean> = {};
      for (const staffMember of data.users) {
        try {
          const sigResponse = await fetch(`/api/medical-staff/check-signature?userId=${encodeURIComponent(staffMember.id)}`);
          if (sigResponse.ok) {
            const sigData = await sigResponse.json();
            statuses[staffMember.id] = sigData.hasSignature;
          }
        } catch (error) {
          console.error(`Error checking signature for ${staffMember.id}:`, error);
          statuses[staffMember.id] = false;
        }
      }
      setSignatureStatuses(statuses);
    } catch (error) {
      console.error('Error fetching medical staff:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSearch = () => {
    fetchStaff(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchStaff(newPage, searchTerm);
  };

  const handleCreateStaff = async () => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/medical-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_created: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to create medical staff record');

      setIsCreateDialogOpen(false);
      setFormData({});
      fetchStaff(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error creating medical staff record:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStaff = async () => {
    if (!selectedStaff) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/medical-staff/${selectedStaff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_updated: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to update medical staff record');

      setIsEditDialogOpen(false);
      setFormData({});
      fetchStaff(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error updating medical staff record:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medical staff record?')) return;

    try {
      const response = await fetch(`/api/medical-staff/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete medical staff record');

      fetchStaff(pagination.page, searchTerm);
      if (selectedStaff?.id === id) {
        setSelectedStaff(null);
      }
    } catch (error) {
      console.error('Error deleting medical staff record:', error);
    }
  };

  const openEditDialog = (staffMember: MedicalStaff) => {
    setFormData(staffMember);
    setIsEditDialogOpen(true);
  };

  const handleStaffClick = async (staffMember: MedicalStaff) => {
    console.log('Selected staff data:', staffMember);
    console.log('Signature field value:', staffMember.signature);
    setSelectedStaff(staffMember);
    
    // Always check for file-based signature by userId (ignore database field for now)
    console.log('Checking for signature file with userId:', staffMember.id);
    try {
      const response = await fetch(`/api/medical-staff/check-signature?userId=${encodeURIComponent(staffMember.id)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Check signature API response:', data);
        setCurrentSignaturePath(data.hasSignature ? data.signaturePath : null);
      }
    } catch (error) {
      console.error('Error checking signature:', error);
      setCurrentSignaturePath(null);
    }
  };

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedStaff) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, etc.)');
      return;
    }

    try {
      setUploadingSignature(true);
      
      const formData = new FormData();
      formData.append('signature', file);
      formData.append('userId', selectedStaff.id);

      // TODO: Replace with actual upload endpoint
      const response = await fetch('/api/medical-staff/upload-signature', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload signature');
      }

      const data = await response.json();
      
      // Update the current signature path
      setCurrentSignaturePath(data.signaturePath);
      
      // Update signature status for this user
      setSignatureStatuses(prev => ({
        ...prev,
        [selectedStaff.id]: true
      }));

      // Refresh the staff list
      fetchStaff(pagination.page, searchTerm);

    } catch (error) {
      console.error('Error uploading signature:', error);
      alert('Failed to upload signature. Please try again.');
    } finally {
      setUploadingSignature(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // Resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const container = document.querySelector('.staff-container');
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constrain between 20% and 80%
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
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

  return (
    <DashboardLayout>
      <div className="pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[10vw] py-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medical Staff</h1>
            <p className="text-muted-foreground">
              Manage medical staff users and their information
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Staff Member</DialogTitle>
                <DialogDescription>
                  Add a new medical staff member to the system.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">First Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surname">Last Name</Label>
                  <Input
                    id="surname"
                    value={formData.surname || ''}
                    onChange={(e) => setFormData({...formData, surname: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile || ''}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    placeholder="Enter mobile number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type || ''} 
                    onValueChange={(value) => setFormData({...formData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Doctor">Doctor</SelectItem>
                      <SelectItem value="Nurse">Nurse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    placeholder="Enter position/title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="Enter department"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number || ''}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    placeholder="Enter license number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={formData.qualification || ''}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    placeholder="Enter qualifications"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter address"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button onClick={handleCreateStaff} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Staff Member'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content with Split View */}
        <div className="staff-container flex gap-0 overflow-hidden mb-6">
          {/* Left Panel - Staff List */}
          <div 
            className="space-y-4 flex-shrink-0 flex flex-col"
            style={{ 
              width: selectedStaff ? `${leftPanelWidth}%` : '100%',
              maxWidth: selectedStaff ? `${leftPanelWidth}%` : '100%'
            }}
          >
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pagination.total}</div>
                  <p className="text-xs text-muted-foreground">
                    Medical staff members
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {staff.filter(s => s.email).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    With email addresses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Doctors</CardTitle>
                  <UserCog className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {staff.filter(s => s.type === 'Doctor').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Medical doctors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nurses</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {staff.filter(s => s.type === 'Nurse').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nursing staff
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="flex-1 flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, surname or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch}>Search</Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staff Table */}
            <Card className="hover-lift flex-1 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCog className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <span>Medical Staff</span>
                    <span className="ml-2 text-lg font-medium text-gray-500">({pagination.total})</span>
                  </div>
                </CardTitle>
                <CardDescription>
                  Click on any record to view detailed staff information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-hidden">
                  {/* Sticky Header */}
                  <div className="bg-white border-b border-gray-200 px-6 py-3">
                    <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500">
                      <div>Name</div>
                      <div>Type</div>
                      <div>Email</div>
                      <div>Signature</div>
                      <div>Created</div>
                      <div>Actions</div>
                    </div>
                  </div>
                  
                  {/* Scrollable Content */}
                  <div className="max-h-[55vh] overflow-auto scrollbar-thin">
                    {loading ? (
                      <div className="grid grid-cols-6 gap-4 px-6 py-8">
                        <div className="col-span-6 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p>Loading medical staff...</p>
                        </div>
                      </div>
                    ) : staff.length === 0 ? (
                      <div className="grid grid-cols-6 gap-4 px-6 py-8">
                        <div className="col-span-6 text-center">
                          <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-foreground mb-2">No staff found</h3>
                          <p className="text-muted-foreground">No medical staff records match your search criteria.</p>
                        </div>
                      </div>
                    ) : (
                        staff.map((staffMember) => (
                          <div
                            key={staffMember.id}
                            className={`grid grid-cols-6 gap-4 px-6 py-3 border-b border-gray-100 cursor-pointer hover:bg-muted/50 ${
                              selectedStaff?.id === staffMember.id ? 'bg-muted' : ''
                            }`}
                            onClick={() => handleStaffClick(staffMember)}
                          >
                            <div>
                              <div className="font-medium">
                                {staffMember.name || 'N/A'} {staffMember.surname || ''}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {staffMember.id.substring(0, 8)}...
                              </div>
                            </div>
                            <div>
                              {staffMember.type && (
                                <Badge 
                                  className={staffMember.type === 'Doctor' 
                                    ? "bg-blue-100 text-blue-800" 
                                    : "bg-green-100 text-green-800"
                                  }
                                  variant="secondary"
                                >
                                  {staffMember.type}
                                </Badge>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                {staffMember.email && <Mail className="h-4 w-4 text-muted-foreground" />}
                                <span className="text-sm">
                                  {staffMember.email || 'No email'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                {signatureStatuses[staffMember.id] !== undefined ? (
                                  signatureStatuses[staffMember.id] ? (
                                    <Badge className="bg-green-100 text-green-800" variant="secondary">
                                      <Image className="h-3 w-3 mr-1" />
                                      Available
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-red-100 text-red-800" variant="secondary">
                                      <X className="h-3 w-3 mr-1" />
                                      Missing
                                    </Badge>
                                  )
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800" variant="secondary">
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Checking...
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div>
                              {new Date(staffMember.date_created).toLocaleDateString()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditDialog(staffMember);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteStaff(staffMember.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} records
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={!pagination.hasPreviousPage}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPreviousPage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <span className="text-sm font-medium px-3">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={!pagination.hasNextPage}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resize Handle */}
          {selectedStaff && (
            <div 
              className="w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors duration-200 flex-shrink-0 group"
              onMouseDown={handleMouseDown}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-border group-hover:bg-primary/50 rounded-full transition-colors duration-200"></div>
            </div>
          )}

          {/* Right Panel - Staff Preview */}
          <div 
            className={`${selectedStaff ? 'animate-slide-up' : ''} overflow-hidden`}
            style={{ 
              width: selectedStaff ? `calc(${100 - leftPanelWidth}% - 4px)` : '0%',
              maxWidth: selectedStaff ? `calc(${100 - leftPanelWidth}% - 4px)` : '0%',
              paddingLeft: selectedStaff ? '12px' : '0',
              paddingRight: selectedStaff ? '0px' : '0',
              overflow: selectedStaff ? 'visible' : 'hidden'
            }}
          >
            {selectedStaff && (
              <div className="space-y-4 max-h-[80vh] overflow-y-auto scrollbar-thin">
                {/* Staff Header Card */}
                <Card className="glass-effect">
                  <CardContent className="p-4 min-h-[120px] flex items-center">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start w-full gap-4">
                      <div className="space-y-3">
                        <div>
                          <h2 className="text-xl font-semibold">
                            {selectedStaff.name || 'N/A'} {selectedStaff.surname || ''}
                          </h2>
                          <div className="text-sm text-muted-foreground mt-1">
                            {selectedStaff.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {selectedStaff.email}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">
                            User ID: {selectedStaff.id.substring(0, 8)}...
                          </Badge>
                          {selectedStaff.type && (
                            <Badge 
                              className={selectedStaff.type === 'Doctor' 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-green-100 text-green-800"
                              }
                              variant="secondary"
                            >
                              {selectedStaff.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStaff(null)}
                          className="hover-lift"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Details */}
                <Card className="border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserCog className="h-5 w-5" />
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-muted-foreground">First Name</div>
                        <div className="font-semibold">{selectedStaff.name || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last Name</div>
                        <div className="font-semibold">{selectedStaff.surname || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Type</div>
                        <div className="font-semibold">{selectedStaff.type || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Position</div>
                        <div className="font-semibold">{selectedStaff.position || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Department</div>
                        <div className="font-semibold">{selectedStaff.department || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">License Number</div>
                        <div className="font-semibold">{selectedStaff.license_number || 'Not specified'}</div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-muted-foreground">Email Address</div>
                        <div className="font-semibold">{selectedStaff.email || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Mobile Number</div>
                        <div className="font-semibold">{selectedStaff.mobile || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Phone Number</div>
                        <div className="font-semibold">{selectedStaff.phone || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Qualification</div>
                        <div className="font-semibold">{selectedStaff.qualification || 'Not specified'}</div>
                      </div>
                      <div className="md:col-span-3">
                        <div className="text-muted-foreground">Address</div>
                        <div className="font-semibold">{selectedStaff.address || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">User ID</div>
                        <div className="font-semibold font-mono text-sm">
                          {selectedStaff.id}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">User Created By</div>
                        <div className="font-semibold font-mono text-sm">
                          {selectedStaff.user_created}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Record Information */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Record Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-muted-foreground">Created</div>
                        <div className="font-semibold">{new Date(selectedStaff.date_created).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{selectedStaff.created_by_name || 'System'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last Updated</div>
                        <div className="font-semibold">{new Date(selectedStaff.date_updated).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{selectedStaff.updated_by_name || 'System'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Signature Section */}
                <Card className="border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Digital Signature
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentSignaturePath ? (
                      <div className="space-y-4">
                        <div>
                          <div className="text-muted-foreground mb-2">Current Signature</div>
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <img 
                              src={`/${currentSignaturePath}`}
                              alt="Staff Signature"
                              className="max-w-full h-auto max-h-32 border rounded"
                              onError={(e) => {
                                console.error('Failed to load signature image:', currentSignaturePath);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          File: {currentSignaturePath.split('/').pop()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <Image className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No signature found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Looking for: {selectedStaff.name} {selectedStaff.surname}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={uploadingSignature}
                        onClick={() => document.getElementById('signature-upload')?.click()}
                        className="flex items-center gap-2"
                      >
                        {uploadingSignature ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            {currentSignaturePath ? 'Replace Signature' : 'Upload Signature'}
                          </>
                        )}
                      </Button>
                      <input
                        id="signature-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureUpload}
                        className="hidden"
                      />
                      <div className="text-xs text-muted-foreground">
                        Supported formats: PNG, JPG, JPEG
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
              <DialogDescription>
                Update the staff member information below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">First Name</Label>
                <Input
                  id="edit_name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_surname">Last Name</Label>
                <Input
                  id="edit_surname"
                  value={formData.surname || ''}
                  onChange={(e) => setFormData({...formData, surname: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_email">Email Address</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_mobile">Mobile Number</Label>
                <Input
                  id="edit_mobile"
                  value={formData.mobile || ''}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  placeholder="Enter mobile number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_phone">Phone Number</Label>
                <Input
                  id="edit_phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_type">Type</Label>
                <Select 
                  value={formData.type || ''} 
                  onValueChange={(value) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Doctor">Doctor</SelectItem>
                    <SelectItem value="Nurse">Nurse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_position">Position</Label>
                <Input
                  id="edit_position"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  placeholder="Enter position/title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_department">Department</Label>
                <Input
                  id="edit_department"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="Enter department"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_license_number">License Number</Label>
                <Input
                  id="edit_license_number"
                  value={formData.license_number || ''}
                  onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                  placeholder="Enter license number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_qualification">Qualification</Label>
                <Input
                  id="edit_qualification"
                  value={formData.qualification || ''}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  placeholder="Enter qualifications"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit_address">Address</Label>
                <Textarea
                  id="edit_address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleEditStaff} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Staff Member'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}