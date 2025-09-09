import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
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

    const employeeId = (employeeResult.rows[0] as { employee_id: string })
      .employee_id;

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
      notes,
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
      query(notesQuery, [employeeId]),
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
    const genderSpecificData =
      (report as { gender: string }).gender === 'Male'
        ? mensHealth.rows[0]
        : womensHealth.rows[0];
    const notesData = notes.rows[0];

    // Calculate age
    const age = (report as { date_of_birth: string }).date_of_birth
      ? new Date().getFullYear() -
        new Date(
          (report as { date_of_birth: string }).date_of_birth
        ).getFullYear()
      : null;

    // Build report structure exactly matching Executive Medical Report Sections specification
    const comprehensiveReport = {
      report_heading: {
        report_id: (report as { id: string }).id,
        doctor_name: (report as { doctor_name: string }).doctor_name
          ? (report as { doctor_name: string }).doctor_name.includes('Dr.')
            ? (report as { doctor_name: string }).doctor_name
            : `Dr. ${(report as { doctor_name: string }).doctor_name}`
          : 'Unassigned',
        nurse_name:
          (report as { nurse_name: string }).nurse_name || 'Unassigned',
        date_updated: (report as { date_updated: string }).date_updated,
      },
      personal_details: {
        id: (report as { employee_id: string }).employee_id,
        name:
          (report as { employee_first_name: string }).employee_first_name || '',
        surname:
          (report as { employee_last_name: string }).employee_last_name || '',
        gender: (report as { gender: string }).gender || '',
        id_or_passport: (report as { id_number: string }).id_number || '',
        age: age,
        height_cm: (vitalsData as { height_cm: number })?.height_cm || null,
        waist: (vitalsData as { waist: number })?.waist || null,
        weight_kg: (vitalsData as { weight_kg: number })?.weight_kg || null,
        blood_pressure: vitalsData
          ? `${(vitalsData as { systolic_bp: number }).systolic_bp || '0'}\\${(vitalsData as { diastolic_bp: number }).diastolic_bp || '0'}`
          : '0\\0',
        blood_pressure_status:
          (vitalsData as { blood_pressure_status: string })
            ?.blood_pressure_status || '',
        bmi: (vitalsData as { bmi: number })?.bmi || null,
        bmi_status: (vitalsData as { bmi_status: string })?.bmi_status || '',
        whtr_percent: (vitalsData as { whtr: number })?.whtr
          ? `${Math.round((vitalsData as { whtr: number }).whtr * 100 * 100) / 100}%`
          : '',
        whtr_status: (vitalsData as { whtr_status: string })?.whtr_status || '',
      },
      clinical_examinations: {
        general_assessment:
          (examData as { general_assessment: string })?.general_assessment ||
          'Not Done',
        head_neck_incl_thyroid:
          (examData as { 'head_&_neck,_incl_thyroid': string })?.[
            'head_&_neck,_incl_thyroid'
          ] || 'Not Done',
        cardiovascular:
          (examData as { cardiovascular: string })?.cardiovascular ||
          'Not Done',
        respiratory:
          (examData as { respiratory: string })?.respiratory || 'Not Done',
        gastrointestinal:
          (examData as { gastrointestinal: string })?.gastrointestinal ||
          'Not Done',
        musculoskeletal:
          (examData as { musculoskeletal: string })?.musculoskeletal ||
          'Not Done',
        neurological:
          (examData as { neurological: string })?.neurological || 'Not Done',
        skin: (examData as { skin: string })?.skin || 'Not Done',
        hearing_assessment:
          (examData as { hearing_assessment: string })?.hearing_assessment ||
          'Not Done',
        eyesight_status:
          (examData as { eyesight_header: string })?.eyesight_header ||
          'Not Done',
      },
      lab_tests: {
        full_blood_count_an_esr:
          (labData as { full_blood_count_an_esr: string })?.[
            'full_blood_count_an_esr'
          ] || 'Not Done',
        kidney_function:
          (labData as { kidney_function: string })?.kidney_function ||
          'Not Done',
        liver_enzymes:
          (labData as { liver_enzymes: string })?.liver_enzymes || 'Not Done',
        vitamin_d: (labData as { vitamin_d: string })?.vitamin_d || 'Not Done',
        uric_acid: (labData as { uric_acid: string })?.uric_acid || 'Not Done',
        hs_crp: (labData as { 'hs-crp': string })?.['hs-crp'] || 'Not Done',
        homocysteine:
          (labData as { homocysteine: string })?.homocysteine || 'Not Done',
        total_cholesterol:
          (labData as { total_cholesterol: string })?.total_cholesterol ||
          'Not Done',
        fasting_glucose:
          (labData as { fasting_glucose: string })?.fasting_glucose ||
          'Not Done',
        insulin_level:
          (labData as { Insulin_level: string })?.['Insulin_level'] ||
          'Not Done',
        thyroid_stimulating_hormone:
          (labData as { thyroid_stimulating_hormone: string })
            ?.thyroid_stimulating_hormone || 'Not Done',
        adrenal_response:
          (labData as { 'Adrenal Response': string })?.['Adrenal Response'] ||
          'Not Done',
        sex_hormones: (labData as { hormones: string })?.hormones || 'Not Done',
        psa: (labData as { psa: string })?.psa || 'Not Done',
        hiv: (labData as { hiv: string })?.hiv || 'Not Done',
      },
      special_investigations: {
        resting_ecg:
          (specialData as { resting_ecg: string })?.resting_ecg || 'Not Done',
        stress_ecg:
          (specialData as { stress_ecg: string })?.stress_ecg || 'Not Done',
        lung_function:
          (specialData as { lung_function: string })?.lung_function ||
          'Not Done',
        urine_dipstix:
          (specialData as { urine_dipstix: string })?.urine_dipstix ||
          'Not Done',
        kardiofit:
          (specialData as { kardiofit: string })?.kardiofit || 'Not Done',
        nerveiq_cardio:
          (specialData as { nerveiq_cardio: string })?.nerveiq_cardio ||
          'Not Done',
        nerveiq_cns:
          (specialData as { nerveiq_cns: string })?.nerveiq_cns || 'Not Done',
        nerveiq: (specialData as { nerveiq: string })?.nerveiq || 'Not Done',
        predicted_vo2_max:
          (specialData as { predicted_vo2_max: string })?.predicted_vo2_max ||
          'Not Done',
        body_fat_percentage:
          (specialData as { body_fat_percentage: string })
            ?.body_fat_percentage || 'Not Done',
      },
      medical_history: {
        high_blood_pressure: (historyData as { high_blood_pressure: boolean })
          ?.high_blood_pressure
          ? 'Yes'
          : 'No',
        high_cholesterol: (historyData as { high_cholesterol: boolean })
          ?.high_cholesterol
          ? 'Yes'
          : 'No',
        diabetes: (historyData as { diabetes: boolean })?.diabetes
          ? 'Yes'
          : 'No',
        asthma: (historyData as { asthma: boolean })?.asthma ? 'Yes' : 'No',
        epilepsy: (historyData as { epilepsy: boolean })?.epilepsy
          ? 'Yes'
          : 'No',
        thyroid_disease: (historyData as { thyroid_disease: boolean })
          ?.thyroid_disease
          ? 'Yes'
          : 'No',
        inflammatory_bowel_disease: (
          historyData as { inflammatory_bowel_disease: boolean }
        )?.inflammatory_bowel_disease
          ? 'Yes'
          : 'No',
        hepatitis: (historyData as { hepatitis: boolean })?.hepatitis
          ? 'Yes'
          : 'No',
        surgery: (historyData as { surgery: boolean })?.surgery ? 'Yes' : 'No',
        anxiety_or_depression: (
          historyData as { anxiety_or_depression: boolean }
        )?.anxiety_or_depression
          ? 'Yes'
          : 'No',
        bipolar_mood_disorder: (
          historyData as { bipolar_mood_disorder: boolean }
        )?.bipolar_mood_disorder
          ? 'Yes'
          : 'No',
        hiv: (historyData as { hiv: boolean })?.hiv ? 'Yes' : 'No',
        tb: (historyData as { tb: boolean })?.tb ? 'Yes' : 'No',
        disability: (
          historyData as { 'Does this person have a disability?': boolean }
        )?.['Does this person have a disability?']
          ? 'Yes'
          : 'No',
        cardiac_event_in_family:
          (historyData as { heart_attack: boolean })?.heart_attack ||
          (historyData as { heart_attack_60: boolean })?.heart_attack_60
            ? 'Yes'
            : 'No',
        cancer_family: (historyData as { cancer_family: boolean })
          ?.cancer_family
          ? 'Yes'
          : 'No',
      },
      allergies: {
        environmental: (historyData as { environmental: boolean })
          ?.environmental
          ? 'Yes'
          : (historyData as { environmental: boolean })?.environmental === false
            ? 'No'
            : 'Unknown',
        food: (historyData as { food: boolean })?.food
          ? 'Yes'
          : (historyData as { food: boolean })?.food === false
            ? 'No'
            : 'Unknown',
        medication: (historyData as { medication: boolean })?.medication
          ? 'Yes'
          : (historyData as { medication: boolean })?.medication === false
            ? 'No'
            : 'Unknown',
      },
      current_medication_supplements: {
        chronic_medication:
          (historyData as { chronic_medication: string })?.chronic_medication ||
          'None',
        vitamins_supplements:
          (historyData as { vitamins_or_supplements: string })
            ?.vitamins_or_supplements || 'None',
      },
      screening: {
        abdominal_ultrasound: (specialData as { abdominal_ultrasound: boolean })
          ?.abdominal_ultrasound
          ? 'Required'
          : 'Not Required',
        colonoscopy: (specialData as { colonscopy_required: boolean })
          ?.colonscopy_required
          ? 'Required'
          : 'Not Required',
        gastroscopy: (specialData as { gastroscopy: boolean })?.gastroscopy
          ? 'Required'
          : 'Not Required',
        bone_density_scan: (specialData as { osteroporosis_screen: boolean })
          ?.osteroporosis_screen
          ? 'Required'
          : 'Not Required',
        annual_screening_prostate:
          (labData as { psa: string })?.psa === 'Abnormal'
            ? 'Required'
            : 'Not Required',
      },
      mental_health: {
        anxiety_level:
          (mentalData as { 'gad2-score': number })?.['gad2-score'] &&
          (mentalData as { 'gad2-score': number })['gad2-score'] <= 2
            ? 'LOW'
            : (mentalData as { 'gad2-score': number })?.['gad2-score'] &&
                (mentalData as { 'gad2-score': number })['gad2-score'] <= 4
              ? 'MEDIUM'
              : 'HIGH',
        energy_level:
          (mentalData as { energy_levels: number })?.energy_levels &&
          (mentalData as { energy_levels: number }).energy_levels <= 3
            ? 'LOW'
            : (mentalData as { energy_levels: number })?.energy_levels &&
                (mentalData as { energy_levels: number }).energy_levels <= 6
              ? 'MEDIUM'
              : 'HIGH',
        mood_level: (
          mentalData as { mood_feeling: string }
        )?.mood_feeling?.includes('Not at all')
          ? 'POSITIVE'
          : (mentalData as { mood_feeling: string })?.mood_feeling?.includes(
                'Several days'
              ) ||
              (mentalData as { mood_feeling: string })?.mood_feeling?.includes(
                'More than half'
              )
            ? 'NEGATIVE'
            : 'UNKNOWN',
        stress_level:
          (mentalData as { stress_level: number })?.stress_level &&
          (mentalData as { stress_level: number }).stress_level <= 3
            ? 'LOW'
            : (mentalData as { stress_level: number })?.stress_level &&
                (mentalData as { stress_level: number }).stress_level <= 6
              ? 'MEDIUM'
              : 'HIGH',
        sleep_rating: (
          lifestyleData as { sleep_rating: string }
        )?.sleep_rating?.includes('Good')
          ? 'GOOD'
          : (lifestyleData as { sleep_rating: string })?.sleep_rating?.includes(
                'Fair'
              )
            ? 'FAIR'
            : (
                  lifestyleData as { sleep_rating: string }
                )?.sleep_rating?.includes('Poor')
              ? 'POOR'
              : 'UNKNOWN',
      },
      cardiovascular_stroke_risk: {
        age_and_gender_risk:
          (age && age >= 45) || (report as { gender: string }).gender === 'Male'
            ? 'At Risk'
            : 'Low Risk',
        blood_pressure:
          (vitalsData as { blood_pressure_status: string })
            ?.blood_pressure_status === 'High'
            ? 'At Risk'
            : 'Low Risk',
        cholesterol:
          (labData as { total_cholesterol: string })?.total_cholesterol &&
          parseFloat(
            (labData as { total_cholesterol: string }).total_cholesterol
          ) > 5.0
            ? 'At Risk'
            : 'Low Risk',
        diabetes:
          ((labData as { fasting_glucose: string })?.fasting_glucose &&
            parseFloat(
              (labData as { fasting_glucose: string }).fasting_glucose
            ) >= 7.0) ||
          (historyData as { diabetes: boolean })?.diabetes
            ? 'At Risk'
            : 'Low Risk',
        obesity:
          (vitalsData as { bmi_status: string })?.bmi_status === 'Obese'
            ? 'At Risk'
            : 'Low Risk',
        waist_to_hip_ratio:
          (vitalsData as { whtr_status: string })?.whtr_status === 'High'
            ? 'At Risk'
            : 'Low Risk',
        overall_diet: (
          lifestyleData as { diet_overall: string }
        )?.diet_overall?.includes('good')
          ? 'Low Risk'
          : 'At Risk',
        exercise:
          (lifestyleData as { exercise: string })?.exercise?.includes(
            "don't exercise"
          ) ||
          (lifestyleData as { exercise: string })?.exercise?.includes('seldom')
            ? 'At Risk'
            : 'Low Risk',
        alcohol_consumption:
          (lifestyleData as { alcohol_score: number })?.alcohol_score > 0
            ? 'At Risk'
            : 'No Risk',
        smoking: (lifestyleData as { smoke: boolean })?.smoke
          ? 'At Risk'
          : 'No Risk',
        stress_level:
          (mentalData as { stress_level: number })?.stress_level <= 3
            ? 'Low Risk'
            : (mentalData as { stress_level: number })?.stress_level <= 6
              ? 'Medium Risk'
              : 'At Risk',
        previous_cardiac_event:
          (historyData as { high_blood_pressure: boolean })
            ?.high_blood_pressure ||
          (historyData as { high_cholesterol: boolean })?.high_cholesterol
            ? 'At Risk'
            : 'Low Risk',
        cardiac_history_in_family:
          (historyData as { heart_attack: boolean })?.heart_attack ||
          (historyData as { heart_attack_60: boolean })?.heart_attack_60
            ? 'At Risk'
            : 'Low Risk',
        stroke_history_in_family: (historyData as { cancer_family: boolean })
          ?.cancer_family
          ? 'At Risk'
          : 'Low Risk',
        reynolds_risk_score: 'Low Risk',
      },
      notes_recommendations: {
        recommendation_text:
          (examData as { recommendation_text: string })?.recommendation_text ||
          '',
      },
      mens_health: {
        recommendation_text:
          (report as { gender: string }).gender === 'Male'
            ? (genderSpecificData as { recommendation_text: string })
                ?.recommendation_text || ''
            : '',
      },
      womens_health: {
        recommendation_text:
          (report as { gender: string }).gender === 'Female'
            ? (genderSpecificData as { recommendation_text: string })
                ?.recommendation_text || ''
            : '',
      },
      overview: {
        notes_text: (notesData as { notes_text: string })?.notes_text || '',
      },
      important_information_disclaimer: {
        disclaimer_text:
          'Thank you for trusting us with your medical. It is important to note that there is no sign, symptom, or result from a special investigation that can conclusively say a person is free from any disease and is completely healthy. We make assessments and decisions based on the highest quality information we have at hand. The insidious nature of some diseases may still evade detection. Please proactively report any changes in your health and wellbeing that occur after your medical is completed. Regular, proactive screening facilitates earlier detection and better prevention of disease through early intervention and lifestyle change.\n\nTo book with our team of doctors or engage our health coach to help facilitate healthy change, click here.\n\n• Merchant Place: 011 685 5021 | staywell@healthwithheart.co.za\n• BankCity: 087 311 5011 | bewell@healthwithheart.co.za\n• Fairland: 011 632 4664 | feelwell@healthwithheart.co.za\n• WhatsApp: 079 262 8749\n\nWishing you good health, the greatest asset you can invest in.\n\nHealth with Heart Medical Team\nwww.healthwithheart.co.za',
      },
    };

    return NextResponse.json(comprehensiveReport);
  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate comprehensive report',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
