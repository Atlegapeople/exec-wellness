'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Line
} from 'recharts';
import { 
  Brain,
  Heart,
  Activity,
  Moon,
  Users,
  BarChart3,
  FileText,
  Stethoscope
} from 'lucide-react';
import { PALETTE, getBadgeClass } from '@/lib/chartColors';

const MentalHealthChart = ({ data }: { data: any }) => {
  if (!data) return null;

  const { levelData, scoreData, sleepData, summaryStats } = data;

  if (!levelData || !scoreData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No mental health data available</p>
      </div>
    );
  }

  // Mental Health specific color mapping - consistent across all dashboards
  const MENTAL_HEALTH_COLORS = {
    "Energy": "#178089",     // Positive metric - teal
    "Stress": "#D65241",     // Negative metric - sunset  
    "Overall": "#B6D9CE",    // Overall wellbeing - duckEgg
    "Anxiety": "#EAB75C",    // Negative metric - daisy
    "Mood": "#B4CABC"        // Positive metric - sage
  };

  // Get color for mental health metrics
  const getMentalHealthColor = (metricName: string): string => {
    if (!metricName) return PALETTE.neutral.base;
    
    // Normalize metric name to match our color mapping
    const normalized = metricName.toLowerCase().trim();
    
    // Check for exact or partial matches
    for (const [key, color] of Object.entries(MENTAL_HEALTH_COLORS)) {
      if (normalized.includes(key.toLowerCase())) {
        return color;
      }
    }
    
    // Default logic for unmapped metrics
    // Positive metrics (wellbeing, energy, mood, sleep) = teal
    if (normalized.includes('wellbeing') || normalized.includes('energy') || 
        normalized.includes('mood') || normalized.includes('sleep') ||
        normalized.includes('happiness') || normalized.includes('satisfaction')) {
      return "#178089";
    }
    
    // Negative metrics (stress, anxiety, depression) = sunset/coral  
    if (normalized.includes('stress') || normalized.includes('anxiety') || 
        normalized.includes('depression') || normalized.includes('worry')) {
      return "#D65241";
    }
    
    return PALETTE.neutral.base;
  };

  // Sleep Quality specific color mapping - consistent across all dashboards
  const SLEEP_QUALITY_COLORS = {
    "Good": "#178089", // Teal - good sleep quality
    "OK, Could Be Better": "#EAB75C", // Daisy - moderate sleep quality
    "Poor": "#D65241", // Sunset - poor sleep quality
    "Not Specified": "#D7D9D9" // Light Grey - unknown/not specified
  };

  // Sleep quality category order for consistent display
  const SLEEP_QUALITY_ORDER = ["Good", "OK, Could Be Better", "Poor", "Not Specified"];

  // Anxiety Level specific color mapping - consistent across all dashboards
  const ANXIETY_LEVEL_COLORS = {
    "Low": "#178089",     // Teal - positive/healthy/low anxiety
    "Medium": "#EAB75C",  // Daisy - moderate/caution
    "High": "#D65241"     // Sunset - high-risk/clinically significant
  };

  // Energy Level specific color mapping - inverted logic (HIGH = good)
  const ENERGY_LEVEL_COLORS = {
    "High": "#178089",    // Teal - high energy (good outcome)
    "Medium": "#EAB75C",  // Daisy - medium energy (caution)
    "Low": "#D65241"      // Sunset - low energy (fatigue risk)
  };

  // Mental health level category order for consistent display
  const MENTAL_HEALTH_LEVEL_ORDER = ["Low", "Medium", "High"];
  
  // Energy level category order (High to Low for positive metrics)
  const ENERGY_LEVEL_ORDER = ["High", "Medium", "Low"];

  // Overall Level specific color mapping
  const OVERALL_LEVEL_COLORS = {
    "Good": "#178089",        // Teal - overall good wellbeing
    "OK": "#EAB75C",          // Daisy - moderate wellbeing
    "Poor": "#D65241",        // Sunset - overall poor wellbeing (risk)
    "Not Recorded": "#D7D9D9" // Light Grey - not recorded/missing data
  };

  // Overall level category order (Good to Poor)
  const OVERALL_LEVEL_ORDER = ["Good", "OK", "Poor", "Not Recorded"];

  // Mood level category order (Positive to Negative)
  const MOOD_LEVEL_ORDER = ["Positive", "Neutral", "Negative", "Not Recorded"];

  // Get color for sleep quality ratings
  const getSleepColor = (rating: string): string => {
    if (!rating) return SLEEP_QUALITY_COLORS["Not Specified"];
    
    // Check for exact match first
    if (SLEEP_QUALITY_COLORS[rating as keyof typeof SLEEP_QUALITY_COLORS]) {
      return SLEEP_QUALITY_COLORS[rating as keyof typeof SLEEP_QUALITY_COLORS];
    }
    
    // Normalize and check for partial matches
    const normalized = rating.toLowerCase().trim();
    
    if (normalized.includes('good') || normalized.includes('excellent') || normalized.includes('great')) {
      return SLEEP_QUALITY_COLORS["Good"];
    }
    
    if (normalized.includes('ok') || normalized.includes('could be better') || normalized.includes('average') || normalized.includes('moderate')) {
      return SLEEP_QUALITY_COLORS["OK, Could Be Better"];
    }
    
    if (normalized.includes('poor') || normalized.includes('bad') || normalized.includes('terrible')) {
      return SLEEP_QUALITY_COLORS["Poor"];
    }
    
    return SLEEP_QUALITY_COLORS["Not Specified"];
  };

  // Get color for anxiety levels with specific mapping
  const getAnxietyLevelColor = (level: string): string => {
    if (!level || level.toLowerCase() === 'unknown') return PALETTE.neutral.base;
    
    // For anxiety: LOW = good (teal), MEDIUM = caution (amber), HIGH = risk (red)
    const normalized = level.toLowerCase().trim();
    
    if (normalized === 'low') {
      return "#178089"; // Teal - low anxiety is good
    }
    
    if (normalized === 'medium') {
      return "#EAB75C"; // Daisy - medium anxiety needs caution
    }
    
    if (normalized === 'high') {
      return "#D65241"; // Sunset - high anxiety is risk
    }
    
    // Fallback for unknown/not recorded only
    return PALETTE.neutral.base;
  };

  // Get color for energy levels with specific mapping
  const getEnergyLevelColor = (level: string): string => {
    if (!level) return PALETTE.neutral.base;
    
    // Check for exact match first
    if (ENERGY_LEVEL_COLORS[level as keyof typeof ENERGY_LEVEL_COLORS]) {
      return ENERGY_LEVEL_COLORS[level as keyof typeof ENERGY_LEVEL_COLORS];
    }
    
    const normalized = level.toLowerCase().trim();
    
    if (normalized === 'high' || normalized.includes('high')) {
      return ENERGY_LEVEL_COLORS["High"];    // Teal for high energy (good)
    }
    
    if (normalized === 'medium' || normalized.includes('medium') || normalized.includes('moderate')) {
      return ENERGY_LEVEL_COLORS["Medium"];  // Orange for medium energy
    }
    
    if (normalized === 'low' || normalized.includes('low')) {
      return ENERGY_LEVEL_COLORS["Low"];     // Red for low energy (bad)
    }
    
    return PALETTE.neutral.base;
  };

  // Mood Level specific color mapping - positive metrics where HIGH = good
  const MOOD_LEVEL_COLORS = {
    "Positive": "#178089",    // Teal - positive mood (good outcome)
    "Neutral": "#EAB75C",     // Daisy - neutral mood (moderate)
    "Negative": "#D65241",    // Sunset - negative mood (risk)
    "Not Recorded": "#D7D9D9" // Light Grey - not recorded/missing data
  };

  // Get color for mood levels with specific mapping
  const getMoodLevelColor = (level: string): string => {
    if (!level || level.toLowerCase() === 'unknown') return PALETTE.neutral.base;
    
    // For mood: POSITIVE = good (teal), NEUTRAL = moderate (amber), NEGATIVE = poor (red)
    const normalized = level.toLowerCase().trim();
    
    if (normalized === 'positive') {
      return "#178089"; // Teal - positive mood is good
    }
    
    if (normalized === 'neutral') {
      return "#EAB75C"; // Daisy - neutral mood is moderate/caution
    }
    
    if (normalized === 'negative') {
      return "#D65241"; // Sunset - negative mood is poor
    }
    
    // Fallback for unknown/not recorded only
    return PALETTE.neutral.base;
  };

  // Get color for overall levels with specific mapping
  const getOverallLevelColor = (level: string): string => {
    if (!level || level.toLowerCase() === 'unknown') return PALETTE.neutral.base;
    
    // For overall: HIGH = good (teal), MEDIUM = moderate (amber), LOW = poor (red)
    const normalized = level.toLowerCase().trim();
    
    // Handle HIGH as Good (positive overall wellbeing)
    if (normalized === 'high') {
      return "#178089"; // Teal - high overall wellbeing is good
    }
    
    // Handle MEDIUM as OK (moderate overall wellbeing)
    if (normalized === 'medium') {
      return "#EAB75C"; // Daisy - medium overall wellbeing is moderate
    }
    
    // Handle LOW as Poor (poor overall wellbeing)
    if (normalized === 'low') {
      return "#D65241"; // Sunset - low overall wellbeing is poor
    }
    
    // Fallback for unknown/not recorded only
    return PALETTE.neutral.base;
  };

  // General level color mapping with metric-specific routing
  const getLevelColor = (level: string, metricName: string = ''): string => {
    if (!level || typeof level !== 'string') {
      return PALETTE.neutral.base;
    }
    
    const normalizedMetric = metricName.toLowerCase();
    const normalizedLevel = level.toLowerCase().trim();
    
    // Use specific overall colors for overall metrics
    if (normalizedMetric.includes('overall') || normalizedMetric.includes('general')) {
      return getOverallLevelColor(level);
    }
    
    // Use specific anxiety colors for anxiety metrics
    if (normalizedMetric.includes('anxiety')) {
      return getAnxietyLevelColor(level);
    }
    
    // Use specific energy colors for energy metrics  
    if (normalizedMetric.includes('energy')) {
      return getEnergyLevelColor(level);
    }
    
    // Use specific mood colors for mood metrics
    if (normalizedMetric.includes('mood')) {
      return getMoodLevelColor(level);
    }
    
    // For stress, depression (negative metrics), use anxiety logic (low = good)
    if (normalizedMetric.includes('stress') || normalizedMetric.includes('depression')) {
      return getAnxietyLevelColor(level);
    }
    
    // For wellbeing, happiness (positive metrics), use energy logic (high = good)  
    if (normalizedMetric.includes('wellbeing') || normalizedMetric.includes('happiness')) {
      return getEnergyLevelColor(level);
    }

    // Handle specific level values that might appear regardless of metric
    // Check for positive descriptive terms first
    if (normalizedLevel.includes('positive') || normalizedLevel.includes('good') || normalizedLevel.includes('excellent') || normalizedLevel.includes('great')) {
      return "#178089"; // Teal for positive outcomes
    }
    
    if (normalizedLevel.includes('negative') || normalizedLevel.includes('poor') || normalizedLevel.includes('bad') || normalizedLevel.includes('terrible')) {
      return "#D65241"; // Sunset for negative outcomes
    }
    
    if (normalizedLevel.includes('neutral') || normalizedLevel.includes('ok') || normalizedLevel.includes('moderate') || normalizedLevel.includes('average')) {
      return "#EAB75C"; // Daisy for neutral/moderate outcomes
    }
    
    // Default Low/Medium/High logic for unknown metrics (assume negative metric where low = good)
    if (normalizedLevel === 'low') {
      return "#178089";  // Teal for low (good for negative metrics)
    }
    
    if (normalizedLevel === 'medium') {
      return "#EAB75C";  // Daisy for medium
    }
    
    if (normalizedLevel === 'high') {
      return "#D65241";   // Sunset for high (bad for negative metrics)
    }
    
    return PALETTE.neutral.base; // Grey fallback for unknown/not recorded only
  };

  const groupedLevelData = (() => {
    const grouped = levelData.reduce((acc: any, item: any) => {
      if (!acc[item.metric]) {
        acc[item.metric] = [];
      }
      
      acc[item.metric].push({
        level: item.level,
        count: item.count,
        fill: getLevelColor(item.level || 'unknown', item.metric || '')
      });
      return acc;
    }, {});

    // Sort each metric's levels according to appropriate order
    Object.keys(grouped).forEach(metric => {
      const normalizedMetric = metric.toLowerCase();
      
      // Choose the right order based on metric type
      let orderArray = MENTAL_HEALTH_LEVEL_ORDER; // Default: Low, Medium, High
      
      // For overall metrics, use Good/OK/Poor order
      if (normalizedMetric.includes('overall') || normalizedMetric.includes('general')) {
        orderArray = OVERALL_LEVEL_ORDER; // Good, OK, Poor, Not Recorded
      }
      // For mood metrics, use Positive/Neutral/Negative order
      else if (normalizedMetric.includes('mood')) {
        orderArray = MOOD_LEVEL_ORDER; // Positive, Neutral, Negative, Not Recorded
      }
      // For positive metrics (energy, wellbeing), show best first
      else if (normalizedMetric.includes('energy') || normalizedMetric.includes('wellbeing') || normalizedMetric.includes('happiness')) {
        orderArray = ENERGY_LEVEL_ORDER; // High, Medium, Low
      }
      
      grouped[metric].sort((a: any, b: any) => {
        const indexA = orderArray.indexOf(a.level);
        const indexB = orderArray.indexOf(b.level);
        
        // If not found in order array, put at the end
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        
        return indexA - indexB;
      });
    });

    return grouped;
  })();

  // Process sleep data with proper error handling
  const sleepChartData = (() => {
    if (!sleepData || !Array.isArray(sleepData)) return [];
    
    const processedData = sleepData.map((item: any) => ({
      rating: item.rating || 'Not Specified',
      count: item.count || 0,
      fill: getSleepColor(item.rating || 'Not Specified')
    }));

    // Sort according to our standard order, but don't break if sorting fails
    try {
      return processedData.sort((a, b) => {
        const indexA = SLEEP_QUALITY_ORDER.indexOf(a.rating);
        const indexB = SLEEP_QUALITY_ORDER.indexOf(b.rating);
        
        // If not found in order array, put at the end
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        
        return indexA - indexB;
      });
    } catch (error) {
      // If sorting fails, return unsorted data
      console.warn('Sleep data sorting failed, returning unsorted:', error);
      return processedData;
    }
  })();

  // Add color to score data based on metric name
  const coloredScoreData = scoreData?.map((item: any) => ({
    ...item,
    fill: getMentalHealthColor(item.metric)
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Mental Health Analytics</h2>
        <p className="text-muted-foreground">Comprehensive mental health assessment insights</p>
      </div>

      {/* Hero Overall Wellbeing Score */}
      {(() => {
        const overallScore = parseFloat(summaryStats.overall_average);
        const getOverallStatus = (score: number) => {
          if (score >= 7) {
            return { 
              label: 'Good', 
              color: 'teal-600', 
              bgColor: '#178089',
              borderColor: 'border-l-teal-600' 
            };
          } else if (score >= 4) {
            return { 
              label: 'Moderate', 
              color: 'orange-500', 
              bgColor: '#EAB75C',
              borderColor: 'border-l-orange-500' 
            };
          } else {
            return { 
              label: 'Poor', 
              color: 'red-600', 
              bgColor: '#D65241',
              borderColor: 'border-l-red-600' 
            };
          }
        };
        
        const status = getOverallStatus(overallScore);
        
        return (
          <Card className={`border-l-4 ${status.borderColor}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Overall Wellbeing Score</h3>
                  <p className="text-sm text-muted-foreground mb-3">Average across all mental health metrics (0-10 scale)</p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-teal-600"></div>
                      <span>Good (7-10)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500"></div>
                      <span>Moderate (4-6)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-600"></div>
                      <span>Poor (0-3)</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold text-${status.color}`}>{summaryStats.overall_average}</div>
                  <div className="text-sm text-muted-foreground">/10</div>
                  <div className={`text-sm font-medium text-${status.color} mt-1`}>{status.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Supporting Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" style={{ color: '#424242' }} />
              <div>
                <p className="text-2xl font-bold">{summaryStats.total_responses}</p>
                <p className="text-xs text-muted-foreground">Total Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" style={{ color: '#178089' }} />
              <div>
                <p className="text-lg font-bold">{summaryStats.highest_metric}</p>
                <p className="text-xs text-muted-foreground">Highest Scoring</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5" style={{ color: '#D65241' }} />
              <div>
                <p className="text-lg font-bold">{summaryStats.lowest_metric}</p>
                <p className="text-xs text-muted-foreground">Needs Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Average Scores Chart */}
        <Card className="col-span-1 xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" style={{ color: '#424242' }} />
              Average Mental Health Scores
            </CardTitle>
            <CardDescription>Mean scores across different mental health metrics (0-10 scale)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coloredScoreData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis domain={[0, 10]} />
                <Tooltip formatter={(value: any) => [`${value}/10`, 'Average Score']} />
                <Bar dataKey="average_score">
                  {coloredScoreData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sleep Quality Distribution */}
        <Card className="col-span-1 xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary" />
              Sleep Quality Distribution
            </CardTitle>
            <CardDescription>
              Sleep rating patterns across assessments 
              {sleepData && ` (${sleepData.length} categories)`}
              {sleepChartData && ` - Processed: ${sleepChartData.length}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sleepChartData.length > 0 ? (
              <div className="space-y-4">
                {sleepChartData.map((item: any, index: number) => {
                  const total = sleepChartData.reduce((sum: number, entry: any) => sum + entry.count, 0);
                  const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                  const barWidth = total > 0 ? (item.count / total) * 100 : 0;
                  
                  return (
                    <div key={`rating-${index}-${item.rating}`} className="flex items-center gap-4 mb-3">
                      <div className="w-32 text-sm font-medium text-right flex-shrink-0">
                        {item.rating ? 
                          item.rating.toLowerCase().split(' ').map((word: string) => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ') 
                          : 'Unknown'
                        }
                      </div>
                      <div className="flex-1 relative min-w-0">
                        <div className="w-full rounded h-10 relative overflow-hidden" style={{ backgroundColor: '#F2EFED' }}>
                          <div 
                            className="h-full rounded transition-all duration-700 ease-out flex items-center justify-end pr-3"
                            style={{ 
                              width: `${Math.max(barWidth, 0)}%`,
                              backgroundColor: item.fill,
                              minWidth: item.count > 0 ? '40px' : '0px'
                            }}
                          >
                            <span className="text-white text-sm font-medium drop-shadow">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-16 text-sm font-medium text-right flex-shrink-0" style={{ color: '#586D6A' }}>
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <p>No sleep quality data available</p>
                  <p className="text-xs mt-1">
                    Sleep data: {sleepData ? `${sleepData.length} items` : 'null'} | 
                    Processed: {sleepChartData ? `${sleepChartData.length} items` : 'null'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mental Health Level Distributions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Object.entries(groupedLevelData).slice(0, 4).map(([metric, levelCounts]: [string, any]) => (
          <Card key={`${metric}-chart`} className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                {metric} Level Distribution
              </CardTitle>
              <CardDescription>{metric} assessment level breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Custom bar chart using HTML/CSS instead of Recharts */}
              <div className="space-y-3">
                {levelCounts.map((entry: any, index: number) => {
                  const maxCount = Math.max(...levelCounts.map((c: any) => c.count));
                  const barWidth = maxCount > 0 ? (entry.count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={`level-${index}-${entry.level || 'null'}`} className="flex items-center gap-4 mb-3">
                      <div className="w-24 text-sm font-medium text-right flex-shrink-0">
                        {entry.level ? 
                          entry.level.toLowerCase().split(' ').map((word: string) => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ') 
                          : 'Unknown'
                        }
                      </div>
                      <div className="flex-1 relative min-w-0">
                        <div className="w-full rounded h-10 relative overflow-hidden" style={{ backgroundColor: '#F2EFED' }}>
                          <div 
                            className="h-full rounded transition-all duration-700 ease-out flex items-center justify-end pr-3"
                            style={{ 
                              width: `${Math.max(barWidth, 0)}%`,
                              backgroundColor: entry.fill,
                              minWidth: entry.count > 0 ? '40px' : '0px'
                            }}
                          >
                            <span className="text-white text-sm font-medium drop-shadow">
                              {entry.count}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-16 text-sm font-medium text-right flex-shrink-0" style={{ color: '#586D6A' }}>
                        {entry.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Mental Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Mental Health Metrics Summary
          </CardTitle>
          <CardDescription>Detailed breakdown of all mental health assessment scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scoreData
              .sort((a: any, b: any) => {
                // Order: Performance drivers first (Energy, Stress), then core outcomes (Mood, Anxiety, Overall)
                const order = ['Energy', 'Stress', 'Mood', 'Anxiety', 'Overall'];
                return order.indexOf(a.metric) - order.indexOf(b.metric);
              })
              .map((metric: any, index: number) => {
                const score = parseFloat(metric.average_score);
                const progressValue = score / 10; // 0-1 scale for 0–10
                
                // Exact color mapping specification
                const getMetricStatus = (score: number) => {
                  if (score >= 7) {
                    return { label: 'Good', color: '#178089' };
                  } else if (score >= 4) {
                    return { label: 'Moderate', color: '#EAB75C' };
                  } else if (score >= 0) {
                    return { label: 'Poor', color: '#D65241' };
                  } else {
                    return { label: 'Unknown', color: '#D7D9D9' };
                  }
                };
                
                const status = getMetricStatus(score);
                
                // Executive-ready metric card layout
                return (
                  <div key={`metric-${index}-${metric.metric}`} className="py-4 last:border-b-0" style={{ borderBottom: '1px solid #D7D9D9' }}>
                    <div className="flex items-center gap-6">
                      
                      {/* Left: Metric name */}
                      <div className="w-24 flex-shrink-0">
                        <span className="text-sm font-medium" style={{ color: '#111827' }}>
                          {metric.metric ? 
                            metric.metric.toLowerCase().split(' ').map((word: string) => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ') 
                            : 'Unknown'
                          }
                        </span>
                      </div>
                      
                      {/* Center: Progress bar (scaled 0–10) */}
                      <div className="flex-1">
                        <div className="w-full h-2" style={{ backgroundColor: '#F2EFED' }}>
                          <div 
                            className="h-2"
                            style={{ 
                              width: `${Math.max(progressValue * 100, 0)}%`,
                              backgroundColor: status.color
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Right: Score + status label */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <span className="font-bold" style={{ color: '#111827' }}>{metric.average_score}</span>
                          <span className="text-sm ml-0.5" style={{ color: '#586D6A' }}>/10</span>
                        </div>
                        <span className="text-sm w-16 text-left" style={{ color: '#586D6A' }}>
                          {status.label}
                        </span>
                      </div>
                      
                    </div>
                    
                    {/* Response count - de-emphasized */}
                    <div className="mt-2 ml-24">
                      <span className="text-xs font-normal" style={{ color: '#9CA3AF' }}>
                        {metric.total_responses.toLocaleString()} responses
                      </span>
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

export default MentalHealthChart;