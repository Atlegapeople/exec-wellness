import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Query for mental health level distributions
    const mentalHealthQuery = `
      SELECT 
        key as metric,
        value as level,
        COUNT(*) as count
      FROM prod.dim_ohms__exec_medical_mental_health
      WHERE key LIKE '%Level' 
      GROUP BY key, value
      ORDER BY key, count DESC
    `;

    // Query for average scores by metric
    const scoresQuery = `
      SELECT 
        key as metric,
        ROUND(AVG(CAST(value AS DECIMAL)), 2) as average_score,
        COUNT(*) as total_responses
      FROM prod.dim_ohms__exec_medical_mental_health
      WHERE key IN ('Mood', 'Anxiety', 'Energy', 'Stress', 'Overall')
      AND value ~ '^[0-9]+(\\.[0-9]+)?$'
      GROUP BY key
      ORDER BY average_score DESC
    `;

    // Query for sleep rating distribution
    const sleepQuery = `
      SELECT 
        value as sleep_rating,
        COUNT(*) as count
      FROM prod.dim_ohms__exec_medical_mental_health
      WHERE key = 'Sleep Rating'
      GROUP BY value
      ORDER BY count DESC
    `;

    const mentalHealthResult = await query(mentalHealthQuery);
    const scoresResult = await query(scoresQuery);
    const sleepResult = await query(sleepQuery);
    
    const mentalHealthLevels = mentalHealthResult.rows;
    const averageScores = scoresResult.rows;
    const sleepRatings = sleepResult.rows;
    
    // Transform data for charts
    const levelData = mentalHealthLevels.map((row: any) => ({
      metric: row.metric.replace(' Level', ''),
      level: row.level,
      count: parseInt(row.count)
    }));

    const scoreData = averageScores.map((row: any) => ({
      metric: row.metric,
      average_score: parseFloat(row.average_score),
      total_responses: parseInt(row.total_responses)
    }));

    const sleepData = sleepRatings.map((row: any) => ({
      rating: row.sleep_rating,
      count: parseInt(row.count)
    }));

    // Calculate summary statistics
    const totalResponses = scoreData.reduce((sum, item) => sum + item.total_responses, 0) / scoreData.length;
    const overallAverage = scoreData.find(item => item.metric === 'Overall')?.average_score || 0;
    
    const summaryStats = {
      total_responses: Math.round(totalResponses),
      overall_average: overallAverage,
      highest_metric: scoreData[0]?.metric || 'N/A',
      lowest_metric: scoreData[scoreData.length - 1]?.metric || 'N/A'
    };

    console.log('Mental Health Levels:', mentalHealthLevels);
    console.log('Average Scores:', averageScores);
    console.log('Sleep Ratings:', sleepRatings);

    return NextResponse.json({
      levelData,
      scoreData,
      sleepData,
      summaryStats,
      success: true
    });

  } catch (error) {
    console.error('Mental health analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mental health analytics', success: false },
      { status: 500 }
    );
  }
}