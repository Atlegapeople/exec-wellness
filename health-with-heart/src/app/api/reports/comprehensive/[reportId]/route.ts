import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = await params;

    // Get the employee_id first
    const employeeIdQuery = `
      SELECT employee_id FROM medical_report WHERE id = $1
    `;
    const employeeResult = await query(employeeIdQuery, [reportId]);
    
    if (employeeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    const employeeId = employeeResult.rows[0].employee_id;

    // Main medical report with employee and user details
    const mainReportQuery = `
      SELECT 
        mr.*,
        e.name as employee_first_name,
        e.surname as employee_last_name,
        e.gender,
        e.id_number,
        e.date_of_birth,
        CONCAT(doctor_user.name, ' ', doctor_user.surname) as doctor_name,
        CONCAT(nurse_user.name, ' ', nurse_user.surname) as nurse_name
      FROM medical_report mr
      LEFT JOIN employee e ON e.id = mr.employee_id
      LEFT JOIN users doctor_user ON doctor_user.id = mr.doctor
      LEFT JOIN users nurse_user ON nurse_user.id = mr.nurse
      WHERE mr.id = $1
    `;

    // Get vitals and clinical metrics using employee_id
    const vitalsQuery = `
      SELECT * FROM vitals_clinical_metrics 
      WHERE employee_id = $1
      ORDER BY date_created DESC
      LIMIT 1
    `;

    // Get medical history using employee_id
    const medicalHistoryQuery = `
      SELECT * FROM employee_medical_history 
      WHERE employee_id = $1
      ORDER BY date_created DESC
      LIMIT 1
    `;

    // Get clinical examinations using employee_id
    const clinicalExamQuery = `
      SELECT * FROM clinical_examinations 
      WHERE employee_id = $1
      ORDER BY date_created DESC
      LIMIT 1
    `;

    // Get lab tests using employee_id
    const labTestsQuery = `
      SELECT * FROM lab_tests 
      WHERE employee_id = $1
      ORDER BY date_created DESC
      LIMIT 1
    `;

    // Get lifestyle data using employee_id
    const lifestyleQuery = `
      SELECT * FROM lifestyle 
      WHERE employee_id = $1
      ORDER BY date_created DESC
      LIMIT 1
    `;

    // Get mental health data using employee_id
    const mentalHealthQuery = `
      SELECT * FROM mental_health 
      WHERE employee_id = $1
      ORDER BY date_created DESC
      LIMIT 1
    `;

    // Get special investigations using employee_id
    const specialInvestigationsQuery = `
      SELECT * FROM special_investigations 
      WHERE employee_id = $1
      ORDER BY date_created DESC
      LIMIT 1
    `;

    // Get men's or women's health data using employee_id
    const mensHealthQuery = `
      SELECT * FROM mens_health 
      WHERE employee_id = $1
      ORDER BY date_created DESC
      LIMIT 1
    `;

    const womensHealthQuery = `
      SELECT * FROM womens_health 
      WHERE employee_id = $1
      ORDER BY date_created DESC
      LIMIT 1
    `;

    const notesQuery = `
      SELECT * FROM notes 
      WHERE employee_id = $1
      ORDER BY date_created DESC
      LIMIT 1
    `;

    // Execute all queries using employee_id
    const [
      mainReport,
      vitals,
      medicalHistory, 
      clinicalExam,
      labTests,
      lifestyle,
      mentalHealth,
      specialInvestigations,
      mensHealth,
      womensHealth,
      notes
    ] = await Promise.all([
      query(mainReportQuery, [reportId]),
      query(vitalsQuery, [employeeId]),
      query(medicalHistoryQuery, [employeeId]),
      query(clinicalExamQuery, [employeeId]),
      query(labTestsQuery, [employeeId]),
      query(lifestyleQuery, [employeeId]),
      query(mentalHealthQuery, [employeeId]),
      query(specialInvestigationsQuery, [employeeId]),
      query(mensHealthQuery, [employeeId]),
      query(womensHealthQuery, [employeeId]),
      query(notesQuery, [employeeId])
    ]);

    if (mainReport.rows.length === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const report = mainReport.rows[0];
    const vitalsData = vitals.rows[0];
    const historyData = medicalHistory.rows[0];
    const examData = clinicalExam.rows[0];
    const labData = labTests.rows[0];
    const lifestyleData = lifestyle.rows[0];
    const mentalData = mentalHealth.rows[0];
    const specialData = specialInvestigations.rows[0];
    const genderSpecificData = report.gender === 'Male' ? mensHealth.rows[0] : womensHealth.rows[0];
    const notesData = notes.rows[0];

    // Calculate age
    const age = report.date_of_birth 
      ? new Date().getFullYear() - new Date(report.date_of_birth).getFullYear()
      : null;

    // Build report structure exactly matching Executive Medical Report Sections specification
    const comprehensiveReport = {
      report_heading: {
        report_id: report.id,
        doctor_name: report.doctor_name ? 
          (report.doctor_name.includes('Dr.') ? report.doctor_name : `Dr. ${report.doctor_name}`) : 
          'Unassigned',
        nurse_name: report.nurse_name || 'Unassigned',
        date_updated: report.date_updated
      },
      personal_details: {
        id: report.employee_id,
        name: report.employee_first_name || '',
        surname: report.employee_last_name || '',
        gender: report.gender || '',
        id_or_passport: report.id_number || '',
        age: age,
        height_cm: vitalsData?.height_cm || null,
        waist: vitalsData?.waist || null,
        weight_kg: vitalsData?.weight_kg || null,
        blood_pressure: vitalsData ? `${vitalsData.systolic_bp || '0'}\\${vitalsData.diastolic_bp || '0'}` : '0\\0',
        blood_pressure_status: vitalsData?.blood_pressure_status || '',
        bmi: vitalsData?.bmi || null,
        bmi_status: vitalsData?.bmi_status || '',
        whtr_percent: vitalsData?.whtr ? `${Math.round((vitalsData.whtr * 100) * 100) / 100}%` : '',
        whtr_status: vitalsData?.whtr_status || ''
      },
      clinical_examinations: {
        general_assessment: examData?.general_assessment || 'Not Done',
        head_neck_incl_thyroid: examData?.['head_&_neck,_incl_thyroid'] || 'Not Done',
        cardiovascular: examData?.cardiovascular || 'Not Done',
        respiratory: examData?.respiratory || 'Not Done',
        gastrointestinal: examData?.gastrointestinal || 'Not Done',
        musculoskeletal: examData?.musculoskeletal || 'Not Done',
        neurological: examData?.neurological || 'Not Done',
        skin: examData?.skin || 'Not Done',
        hearing_assessment: examData?.hearing_assessment || 'Not Done',
        eyesight_status: examData?.eyesight_header || 'Not Done'
      },
      lab_tests: {
        full_blood_count_an_esr: labData?.['full_blood_count_an_esr'] || 'Not Done',
        kidney_function: labData?.kidney_function || 'Not Done',
        liver_enzymes: labData?.liver_enzymes || 'Not Done',
        vitamin_d: labData?.vitamin_d || 'Not Done',
        uric_acid: labData?.uric_acid || 'Not Done',
        hs_crp: labData?.['hs-crp'] || 'Not Done',
        homocysteine: labData?.homocysteine || 'Not Done',
        total_cholesterol: labData?.total_cholesterol || 'Not Done',
        fasting_glucose: labData?.fasting_glucose || 'Not Done',
        insulin_level: labData?.['Insulin_level'] || 'Not Done',
        thyroid_stimulating_hormone: labData?.thyroid_stimulating_hormone || 'Not Done',
        adrenal_response: labData?.['Adrenal Response'] || 'Not Done',
        sex_hormones: labData?.hormones || 'Not Done',
        psa: labData?.psa || 'Not Done',
        hiv: labData?.hiv || 'Not Done'
      },
      special_investigations: {
        resting_ecg: specialData?.resting_ecg || 'Not Done',
        stress_ecg: specialData?.stress_ecg || 'Not Done',
        lung_function: specialData?.lung_function || 'Not Done',
        urine_dipstix: specialData?.urine_dipstix || 'Not Done',
        kardiofit: specialData?.kardiofit || 'Not Done',
        nerveiq_cardio: specialData?.nerveiq_cardio || 'Not Done',
        nerveiq_cns: specialData?.nerveiq_cns || 'Not Done',
        nerveiq: specialData?.nerveiq || 'Not Done',
        predicted_vo2_max: specialData?.predicted_vo2_max || 'Not Done',
        body_fat_percentage: specialData?.body_fat_percentage || 'Not Done'
      },
      medical_history: {
        high_blood_pressure: historyData?.high_blood_pressure ? 'Yes' : 'No',
        high_cholesterol: historyData?.high_cholesterol ? 'Yes' : 'No',
        diabetes: historyData?.diabetes ? 'Yes' : 'No',
        asthma: historyData?.asthma ? 'Yes' : 'No',
        epilepsy: historyData?.epilepsy ? 'Yes' : 'No',
        thyroid_disease: historyData?.thyroid_disease ? 'Yes' : 'No',
        inflammatory_bowel_disease: historyData?.inflammatory_bowel_disease ? 'Yes' : 'No',
        hepatitis: historyData?.hepatitis ? 'Yes' : 'No',
        surgery: historyData?.surgery ? 'Yes' : 'No',
        anxiety_or_depression: historyData?.anxiety_or_depression ? 'Yes' : 'No',
        bipolar_mood_disorder: historyData?.bipolar_mood_disorder ? 'Yes' : 'No',
        hiv: historyData?.hiv ? 'Yes' : 'No',
        tb: historyData?.tb ? 'Yes' : 'No',
        disability: historyData?.['Does this person have a disability?'] ? 'Yes' : 'No',
        cardiac_event_in_family: (historyData?.heart_attack || historyData?.heart_attack_60) ? 'Yes' : 'No',
        cancer_family: historyData?.cancer_family ? 'Yes' : 'No'
      },
      allergies: {
        environmental: historyData?.environmental ? 'Yes' : (historyData?.environmental === false ? 'No' : 'Unknown'),
        food: historyData?.food ? 'Yes' : (historyData?.food === false ? 'No' : 'Unknown'),
        medication: historyData?.medication ? 'Yes' : (historyData?.medication === false ? 'No' : 'Unknown')
      },
      current_medication_supplements: {
        chronic_medication: historyData?.chronic_medication || 'None',
        vitamins_supplements: historyData?.vitamins_or_supplements || 'None'
      },
      screening: {
        abdominal_ultrasound: specialData?.abdominal_ultrasound ? 'Required' : 'Not Required',
        colonoscopy: specialData?.colonscopy_required ? 'Required' : 'Not Required',
        gastroscopy: specialData?.gastroscopy ? 'Required' : 'Not Required',
        bone_density_scan: specialData?.osteroporosis_screen ? 'Required' : 'Not Required',
        annual_screening_prostate: labData?.psa === 'Abnormal' ? 'Required' : 'Not Required'
      },
      mental_health: {
        anxiety_level: mentalData?.['gad2-score'] && mentalData['gad2-score'] <= 2 ? 'LOW' : 
                     (mentalData?.['gad2-score'] && mentalData['gad2-score'] <= 4 ? 'MEDIUM' : 'HIGH'),
        energy_level: mentalData?.energy_levels && mentalData.energy_levels <= 3 ? 'LOW' : 
                     (mentalData?.energy_levels && mentalData.energy_levels <= 6 ? 'MEDIUM' : 'HIGH'),
        mood_level: mentalData?.mood_feeling?.includes('Not at all') ? 'POSITIVE' : 
                   (mentalData?.mood_feeling?.includes('Several days') || mentalData?.mood_feeling?.includes('More than half') ? 'NEGATIVE' : 'UNKNOWN'),
        stress_level: mentalData?.stress_level && mentalData.stress_level <= 3 ? 'LOW' : 
                     (mentalData?.stress_level && mentalData.stress_level <= 6 ? 'MEDIUM' : 'HIGH'),
        sleep_rating: lifestyleData?.sleep_rating?.includes('Good') ? 'GOOD' : 
                     (lifestyleData?.sleep_rating?.includes('Fair') ? 'FAIR' : 
                     (lifestyleData?.sleep_rating?.includes('Poor') ? 'POOR' : 'UNKNOWN'))
      },
      cardiovascular_stroke_risk: {
        age_and_gender_risk: (age && age >= 45) || report.gender === 'Male' ? 'At Risk' : 'Low Risk',
        blood_pressure: vitalsData?.blood_pressure_status === 'High' ? 'At Risk' : 'Low Risk',
        cholesterol: labData?.total_cholesterol && parseFloat(labData.total_cholesterol) > 5.0 ? 'At Risk' : 'Low Risk',
        diabetes: (labData?.fasting_glucose && parseFloat(labData.fasting_glucose) >= 7.0) || historyData?.diabetes ? 'At Risk' : 'Low Risk',
        obesity: vitalsData?.bmi_status === 'Obese' ? 'At Risk' : 'Low Risk',
        waist_to_hip_ratio: vitalsData?.whtr_status === 'High' ? 'At Risk' : 'Low Risk',
        overall_diet: lifestyleData?.diet_overall?.includes('good') ? 'Low Risk' : 'At Risk',
        exercise: lifestyleData?.exercise?.includes('don\'t exercise') || lifestyleData?.exercise?.includes('seldom') ? 'At Risk' : 'Low Risk',
        alcohol_consumption: lifestyleData?.alcohol_score > 0 ? 'At Risk' : 'No Risk',
        smoking: lifestyleData?.smoke ? 'At Risk' : 'No Risk',
        stress_level: mentalData?.stress_level <= 3 ? 'Low Risk' : (mentalData?.stress_level <= 6 ? 'Medium Risk' : 'At Risk'),
        previous_cardiac_event: historyData?.high_blood_pressure || historyData?.high_cholesterol ? 'At Risk' : 'Low Risk',
        cardiac_history_in_family: historyData?.heart_attack || historyData?.heart_attack_60 ? 'At Risk' : 'Low Risk',
        stroke_history_in_family: historyData?.cancer_family ? 'At Risk' : 'Low Risk',
        reynolds_risk_score: 'Low Risk'
      },
      notes_recommendations: {
        recommendation_text: examData?.recommendation_text || ''
      },
      mens_health: {
        recommendation_text: report.gender === 'Male' ? (genderSpecificData?.recommendation_text || '') : ''
      },
      womens_health: {
        recommendation_text: report.gender === 'Female' ? (genderSpecificData?.recommendation_text || '') : ''
      },
      overview: {
        notes_text: notesData?.notes_text || ''
      },
      important_information_disclaimer: {
        disclaimer_text: 'Thank you for trusting us with your medical. It is important to note that there is no sign, symptom, or result from a special investigation that can conclusively say a person is free from any disease and is completely healthy. We make assessments and decisions based on the highest quality information we have at hand. The insidious nature of some diseases may still evade detection. Please proactively report any changes in your health and wellbeing that occur after your medical is completed. Regular, proactive screening facilitates earlier detection and better prevention of disease through early intervention and lifestyle change.\n\nTo book with our team of doctors or engage our health coach to help facilitate healthy change, click here.\n\n• Merchant Place: 011 685 5021 | staywell@healthwithheart.co.za\n• BankCity: 087 311 5011 | bewell@healthwithheart.co.za\n• Fairland: 011 632 4664 | feelwell@healthwithheart.co.za\n• WhatsApp: 079 262 8749\n\nWishing you good health, the greatest asset you can invest in.\n\nHealth with Heart Medical Team\nwww.healthwithheart.co.za'
      }
    };

    return NextResponse.json(comprehensiveReport);

  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    return NextResponse.json(
      { error: 'Failed to generate comprehensive report', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}