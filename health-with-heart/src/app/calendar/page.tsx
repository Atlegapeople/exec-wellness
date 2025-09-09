'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  FileText,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
  CalendarDays,
  BarChart3,
  Users,
  CheckCircle,
  AlertCircle,
  Eye,
  Grid3X3,
  List,
  X,
  ArrowLeft,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addYears,
  subYears,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { PageLoading } from '@/components/ui/loading';
import { useBreadcrumbBack } from '@/hooks/useBreadcrumbBack';

interface CalendarAppointment {
  id: string;
  title: string;
  type: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color: string;
  status: 'scheduled' | 'completed';
  employee_name: string;
  employee_surname: string;
  employee_email: string;
  employee_mobile: string;
  notes: string;
  report_id: string;
  start_time: string;
  end_time: string;
  created_by_name: string;
  updated_by_name: string;
}

interface CalendarStats {
  total: number;
  completed: number;
  scheduled: number;
  uniqueEmployees: number;
  appointmentTypes: number;
}

type CalendarView = 'month' | 'week' | 'day' | 'year';

function CalendarPageContent() {
  const goBack = useBreadcrumbBack();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [stats, setStats] = useState<CalendarStats>({
    total: 0,
    completed: 0,
    scheduled: 0,
    uniqueEmployees: 0,
    appointmentTypes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<CalendarAppointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Calculate date range based on current view
  const getDateRange = useCallback((date: Date, viewType: CalendarView) => {
    switch (viewType) {
      case 'day':
        return {
          start: format(startOfDay(date), 'yyyy-MM-dd'),
          end: format(endOfDay(date), 'yyyy-MM-dd'),
        };
      case 'week':
        return {
          start: format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
          end: format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        };
      case 'month':
        return {
          start: format(
            startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
            'yyyy-MM-dd'
          ),
          end: format(
            endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
            'yyyy-MM-dd'
          ),
        };
      case 'year':
        return {
          start: format(startOfYear(date), 'yyyy-MM-dd'),
          end: format(endOfYear(date), 'yyyy-MM-dd'),
        };
      default:
        return {
          start: format(
            startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
            'yyyy-MM-dd'
          ),
          end: format(
            endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
            'yyyy-MM-dd'
          ),
        };
    }
  }, []);

  // Fetch appointments for the current view with smooth transitions
  const fetchAppointments = useCallback(
    async (isNavigation = false, date: Date, viewType: CalendarView) => {
      try {
        if (isNavigation) {
          setCalendarLoading(true);
          setIsTransitioning(true);
        } else {
          setLoading(true);
        }

        const dateRange = getDateRange(date, viewType);

        const url = new URL(
          '/api/calendar/appointments',
          window.location.origin
        );
        url.searchParams.set('start', dateRange.start);
        url.searchParams.set('end', dateRange.end);
        url.searchParams.set('view', viewType);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (response.ok) {
          // Add a small delay for smooth transition effect
          if (isNavigation) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }

          setAppointments(
            data.appointments.map((apt: any) => ({
              ...apt,
              start: new Date(apt.start),
              end: new Date(apt.end),
            }))
          );
          setStats(data.stats);
        } else {
          console.error('Failed to fetch appointments:', data.error);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        if (isNavigation) {
          setCalendarLoading(false);
          setTimeout(() => setIsTransitioning(false), 100);
        } else {
          setLoading(false);
        }
      }
    },
    [getDateRange]
  );

  // Initial load only
  useEffect(() => {
    fetchAppointments(false, new Date(), 'month');
  }, [fetchAppointments]); // Only run on mount

  // Navigation functions with smooth transitions
  const navigatePrevious = async () => {
    let newDate;
    switch (view) {
      case 'day':
        newDate = addDays(currentDate, -1);
        break;
      case 'week':
        newDate = addWeeks(currentDate, -1);
        break;
      case 'month':
        newDate = addMonths(currentDate, -1);
        break;
      case 'year':
        newDate = addYears(currentDate, -1);
        break;
      default:
        return;
    }
    setCurrentDate(newDate);
    // Trigger smooth reload with new date
    fetchAppointments(true, newDate, view);
  };

  const navigateNext = async () => {
    let newDate;
    switch (view) {
      case 'day':
        newDate = addDays(currentDate, 1);
        break;
      case 'week':
        newDate = addWeeks(currentDate, 1);
        break;
      case 'month':
        newDate = addMonths(currentDate, 1);
        break;
      case 'year':
        newDate = addYears(currentDate, 1);
        break;
      default:
        return;
    }
    setCurrentDate(newDate);
    // Trigger smooth reload with new date
    fetchAppointments(true, newDate, view);
  };

  const navigateToday = () => {
    const today = new Date();
    setCurrentDate(today);
    fetchAppointments(true, today, view);
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.start), date));
  };

  // Get title for current view
  const getViewTitle = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  // Render month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    // Week header
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayAppointments = getAppointmentsForDate(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isDayToday = isToday(day);
        const dayDate = new Date(day);

        days.push(
          <div
            key={day.toString()}
            className={`
              min-h-[120px] border border-border p-2 cursor-pointer transition-colors
              ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
              ${isDayToday ? 'bg-primary/10 border-primary' : ''}
              hover:bg-muted/50
            `}
            onClick={() => setSelectedDate(dayDate)}
          >
            <div
              className={`text-sm font-medium mb-1 ${isDayToday ? 'text-primary' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {format(day, 'd')}
            </div>
            <div className='space-y-1'>
              {dayAppointments.slice(0, 3).map((apt, index) => (
                <div
                  key={apt.id}
                  className='text-xs p-1 rounded truncate cursor-pointer transition-opacity hover:opacity-80'
                  style={{
                    backgroundColor: apt.color + '20',
                    color: apt.color,
                    borderLeft: `3px solid ${apt.color}`,
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedAppointment(apt);
                  }}
                >
                  {apt.start_time} {apt.employee_name}
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div className='text-xs text-muted-foreground'>
                  +{dayAppointments.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className='grid grid-cols-7'>
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className='space-y-0'>
        {/* Week header */}
        <div className='grid grid-cols-7 border-b border-border'>
          {weekDays.map(weekDay => (
            <div
              key={weekDay}
              className='p-3 text-center font-medium text-muted-foreground bg-muted/30'
            >
              {weekDay}
            </div>
          ))}
        </div>
        {/* Calendar grid */}
        {rows}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className='flex flex-col'>
        {/* Week header */}
        <div className='grid grid-cols-8 border-b border-border'>
          <div className='p-3 text-center font-medium text-muted-foreground bg-muted/30'>
            Time
          </div>
          {weekDays.map(day => (
            <div
              key={day.toString()}
              className={`p-3 text-center font-medium ${isToday(day) ? 'bg-primary/10 text-primary' : 'bg-muted/30 text-muted-foreground'}`}
            >
              <div>{format(day, 'EEE')}</div>
              <div className='text-lg'>{format(day, 'd')}</div>
            </div>
          ))}
        </div>

        {/* Week grid */}
        <div className='max-h-[600px] overflow-y-auto'>
          {hours.map(hour => (
            <div
              key={hour}
              className='grid grid-cols-8 border-b border-border min-h-[60px]'
            >
              <div className='p-2 text-sm text-muted-foreground bg-muted/30 border-r border-border'>
                {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
              </div>
              {weekDays.map(day => {
                const dayAppointments = getAppointmentsForDate(day).filter(
                  apt => {
                    const aptHour = new Date(apt.start).getHours();
                    return aptHour === hour;
                  }
                );

                return (
                  <div
                    key={`${day}-${hour}`}
                    className='p-1 border-r border-border relative'
                  >
                    {dayAppointments.map(apt => (
                      <div
                        key={apt.id}
                        className='text-xs p-1 rounded mb-1 cursor-pointer transition-opacity hover:opacity-80'
                        style={{
                          backgroundColor: apt.color + '20',
                          color: apt.color,
                          borderLeft: `3px solid ${apt.color}`,
                        }}
                        onClick={() => setSelectedAppointment(apt)}
                      >
                        <div className='font-medium truncate'>
                          {apt.employee_name}
                        </div>
                        <div className='truncate'>{apt.type}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <div className='space-y-4'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold'>
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <p className='text-muted-foreground'>
            {dayAppointments.length} appointments
          </p>
        </div>

        <div className='max-h-[600px] overflow-y-auto border rounded-lg'>
          {hours.map(hour => {
            const hourAppointments = dayAppointments.filter(apt => {
              const aptHour = new Date(apt.start).getHours();
              return aptHour === hour;
            });

            return (
              <div
                key={hour}
                className='flex border-b border-border min-h-[60px]'
              >
                <div className='w-20 p-3 text-sm text-muted-foreground bg-muted/30 border-r border-border'>
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </div>
                <div className='flex-1 p-2'>
                  {hourAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className='p-3 rounded-lg mb-2 cursor-pointer transition-all hover:shadow-md'
                      style={{
                        backgroundColor: apt.color + '20',
                        borderLeft: `4px solid ${apt.color}`,
                      }}
                      onClick={() => setSelectedAppointment(apt)}
                    >
                      <div className='flex justify-between items-start'>
                        <div>
                          <div className='font-medium text-foreground'>
                            {apt.employee_name} {apt.employee_surname}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {apt.type}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {apt.start_time} - {apt.end_time}
                          </div>
                        </div>
                        <Badge
                          variant={
                            apt.status === 'completed' ? 'default' : 'secondary'
                          }
                        >
                          {apt.status === 'completed' ? (
                            <CheckCircle className='h-3 w-3 mr-1' />
                          ) : (
                            <AlertCircle className='h-3 w-3 mr-1' />
                          )}
                          {apt.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render year view
  const renderYearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(currentDate.getFullYear(), i, 1);
      const monthAppointments = appointments.filter(
        apt =>
          apt.start.getMonth() === i &&
          apt.start.getFullYear() === currentDate.getFullYear()
      );

      return {
        date: monthDate,
        appointments: monthAppointments,
        completed: monthAppointments.filter(apt => apt.status === 'completed')
          .length,
        scheduled: monthAppointments.filter(apt => apt.status === 'scheduled')
          .length,
      };
    });

    return (
      <div className='grid grid-cols-3 gap-4'>
        {months.map(month => (
          <Card
            key={month.date.getMonth()}
            className='cursor-pointer hover:shadow-md transition-shadow'
            onClick={() => {
              setCurrentDate(month.date);
              setView('month');
              fetchAppointments(true, month.date, 'month');
            }}
          >
            <CardHeader className='pb-2'>
              <CardTitle className='text-lg'>
                {format(month.date, 'MMMM')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='text-2xl font-bold'>
                {month.appointments.length}
              </div>
              <div className='text-sm text-muted-foreground'>
                Total Appointments
              </div>
              <div className='flex gap-2'>
                <Badge variant='default' className='text-xs'>
                  {month.completed} Completed
                </Badge>
                <Badge variant='secondary' className='text-xs'>
                  {month.scheduled} Scheduled
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
            <Card>
              <CardContent>
                <PageLoading
                  text='Loading Calendar'
                  subtitle='Fetching appointment schedule and calendar data...'
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
          {/* Back Button */}
          <div className='mb-6'>
            <Button
              variant='outline'
              size='sm'
              onClick={goBack}
              className='flex items-center space-x-2'
            >
              <ArrowLeft className='h-4 w-4' />
              <span>Back</span>
            </Button>
          </div>

          <div className='space-y-6'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
              <div>
                <h1 className='text-3xl font-bold medical-heading flex items-center gap-2'>
                  <CalendarIcon className='h-8 w-8' />
                  Appointment Calendar
                </h1>
                <p className='text-muted-foreground'>
                  Schedule and manage medical appointments
                </p>
              </div>

              {/* View Controls */}
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={navigateToday}
                  disabled={calendarLoading}
                  className='hover-lift transition-all duration-200'
                >
                  Today
                </Button>
                <div className='flex items-center border rounded-lg'>
                  {(['month', 'week', 'day', 'year'] as CalendarView[]).map(
                    viewType => (
                      <Button
                        key={viewType}
                        variant={view === viewType ? 'default' : 'ghost'}
                        size='sm'
                        className='rounded-none first:rounded-l-lg last:rounded-r-lg'
                        onClick={() => {
                          setView(viewType);
                          fetchAppointments(true, currentDate, viewType);
                        }}
                      >
                        {viewType === 'month' && (
                          <Grid3X3 className='h-4 w-4 mr-1' />
                        )}
                        {viewType === 'week' && (
                          <List className='h-4 w-4 mr-1' />
                        )}
                        {viewType === 'day' && (
                          <CalendarDays className='h-4 w-4 mr-1' />
                        )}
                        {viewType === 'year' && (
                          <BarChart3 className='h-4 w-4 mr-1' />
                        )}
                        {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
              <Card className='glass-effect'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-2'>
                    <CalendarDays className='h-5 w-5 text-primary' />
                    <div>
                      <div className='text-2xl font-bold'>{stats.total}</div>
                      <div className='text-sm text-muted-foreground'>Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='glass-effect'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-5 w-5 text-green-500' />
                    <div>
                      <div className='text-2xl font-bold'>
                        {stats.completed}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Completed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='glass-effect'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-2'>
                    <AlertCircle className='h-5 w-5 text-yellow-500' />
                    <div>
                      <div className='text-2xl font-bold'>
                        {stats.scheduled}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Scheduled
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='glass-effect'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-5 w-5 text-blue-500' />
                    <div>
                      <div className='text-2xl font-bold'>
                        {stats.uniqueEmployees}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Employees
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='glass-effect'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-2'>
                    <Stethoscope className='h-5 w-5 text-purple-500' />
                    <div>
                      <div className='text-2xl font-bold'>
                        {stats.appointmentTypes}
                      </div>
                      <div className='text-sm text-muted-foreground'>Types</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation */}
            <Card className='glass-effect'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <Button
                    variant='outline'
                    onClick={navigatePrevious}
                    disabled={calendarLoading}
                    className='hover-lift transition-all duration-200'
                  >
                    <ChevronLeft className='h-4 w-4 mr-1' />
                    Previous
                  </Button>

                  <h2
                    className={`text-xl font-semibold transition-all duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
                  >
                    {getViewTitle()}
                  </h2>

                  <Button
                    variant='outline'
                    onClick={navigateNext}
                    disabled={calendarLoading}
                    className='hover-lift transition-all duration-200'
                  >
                    Next
                    <ChevronRight className='h-4 w-4 ml-1' />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Calendar View */}
            <Card className='glass-effect'>
              <CardContent className='p-0 relative'>
                {/* Loading overlay for smooth transitions */}
                {calendarLoading && (
                  <div className='absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                      <span>Loading...</span>
                    </div>
                  </div>
                )}

                {/* Calendar content with transition */}
                <div
                  className={`transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
                >
                  {view === 'month' && renderMonthView()}
                  {view === 'week' && renderWeekView()}
                  {view === 'day' && renderDayView()}
                  {view === 'year' && renderYearView()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <Dialog
            open={!!selectedAppointment}
            onOpenChange={() => setSelectedAppointment(null)}
          >
            <DialogContent className='sm:max-w-[500px]'>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2'>
                  <div
                    className='w-4 h-4 rounded'
                    style={{ backgroundColor: selectedAppointment.color }}
                  />
                  {selectedAppointment.type}
                </DialogTitle>
                <DialogDescription>
                  Appointment details and information
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4'>
                {/* Employee Info */}
                <div className='space-y-2'>
                  <h4 className='font-semibold flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    Employee Information
                  </h4>
                  <div className='space-y-1 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Name:</span>
                      <span>
                        {selectedAppointment.employee_name}{' '}
                        {selectedAppointment.employee_surname}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Email:</span>
                      <span className='break-all'>
                        {selectedAppointment.employee_email}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Mobile:</span>
                      <span>
                        {selectedAppointment.employee_mobile || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Appointment Details */}
                <div className='space-y-2'>
                  <h4 className='font-semibold flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    Appointment Details
                  </h4>
                  <div className='space-y-1 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Date:</span>
                      <span>
                        {format(selectedAppointment.start, 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Time:</span>
                      <span>
                        {selectedAppointment.start_time} -{' '}
                        {selectedAppointment.end_time}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Type:</span>
                      <span>{selectedAppointment.type}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Status:</span>
                      <Badge
                        variant={
                          selectedAppointment.status === 'completed'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {selectedAppointment.status === 'completed' ? (
                          <CheckCircle className='h-3 w-3 mr-1' />
                        ) : (
                          <AlertCircle className='h-3 w-3 mr-1' />
                        )}
                        {selectedAppointment.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <>
                    <Separator />
                    <div className='space-y-2'>
                      <h4 className='font-semibold'>Notes</h4>
                      <p className='text-sm text-muted-foreground bg-muted p-3 rounded-lg'>
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                {/* System Info */}
                <div className='space-y-2'>
                  <h4 className='font-semibold text-xs uppercase tracking-wide text-muted-foreground'>
                    System Information
                  </h4>
                  <div className='space-y-1 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Created by:</span>
                      <span>
                        {selectedAppointment.created_by_name || 'N/A'}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Updated by:</span>
                      <span>
                        {selectedAppointment.updated_by_name || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Selected Date Modal */}
        {selectedDate && (
          <Dialog
            open={!!selectedDate}
            onOpenChange={() => setSelectedDate(null)}
          >
            <DialogContent className='sm:max-w-[600px]'>
              <DialogHeader>
                <DialogTitle>
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </DialogTitle>
                <DialogDescription>
                  {getAppointmentsForDate(selectedDate).length} appointments on
                  this date
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4 max-h-[400px] overflow-y-auto'>
                {getAppointmentsForDate(selectedDate).length === 0 ? (
                  <div className='text-center py-8'>
                    <CalendarDays className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <p className='text-muted-foreground'>
                      No appointments scheduled for this date
                    </p>
                  </div>
                ) : (
                  getAppointmentsForDate(selectedDate).map(apt => (
                    <div
                      key={apt.id}
                      className='p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors'
                      onClick={() => {
                        setSelectedDate(null);
                        setSelectedAppointment(apt);
                      }}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div
                            className='w-4 h-4 rounded'
                            style={{ backgroundColor: apt.color }}
                          />
                          <div>
                            <div className='font-medium'>
                              {apt.employee_name} {apt.employee_surname}
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {apt.type}
                            </div>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-sm font-medium'>
                            {apt.start_time} - {apt.end_time}
                          </div>
                          <Badge
                            variant={
                              apt.status === 'completed'
                                ? 'default'
                                : 'secondary'
                            }
                            className='text-xs'
                          >
                            {apt.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <ProtectedRoute>
          <DashboardLayout>
            <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
              <Card>
                <CardContent>
                  <PageLoading
                    text='Loading Calendar'
                    subtitle='Fetching appointment schedule and calendar data...'
                  />
                </CardContent>
              </Card>
            </div>
          </DashboardLayout>
        </ProtectedRoute>
      }
    >
      <CalendarPageContent />
    </Suspense>
  );
}
