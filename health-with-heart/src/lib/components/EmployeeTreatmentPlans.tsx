'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  loadTreatmentPlanIndex, 
  loadFullTreatmentPlan, 
  hasTreatmentPlan,
  debugEmployeeIdMatching 
} from '@/utils/treatmentPlanUtils';
import { 
  Heart,
  Calendar,
  User,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Clock,
  CheckCircle,
  Circle,
  Target
} from 'lucide-react';

interface TreatmentAction {
  category: string;
  recommendation: string;
  status: string;
  source_field: string;
}

interface TreatmentReport {
  date: string;
  report_id: string;
  report_date: string;
  doctor: string;
  nurse: string;
  employee_name: string;
  actions: TreatmentAction[];
}

interface TreatmentPlan {
  employee_id: string;
  employee_name: string;
  treatment_timeline: TreatmentReport[];
  generated_at: string;
  total_reports: number;
  total_actions: number;
  medical_staff: {
    doctors: string[];
    nurses: string[];
  };
}

interface EmployeeTreatmentPlansProps {
  employeeId: string;
  employee?: {
    gender?: string;
  };
}

const getCategoryColor = (category: string): { backgroundColor: string; color: string; borderColor: string } => {
  const colors: Record<string, { backgroundColor: string; color: string; borderColor: string }> = {
    'Clinical': { backgroundColor: '#F5D8DC', color: '#D65241', borderColor: '#EDBABE' }, // Lily/Sunset - medical/urgent
    'Men\'s Health': { backgroundColor: '#B6D9CE', color: '#178089', borderColor: '#56969D' }, // Duck Egg/Teal - male health
    'Women\'s Health': { backgroundColor: '#F5D8DC', color: '#E19985', borderColor: '#EDBABE' }, // Lily/Coral - female health
    'Lifestyle': { backgroundColor: '#EADC99', color: '#759282', borderColor: '#EAB75C' }, // Warm Light/Fern - lifestyle changes
    'Supplements': { backgroundColor: '#B4CABC', color: '#586D6A', borderColor: '#759282' }, // Sage/Forest - supplements/nutrition
    'Screening': { backgroundColor: '#B6D9CE', color: '#56969D', borderColor: '#178089' }, // Duck Egg/Soft Teal - preventive screening
    'Monitoring': { backgroundColor: '#EADC99', color: '#EAB75C', borderColor: '#D65241' }, // Warm Light/Daisy - ongoing monitoring
    'Referral': { backgroundColor: '#F5D8DC', color: '#D65241', borderColor: '#E19985' }, // Lily/Sunset - urgent referrals
    'Follow-up': { backgroundColor: '#B4CABC', color: '#759282', borderColor: '#586D6A' }, // Sage/Fern - routine follow-up
  };
  return colors[category] || { backgroundColor: '#E6DDD6', color: '#759282', borderColor: '#D7D9D9' };
};

const getStatusIcon = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'completed':
      return <CheckCircle className="h-4 w-4" style={{ color: '#B4CABC', fill: 'currentColor' }} />; // Sage - success/completed (green)
    case 'planned':
      return <Clock className="h-4 w-4" style={{ color: '#178089', fill: 'currentColor' }} />; // Teal - planned/future (dark blue)
    case 'ongoing':
      return <Activity className="h-4 w-4" style={{ color: '#D65241', fill: 'currentColor' }} />; // Sunset - active/ongoing (red)
    default:
      return <Circle className="h-4 w-4" style={{ color: '#759282', fill: 'currentColor' }} />; // Fern - neutral/default (grey-green)
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString || dateString === 'Not specified') return 'Not specified';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Filter actions based on employee gender
const filterActionsByGender = (actions: TreatmentAction[], gender?: string): TreatmentAction[] => {
  if (!gender) return actions; // If no gender info, show all actions
  
  const genderLower = gender.toLowerCase();
  const isMale = genderLower === 'male' || genderLower === 'm';
  const isFemale = genderLower === 'female' || genderLower === 'f';
  
  return actions.filter(action => {
    const category = action.category.toLowerCase();
    
    // Filter out gender-specific recommendations for wrong gender
    if (category === "women's health" && !isFemale) {
      return false;
    }
    if (category === "men's health" && !isMale) {
      return false;
    }
    
    return true;
  });
};

export default function EmployeeTreatmentPlans({ employeeId, employee }: EmployeeTreatmentPlansProps) {
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchTreatmentPlan() {
      setLoading(true);
      setError(null);

      try {
        // Debug employee ID matching
        if (process.env.NODE_ENV === 'development') {
          debugEmployeeIdMatching(employeeId);
        }

        // Check if treatment plan exists using utility
        const exists = await hasTreatmentPlan(employeeId);
        if (!exists) {
          setTreatmentPlan(null);
          return;
        }

        // Load the full treatment plan using utility
        const plan = await loadFullTreatmentPlan(employeeId);
        if (!plan) {
          setError('Failed to load treatment plan details');
          return;
        }

        // Filter the treatment plan based on gender
        if (plan && employee?.gender) {
          console.log(`🔍 Filtering treatment plan for ${employee.gender} employee:`, {
            originalActions: plan.total_actions,
            employeeGender: employee.gender
          });
          
          const filteredPlan = {
            ...plan,
            treatment_timeline: plan.treatment_timeline.map((report: any) => {
              const originalActions = report.actions.length;
              const filteredActions = filterActionsByGender(report.actions, employee.gender);
              
              if (originalActions !== filteredActions.length) {
                console.log(`📋 Report ${report.report_id}: Filtered ${originalActions} → ${filteredActions.length} actions`);
              }
              
              return {
                ...report,
                actions: filteredActions
              };
            })
          };
          
          // Recalculate total actions based on filtered actions
          const totalFilteredActions = filteredPlan.treatment_timeline.reduce(
            (sum: number, report: any) => sum + report.actions.length, 
            0
          );
          
          filteredPlan.total_actions = totalFilteredActions;
          
          console.log(`✅ Gender filtering complete: ${plan.total_actions} → ${totalFilteredActions} actions`);
          setTreatmentPlan(filteredPlan);
        } else {
          setTreatmentPlan(plan);
        }
      } catch (err) {
        setError('Error loading treatment plan');
        console.error('Treatment plan loading error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (employeeId) {
      fetchTreatmentPlan();
    }
  }, [employeeId]);

  const toggleReportExpansion = (reportId: string) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg" style={{ backgroundColor: '#F5D8DC', borderColor: '#EDBABE', border: '1px solid' }}>
        <AlertCircle className="h-4 w-4" style={{ color: '#D65241' }} />
        <span className="text-sm" style={{ color: '#D65241' }}>{error}</span>
      </div>
    );
  }

  if (!treatmentPlan) {
    return (
      <div className="text-center py-6 space-y-3">
        <div className="flex justify-center">
          <div className="rounded-full bg-gray-100 p-3">
            <FileText className="h-6 w-6" style={{ color: '#759282' }} />
          </div>
        </div>
        <div>
          <h3 className="font-medium" style={{ color: '#586D6A' }}>No Treatment Plans</h3>
          <p className="text-sm mt-1" style={{ color: '#759282' }}>
            No treatment plans are available for this employee.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Treatment Plans</h3>
        <Badge variant="secondary" className="ml-auto">
          {treatmentPlan.total_reports} {treatmentPlan.total_reports === 1 ? 'Report' : 'Reports'}
        </Badge>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" style={{ color: '#759282' }} />
            <span style={{ color: '#759282' }}>Total Actions:</span>
            <Badge variant="outline">{treatmentPlan.total_actions}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" style={{ color: '#759282' }} />
            <span style={{ color: '#759282' }}>Last Updated:</span>
            <span style={{ color: '#586D6A' }}>{formatDate(treatmentPlan.generated_at)}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" style={{ color: '#759282' }} />
            <span style={{ color: '#759282' }}>Doctors:</span>
            <span style={{ color: '#586D6A' }}>{treatmentPlan.medical_staff.doctors.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" style={{ color: '#759282' }} />
            <span style={{ color: '#759282' }}>Nurses:</span>
            <span style={{ color: '#586D6A' }}>{treatmentPlan.medical_staff.nurses.length}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Treatment Timeline */}
      <div className="max-h-[600px] overflow-y-auto space-y-4">
        {treatmentPlan.treatment_timeline.map((report, index) => {
            const isExpanded = expandedReports.has(report.report_id);
            
            return (
              <Card key={report.report_id} className="border-l-4 border-l-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Report Date: {formatDate(report.report_date)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        {report.doctor && report.doctor !== 'Not specified' && (
                          <span>Dr. {report.doctor}</span>
                        )}
                        {report.nurse && report.nurse !== 'Not specified' && (
                          <span>• Nurse: {report.nurse}</span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {report.actions.length} {report.actions.length === 1 ? 'Action' : 'Actions'}
                      </Badge>
                      {report.actions.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleReportExpansion(report.report_id)}
                          className="p-1 h-8 w-8"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Actions */}
                {report.actions.length > 0 && (
                  <CardContent className={`pt-0 ${isExpanded ? 'block' : 'hidden'}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {report.actions.map((action, actionIndex) => (
                        <div
                          key={`${report.report_id}-${actionIndex}`}
                          className="flex gap-3 p-3 rounded-lg border"
                          style={{ backgroundColor: '#F2EFED', borderColor: '#D7D9D9' }}
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" style={getCategoryColor(action.category)}>
                                {action.category}
                              </Badge>
                              {action.status && action.status !== 'Not specified' && (
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                  style={{
                                    backgroundColor: action.status.toLowerCase() === 'completed' ? '#B4CABC' :
                                                   action.status.toLowerCase() === 'planned' ? '#178089' :
                                                   action.status.toLowerCase() === 'ongoing' ? '#D65241' :
                                                   '#759282',
                                    color: action.status.toLowerCase() === 'completed' ? '#586D6A' :
                                          action.status.toLowerCase() === 'planned' ? '#FFFFFF' :
                                          action.status.toLowerCase() === 'ongoing' ? '#FFFFFF' :
                                          '#FFFFFF'
                                  }}
                                >
                                  {action.status}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: '#586D6A' }}>
                              {action.recommendation}
                            </p>
                            {action.source_field && (
                              <p className="text-xs" style={{ color: '#759282' }}>
                                Source: {action.source_field}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}

                {/* No actions message */}
                {report.actions.length === 0 && (
                  <CardContent className="pt-0">
                    <div className="text-sm text-center py-2" style={{ color: '#759282' }}>
                      No actionable recommendations in this report
                    </div>
                  </CardContent>
                )}
              </Card>
            );
        })}
      </div>

    </div>
  );
}