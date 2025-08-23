import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get clinical examinations data from the database - simplified query
    const clinicalExamsQuery = `
      SELECT 
        question as examination_type,
        COUNT(*) as total_count,
        SUM(CASE WHEN answer = 1 THEN 1 ELSE 0 END) as positive_count,
        SUM(CASE WHEN answer = -1 THEN 1 ELSE 0 END) as negative_count,
        ROUND(AVG(CASE WHEN answer = 1 THEN 1.0 ELSE 0.0 END) * 100, 2) as positive_percentage
      FROM prod.dim_ohms__employee_clinical_examinations 
      GROUP BY question
      ORDER BY total_count DESC
    `;

    // Your specific query for Musculoskeletal Assessment
    const musculoskeletalQuery = `
      SELECT 
        question,
        CASE answer
            WHEN 1 THEN 'Normal'
            WHEN -1 THEN 'Abnormal'
            WHEN 0 THEN 'Not Done'
            ELSE 'Unknown'
        END AS result,
        COUNT(*) AS count
      FROM prod.dim_ohms__employee_clinical_examinations
      WHERE question = 'Muscoskeletal Assessment'
      GROUP BY question, result
      ORDER BY count DESC
    `;

    // Query for Skin Assessment
    const skinQuery = `
      SELECT 
        question,
        CASE answer
            WHEN 1 THEN 'Normal'
            WHEN -1 THEN 'Abnormal'
            WHEN 0 THEN 'Not Done'
            ELSE 'Unknown'
        END AS result,
        COUNT(*) AS count
      FROM prod.dim_ohms__employee_clinical_examinations
      WHERE question = 'Skin Assessment'
      GROUP BY question, result
      ORDER BY count DESC
    `;

    // Query for Breast Assessment
    const breastQuery = `
      SELECT 
        question,
        CASE answer
            WHEN 1 THEN 'Normal'
            WHEN -1 THEN 'Abnormal'
            WHEN 0 THEN 'Not Done'
            ELSE 'Unknown'
        END AS result,
        COUNT(*) AS count
      FROM prod.dim_ohms__employee_clinical_examinations
      WHERE question = 'Breast Assessment'
      GROUP BY question, result
      ORDER BY count DESC
    `;

    // Query for Balance Function Assessment
    const balanceQuery = `
      SELECT 
        question,
        CASE answer
            WHEN 1 THEN 'Normal'
            WHEN -1 THEN 'Abnormal'
            WHEN 0 THEN 'Not Done'
            ELSE 'Unknown'
        END AS result,
        COUNT(*) AS count
      FROM prod.dim_ohms__employee_clinical_examinations
      WHERE question = 'Balance Function Assessment'
      GROUP BY question, result
      ORDER BY count DESC
    `;

    // Query for Neurological Assessment
    const neurologicalQuery = `
      SELECT 
        question,
        CASE answer
            WHEN 1 THEN 'Normal'
            WHEN -1 THEN 'Abnormal'
            WHEN 0 THEN 'Not Done'
            ELSE 'Unknown'
        END AS result,
        COUNT(*) AS count
      FROM prod.dim_ohms__employee_clinical_examinations
      WHERE question LIKE '%Neurological%'
      GROUP BY question, result
      ORDER BY count DESC
    `;

    // Query for Righ Rf Assessment - simple version
    const righRfQuery = `
      SELECT 
        question,
        answer,
        COUNT(*) AS count
      FROM prod.dim_ohms__employee_clinical_examinations
      WHERE question = 'Righ Rf'
      GROUP BY question, answer
      ORDER BY count DESC
    `;

    // Query for General Assessment
    const generalQuery = `
      SELECT 
        question,
        CASE answer
            WHEN 1 THEN 'Normal'
            WHEN -1 THEN 'Abnormal'
            WHEN 0 THEN 'Not Done'
            ELSE 'Unknown'
        END AS result,
        COUNT(*) AS count
      FROM prod.dim_ohms__employee_clinical_examinations
      WHERE question = 'General Assessment'
      GROUP BY question, result
      ORDER BY count DESC
    `;

    // Query for Cardiovascular Assessment
    const cardiovascularQuery = `
      SELECT 
        question,
        CASE answer
            WHEN 1 THEN 'Normal'
            WHEN -1 THEN 'Abnormal'
            WHEN 0 THEN 'Not Done'
            ELSE 'Unknown'
        END AS result,
        COUNT(*) AS count
      FROM prod.dim_ohms__employee_clinical_examinations
      WHERE question = 'Cardiovascular Assessment'
      GROUP BY question, result
      ORDER BY count DESC
    `;

    // Query for Hearing Assessment
    const hearingQuery = `
      SELECT 
        question,
        CASE answer
            WHEN 1 THEN 'Normal'
            WHEN -1 THEN 'Abnormal'
            WHEN 0 THEN 'Not Done'
            ELSE 'Unknown'
        END AS result,
        COUNT(*) AS count
      FROM prod.dim_ohms__employee_clinical_examinations
      WHERE question = 'Hearing Assessment'
      GROUP BY question, result
      ORDER BY count DESC
    `;

    // Query for Gastrointestinal Assessment
    const gastrointestinalQuery = `
      SELECT 
        question,
        CASE answer
            WHEN 1 THEN 'Normal'
            WHEN -1 THEN 'Abnormal'
            WHEN 0 THEN 'Not Done'
            ELSE 'Unknown'
        END AS result,
        COUNT(*) AS count
      FROM prod.dim_ohms__employee_clinical_examinations
      WHERE question = 'Gastrointestinal Assessment'
      GROUP BY question, result
      ORDER BY count DESC
    `;

    // Debug query to find all available questions
    const allQuestionsQuery = `
      SELECT DISTINCT question, COUNT(*) as total_records
      FROM prod.dim_ohms__employee_clinical_examinations
      GROUP BY question
      ORDER BY question
    `;
    
    const allQuestionsResult = await query(allQuestionsQuery);
    console.log('ALL available questions in database:', allQuestionsResult.rows);
    
    // Query for Visual Acuity Assessment - try different variations
    const visualAcuityQuery = `
      SELECT 
        question,
        answer,
        COUNT(*) AS count
      FROM prod.dim_ohms__employee_clinical_examinations
      WHERE question LIKE '%Visual%' OR question LIKE '%Acuity%' OR question LIKE '%Vision%' OR question LIKE '%Eye%'
      GROUP BY question, answer
      ORDER BY count DESC
    `;

    const result = await query(clinicalExamsQuery);
    const musculoskeletalResult = await query(musculoskeletalQuery);
    const skinResult = await query(skinQuery);
    const breastResult = await query(breastQuery);
    const balanceResult = await query(balanceQuery);
    const neurologicalResult = await query(neurologicalQuery);
    const righRfResult = await query(righRfQuery);
    const generalResult = await query(generalQuery);
    // Query for Respiratory Assessment
    const respiratoryQuery = `
      SELECT 
        question,
        CASE answer
            WHEN 1 THEN 'Normal'
            WHEN -1 THEN 'Abnormal'
            WHEN 0 THEN 'Not Done'
            ELSE 'Unknown'
        END AS result,
        COUNT(*) AS count
      FROM prod.dim_ohms__employee_clinical_examinations
      WHERE question = 'Respiratory Assessment'
      GROUP BY question, result
      ORDER BY count DESC
    `;

    const cardiovascularResult = await query(cardiovascularQuery);
    const hearingResult = await query(hearingQuery);
    const gastrointestinalResult = await query(gastrointestinalQuery);
    const visualAcuityResult = await query(visualAcuityQuery);
    const respiratoryResult = await query(respiratoryQuery);
    
    const results = result.rows;
    const musculoskeletalData = musculoskeletalResult.rows;
    const skinData = skinResult.rows;
    const breastData = breastResult.rows;
    const balanceData = balanceResult.rows;
    const neurologicalData = neurologicalResult.rows;
    const righRfData = righRfResult.rows;
    const generalData = generalResult.rows;
    const cardiovascularData = cardiovascularResult.rows;
    const hearingData = hearingResult.rows;
    const gastrointestinalData = gastrointestinalResult.rows;
    const visualAcuityData = visualAcuityResult.rows;
    const respiratoryData = respiratoryResult.rows;
    
    console.log('Musculoskeletal query results:', musculoskeletalData);
    console.log('Skin query results:', skinData);
    console.log('Breast query results:', breastData);
    console.log('Balance query results:', balanceData);
    console.log('Neurological query results:', neurologicalData);
    console.log('Right Rf query results (updated):', righRfData);
    console.log('General Assessment query results:', generalData);
    console.log('Visual Acuity query results:', visualAcuityData);
    
    // Transform data for chart visualization
    const chartData = results.map((row: any) => ({
      examination_type: row.examination_type,
      total_count: parseInt(row.total_count),
      positive_count: parseInt(row.positive_count),
      negative_count: parseInt(row.negative_count),
      positive_percentage: parseFloat(row.positive_percentage)
    }));

    // Get summary statistics
    const totalExaminations = chartData.reduce((sum, item) => sum + item.total_count, 0);
    const averagePositiveRate = chartData.reduce((sum, item) => sum + item.positive_percentage, 0) / chartData.length;

    const summaryStats = {
      total_examinations: totalExaminations,
      examination_types: chartData.length,
      average_positive_rate: Math.round(averagePositiveRate * 100) / 100,
      most_common_exam: chartData[0]?.examination_type || 'N/A'
    };

    return NextResponse.json({
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
      respiratoryData,
      success: true
    });

  } catch (error) {
    console.error('Clinical examinations analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinical examinations analytics', success: false },
      { status: 500 }
    );
  }
}