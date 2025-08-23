'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  FileText,
  User,
  Heart,
  Shield,
  Pill,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  X,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

interface MedicalHistory {
  id: string;
  date_created: string;
  date_updated: string;
  user_created: string | null;
  user_updated: string | null;
  employee_id: string;
  conditions_header: string | null;
  hiv: string | null;
  high_blood_pressure: boolean;
  high_cholesterol: boolean;
  diabetes: boolean;
  thyroid_disease: boolean;
  asthma: boolean;
  epilepsy: boolean;
  bipolar_mood_disorder: boolean;
  anxiety_or_depression: boolean;
  inflammatory_bowel_disease: boolean;
  tb: boolean;
  hepatitis: boolean;
  other: string | null;
  notes: string | null;
  disability_header: string | null;
  disability: boolean;
  disability_type: string | null;
  disabilty_desription: string | null;
  allergies_header: string | null;
  medication: boolean;
  medication_type: string | null;
  medication_severity: string | null;
  environmental: boolean;
  environmental_type: string | null;
  enviromental_severity: string | null;
  food: boolean;
  food_type: string | null;
  food_severity: string | null;
  on_medication: boolean;
  chronic_medication: string | null;
  vitamins_or_supplements: string | null;
  family_history_header: string | null;
  family_conditions: string | null;
  heart_attack: boolean;
  heart_attack_60: string | null;
  cancer_family: boolean;
  type_cancer: string | null;
  age_of_cancer: string | null;
  family_members: string | null;
  other_family: string | null;
  surgery_header: string | null;
  surgery: boolean;
  surgery_type: string | null;
  surgery_year: string | null;
  notes_header: string | null;
  notes_text: string | null;
  recommendation_text: string | null;
  employee_name?: string;
  created_by_name?: string;
  updated_by_name?: string;
}

interface Employee {
  id: string;
  name: string;
  surname: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function MedicalHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get filter parameters from URL
  const employeeFilter = searchParams.get('employee');
  const employeeName = searchParams.get('employeeName');
  const returnUrl = searchParams.get('returnUrl');
  
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
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
  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState<MedicalHistory | null>(null);
  const [formData, setFormData] = useState<Partial<MedicalHistory>>({});
  const [submitting, setSubmitting] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(60);
  const [isResizing, setIsResizing] = useState(false);

  const fetchMedicalHistories = async (page = 1, search = '') => {
    try {
      setLoading(true);
      let url = `/api/medical-history?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(search)}`;
      
      if (employeeFilter) {
        url += `&employee=${encodeURIComponent(employeeFilter)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch medical histories');
      
      const data = await response.json();
      setMedicalHistories(data.medicalHistories);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching medical histories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch employees');
      
      const data = await response.json();
      setEmployees(data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchMedicalHistories();
    fetchEmployees();
  }, [employeeFilter]);

  const handleSearch = () => {
    fetchMedicalHistories(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchMedicalHistories(newPage, searchTerm);
  };

  const handleCreateMedicalHistory = async () => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/medical-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_created: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to create medical history');

      setIsCreateDialogOpen(false);
      setFormData({});
      fetchMedicalHistories(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error creating medical history:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMedicalHistory = async () => {
    if (!selectedMedicalHistory) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/medical-history/${selectedMedicalHistory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_updated: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to update medical history');

      setIsEditDialogOpen(false);
      setFormData({});
      setSelectedMedicalHistory(null);
      fetchMedicalHistories(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error updating medical history:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMedicalHistory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medical history?')) return;

    try {
      const response = await fetch(`/api/medical-history/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete medical history');

      fetchMedicalHistories(pagination.page, searchTerm);
      if (selectedMedicalHistory?.id === id) {
        setSelectedMedicalHistory(null);
      }
    } catch (error) {
      console.error('Error deleting medical history:', error);
    }
  };

  const openEditDialog = (medicalHistory: MedicalHistory) => {
    setFormData(medicalHistory);
    setSelectedMedicalHistory(medicalHistory);
    setIsEditDialogOpen(true);
  };

  const handleMedicalHistoryClick = (medicalHistory: MedicalHistory) => {
    setSelectedMedicalHistory(medicalHistory);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getConditionsBadges = (medicalHistory: MedicalHistory) => {
    const conditions = [];
    if (medicalHistory.high_blood_pressure) conditions.push('High BP');
    if (medicalHistory.diabetes) conditions.push('Diabetes');
    if (medicalHistory.asthma) conditions.push('Asthma');
    if (medicalHistory.anxiety_or_depression) conditions.push('Anxiety/Depression');
    if (medicalHistory.tb) conditions.push('TB');
    return conditions.slice(0, 3); // Show only first 3
  };

  // Resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const container = document.querySelector('.medical-history-container');
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
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
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[600px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[10vw] py-6 max-w-full overflow-hidden">
        {/* Back Button and Filters */}
        {(returnUrl || employeeFilter) && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {returnUrl && (
                <Button
                  variant="outline"
                  onClick={() => router.push(returnUrl)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              
              {employeeFilter && employeeName && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <User className="h-3 w-3 mr-1" />
                    Filtered by: {decodeURIComponent(employeeName)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete('employee');
                      params.delete('employeeName');
                      router.push(`/medical-history?${params.toString()}`);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medical History</h1>
            <p className="text-muted-foreground">
              Manage employee medical history records
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="hover-lift">
                <Plus className="h-4 w-4 mr-2" />
                Add Medical History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Medical History</DialogTitle>
                <DialogDescription>
                  Add a new medical history record
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="conditions" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="conditions">Conditions</TabsTrigger>
                  <TabsTrigger value="allergies">Allergies</TabsTrigger>
                  <TabsTrigger value="medications">Medications</TabsTrigger>
                  <TabsTrigger value="family">Family History</TabsTrigger>
                  <TabsTrigger value="surgery">Surgery</TabsTrigger>
                </TabsList>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_id">Employee</Label>
                    <Select
                      value={formData.employee_id || ''}
                      onValueChange={(value) => setFormData({...formData, employee_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} {employee.surname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <TabsContent value="conditions" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="high_blood_pressure"
                        checked={formData.high_blood_pressure || false}
                        onChange={(e) => setFormData({...formData, high_blood_pressure: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="high_blood_pressure">High Blood Pressure</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="diabetes"
                        checked={formData.diabetes || false}
                        onChange={(e) => setFormData({...formData, diabetes: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="diabetes">Diabetes</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="asthma"
                        checked={formData.asthma || false}
                        onChange={(e) => setFormData({...formData, asthma: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="asthma">Asthma</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="anxiety_or_depression"
                        checked={formData.anxiety_or_depression || false}
                        onChange={(e) => setFormData({...formData, anxiety_or_depression: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="anxiety_or_depression">Anxiety/Depression</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes_text">Notes</Label>
                    <Textarea
                      id="notes_text"
                      value={formData.notes_text || ''}
                      onChange={(e) => setFormData({...formData, notes_text: e.target.value})}
                      placeholder="Additional notes about conditions"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="allergies" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="medication_allergy"
                        checked={formData.medication || false}
                        onChange={(e) => setFormData({...formData, medication: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="medication_allergy">Medication Allergies</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="food_allergy"
                        checked={formData.food || false}
                        onChange={(e) => setFormData({...formData, food: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="food_allergy">Food Allergies</Label>
                    </div>
                  </div>
                  
                  {formData.medication && (
                    <div className="space-y-2">
                      <Label htmlFor="medication_type">Medication Type</Label>
                      <Input
                        id="medication_type"
                        value={formData.medication_type || ''}
                        onChange={(e) => setFormData({...formData, medication_type: e.target.value})}
                        placeholder="Specify medication allergens"
                      />
                    </div>
                  )}
                  
                  {formData.food && (
                    <div className="space-y-2">
                      <Label htmlFor="food_type">Food Type</Label>
                      <Input
                        id="food_type"
                        value={formData.food_type || ''}
                        onChange={(e) => setFormData({...formData, food_type: e.target.value})}
                        placeholder="Specify food allergens"
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="medications" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="on_medication"
                      checked={formData.on_medication || false}
                      onChange={(e) => setFormData({...formData, on_medication: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="on_medication">Currently on Medication</Label>
                  </div>
                  
                  {formData.on_medication && (
                    <div className="space-y-2">
                      <Label htmlFor="chronic_medication">Chronic Medication</Label>
                      <Input
                        id="chronic_medication"
                        value={formData.chronic_medication || ''}
                        onChange={(e) => setFormData({...formData, chronic_medication: e.target.value})}
                        placeholder="List chronic medications"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="vitamins_or_supplements">Vitamins/Supplements</Label>
                    <Input
                      id="vitamins_or_supplements"
                      value={formData.vitamins_or_supplements || ''}
                      onChange={(e) => setFormData({...formData, vitamins_or_supplements: e.target.value})}
                      placeholder="List vitamins and supplements"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="family" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="heart_attack"
                        checked={formData.heart_attack || false}
                        onChange={(e) => setFormData({...formData, heart_attack: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="heart_attack">Family Heart Attack History</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="cancer_family"
                        checked={formData.cancer_family || false}
                        onChange={(e) => setFormData({...formData, cancer_family: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="cancer_family">Family Cancer History</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="family_conditions">Family Conditions</Label>
                    <Textarea
                      id="family_conditions"
                      value={formData.family_conditions || ''}
                      onChange={(e) => setFormData({...formData, family_conditions: e.target.value})}
                      placeholder="Describe family medical history"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="surgery" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="surgery"
                      checked={formData.surgery || false}
                      onChange={(e) => setFormData({...formData, surgery: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="surgery">Previous Surgery</Label>
                  </div>
                  
                  {formData.surgery && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="surgery_type">Surgery Type</Label>
                        <Input
                          id="surgery_type"
                          value={formData.surgery_type || ''}
                          onChange={(e) => setFormData({...formData, surgery_type: e.target.value})}
                          placeholder="Type of surgery"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="surgery_year">Surgery Year</Label>
                        <Input
                          id="surgery_year"
                          value={formData.surgery_year || ''}
                          onChange={(e) => setFormData({...formData, surgery_year: e.target.value})}
                          placeholder="Year of surgery"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="recommendation_text">Recommendations</Label>
                    <Textarea
                      id="recommendation_text"
                      value={formData.recommendation_text || ''}
                      onChange={(e) => setFormData({...formData, recommendation_text: e.target.value})}
                      placeholder="Medical recommendations"
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setFormData({});
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateMedicalHistory} disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Medical History
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="medical-history-container flex gap-1 min-h-[600px]">
          {/* Left Panel - Medical History Table */}
          <div 
            className="space-y-4"
            style={{ width: selectedMedicalHistory ? `${leftPanelWidth}%` : '100%' }}
          >
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pagination.total}</div>
                  <p className="text-xs text-muted-foreground">
                    Medical history records
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High BP Cases</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {medicalHistories.filter(mh => mh.high_blood_pressure).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    High blood pressure cases
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Diabetes Cases</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {medicalHistories.filter(mh => mh.diabetes).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Diabetes cases
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On Medication</CardTitle>
                  <Pill className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {medicalHistories.filter(mh => mh.on_medication).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently on medication
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by employee name or notes..."
                      className="pl-9"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} className="hover-lift">
                    Search
                  </Button>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        fetchMedicalHistories(1, '');
                      }}
                      className="hover-lift"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Medical History Table */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileText className="h-6 w-6" />
                  Medical History ({pagination.total})
                </CardTitle>
                <CardDescription>
                  Employee medical history records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {medicalHistories.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No medical history found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'No medical history records available.'}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-auto scrollbar-premium">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Conditions</TableHead>
                          <TableHead>Medications</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medicalHistories.map((medicalHistory) => (
                          <TableRow 
                            key={medicalHistory.id} 
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedMedicalHistory?.id === medicalHistory.id ? 'bg-muted border-l-4 border-l-primary' : ''
                            }`}
                            onClick={() => handleMedicalHistoryClick(medicalHistory)}
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {medicalHistory.employee_name || 'Unknown Employee'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {medicalHistory.id.substring(0, 8)}...
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {getConditionsBadges(medicalHistory).map((condition, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {condition}
                                  </Badge>
                                ))}
                                {getConditionsBadges(medicalHistory).length === 0 && (
                                  <span className="text-sm text-muted-foreground">None</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {medicalHistory.on_medication ? (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                  On Medication
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">None</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(medicalHistory.date_updated)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditDialog(medicalHistory);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMedicalHistory(medicalHistory.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
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
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.page === 1}
                        className="hover-lift"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                        First
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPreviousPage}
                        className="hover-lift"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const startPage = Math.max(1, pagination.page - 2);
                          const page = startPage + i;
                          if (page > pagination.totalPages) return null;
                          
                          return (
                            <Button
                              key={`medical-history-page-${page}`}
                              variant={page === pagination.page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="hover-lift min-w-[40px]"
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="hover-lift"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages}
                        className="hover-lift"
                      >
                        Last
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resize Handle */}
          {selectedMedicalHistory && (
            <div 
              className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0"
              onMouseDown={handleMouseDown}
              style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
            />
          )}

          {/* Right Panel - Medical History Details */}
          {selectedMedicalHistory && (
            <div 
              className="space-y-4 animate-slide-up"
              style={{ width: `${100 - leftPanelWidth}%` }}
            >
              <Card className="glass-effect">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl medical-heading">
                        {selectedMedicalHistory.employee_name || 'Unknown Employee'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="outline">
                          Updated: {formatDate(selectedMedicalHistory.date_updated)}
                        </Badge>
                        {selectedMedicalHistory.on_medication && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            On Medication
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMedicalHistory(null)}
                      className="hover-lift"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium">
                  {/* Medical Conditions */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Medical Conditions
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedMedicalHistory.high_blood_pressure ? 'bg-red-500' : 'bg-gray-300'}`} />
                        <span>High Blood Pressure</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedMedicalHistory.diabetes ? 'bg-red-500' : 'bg-gray-300'}`} />
                        <span>Diabetes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedMedicalHistory.asthma ? 'bg-red-500' : 'bg-gray-300'}`} />
                        <span>Asthma</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedMedicalHistory.anxiety_or_depression ? 'bg-red-500' : 'bg-gray-300'}`} />
                        <span>Anxiety/Depression</span>
                      </div>
                    </div>
                    {selectedMedicalHistory.notes_text && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">{selectedMedicalHistory.notes_text}</p>
                      </div>
                    )}
                  </div>

                  {/* Medications */}
                  {selectedMedicalHistory.on_medication && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Current Medications
                      </h3>
                      <div className="text-sm space-y-2">
                        {selectedMedicalHistory.chronic_medication && (
                          <div>
                            <span className="font-medium">Chronic Medication: </span>
                            <span>{selectedMedicalHistory.chronic_medication}</span>
                          </div>
                        )}
                        {selectedMedicalHistory.vitamins_or_supplements && (
                          <div>
                            <span className="font-medium">Supplements: </span>
                            <span>{selectedMedicalHistory.vitamins_or_supplements}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Allergies */}
                  {(selectedMedicalHistory.medication || selectedMedicalHistory.food) && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Allergies
                      </h3>
                      <div className="text-sm space-y-2">
                        {selectedMedicalHistory.medication && selectedMedicalHistory.medication_type && (
                          <div>
                            <span className="font-medium">Medication: </span>
                            <span>{selectedMedicalHistory.medication_type}</span>
                          </div>
                        )}
                        {selectedMedicalHistory.food && selectedMedicalHistory.food_type && (
                          <div>
                            <span className="font-medium">Food: </span>
                            <span>{selectedMedicalHistory.food_type}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Family History */}
                  {selectedMedicalHistory.family_conditions && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        Family History
                      </h3>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">{selectedMedicalHistory.family_conditions}</p>
                      </div>
                    </div>
                  )}

                  {/* Surgery History */}
                  {selectedMedicalHistory.surgery && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        Surgery History
                      </h3>
                      <div className="text-sm space-y-2">
                        {selectedMedicalHistory.surgery_type && (
                          <div>
                            <span className="font-medium">Type: </span>
                            <span>{selectedMedicalHistory.surgery_type}</span>
                          </div>
                        )}
                        {selectedMedicalHistory.surgery_year && (
                          <div>
                            <span className="font-medium">Year: </span>
                            <span>{selectedMedicalHistory.surgery_year}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {selectedMedicalHistory.recommendation_text && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        Recommendations
                      </h3>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">{selectedMedicalHistory.recommendation_text}</p>
                      </div>
                    </div>
                  )}

                  {/* System Information */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Record Information
                    </h3>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-[120px]">Created:</span>
                        <span className="font-medium">{formatDate(selectedMedicalHistory.date_created)}</span>
                      </div>
                      {selectedMedicalHistory.created_by_name && (
                        <div className="flex gap-2">
                          <span className="text-muted-foreground min-w-[120px]">Created By:</span>
                          <span className="font-medium">{selectedMedicalHistory.created_by_name}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-[120px]">Last Updated:</span>
                        <span className="font-medium">{formatDate(selectedMedicalHistory.date_updated)}</span>
                      </div>
                      {selectedMedicalHistory.updated_by_name && (
                        <div className="flex gap-2">
                          <span className="text-muted-foreground min-w-[120px]">Updated By:</span>
                          <span className="font-medium">{selectedMedicalHistory.updated_by_name}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-[120px]">Record ID:</span>
                        <span className="font-mono text-xs">{selectedMedicalHistory.id}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Edit Dialog - Similar structure to Create Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Medical History</DialogTitle>
              <DialogDescription>
                Update medical history information
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="conditions" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="conditions">Conditions</TabsTrigger>
                <TabsTrigger value="allergies">Allergies</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="family">Family History</TabsTrigger>
                <TabsTrigger value="surgery">Surgery</TabsTrigger>
              </TabsList>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_employee_id">Employee</Label>
                  <Select
                    value={formData.employee_id || ''}
                    onValueChange={(value) => setFormData({...formData, employee_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} {employee.surname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="conditions" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit_high_blood_pressure"
                      checked={formData.high_blood_pressure || false}
                      onChange={(e) => setFormData({...formData, high_blood_pressure: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit_high_blood_pressure">High Blood Pressure</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit_diabetes"
                      checked={formData.diabetes || false}
                      onChange={(e) => setFormData({...formData, diabetes: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit_diabetes">Diabetes</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit_asthma"
                      checked={formData.asthma || false}
                      onChange={(e) => setFormData({...formData, asthma: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit_asthma">Asthma</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit_anxiety_or_depression"
                      checked={formData.anxiety_or_depression || false}
                      onChange={(e) => setFormData({...formData, anxiety_or_depression: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit_anxiety_or_depression">Anxiety/Depression</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_notes_text">Notes</Label>
                  <Textarea
                    id="edit_notes_text"
                    value={formData.notes_text || ''}
                    onChange={(e) => setFormData({...formData, notes_text: e.target.value})}
                    placeholder="Additional notes about conditions"
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* Similar content for other tabs... */}

            </Tabs>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditMedicalHistory} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Medical History
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}