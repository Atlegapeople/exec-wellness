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

// Reusable Examination Outcome Chart Component
interface ExaminationOutcomeChartProps {
  examName: string;
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
}

const ExaminationOutcomeChart: React.FC<ExaminationOutcomeChartProps> = ({ examName, data }) => {
  const colorMapping = {
    "Normal": "#00897B",
    "Abnormal": "#E53935", 
    "Unknown": "#E0E0E0",
    "Not Done": "#E0E0E0",
    "Not Assessed": "#E0E0E0",
    "Present": "#00897B"
  };

  const totalCount = data.reduce((sum, item) => sum + item.value, 0);
  const maxCount = Math.max(...data.map(item => item.value));

  // Map data with proper colors and percentages
  const chartData = data.map(item => ({
    outcome: item.name,
    count: item.value,
    percent: totalCount > 0 ? ((item.value / totalCount) * 100).toFixed(1) : "0.0",
    color: colorMapping[item.name as keyof typeof colorMapping] || "#E0E0E0"
  }));

  return (
    <div className="py-4">
      <div className="flex items-end justify-center gap-6 h-64">
        {chartData.map((item, index) => {
          const barHeight = maxCount > 0 ? (item.count / maxCount) * 200 : 0;
          
          return (
            <div key={`outcome-${index}-${item.outcome}`} className="flex flex-col items-center gap-3">
              {/* Value label on top */}
              <div 
                className="text-center transition-all duration-700 ease-out"
                style={{ 
                  fontSize: '12px', 
                  color: '#212121',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}
              >
                {item.count.toLocaleString()} ({item.percent}%)
              </div>
              
              {/* Bar */}
              <div 
                className="w-16 transition-all duration-700 ease-out flex items-end"
                style={{ 
                  height: `${barHeight}px`,
                  backgroundColor: item.color,
                  borderRadius: '4px 4px 0 0',
                  minHeight: '20px'
                }}
                title={`${item.outcome}: ${item.count.toLocaleString()} (${item.percent}%)`}
              />
              
              {/* X-axis label */}
              <div 
                className="text-center"
                style={{ 
                  fontSize: '13px', 
                  color: '#424242',
                  fontWeight: '500',
                  marginTop: '8px'
                }}
              >
                {item.outcome}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Y-axis reference lines */}
      <div className="relative mt-4">
        <div className="flex justify-between text-xs" style={{ color: '#666' }}>
          <span>0</span>
          <span>500</span>
          <span>1,000</span>
          <span>1,500</span>
          <span>2,000</span>
        </div>
        <div className="w-full h-px bg-gray-200 mt-1"></div>
      </div>
    </div>
  );
};


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

  // Use exact data as specified
  const top5ExaminationsData = [
    { exam: "Hearing Assessment", count: 2185, percent: 20.4 },
    { exam: "Skin Assessment", count: 2145, percent: 20.1 },
    { exam: "Balance Function Assessment", count: 2143, percent: 20.0 },
    { exam: "Breast Assessment", count: 2125, percent: 19.9 },
    { exam: "Gastrointestinal Assessment", count: 2096, percent: 19.6 }
  ];
  
  const maxCount = Math.max(...top5ExaminationsData.map(item => item.count));

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
            <div className="space-y-4 py-4">
              {top5ExaminationsData.map((item, index) => {
                const barWidth = (item.count / maxCount) * 100;
                const isLeader = index === 0;
                const barColor = isLeader ? '#00695C' : '#00897B'; // Darker teal for leader
                
                return (
                  <div key={`exam-${index}-${item.exam}`} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span 
                        className="text-sm font-medium" 
                        style={{ 
                          color: '#424242',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        {item.exam}
                      </span>
                      <span 
                        className="text-sm font-medium" 
                        style={{ 
                          color: '#212121',
                          fontSize: '12px'
                        }}
                      >
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative">
                      <div 
                        className="w-full bg-gray-100 h-8 overflow-hidden" 
                        style={{ borderRadius: '6px' }}
                      >
                        <div 
                          className="h-full transition-all duration-700 ease-out flex items-center justify-end pr-3"
                          style={{ 
                            width: `${barWidth}%`, 
                            backgroundColor: barColor,
                            borderRadius: '6px'
                          }}
                        >
                          <span 
                            className="text-xs text-white font-medium"
                            style={{
                              fontSize: '12px',
                              color: '#FFFFFF'
                            }}
                          >
                            {item.percent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
              <ExaminationOutcomeChart examName="Balance Function" data={balanceChartData} />
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
              <ExaminationOutcomeChart examName="Musculoskeletal" data={musculoskeletalChartData} />
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
              <ExaminationOutcomeChart examName="Skin" data={skinChartData} />
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
              <ExaminationOutcomeChart examName="Breast" data={breastChartData} />
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
              <ExaminationOutcomeChart examName="Neurological" data={neurologicalChartData} />
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
              <ExaminationOutcomeChart examName="General Assessment" data={generalChartData} />
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
              <ExaminationOutcomeChart examName="Cardiovascular" data={cardiovascularChartData} />
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
              <ExaminationOutcomeChart examName="Hearing Assessment" data={hearingChartData} />
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
              <ExaminationOutcomeChart examName="Gastrointestinal" data={gastrointestinalChartData} />
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
              <ExaminationOutcomeChart examName="Respiratory" data={respiratoryChartData} />
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
            <CardDescription>Percentage of normal findings by examination type – higher percentages indicate healthier population outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-6">
              {/* Y-axis labels */}
              <div className="flex justify-between mb-4 text-xs" style={{ color: '#666' }}>
                <span>Percentage of Normal Results (%)</span>
                <div className="flex gap-8">
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Chart area */}
              <div className="relative h-80">
                {/* Grid lines */}
                {[25, 50, 75, 100].map(gridLine => (
                  <div
                    key={gridLine}
                    className="absolute w-full border-t border-gray-200"
                    style={{ top: `${100 - gridLine}%` }}
                  />
                ))}

                {/* Data points and line */}
                <div className="relative h-full">
                  <svg className="absolute inset-0 w-full h-full">
                    {/* Connect dots with lines */}
                    {positiveRateData.slice(0, -1).map((point: any, index: number) => {
                      const nextPoint = positiveRateData[index + 1];
                      const x1 = ((index + 1) / (positiveRateData.length + 1)) * 100;
                      const x2 = ((index + 2) / (positiveRateData.length + 1)) * 100;
                      const y1 = 100 - point.positive_percentage;
                      const y2 = 100 - nextPoint.positive_percentage;
                      
                      // Color based on current point's threshold
                      const color = point.positive_percentage >= 75 ? '#00897B' : 
                                   point.positive_percentage >= 50 ? '#FB8C00' : '#E53935';
                      
                      return (
                        <line
                          key={index}
                          x1={`${x1}%`}
                          y1={`${y1}%`}
                          x2={`${x2}%`}
                          y2={`${y2}%`}
                          stroke={color}
                          strokeWidth="2"
                          className="transition-all duration-300"
                        />
                      );
                    })}
                  </svg>

                  {/* Data markers */}
                  {positiveRateData.map((point: any, index: number) => {
                    const x = ((index + 1) / (positiveRateData.length + 1)) * 100;
                    const y = 100 - point.positive_percentage;
                    
                    // Color based on threshold
                    const color = point.positive_percentage >= 75 ? '#00897B' : 
                                 point.positive_percentage >= 50 ? '#FB8C00' : '#E53935';
                    
                    return (
                      <div
                        key={`point-${index}-${point.examination_type}`}
                        className="absolute transition-all duration-300 hover:scale-125 cursor-pointer"
                        style={{ 
                          left: `${x}%`, 
                          top: `${y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        title={`${point.examination_type}: ${point.positive_percentage}% Normal (${point.positive_count} of ${point.total_count})`}
                      >
                        <div
                          className="w-3 h-3 rounded-full border-2 bg-white"
                          style={{ borderColor: color }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between mt-4 text-xs" style={{ color: '#424242' }}>
                {positiveRateData.map((point: any, index: number) => (
                  <div
                    key={`label-${index}-${point.examination_type}`}
                    className="flex-1 text-center"
                    style={{ transform: 'rotate(45deg)', transformOrigin: 'center' }}
                  >
                    <span className="font-medium">
                      {point.examination_type.replace(' Assessment', '').replace(' Function', '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
          <div className="space-y-3">
            {chartData.map((exam: any, index: number) => {
              // Threshold-based badge styling
              const getBadgeStyle = (percentage: number) => {
                if (percentage >= 90) {
                  return { backgroundColor: '#00897B', color: '#FFFFFF' };
                } else if (percentage >= 75) {
                  return { backgroundColor: '#FB8C00', color: '#FFFFFF' };
                } else {
                  return { backgroundColor: '#E53935', color: '#FFFFFF' };
                }
              };

              const badgeStyle = getBadgeStyle(exam.positive_percentage);

              return (
                <div 
                  key={`exam-detail-${index}-${exam.examination_type}`} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  title={`Exam: ${exam.examination_type}, Positive: ${exam.positive_count}, Negative: ${exam.negative_count}, Total: ${exam.total_count}, % Positive: ${exam.positive_percentage}%`}
                >
                  {/* Left Zone: Exam Info */}
                  <div className="flex-1">
                    <h4 
                      className="font-bold"
                      style={{ 
                        fontSize: '16px',
                        color: '#212121'
                      }}
                    >
                      {exam.examination_type}
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ 
                        fontSize: '13px',
                        color: '#757575'
                      }}
                    >
                      Total: {exam.total_count.toLocaleString()} examinations
                    </p>
                  </div>

                  {/* Center Zone: Outcomes */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" style={{ color: '#00897B' }} />
                      <div className="text-center">
                        <div className="font-medium" style={{ color: '#212121' }}>
                          {exam.positive_count.toLocaleString()}
                        </div>
                        <div className="text-xs" style={{ color: '#757575' }}>
                          Positive
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4" style={{ color: '#E53935' }} />
                      <div className="text-center">
                        <div className="font-medium" style={{ color: '#212121' }}>
                          {exam.negative_count.toLocaleString()}
                        </div>
                        <div className="text-xs" style={{ color: '#757575' }}>
                          Negative
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Zone: Key Metric */}
                  <div className="flex-shrink-0">
                    <div
                      className="px-3 py-1 rounded-full font-bold text-sm"
                      style={badgeStyle}
                    >
                      {exam.positive_percentage}% positive
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ClinicalExaminationsChart;