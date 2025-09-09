'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  loadTreatmentPlanIndex,
  loadFullTreatmentPlan,
  hasTreatmentPlan,
  debugEmployeeIdMatching,
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
  Target,
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

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Clinical: 'bg-red-100 text-red-800 border-red-200',
    "Men's Health": 'bg-blue-100 text-blue-800 border-blue-200',
    "Women's Health": 'bg-pink-100 text-pink-800 border-pink-200',
    Lifestyle: 'bg-green-100 text-green-800 border-green-200',
    Supplements: 'bg-orange-100 text-orange-800 border-orange-200',
    Screening: 'bg-purple-100 text-purple-800 border-purple-200',
    Monitoring: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    Referral: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Follow-up': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };
  return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <CheckCircle className='h-4 w-4 text-green-600' />;
    case 'planned':
      return <Clock className='h-4 w-4 text-blue-600' />;
    case 'ongoing':
      return <Activity className='h-4 w-4 text-orange-600' />;
    default:
      return <Circle className='h-4 w-4 text-gray-400' />;
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString || dateString === 'Not specified') return 'Not specified';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// Filter actions based on employee gender
const filterActionsByGender = (
  actions: TreatmentAction[],
  gender?: string
): TreatmentAction[] => {
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

export default function EmployeeTreatmentPlans({
  employeeId,
  employee,
}: EmployeeTreatmentPlansProps) {
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(
    new Set()
  );

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
          console.log(
            `🔍 Filtering treatment plan for ${employee.gender} employee:`,
            {
              originalActions: plan.total_actions,
              employeeGender: employee.gender,
            }
          );

          const filteredPlan = {
            ...plan,
            treatment_timeline: plan.treatment_timeline.map(report => {
              const originalActions = report.actions.length;
              const filteredActions = filterActionsByGender(
                report.actions,
                employee.gender
              );

              if (originalActions !== filteredActions.length) {
                console.log(
                  `📋 Report ${report.report_id}: Filtered ${originalActions} → ${filteredActions.length} actions`
                );
              }

              return {
                ...report,
                actions: filteredActions,
              };
            }),
          };

          // Recalculate total actions based on filtered actions
          const totalFilteredActions = filteredPlan.treatment_timeline.reduce(
            (sum, report) => sum + report.actions.length,
            0
          );

          filteredPlan.total_actions = totalFilteredActions;

          console.log(
            `✅ Gender filtering complete: ${plan.total_actions} → ${totalFilteredActions} actions`
          );
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
  }, [employeeId, employee?.gender]);

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
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-5 w-5' />
          <Skeleton className='h-5 w-32' />
        </div>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-20 w-full' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200'>
        <AlertCircle className='h-4 w-4 text-red-600' />
        <span className='text-sm text-red-700'>{error}</span>
      </div>
    );
  }

  if (!treatmentPlan) {
    return (
      <div className='text-center py-6 space-y-3'>
        <div className='flex justify-center'>
          <div className='rounded-full bg-gray-100 p-3'>
            <FileText className='h-6 w-6 text-gray-400' />
          </div>
        </div>
        <div>
          <h3 className='font-medium text-gray-900'>No Treatment Plans</h3>
          <p className='text-sm text-gray-500 mt-1'>
            No treatment plans are available for this employee.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center gap-2'>
        <Heart className='h-5 w-5 text-primary' />
        <h3 className='font-semibold text-lg'>Treatment Plans</h3>
        <Badge variant='secondary' className='ml-auto'>
          {treatmentPlan.total_reports}{' '}
          {treatmentPlan.total_reports === 1 ? 'Report' : 'Reports'}
        </Badge>
      </div>

      {/* Summary */}
      <div className='grid grid-cols-2 gap-4 text-sm'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <Target className='h-4 w-4 text-gray-400' />
            <span className='text-gray-600'>Total Actions:</span>
            <Badge variant='outline'>{treatmentPlan.total_actions}</Badge>
          </div>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-gray-400' />
            <span className='text-gray-600'>Last Updated:</span>
            <span className='text-gray-900'>
              {formatDate(treatmentPlan.generated_at)}
            </span>
          </div>
        </div>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <User className='h-4 w-4 text-gray-400' />
            <span className='text-gray-600'>Doctors:</span>
            <span className='text-gray-900'>
              {treatmentPlan.medical_staff.doctors.length}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <User className='h-4 w-4 text-gray-400' />
            <span className='text-gray-600'>Nurses:</span>
            <span className='text-gray-900'>
              {treatmentPlan.medical_staff.nurses.length}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Treatment Timeline */}
      <div className='max-h-[600px] overflow-y-auto space-y-4'>
        {treatmentPlan.treatment_timeline.map((report, index) => {
          const isExpanded = expandedReports.has(report.report_id);

          return (
            <Card
              key={report.report_id}
              className='border-l-4 border-l-primary/20'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <CardTitle className='text-base flex items-center gap-2'>
                      <Calendar className='h-4 w-4' />
                      Report Date: {formatDate(report.report_date)}
                    </CardTitle>
                    <CardDescription className='flex items-center gap-4'>
                      {report.doctor && report.doctor !== 'Not specified' && (
                        <span>Dr. {report.doctor}</span>
                      )}
                      {report.nurse && report.nurse !== 'Not specified' && (
                        <span>• Nurse: {report.nurse}</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline'>
                      {report.actions.length}{' '}
                      {report.actions.length === 1 ? 'Action' : 'Actions'}
                    </Badge>
                    {report.actions.length > 0 && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => toggleReportExpansion(report.report_id)}
                        className='p-1 h-8 w-8'
                      >
                        {isExpanded ? (
                          <ChevronUp className='h-4 w-4' />
                        ) : (
                          <ChevronDown className='h-4 w-4' />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Actions */}
              {report.actions.length > 0 && (
                <CardContent
                  className={`pt-0 ${isExpanded ? 'block' : 'hidden'}`}
                >
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                    {report.actions.map((action, actionIndex) => (
                      <div
                        key={`${report.report_id}-${actionIndex}`}
                        className='flex gap-3 p-3 rounded-lg bg-gray-50/50 border'
                      >
                        <div className='flex-shrink-0 mt-0.5'>
                          {getStatusIcon(action.status)}
                        </div>
                        <div className='flex-1 space-y-2'>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <Badge
                              className={getCategoryColor(action.category)}
                              variant='outline'
                            >
                              {action.category}
                            </Badge>
                            {action.status &&
                              action.status !== 'Not specified' && (
                                <Badge variant='secondary' className='text-xs'>
                                  {action.status}
                                </Badge>
                              )}
                          </div>
                          <p className='text-sm text-gray-700 leading-relaxed'>
                            {action.recommendation}
                          </p>
                          {action.source_field && (
                            <p className='text-xs text-gray-500'>
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
                <CardContent className='pt-0'>
                  <div className='text-sm text-gray-500 text-center py-2'>
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
