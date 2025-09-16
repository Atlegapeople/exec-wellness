'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useBreadcrumbBack } from '@/hooks/useBreadcrumbBack';
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
import { Checkbox } from '@/components/ui/checkbox';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Shield,
  Search,
  Plus,
  Send,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  FileCheck,
  Calendar,
  Mail,
  Download,
  Filter,
  RefreshCw,
  Info,
  ArrowLeft,
  X,
  Trash2,
  Edit,
} from 'lucide-react';
import { ButtonLoading, PageLoading } from '@/components/ui/loading';

interface ConsentRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  department: string;
  consent_type: string;
  purpose: string;
  status: 'pending' | 'active' | 'expired' | 'revoked';
  consent_date: string | null;
  expiry_date: string | null;
  withdrawal_date: string | null;
  legal_basis: 'consent' | 'statutory' | 'mixed';
  purpose_achieved: boolean;
  link_sent_date: string | null;
  link_opened: boolean;
  link_expires: string | null;
}

interface ConsentStats {
  total_employees: number;
  consents_active: number;
  consents_pending: number;
  consents_expired: number;
  consents_revoked: number;
  compliance_rate: number;
  expiring_soon: number;
}

const CONSENT_TYPES = [
  {
    id: 'pre_employment',
    name: 'Pre-Employment Medical Assessment',
    description: 'Medical fitness evaluation for employment',
    duration_type: 'purpose_based',
    typical_duration: 'Until hiring decision',
  },
  {
    id: 'periodic_screening',
    name: 'Periodic Health Screening',
    description: 'Regular health monitoring and assessment',
    duration_type: 'time_based',
    typical_duration: '12 months',
  },
  {
    id: 'incident_investigation',
    name: 'Incident Investigation',
    description: 'Medical data for workplace incident investigation',
    duration_type: 'purpose_based',
    typical_duration: 'Until investigation complete',
  },
  {
    id: 'return_to_work',
    name: 'Return-to-Work Assessment',
    description: 'Medical clearance for return to work',
    duration_type: 'purpose_based',
    typical_duration: 'Until clearance decision',
  },
  {
    id: 'occupational_surveillance',
    name: 'Occupational Health Surveillance',
    description: 'Ongoing health monitoring for occupational risks',
    duration_type: 'time_based',
    typical_duration: '24 months',
  },
  {
    id: 'emergency_medical',
    name: 'Emergency Medical Response',
    description: 'Emergency contact and medical information',
    duration_type: 'employment_based',
    typical_duration: 'During employment',
  },
];

function CompliancePageContent() {
  const router = useRouter();
  const handleBreadcrumbBack = useBreadcrumbBack('/dashboard');
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [stats, setStats] = useState<ConsentStats>({
    total_employees: 0,
    consents_active: 0,
    consents_pending: 0,
    consents_expired: 0,
    consents_revoked: 0,
    compliance_rate: 0,
    expiring_soon: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Right panel state
  const [selectedConsentRecord, setSelectedConsentRecord] =
    useState<ConsentRecord | null>(null);
  const [leftWidth, setLeftWidth] = useRouteState<number>(
    'leftPanelWidth',
    40,
    { scope: 'path' }
  );
  const [selectedConsentId, setSelectedConsentId] = useRouteState<
    string | null
  >('selectedConsentId', null, { scope: 'path' });
  const [isResizing, setIsResizing] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [isSendConsentDialogOpen, setIsSendConsentDialogOpen] = useState(false);
  const [isViewConsentDialogOpen, setIsViewConsentDialogOpen] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(
    null
  );
  const [consentFormData, setConsentFormData] = useState({
    consent_type: '',
    purpose: '',
    duration_type: 'time_based',
    duration_value: '12',
    duration_unit: 'months',
    custom_message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingConsent, setEditingConsent] = useState<ConsentRecord | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<ConsentRecord>>({});
  const [formLoading, setFormLoading] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    if (!mounted) return; // Only run after client-side mount

    const fetchData = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock consent records with consistent dates
      const mockRecords: ConsentRecord[] = [
        {
          id: '1',
          employee_id: 'EMP001',
          employee_name: 'John Smith',
          employee_email: 'john.smith@company.com',
          department: 'Manufacturing',
          consent_type: 'periodic_screening',
          purpose:
            'Annual health screening for occupational health surveillance',
          status: 'active',
          consent_date: '2024-01-15T00:00:00.000Z',
          expiry_date: '2025-01-15T00:00:00.000Z',
          withdrawal_date: null,
          legal_basis: 'consent',
          purpose_achieved: false,
          link_sent_date: '2024-01-10T00:00:00.000Z',
          link_opened: true,
          link_expires: null,
        },
        {
          id: '2',
          employee_id: 'EMP002',
          employee_name: 'Sarah Johnson',
          employee_email: 'sarah.johnson@company.com',
          department: 'Office Administration',
          consent_type: 'pre_employment',
          purpose: 'Pre-employment medical fitness assessment',
          status: 'pending',
          consent_date: null,
          expiry_date: null,
          withdrawal_date: null,
          legal_basis: 'consent',
          purpose_achieved: false,
          link_sent_date: '2024-08-20T00:00:00.000Z',
          link_opened: false,
          link_expires: '2024-08-27T00:00:00.000Z',
        },
        {
          id: '3',
          employee_id: 'EMP003',
          employee_name: 'Michael Brown',
          employee_email: 'michael.brown@company.com',
          department: 'Warehouse',
          consent_type: 'return_to_work',
          purpose: 'Medical clearance following workplace injury',
          status: 'expired',
          consent_date: '2024-03-10T00:00:00.000Z',
          expiry_date: '2024-07-10T00:00:00.000Z',
          withdrawal_date: null,
          legal_basis: 'mixed',
          purpose_achieved: true,
          link_sent_date: '2024-03-05T00:00:00.000Z',
          link_opened: true,
          link_expires: null,
        },
        {
          id: '4',
          employee_id: 'EMP004',
          employee_name: 'Lisa Wilson',
          employee_email: 'lisa.wilson@company.com',
          department: 'Quality Control',
          consent_type: 'occupational_surveillance',
          purpose: 'Health monitoring for chemical exposure risk',
          status: 'revoked',
          consent_date: '2023-12-01T00:00:00.000Z',
          expiry_date: '2025-12-01T00:00:00.000Z',
          withdrawal_date: '2024-06-15T00:00:00.000Z',
          legal_basis: 'consent',
          purpose_achieved: false,
          link_sent_date: '2023-11-25T00:00:00.000Z',
          link_opened: true,
          link_expires: null,
        },
      ];

      setConsentRecords(mockRecords);

      // Calculate stats
      const mockStats: ConsentStats = {
        total_employees: 150,
        consents_active: mockRecords.filter(r => r.status === 'active').length,
        consents_pending: mockRecords.filter(r => r.status === 'pending')
          .length,
        consents_expired: mockRecords.filter(r => r.status === 'expired')
          .length,
        consents_revoked: mockRecords.filter(r => r.status === 'revoked')
          .length,
        compliance_rate: 78,
        expiring_soon: 12,
      };

      setStats(mockStats);
      setLoading(false);
    };

    fetchData();
  }, [mounted]);

  // Restore selected consent from URL state
  useEffect(() => {
    if (!selectedConsentRecord && selectedConsentId) {
      const found = consentRecords.find(c => c.id === selectedConsentId);
      if (found) {
        setSelectedConsentRecord(found);
      } else {
        setSelectedConsentId(null);
      }
    }
  }, [selectedConsentId, selectedConsentRecord, consentRecords]);

  const handleSearch = () => {
    // Implement search logic
    console.log('Searching for:', searchTerm);
  };

  const handleConsentClick = (consent: ConsentRecord) => {
    setSelectedConsentRecord(consent);
    setSelectedConsentId(consent.id);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = leftWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const containerWidth = window.innerWidth;
      const newWidth = Math.max(
        20,
        Math.min(80, startWidth + (deltaX / containerWidth) * 100)
      );
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleSendConsent = async () => {
    setSubmitting(true);

    // Simulate API call - no actual email sending
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log(
      'Mock: Consent link would be sent to selected employees:',
      selectedRecords
    );
    console.log('Consent form data:', consentFormData);

    setIsSendConsentDialogOpen(false);
    setSelectedRecords([]);
    setConsentFormData({
      consent_type: '',
      purpose: '',
      duration_type: 'time_based',
      duration_value: '12',
      duration_unit: 'months',
      custom_message: '',
    });
    setSubmitting(false);
  };

  // Modal handlers
  const openCreateModal = () => {
    setFormData({});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (consent: ConsentRecord) => {
    setEditingConsent(consent);
    setFormData(consent);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (consent: ConsentRecord) => {
    setEditingConsent(consent);
    setIsDeleteModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({});
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingConsent(null);
    setFormData({});
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEditingConsent(null);
  };

  const handleCreate = async () => {
    setFormLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Creating consent record:', formData);
    setIsCreateModalOpen(false);
    setFormData({});
    setFormLoading(false);
  };

  const handleEdit = async () => {
    setFormLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Updating consent record:', formData);
    setIsEditModalOpen(false);
    setEditingConsent(null);
    setFormData({});
    setFormLoading(false);
  };

  const handleDelete = async () => {
    setFormLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Deleting consent record:', editingConsent?.id);
    setIsDeleteModalOpen(false);
    setEditingConsent(null);
    setFormLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className='bg-green-100 text-green-800 border-green-200'>
            <CheckCircle className='h-3 w-3 mr-1' />
            Active
          </Badge>
        );
      case 'pending':
        return (
          <Badge className='bg-yellow-100 text-yellow-800 border-yellow-200'>
            <Clock className='h-3 w-3 mr-1' />
            Pending
          </Badge>
        );
      case 'expired':
        return (
          <Badge className='bg-red-100 text-red-800 border-red-200'>
            <XCircle className='h-3 w-3 mr-1' />
            Expired
          </Badge>
        );
      case 'revoked':
        return (
          <Badge className='bg-gray-100 text-gray-800 border-gray-200'>
            <XCircle className='h-3 w-3 mr-1' />
            Revoked
          </Badge>
        );
      default:
        return <Badge variant='secondary'>{status}</Badge>;
    }
  };

  const getLegalBasisBadge = (basis: string) => {
    switch (basis) {
      case 'consent':
        return (
          <Badge variant='outline' className='text-blue-700 border-blue-200'>
            Consent
          </Badge>
        );
      case 'statutory':
        return (
          <Badge
            variant='outline'
            className='text-purple-700 border-purple-200'
          >
            Statutory
          </Badge>
        );
      case 'mixed':
        return (
          <Badge
            variant='outline'
            className='text-orange-700 border-orange-200'
          >
            Mixed
          </Badge>
        );
      default:
        return <Badge variant='outline'>{basis}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Use a consistent format that works the same on server and client
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const filteredRecords = consentRecords.filter(record => {
    const matchesSearch =
      record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || record.status === statusFilter;
    const matchesType =
      typeFilter === 'all' || record.consent_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Always show loading during SSR and initial client render
  if (!mounted) {
    return (
      // <ProtectedRoute>
      <DashboardLayout>
        <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
          <Card>
            <CardContent>
              <PageLoading
                text='Loading Compliance Dashboard'
                subtitle='Fetching consent records and compliance data...'
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
      // </ProtectedRoute>
    );
  }

  // Show loading screen when mounted but data is still loading
  if (loading) {
    return (
      // <ProtectedRoute>
      <DashboardLayout>
        <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
          <Card>
            <CardContent>
              <PageLoading
                text='Loading Compliance Dashboard'
                subtitle='Fetching consent records and compliance data...'
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
      // </ProtectedRoute>
    );
  }

  return (
    // <ProtectedRoute>
    <DashboardLayout>
      <div className='pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[10vw] py-6 max-w-full overflow-hidden'>
        {/* Back Button */}
        <div className='mb-6 flex justify-start'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleBreadcrumbBack}
            className='flex items-center space-x-2 hover-lift'
          >
            <ArrowLeft className='h-4 w-4' />
            <span>Back</span>
          </Button>
        </div>

        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
              <Shield className='h-8 w-8' />
              Compliance Management
            </h1>
            <p className='text-muted-foreground'>
              POPIA-compliant consent tracking and management system
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Employees
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.total_employees}</div>
              <p className='text-xs text-muted-foreground'>In consent system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Compliance Rate
              </CardTitle>
              <FileCheck className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.compliance_rate}%</div>
              <p className='text-xs text-muted-foreground'>Active consents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pending Consents
              </CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.consents_pending}</div>
              <p className='text-xs text-muted-foreground'>Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Expiring Soon
              </CardTitle>
              <AlertTriangle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.expiring_soon}</div>
              <p className='text-xs text-muted-foreground'>Next 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className='glass-effect mb-6'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-4'>
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  type='text'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder='Search by employee name, email, or department...'
                  className='pl-9'
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-[140px]'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='expired'>Expired</SelectItem>
                  <SelectItem value='revoked'>Revoked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Consent Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  {CONSENT_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} className='hover-lift'>
                Search
              </Button>

              {(searchTerm ||
                statusFilter !== 'all' ||
                typeFilter !== 'all') && (
                <Button
                  variant='outline'
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className='hover-lift'
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className='compliance-container flex gap-1 min-h-[600px]'>
          {/* Left Panel - Consent Records Table */}
          <div
            className='space-y-4 animate-slide-up'
            style={{ width: selectedConsentRecord ? `${leftWidth}%` : '100%' }}
          >
            {/* Consent Records Table */}
            <Card className='hover-lift'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2 text-2xl text-teal'>
                      <Shield className='h-6 w-6' />
                      Consent Records ({filteredRecords.length})
                    </CardTitle>
                    <CardDescription>
                      POPIA-compliant consent tracking and management
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      onClick={openCreateModal}
                      className={`hover-lift ${selectedConsentRecord ? 'rounded-full w-10 h-10 p-0' : ''}`}
                    >
                      <Plus className='h-4 w-4' />
                      {!selectedConsentRecord && (
                        <span className='ml-2'>Add New Record</span>
                      )}
                    </Button>
                    <Button
                      variant='outline'
                      className={`hover-lift ${selectedConsentRecord ? 'rounded-full w-10 h-10 p-0' : ''}`}
                    >
                      <Download className='h-4 w-4' />
                      {!selectedConsentRecord && (
                        <span className='ml-2'>Export Report</span>
                      )}
                    </Button>
                    <Button
                      onClick={() => setIsSendConsentDialogOpen(true)}
                      className={`hover-lift ${selectedConsentRecord ? 'rounded-full w-10 h-10 p-0' : ''}`}
                    >
                      <Send className='h-4 w-4' />
                      {!selectedConsentRecord && (
                        <span className='ml-2'>Send Consent Request</span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRecords.length === 0 ? (
                  <div className='text-center py-12'>
                    <Shield className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-foreground mb-2'>
                      No consent records found
                    </h3>
                    <p className='text-muted-foreground'>
                      {searchTerm ||
                      statusFilter !== 'all' ||
                      typeFilter !== 'all'
                        ? 'Try adjusting your search criteria.'
                        : 'No consent records available.'}
                    </p>
                  </div>
                ) : (
                  <div className='max-h-[600px] overflow-auto scrollbar-premium'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='w-[50px]'>
                            <Checkbox
                              checked={
                                selectedRecords.length ===
                                filteredRecords.length
                              }
                              onCheckedChange={checked => {
                                if (checked) {
                                  setSelectedRecords(
                                    filteredRecords.map(r => r.id)
                                  );
                                } else {
                                  setSelectedRecords([]);
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead>Employee</TableHead>
                          <TableHead>Consent Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Legal Basis</TableHead>
                          <TableHead>Consent Date</TableHead>
                          <TableHead>Expiry Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.map(record => (
                          <TableRow
                            key={record.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedConsentRecord?.id === record.id
                                ? 'bg-muted border-l-4 border-l-primary'
                                : ''
                            }`}
                            onClick={() => handleConsentClick(record)}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedRecords.includes(record.id)}
                                onCheckedChange={checked => {
                                  if (checked) {
                                    setSelectedRecords([
                                      ...selectedRecords,
                                      record.id,
                                    ]);
                                  } else {
                                    setSelectedRecords(
                                      selectedRecords.filter(
                                        id => id !== record.id
                                      )
                                    );
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {record.employee_name}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  {record.employee_email}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  {record.department}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {CONSENT_TYPES.find(
                                    t => t.id === record.consent_type
                                  )?.name || record.consent_type}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  {record.purpose_achieved && (
                                    <Badge
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      Purpose Achieved
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(record.status)}
                            </TableCell>
                            <TableCell>
                              {getLegalBasisBadge(record.legal_basis)}
                            </TableCell>
                            <TableCell>
                              <div className='text-sm'>
                                {formatDate(record.consent_date)}
                                {record.link_sent_date && (
                                  <div className='text-xs text-muted-foreground flex items-center gap-1'>
                                    <Mail className='h-3 w-3' />
                                    Link sent:{' '}
                                    {formatDate(record.link_sent_date)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='text-sm'>
                                {formatDate(record.expiry_date)}
                                {record.withdrawal_date && (
                                  <div className='text-xs text-red-600'>
                                    Withdrawn:{' '}
                                    {formatDate(record.withdrawal_date)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    openEditModal(record);
                                  }}
                                  className='hover-lift'
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    openDeleteModal(record);
                                  }}
                                  className='hover-lift text-destructive hover:text-destructive'
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
              </CardContent>
            </Card>
          </div>

          {/* Resize Handle */}
          {selectedConsentRecord && (
            <div
              className='w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0'
              onMouseDown={handleMouseDown}
              style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
            />
          )}

          {/* Right Panel - Consent Details */}
          {selectedConsentRecord && (
            <div
              className='space-y-4 animate-slide-up'
              style={{ width: `${100 - leftWidth}%` }}
            >
              <Card className='glass-effect'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div className='space-y-1'>
                      <CardTitle className='text-2xl medical-heading'>
                        Consent Details
                      </CardTitle>
                      <CardDescription className='flex items-center gap-2'>
                        <span className='text-lg font-medium'>
                          {selectedConsentRecord.employee_name}
                        </span>
                        <Badge variant='outline'>
                          {selectedConsentRecord.id}
                        </Badge>
                      </CardDescription>
                      <div className='text-xs text-muted-foreground mt-2'>
                        <span>Employee ID: </span>
                        <span className='font-medium'>
                          {selectedConsentRecord.employee_id}
                        </span>
                        <span> • Department: </span>
                        <span className='font-medium'>
                          {selectedConsentRecord.department}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setSelectedConsentRecord(null);
                          setSelectedConsentId(null);
                        }}
                        className='hover-lift'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium'>
                  {/* Consent Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <Shield className='h-4 w-4' />
                      Consent Information
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Type:
                        </span>
                        <span className='font-medium'>
                          {CONSENT_TYPES.find(
                            t => t.id === selectedConsentRecord.consent_type
                          )?.name || selectedConsentRecord.consent_type}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Status:
                        </span>
                        <div>
                          {getStatusBadge(selectedConsentRecord.status)}
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Legal Basis:
                        </span>
                        <div>
                          {getLegalBasisBadge(
                            selectedConsentRecord.legal_basis
                          )}
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Purpose:
                        </span>
                        <div className='mt-1 p-2 bg-muted rounded text-sm'>
                          {selectedConsentRecord.purpose}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <Calendar className='h-4 w-4' />
                      Timeline
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Link Sent:
                        </span>
                        <span className='font-medium'>
                          {formatDate(selectedConsentRecord.link_sent_date)}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Link Opened:
                        </span>
                        <span className='font-medium'>
                          {selectedConsentRecord.link_opened ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Consent Given:
                        </span>
                        <span className='font-medium'>
                          {formatDate(selectedConsentRecord.consent_date)}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Expires:
                        </span>
                        <span className='font-medium'>
                          {formatDate(selectedConsentRecord.expiry_date)}
                        </span>
                      </div>
                      {selectedConsentRecord.withdrawal_date && (
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Withdrawn:
                          </span>
                          <span className='font-medium text-red-600'>
                            {formatDate(selectedConsentRecord.withdrawal_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* POPIA Compliance */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <Info className='h-4 w-4' />
                      POPIA Compliance
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Purpose Achieved:
                        </span>
                        <span className='font-medium'>
                          {selectedConsentRecord.purpose_achieved
                            ? 'Yes'
                            : 'No'}
                        </span>
                      </div>
                      <div className='p-3 bg-blue-50 border border-blue-200 rounded'>
                        <div className='text-blue-800 font-medium mb-1'>
                          Data Processing Rights
                        </div>
                        <div className='text-blue-700 text-xs'>
                          Employee has the right to withdraw consent at any
                          time. Upon withdrawal, processing will cease except
                          where required by statutory obligations.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* View Consent Dialog */}
        <Dialog
          open={isViewConsentDialogOpen}
          onOpenChange={setIsViewConsentDialogOpen}
        >
          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle>Consent Details</DialogTitle>
              <DialogDescription>
                Detailed information about consent record
              </DialogDescription>
            </DialogHeader>

            {selectedConsent && (
              <div className='grid grid-cols-1 gap-6 py-4 max-h-[60vh] overflow-y-auto'>
                {/* Employee Information */}
                <div className='space-y-3'>
                  <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                    <Users className='h-4 w-4' />
                    Employee Information
                  </h3>
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>Name:</span>
                      <span className='font-medium ml-2'>
                        {selectedConsent.employee_name}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Email:</span>
                      <span className='font-medium ml-2'>
                        {selectedConsent.employee_email}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        Employee ID:
                      </span>
                      <span className='font-medium ml-2'>
                        {selectedConsent.employee_id}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Department:</span>
                      <span className='font-medium ml-2'>
                        {selectedConsent.department}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Consent Information */}
                <div className='space-y-3'>
                  <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                    <Shield className='h-4 w-4' />
                    Consent Information
                  </h3>
                  <div className='grid grid-cols-1 gap-3 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>
                        Consent Type:
                      </span>
                      <span className='font-medium ml-2'>
                        {CONSENT_TYPES.find(
                          t => t.id === selectedConsent.consent_type
                        )?.name || selectedConsent.consent_type}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Purpose:</span>
                      <div className='mt-1 p-2 bg-muted rounded text-sm'>
                        {selectedConsent.purpose}
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <span className='text-muted-foreground'>Status:</span>
                        <div className='mt-1'>
                          {getStatusBadge(selectedConsent.status)}
                        </div>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          Legal Basis:
                        </span>
                        <div className='mt-1'>
                          {getLegalBasisBadge(selectedConsent.legal_basis)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className='space-y-3'>
                  <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    Timeline
                  </h3>
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>Link Sent:</span>
                      <span className='font-medium ml-2'>
                        {formatDate(selectedConsent.link_sent_date)}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        Link Opened:
                      </span>
                      <span className='font-medium ml-2'>
                        {selectedConsent.link_opened ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        Consent Given:
                      </span>
                      <span className='font-medium ml-2'>
                        {formatDate(selectedConsent.consent_date)}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Expires:</span>
                      <span className='font-medium ml-2'>
                        {formatDate(selectedConsent.expiry_date)}
                      </span>
                    </div>
                    {selectedConsent.withdrawal_date && (
                      <div className='col-span-2'>
                        <span className='text-muted-foreground'>
                          Withdrawn:
                        </span>
                        <span className='font-medium ml-2 text-red-600'>
                          {formatDate(selectedConsent.withdrawal_date)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* POPIA Compliance */}
                <div className='space-y-3'>
                  <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                    <Info className='h-4 w-4' />
                    POPIA Compliance
                  </h3>
                  <div className='grid grid-cols-1 gap-3 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>
                        Purpose Achieved:
                      </span>
                      <span className='font-medium ml-2'>
                        {selectedConsent.purpose_achieved ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className='p-3 bg-blue-50 border border-blue-200 rounded'>
                      <div className='text-blue-800 font-medium mb-1'>
                        Data Processing Rights
                      </div>
                      <div className='text-blue-700 text-xs'>
                        Employee has the right to withdraw consent at any time.
                        Upon withdrawal, processing will cease except where
                        required by statutory obligations.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Modal */}
        <Dialog
          open={isCreateModalOpen}
          onOpenChange={open => {
            if (!open) closeCreateModal();
            else setIsCreateModalOpen(true);
          }}
        >
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Create New Consent Record</DialogTitle>
              <DialogDescription>
                Add a new POPIA-compliant consent record for an employee.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='employee_id'>Employee</Label>
                <Select
                  value={formData.employee_id || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, employee_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select employee' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='EMP001'>John Smith</SelectItem>
                    <SelectItem value='EMP002'>Sarah Johnson</SelectItem>
                    <SelectItem value='EMP003'>Michael Brown</SelectItem>
                    <SelectItem value='EMP004'>Lisa Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='consent_type'>Consent Type</Label>
                <Select
                  value={formData.consent_type || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, consent_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select consent type' />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSENT_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='purpose'>Purpose</Label>
                <Textarea
                  id='purpose'
                  value={formData.purpose || ''}
                  onChange={e =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  placeholder='Describe the specific purpose for data collection and processing...'
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='legal_basis'>Legal Basis</Label>
                <Select
                  value={formData.legal_basis || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, legal_basis: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select legal basis' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='consent'>Consent</SelectItem>
                    <SelectItem value='statutory'>Statutory</SelectItem>
                    <SelectItem value='mixed'>Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={formData.status || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, status: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='expired'>Expired</SelectItem>
                    <SelectItem value='revoked'>Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant='outline' onClick={closeCreateModal}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={formLoading}>
                {formLoading && <ButtonLoading />}
                Create Consent Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog
          open={isEditModalOpen}
          onOpenChange={open => {
            if (!open) closeEditModal();
            else setIsEditModalOpen(true);
          }}
        >
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Edit Consent Record</DialogTitle>
              <DialogDescription>
                Update the consent record for{' '}
                {editingConsent ? editingConsent.employee_name : ''}.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='employee_id'>Employee</Label>
                <Select
                  value={formData.employee_id || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, employee_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select employee' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='EMP001'>John Smith</SelectItem>
                    <SelectItem value='EMP002'>Sarah Johnson</SelectItem>
                    <SelectItem value='EMP003'>Michael Brown</SelectItem>
                    <SelectItem value='EMP004'>Lisa Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='consent_type'>Consent Type</Label>
                <Select
                  value={formData.consent_type || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, consent_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select consent type' />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSENT_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='purpose'>Purpose</Label>
                <Textarea
                  id='purpose'
                  value={formData.purpose || ''}
                  onChange={e =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  placeholder='Describe the specific purpose for data collection and processing...'
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='legal_basis'>Legal Basis</Label>
                <Select
                  value={formData.legal_basis || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, legal_basis: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select legal basis' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='consent'>Consent</SelectItem>
                    <SelectItem value='statutory'>Statutory</SelectItem>
                    <SelectItem value='mixed'>Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={formData.status || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, status: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='expired'>Expired</SelectItem>
                    <SelectItem value='revoked'>Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant='outline' onClick={closeEditModal}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={formLoading}>
                {formLoading && <ButtonLoading />}
                Update Consent Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <Dialog
          open={isDeleteModalOpen}
          onOpenChange={open => {
            if (!open) closeDeleteModal();
            else setIsDeleteModalOpen(true);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <AlertTriangle className='h-5 w-5 text-destructive' />
                Delete Consent Record
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this consent record for{' '}
                <span className='font-medium'>
                  {editingConsent ? editingConsent.employee_name : ''}
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant='outline' onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={handleDelete}
                disabled={formLoading}
              >
                {formLoading && <ButtonLoading />}
                Delete Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
    // </ProtectedRoute>
  );
}

export default function CompliancePage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Card>
            <CardContent>
              <PageLoading
                text='Initializing Lifestyle'
                subtitle='Setting up lifestyle assessment management system...'
              />
            </CardContent>
          </Card>
        </div>
      }
    >
      <CompliancePageContent />
    </Suspense>
  );
}
