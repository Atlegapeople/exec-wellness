'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Treemap
} from 'recharts';
import { 
  Users, 
  Building2, 
  ArrowLeft,
  TrendingUp,
  Briefcase,
  UserCheck,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { PALETTE, CHART_SERIES_COLORS } from '@/lib/chartColors';

interface Employee {
  employee_id: string;
  name: string;
  surname: string;
  gender: string;
  age: number;
  ethnicity: string;
  marriage_status: string;
  organisation: string;
  workplace: string;
  job: string;
  medical_aid: string;
  date_created: string;
  work_email: string;
}

interface DrillDownLevel {
  type: 'overview' | 'organization' | 'workplace' | 'job';
  data: any;
  title: string;
  parentPath: string[];
}


const EmployeeInsightsChart = ({ data }: { data: any }) => {
  const [drillDownStack, setDrillDownStack] = useState<DrillDownLevel[]>([
    {
      type: 'overview',
      data: data,
      title: 'Employee Overview',
      parentPath: []
    }
  ]);

  const currentLevel = drillDownStack[drillDownStack.length - 1];

  const handleDrillDown = (type: DrillDownLevel['type'], data: any, title: string, parentName?: string) => {
    const newPath = [...currentLevel.parentPath];
    if (parentName) newPath.push(parentName);
    
    setDrillDownStack(prev => [...prev, {
      type,
      data,
      title,
      parentPath: newPath
    }]);
  };

  const handleDrillUp = () => {
    if (drillDownStack.length > 1) {
      setDrillDownStack(prev => prev.slice(0, -1));
    }
  };

  const renderBreadcrumb = () => {
    return (
      <div className="flex items-center gap-2 mb-4">
        {drillDownStack.map((level, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            <Button
              variant={index === drillDownStack.length - 1 ? "default" : "ghost"}
              size="sm"
              onClick={() => setDrillDownStack(prev => prev.slice(0, index + 1))}
              className="text-sm"
            >
              {level.title}
            </Button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: '#00897B' }} />
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{data.totalEmployees.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" style={{ color: '#00897B' }} />
              <div>
                <p className="text-sm text-muted-foreground">Organizations</p>
                <p className="text-2xl font-bold">{data.organizationBreakdown.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" style={{ color: '#00897B' }} />
              <div>
                <p className="text-sm text-muted-foreground">Avg Age</p>
                <p className="text-2xl font-bold">
                  {Math.round(data.demographicsBreakdown.ageGroups.reduce((sum: number, group: any) => 
                    sum + (group.avgAge * group.count), 0) / data.totalEmployees)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" style={{ color: '#00897B' }} />
              <div>
                <p className="text-sm text-muted-foreground">Registration Growth</p>
                <p className="text-2xl font-bold">
                  {data.timeSeriesData.length > 1 ? 
                    Math.round(((data.timeSeriesData[data.timeSeriesData.length - 1].cumulative - 
                    data.timeSeriesData[0].cumulative) / data.timeSeriesData[0].cumulative) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Organization Breakdown */}
        <Card className="hover-lift cursor-pointer" onClick={() => handleDrillDown('organization', data.organizationBreakdown, 'Organizations')}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="h-5 w-5" style={{ color: '#424242' }} />
                Employee Distribution by Organization
              </span>
              <ArrowRight className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart 
                data={data.organizationBreakdown.slice(0, 10).map((org: any) => ({
                  ...org,
                  shortName: org.name.length > 35 ? org.name.substring(0, 32) + '...' : org.name
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 85 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="shortName" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={12}
                  interval={0}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, 'Employees']}
                  labelFormatter={(label) => {
                    const originalOrg = data.organizationBreakdown.find((org: any) => 
                      org.name.startsWith(label.replace('...', ''))
                    );
                    return originalOrg ? originalOrg.name : label;
                  }}
                />
                <Bar dataKey="count" fill={PALETTE.primary.base} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demographics Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: '#424242' }} />
              Gender Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.demographicsBreakdown.gender}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                >
                  {data.demographicsBreakdown.gender.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} employees (${Math.round(((value as number) / data.totalEmployees) * 100)}%)`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ethnicity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: '#424242' }} />
              Ethnicity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.demographicsBreakdown.ethnicity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, 'Employees']} />
                <Bar dataKey="count" fill={PALETTE.supporting.purple} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" style={{ color: '#424242' }} />
              Age Group Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.demographicsBreakdown.ageGroups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Employees' : name]} />
                <Bar dataKey="count" fill={PALETTE.supporting.blue} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Medical Aid Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" style={{ color: '#424242' }} />
              Medical Aid Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.medicalAidBreakdown}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                >
                  {data.medicalAidBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} employees (${Math.round(((value as number) / data.totalEmployees) * 100)}%)`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Marital Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" style={{ color: '#424242' }} />
              Marital Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.demographicsBreakdown.maritalStatus}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                >
                  {data.demographicsBreakdown.maritalStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} employees (${Math.round(((value as number) / data.totalEmployees) * 100)}%)`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Growth Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" style={{ color: '#424242' }} />
              Employee Registration Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cumulative" stroke={PALETTE.primary.base} name="Total Employees" />
                <Line type="monotone" dataKey="count" stroke={PALETTE.secondary.alert} name="New Registrations" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOrganizationLevel = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentLevel.data.map((org: any, index: number) => (
          <Card 
            key={org.name} 
            className="hover-lift cursor-pointer" 
            onClick={() => handleDrillDown('workplace', org.workplaces, `${org.name} - Workplaces`, org.name)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length] }}
                  />
                  <h3 className="font-semibold">{org.name}</h3>
                </div>
                <ArrowRight className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{org.count.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">employees</p>
                <p className="text-xs text-muted-foreground">{org.workplaces?.length || 0} workplaces</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderWorkplaceLevel = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentLevel.data.map((workplace: any, index: number) => (
          <Card 
            key={workplace.name} 
            className="hover-lift cursor-pointer" 
            onClick={() => handleDrillDown('job', workplace.jobs, `${workplace.name} - Job Roles`, workplace.name)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{workplace.name}</h3>
                </div>
                <ArrowRight className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{workplace.count.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">employees</p>
                <p className="text-xs text-muted-foreground">{workplace.jobs?.length || 0} job roles</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderJobLevel = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentLevel.data.map((job: any, index: number) => (
          <Card key={job.name} className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{job.name}</h3>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{job.count.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">employees</p>
                
                {/* Employee list */}
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {job.employees.slice(0, 10).map((emp: Employee) => (
                    <div key={emp.employee_id} className="text-xs bg-muted/50 rounded px-2 py-1">
                      <div className="font-medium">{emp.name} {emp.surname}</div>
                      <div className="text-muted-foreground">{emp.work_email}</div>
                    </div>
                  ))}
                  {job.employees.length > 10 && (
                    <div className="text-xs text-muted-foreground px-2">
                      +{job.employees.length - 10} more employees
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCurrentLevel = () => {
    switch (currentLevel.type) {
      case 'overview':
        return renderOverview();
      case 'organization':
        return renderOrganizationLevel();
      case 'workplace':
        return renderWorkplaceLevel();
      case 'job':
        return renderJobLevel();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Analytics</h2>
          <p className="text-muted-foreground">Interactive employee insights with drill-down capabilities</p>
        </div>
        {drillDownStack.length > 1 && (
          <Button onClick={handleDrillUp} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" style={{ color: '#424242' }} />
            Back
          </Button>
        )}
      </div>

      {/* Breadcrumb */}
      {renderBreadcrumb()}

      {/* Current level content */}
      <div>
        <h3 className="text-xl font-semibold mb-4">{currentLevel.title}</h3>
        {renderCurrentLevel()}
      </div>
    </div>
  );
};

export default EmployeeInsightsChart;