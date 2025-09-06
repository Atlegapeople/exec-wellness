'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Info
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
    typical_duration: 'Until hiring decision'
  },
  {
    id: 'periodic_screening',
    name: 'Periodic Health Screening',
    description: 'Regular health monitoring and assessment',
    duration_type: 'time_based',
    typical_duration: '12 months'
  },
  {
    id: 'incident_investigation',
    name: 'Incident Investigation',
    description: 'Medical data for workplace incident investigation',
    duration_type: 'purpose_based',
    typical_duration: 'Until investigation complete'
  },
  {
    id: 'return_to_work',
    name: 'Return-to-Work Assessment',
    description: 'Medical clearance for return to work',
    duration_type: 'purpose_based',
    typical_duration: 'Until clearance decision'
  },
  {
    id: 'occupational_surveillance',
    name: 'Occupational Health Surveillance',
    description: 'Ongoing health monitoring for occupational risks',
    duration_type: 'time_based',
    typical_duration: '24 months'
  },
  {
    id: 'emergency_medical',
    name: 'Emergency Medical Response',
    description: 'Emergency contact and medical information',
    duration_type: 'employment_based',
    typical_duration: 'During employment'
  }
];

function CompliancePageContent() {
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [stats, setStats] = useState<ConsentStats>({
    total_employees: 0,
    consents_active: 0,
    consents_pending: 0,
    consents_expired: 0,
    consents_revoked: 0,
    compliance_rate: 0,
    expiring_soon: 0
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

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
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(null);
  const [consentFormData, setConsentFormData] = useState({
    consent_type: '',
    purpose: '',
    duration_type: 'time_based',
    duration_value: '12',
    duration_unit: 'months',
    custom_message: ''
  });
  const [submitting, setSubmitting] = useState(false);

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
          purpose: 'Annual health screening for occupational health surveillance',
          status: 'active',
          consent_date: '2024-01-15T00:00:00.000Z',
          expiry_date: '2025-01-15T00:00:00.000Z',
          withdrawal_date: null,
          legal_basis: 'consent',
          purpose_achieved: false,
          link_sent_date: '2024-01-10T00:00:00.000Z',
          link_opened: true,
          link_expires: null
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
          link_expires: '2024-08-27T00:00:00.000Z'
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
          link_expires: null
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
          link_expires: null
        }
      ];
      
      setConsentRecords(mockRecords);
      
      // Calculate stats
      const mockStats: ConsentStats = {
        total_employees: 150,
        consents_active: mockRecords.filter(r => r.status === 'active').length,
        consents_pending: mockRecords.filter(r => r.status === 'pending').length,
        consents_expired: mockRecords.filter(r => r.status === 'expired').length,
        consents_revoked: mockRecords.filter(r => r.status === 'revoked').length,
        compliance_rate: 78,
        expiring_soon: 12
      };
      
      setStats(mockStats);
      setLoading(false);
    };

    fetchData();
  }, [mounted]);

  const handleSearch = () => {
    // Implement search logic
    console.log('Searching for:', searchTerm);
  };

  const handleSendConsent = async () => {
    setSubmitting(true);
    
    // Simulate API call - no actual email sending
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Mock: Consent link would be sent to selected employees:', selectedRecords);
    console.log('Consent form data:', consentFormData);
    
    setIsSendConsentDialogOpen(false);
    setSelectedRecords([]);
    setConsentFormData({
      consent_type: '',
      purpose: '',
      duration_type: 'time_based',
      duration_value: '12',
      duration_unit: 'months',
      custom_message: ''
    });
    setSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      case 'revoked':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><XCircle className="h-3 w-3 mr-1" />Revoked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLegalBasisBadge = (basis: string) => {
    switch (basis) {
      case 'consent':
        return <Badge variant="outline" className="text-blue-700 border-blue-200">Consent</Badge>;
      case 'statutory':
        return <Badge variant="outline" className="text-purple-700 border-purple-200">Statutory</Badge>;
      case 'mixed':
        return <Badge variant="outline" className="text-orange-700 border-orange-200">Mixed</Badge>;
      default:
        return <Badge variant="outline">{basis}</Badge>;
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
        day: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const filteredRecords = consentRecords.filter(record => {
    const matchesSearch = record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesType = typeFilter === 'all' || record.consent_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Always show loading during SSR and initial client render
  if (!mounted) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="px-8 sm:px-12 lg:px-16 xl:px-24 py-8">
            <Card>
              <CardContent>
                <PageLoading 
                  text="Loading Compliance Dashboard" 
                  subtitle="Fetching consent records and compliance data..."
                />
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Show loading screen when mounted but data is still loading
  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="px-8 sm:px-12 lg:px-16 xl:px-24 py-8">
            <Card>
              <CardContent>
                <PageLoading 
                  text="Loading Compliance Dashboard" 
                  subtitle="Fetching consent records and compliance data..."
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
        <div className="pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[10vw] py-6 max-w-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Shield className="h-8 w-8" />
                Compliance Management
              </h1>
              <p className="text-muted-foreground">
                POPIA-compliant consent tracking and management system
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" className="hover-lift">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Dialog open={isSendConsentDialogOpen} onOpenChange={setIsSendConsentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="hover-lift">
                    <Send className="h-4 w-4 mr-2" />
                    Send Consent Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send Consent Request</DialogTitle>
                    <DialogDescription>
                      Send POPIA-compliant consent request to selected employees
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="consent_type">Consent Type</Label>
                      <Select
                        value={consentFormData.consent_type}
                        onValueChange={(value) => setConsentFormData({...consentFormData, consent_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select consent type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONSENT_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Specific Purpose</Label>
                      <Textarea
                        id="purpose"
                        value={consentFormData.purpose}
                        onChange={(e) => setConsentFormData({...consentFormData, purpose: e.target.value})}
                        placeholder="Describe the specific purpose for data collection and processing..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label>Duration Type</Label>
                        <Select
                          value={consentFormData.duration_type}
                          onValueChange={(value) => setConsentFormData({...consentFormData, duration_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="time_based">Time-based</SelectItem>
                            <SelectItem value="purpose_based">Purpose-based</SelectItem>
                            <SelectItem value="employment_based">Employment-based</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {consentFormData.duration_type === 'time_based' && (
                        <>
                          <div className="space-y-2">
                            <Label>Duration</Label>
                            <Input
                              type="number"
                              value={consentFormData.duration_value}
                              onChange={(e) => setConsentFormData({...consentFormData, duration_value: e.target.value})}
                              placeholder="12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Unit</Label>
                            <Select
                              value={consentFormData.duration_unit}
                              onValueChange={(value) => setConsentFormData({...consentFormData, duration_unit: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="months">Months</SelectItem>
                                <SelectItem value="years">Years</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="custom_message">Custom Message (Optional)</Label>
                      <Textarea
                        id="custom_message"
                        value={consentFormData.custom_message}
                        onChange={(e) => setConsentFormData({...consentFormData, custom_message: e.target.value})}
                        placeholder="Add a personalized message to the consent request..."
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsSendConsentDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSendConsent} disabled={submitting}>
                      {submitting && <ButtonLoading />}
                      Send Consent Request (Mock)
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_employees}</div>
                <p className="text-xs text-muted-foreground">
                  In consent system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.compliance_rate}%</div>
                <p className="text-xs text-muted-foreground">
                  Active consents
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Consents</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.consents_pending}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting response
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.expiring_soon}</div>
                <p className="text-xs text-muted-foreground">
                  Next 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="glass-effect mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by employee name, email, or department..."
                    className="pl-9"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Consent Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {CONSENT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button onClick={handleSearch} className="hover-lift">
                  Search
                </Button>
                
                {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                    className="hover-lift"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Consent Records Table */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="h-6 w-6" />
                Consent Records ({filteredRecords.length})
              </CardTitle>
              <CardDescription>
                POPIA-compliant consent tracking and management
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No consent records found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                      ? 'Try adjusting your search criteria.' 
                      : 'No consent records available.'}
                  </p>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-auto scrollbar-premium">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedRecords.length === filteredRecords.length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRecords(filteredRecords.map(r => r.id));
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
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRecords.includes(record.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedRecords([...selectedRecords, record.id]);
                                } else {
                                  setSelectedRecords(selectedRecords.filter(id => id !== record.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{record.employee_name}</div>
                              <div className="text-sm text-muted-foreground">{record.employee_email}</div>
                              <div className="text-xs text-muted-foreground">{record.department}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {CONSENT_TYPES.find(t => t.id === record.consent_type)?.name || record.consent_type}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {record.purpose_achieved && <Badge variant="outline" className="text-xs">Purpose Achieved</Badge>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>{getLegalBasisBadge(record.legal_basis)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(record.consent_date)}
                              {record.link_sent_date && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  Link sent: {formatDate(record.link_sent_date)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(record.expiry_date)}
                              {record.withdrawal_date && (
                                <div className="text-xs text-red-600">
                                  Withdrawn: {formatDate(record.withdrawal_date)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedConsent(record);
                                  setIsViewConsentDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {record.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    console.log('Mock: Resend consent link to', record.employee_email);
                                  }}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
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

          {/* View Consent Dialog */}
          <Dialog open={isViewConsentDialogOpen} onOpenChange={setIsViewConsentDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Consent Details</DialogTitle>
                <DialogDescription>
                  Detailed information about consent record
                </DialogDescription>
              </DialogHeader>
              
              {selectedConsent && (
                <div className="grid grid-cols-1 gap-6 py-4 max-h-[60vh] overflow-y-auto">
                  {/* Employee Information */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Employee Information
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium ml-2">{selectedConsent.employee_name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium ml-2">{selectedConsent.employee_email}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Employee ID:</span>
                        <span className="font-medium ml-2">{selectedConsent.employee_id}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Department:</span>
                        <span className="font-medium ml-2">{selectedConsent.department}</span>
                      </div>
                    </div>
                  </div>

                  {/* Consent Information */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Consent Information
                    </h3>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Consent Type:</span>
                        <span className="font-medium ml-2">
                          {CONSENT_TYPES.find(t => t.id === selectedConsent.consent_type)?.name || selectedConsent.consent_type}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Purpose:</span>
                        <div className="mt-1 p-2 bg-muted rounded text-sm">{selectedConsent.purpose}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className="mt-1">{getStatusBadge(selectedConsent.status)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Legal Basis:</span>
                          <div className="mt-1">{getLegalBasisBadge(selectedConsent.legal_basis)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Timeline
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Link Sent:</span>
                        <span className="font-medium ml-2">{formatDate(selectedConsent.link_sent_date)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Link Opened:</span>
                        <span className="font-medium ml-2">{selectedConsent.link_opened ? 'Yes' : 'No'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Consent Given:</span>
                        <span className="font-medium ml-2">{formatDate(selectedConsent.consent_date)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>
                        <span className="font-medium ml-2">{formatDate(selectedConsent.expiry_date)}</span>
                      </div>
                      {selectedConsent.withdrawal_date && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Withdrawn:</span>
                          <span className="font-medium ml-2 text-red-600">{formatDate(selectedConsent.withdrawal_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* POPIA Compliance */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      POPIA Compliance
                    </h3>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Purpose Achieved:</span>
                        <span className="font-medium ml-2">{selectedConsent.purpose_achieved ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="text-blue-800 font-medium mb-1">Data Processing Rights</div>
                        <div className="text-blue-700 text-xs">
                          Employee has the right to withdraw consent at any time. Upon withdrawal, 
                          processing will cease except where required by statutory obligations.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function CompliancePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent>
            <PageLoading 
              text="Initializing Compliance System" 
              subtitle="Setting up POPIA-compliant consent management..."
            />
          </CardContent>
        </Card>
      </div>
    }>
      <CompliancePageContent />
    </Suspense>
  );
}
