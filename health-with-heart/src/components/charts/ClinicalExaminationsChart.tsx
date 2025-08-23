'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { 
  Stethoscope,
  FileText,
  TrendingUp,
  Activity,
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  Heart,
  Users
} from 'lucide-react';
import { PALETTE, CHART_SERIES_COLORS, getResultColor } from '@/lib/chartColors';


const ClinicalExaminationsChart = ({ data }: { data: any }) => {
  if (!data) return null;

  const { 
    chartData, 
    summaryStats, 
    musculoskeletalData, 
    skinData, 
    breastData, 
    balanceData, 
    neurologicalData, 
    righRfData, 
    generalData, 
    cardiovascularData, 
    hearingData, 
    gastrointestinalData, 
    visualAcuityData, 
    respiratoryData 
  } = data;

  if (!chartData || !summaryStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const positiveRateData = chartData.map((item: any) => ({
    examination_type: item.examination_type.replace(' Assessment', '').replace(' Function', ''),
    positive_percentage: item.positive_percentage,
    total_count: item.total_count
  }));

  const top5Examinations = chartData.slice(0, 5);

  // Use Musculoskeletal specific counts for the chart
  const musculoskeletalChartData = musculoskeletalData ? musculoskeletalData.map((item: any) => ({
    name: item.result,
    value: parseInt(item.count),
    fill: getResultColor(item.result)
  })) : [];

  // Use Skin specific counts for the chart
  const skinChartData = skinData ? skinData.map((item: any) => ({
    name: item.result,
    value: parseInt(item.count),
    fill: getResultColor(item.result)
  })) : [];

  // Use Breast specific counts for the chart
  const breastChartData = breastData ? breastData.map((item: any) => ({
    name: item.result,
    value: parseInt(item.count),
    fill: getResultColor(item.result)
  })) : [];

  // Use Balance Function specific counts for the chart
  const balanceChartData = balanceData ? balanceData.map((item: any) => ({
    name: item.result,
    value: parseInt(item.count),
    fill: getResultColor(item.result)
  })) : [];

  // Use Neurological specific counts for the chart
  const neurologicalChartData = neurologicalData ? neurologicalData.map((item: any) => ({
    name: item.result,
    value: parseInt(item.count),
    fill: getResultColor(item.result)
  })) : [];

  // Use Right Rf specific counts for the chart - handle raw answer values
  const righRfChartData = righRfData ? righRfData.map((item: any) => {
    let resultName = 'Unknown';
    let fillColor = PALETTE.neutral.base;
    
    if (item.answer === 1) {
      resultName = 'Present';
      fillColor = PALETTE.primary.base;
    } else if (item.answer === -1) {
      resultName = 'Abnormal';
      fillColor = PALETTE.secondary.alert;
    } else if (item.answer === 0) {
      resultName = 'Not Done';
      fillColor = PALETTE.neutral.dark;
    } else if (item.answer === null || item.answer === undefined) {
      resultName = 'Not Assessed';
      fillColor = PALETTE.neutral.base;
    }
    
    return {
      name: resultName,
      value: parseInt(item.count),
      fill: fillColor
    };
  }) : [];
  
  // Use General Assessment specific counts for the chart
  const generalChartData = generalData ? generalData.map((item: any) => ({
    name: item.result,
    value: parseInt(item.count),
    fill: getResultColor(item.result)
  })) : [];

  // Use Cardiovascular specific counts for the chart
  const cardiovascularChartData = cardiovascularData ? cardiovascularData.map((item: any) => ({
    name: item.result,
    value: parseInt(item.count),
    fill: getResultColor(item.result)
  })) : [];

  // Use Hearing specific counts for the chart
  const hearingChartData = hearingData ? hearingData.map((item: any) => ({
    name: item.result,
    value: parseInt(item.count),
    fill: getResultColor(item.result)
  })) : [];

  // Use Gastrointestinal specific counts for the chart
  const gastrointestinalChartData = gastrointestinalData ? gastrointestinalData.map((item: any) => ({
    name: item.result,
    value: parseInt(item.count),
    fill: getResultColor(item.result)
  })) : [];

  // Use Visual Acuity specific counts for the chart - handle raw answer values like Righ Rf
  const visualAcuityChartData = visualAcuityData ? visualAcuityData.map((item: any) => {
    let resultName = 'Unknown';
    let fillColor = PALETTE.neutral.base;
    
    if (item.answer === 1) {
      resultName = 'Normal';
      fillColor = PALETTE.primary.base;
    } else if (item.answer === -1) {
      resultName = 'Abnormal';
      fillColor = PALETTE.secondary.alert;
    } else if (item.answer === 0) {
      resultName = 'Not Done';
      fillColor = PALETTE.neutral.dark;
    } else if (item.answer === null || item.answer === undefined) {
      resultName = 'Not Assessed';
      fillColor = PALETTE.neutral.base;
    }
    
    return {
      name: resultName,
      value: parseInt(item.count),
      fill: fillColor
    };
  }) : [];

  // Use Respiratory specific counts for the chart
  const respiratoryChartData = respiratoryData ? respiratoryData.map((item: any) => ({
    name: item.result,
    value: parseInt(item.count),
    fill: getResultColor(item.result)
  })) : [];

  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Clinical Examinations Analytics</h2>
        <p className="text-muted-foreground">Assessment results and examination trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" style={{ color: '#00897B' }} />
              <div>
                <p className="text-sm text-muted-foreground">Total Examinations</p>
                <p className="text-2xl font-bold">{summaryStats.total_examinations.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" style={{ color: '#00897B' }} />
              <div>
                <p className="text-sm text-muted-foreground">Examination Types</p>
                <p className="text-2xl font-bold">{summaryStats.examination_types}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" style={{ color: '#00897B' }} />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Positive Rate</p>
                <p className="text-2xl font-bold">{summaryStats.average_positive_rate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" style={{ color: '#00897B' }} />
              <div>
                <p className="text-sm text-muted-foreground">Most Common Exam</p>
                <p className="text-lg font-bold">{summaryStats.most_common_exam.replace(' Assessment', '')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid - First row with Top 5 examinations and first specific examination */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Examination Volume Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" style={{ color: '#424242' }} />
              Top 5 Examinations by Volume
            </CardTitle>
            <CardDescription>Most frequently performed clinical examinations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={top5Examinations} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="examination_type" 
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_count" fill={PALETTE.primary.base} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Balance Function Assessment */}
        {balanceChartData.length > 0 && (
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" style={{ color: '#424242' }} />
                Distribution of Balance Function Examination Outcomes
              </CardTitle>
              <CardDescription>Balance Function examination results breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart
                  data={balanceChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {balanceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Second row of specific examination charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Clinical Examinations per Musculoskeletal */}
        {musculoskeletalChartData.length > 0 && (
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" style={{ color: '#424242' }} />
                Distribution of Musculoskeletal Examination Outcomes
              </CardTitle>
              <CardDescription>Musculoskeletal examination results breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart
                  data={musculoskeletalChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {musculoskeletalChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}


        {/* Clinical Examinations per Skin */}
        {skinChartData.length > 0 && (
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" style={{ color: '#424242' }} />
                Distribution of Skin Examination Outcomes
              </CardTitle>
              <CardDescription>Skin examination results breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart
                  data={skinChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {skinChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Clinical Examinations per Breast */}
        {breastChartData.length > 0 && (
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" style={{ color: '#424242' }} />
                Distribution of Breast Examination Outcomes
              </CardTitle>
              <CardDescription>Breast examination results breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart
                  data={breastChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {breastChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Neurological Assessment */}
        {neurologicalChartData.length > 0 && (
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" style={{ color: '#424242' }} />
                Distribution of Neurological Examination Outcomes
              </CardTitle>
              <CardDescription>Neurological examination results breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart
                  data={neurologicalChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {neurologicalChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fourth row - General Assessment and Cardiovascular */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* General Assessment */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Distribution of General Assessment Examination Outcomes
            </CardTitle>
            <CardDescription>General Assessment examination results breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {generalChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart
                  data={generalChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {generalChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No General Assessment data found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cardiovascular Assessment */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Distribution of Cardiovascular Examination Outcomes
            </CardTitle>
            <CardDescription>Cardiovascular examination results breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {cardiovascularChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart
                  data={cardiovascularChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {cardiovascularChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No Cardiovascular data found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fifth row - Hearing Assessment and Gastrointestinal */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Hearing Assessment */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Distribution of Hearing Assessment Examination Outcomes
            </CardTitle>
            <CardDescription>Hearing Assessment examination results breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {hearingChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart
                  data={hearingChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {hearingChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No Hearing Assessment data found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gastrointestinal Assessment */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Distribution of Gastrointestinal Examination Outcomes
            </CardTitle>
            <CardDescription>Gastrointestinal examination results breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {gastrointestinalChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart
                  data={gastrointestinalChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {gastrointestinalChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No Gastrointestinal data found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sixth row - Respiratory Assessment */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Respiratory Assessment */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Distribution of Respiratory Examination Outcomes
            </CardTitle>
            <CardDescription>Respiratory examination results breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {respiratoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart
                  data={respiratoryChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {respiratoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No Respiratory data found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Normal Results Rate Analysis */}
        <Card className="col-span-1 xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" style={{ color: '#424242' }} />
              Normal Examination Results Across All Assessments
            </CardTitle>
            <CardDescription>Percentage of normal findings by examination type - higher percentages indicate healthier population outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={positiveRateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="examination_type" 
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="positive_percentage" 
                  stroke={PALETTE.primary.base} 
                  strokeWidth={2}
                  dot={{ fill: PALETTE.primary.base }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Examination Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" style={{ color: '#424242' }} />
            Detailed Examination Results
          </CardTitle>
          <CardDescription>Complete breakdown of all clinical examinations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chartData.map((exam: any, index: number) => (
              <div key={exam.examination_type} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length] }}></div>
                  <div>
                    <h4 className="font-medium">{exam.examination_type}</h4>
                    <p className="text-sm text-muted-foreground">Total: {exam.total_count} examinations</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" style={{ color: '#00897B' }} />
                      <span className="font-medium">{exam.positive_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Positive</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      <XCircle className="h-4 w-4" style={{ color: '#E53935' }} />
                      <span className="font-medium">{exam.negative_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Negative</p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${
                      exam.positive_percentage >= 70 
                        ? 'bg-teal-100 text-teal-700' 
                        : exam.positive_percentage >= 50 
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {exam.positive_percentage}% positive
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ClinicalExaminationsChart;