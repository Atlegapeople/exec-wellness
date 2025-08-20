'use client';

import { useState, useEffect } from 'react';

interface MedicalReport {
  id: string;
  date_created: string;
  date_updated: string;
  employee_id: string;
  type: string;
  sub_type: string;
  doctor: string;
  doctor_signoff: string;
  doctor_signature: string;
  nurse: string;
  nurse_signature: string;
  report_work_status: string;
  notes_text: string;
  recommendation_text: string;
  employee_work_email: string;
  employee_personal_email: string;
  manager_email: string;
  doctor_email: string;
  workplace: string;
  line_manager: string;
  line_manager2: string;
  employee_name: string;
  employee_surname: string;
  doctor_name: string;
  doctor_surname: string;
  nurse_name: string;
  nurse_surname: string;
  workplace_name: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface FormData {
  [key: string]: any;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<MedicalReport[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(
    null
  );
  const [formData, setFormData] = useState<FormData | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch reports data
  const fetchData = async (page: number = 1) => {
    try {
      setLoading(true);

      const reportsResponse = await fetch(
        `/api/reports?page=${page}&limit=${pagination.limit}`
      );
      const data = await reportsResponse.json();

      setReports(data.reports);
      setFilteredReports(data.reports);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter reports based on search and status
  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report => {
        const employeeName =
          `${report.employee_name || ''} ${report.employee_surname || ''}`.trim();
        const doctorName =
          `${report.doctor_name || ''} ${report.doctor_surname || ''}`.trim();
        return (
          employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.workplace_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          report.employee_work_email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          report.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => {
        if (statusFilter === 'signed') return report.doctor_signoff === 'Yes';
        if (statusFilter === 'pending') return report.doctor_signoff !== 'Yes';
        return true;
      });
    }

    setFilteredReports(filtered);
  }, [searchTerm, statusFilter, reports]);

  const getEmployeeName = (report: MedicalReport) => {
    return report.employee_name && report.employee_surname
      ? `${report.employee_name} ${report.employee_surname}`
      : 'Unknown Employee';
  };

  const getDoctorName = (report: MedicalReport) => {
    if (!report.doctor_name && !report.doctor_surname) {
      return 'Unassigned';
    }
    return report.doctor_name && report.doctor_surname
      ? `Dr. ${report.doctor_name} ${report.doctor_surname}`
      : 'Unknown Doctor';
  };

  const getNurseName = (report: MedicalReport) => {
    if (!report.nurse_name && !report.nurse_surname) {
      return 'Unassigned';
    }
    return report.nurse_name && report.nurse_surname
      ? `${report.nurse_name} ${report.nurse_surname}`
      : 'Unknown Nurse';
  };

  const handleReportClick = async (report: MedicalReport) => {
    setSelectedReport(report);
    setFormLoading(true);

    try {
      const response = await fetch(`/api/reports/form-data/${report.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      } else {
        console.error('Failed to fetch form data');
        setFormData(null);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
      setFormData(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!selectedReport) return;

    try {
      const response = await fetch(`/api/reports/pdf/${selectedReport.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Executive_Medical_Report_${selectedReport.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    }
  };

  const canGeneratePDF = () => {
    return selectedReport?.doctor_signoff === 'Yes';
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-full mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div>
              <div className='flex items-center gap-4'>
                <a
                  href='/'
                  className='text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2'
                >
                  ← Back to Dashboard
                </a>
                <div className='h-6 w-px bg-gray-300'></div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    📊 Executive Medical Reports
                  </h1>
                  <p className='text-sm text-gray-500'>
                    Click on a report to view details and generate PDF
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <main className='max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div
          className={`grid gap-6 transition-all duration-300 ${selectedReport ? 'grid-cols-2' : 'grid-cols-1'}`}
        >
          {/* Left Panel - Reports Table */}
          <div
            className={`space-y-4 ${selectedReport ? 'max-w-none' : 'max-w-7xl mx-auto'}`}
          >
            {/* Filters and Search */}
            <div className='bg-white p-4 rounded-lg shadow-sm border'>
              <div className='flex flex-col lg:flex-row gap-4 items-center justify-between'>
                <div className='flex flex-col lg:flex-row gap-4 flex-1'>
                  <div className='flex-1'>
                    <input
                      type='text'
                      placeholder='Search by employee, doctor, workplace, email, or report ID...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value='all'>All Reports</option>
                      <option value='signed'>Signed by Doctor</option>
                      <option value='pending'>Pending Signature</option>
                    </select>
                  </div>
                </div>
                <div className='text-sm text-gray-600'>
                  {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{' '}
                  of {pagination.total}
                </div>
              </div>
            </div>

            {/* Reports Table */}
            <div className='bg-white rounded-lg shadow-sm border overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Report ID
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Employee
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Date
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Doctor
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Nurse
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Workplace
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {filteredReports.map(report => (
                      <tr
                        key={report.id}
                        onClick={() => handleReportClick(report)}
                        className={`cursor-pointer transition-colors ${
                          selectedReport?.id === report.id
                            ? 'bg-blue-50 border-l-4 border-blue-500'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className='px-3 py-3'>
                          <div
                            className='text-xs font-mono text-gray-600'
                            title={report.id}
                          >
                            {report.id}
                          </div>
                        </td>
                        <td className='px-3 py-3'>
                          <div className='min-w-0'>
                            <div className='text-sm font-medium text-gray-900 truncate'>
                              {getEmployeeName(report)}
                            </div>
                            <div className='text-xs text-gray-500 truncate'>
                              {report.employee_work_email}
                            </div>
                          </div>
                        </td>
                        <td className='px-3 py-3 text-sm text-gray-900'>
                          <div className='whitespace-nowrap'>
                            {new Date(report.date_created).toLocaleDateString(
                              'en-GB',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit',
                              }
                            )}
                          </div>
                        </td>
                        <td className='px-3 py-3'>
                          <div
                            className='text-sm text-gray-900 truncate'
                            title={getDoctorName(report)}
                          >
                            {getDoctorName(report)}
                          </div>
                        </td>
                        <td className='px-3 py-3'>
                          <div
                            className='text-sm text-gray-900 truncate'
                            title={getNurseName(report)}
                          >
                            {getNurseName(report)}
                          </div>
                        </td>
                        <td className='px-3 py-3'>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                              report.doctor_signoff === 'Yes'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {report.doctor_signoff || 'Pending'}
                          </span>
                        </td>
                        <td className='px-3 py-3'>
                          <div
                            className='text-sm text-gray-900 truncate'
                            title={report.workplace_name || 'N/A'}
                          >
                            {report.workplace_name || 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm border'>
                <div className='flex-1 flex justify-between sm:hidden'>
                  <button
                    onClick={() => fetchData(pagination.page - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchData(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
                  >
                    Next
                  </button>
                </div>
                <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
                  <div>
                    <p className='text-sm text-gray-700'>
                      Page{' '}
                      <span className='font-medium'>{pagination.page}</span> of{' '}
                      <span className='font-medium'>
                        {pagination.totalPages}
                      </span>
                    </p>
                  </div>
                  <div>
                    <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                      <button
                        onClick={() => fetchData(pagination.page - 1)}
                        disabled={!pagination.hasPreviousPage}
                        className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
                      >
                        Previous
                      </button>

                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          const pageNum = Math.max(1, pagination.page - 2) + i;
                          if (pageNum > pagination.totalPages) return null;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => fetchData(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNum === pagination.page
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() => fetchData(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}

            {filteredReports.length === 0 && (
              <div className='text-center py-12 bg-white rounded-lg shadow-sm border'>
                <div className='text-4xl mb-4'>📊</div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No reports found
                </h3>
                <p className='text-gray-500'>
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search criteria or filters.'
                    : 'No Executive Medical reports are available.'}
                </p>
              </div>
            )}
          </div>

          {/* Right Panel - Form Preview */}
          {selectedReport && (
            <div className='bg-white rounded-lg shadow-sm border max-h-screen overflow-y-auto'>
              {/* Form Header */}
              <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Medical Report - {getEmployeeName(selectedReport)}
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Report ID: {selectedReport.id}
                    </p>
                  </div>
                  <div className='flex space-x-2'>
                    <button
                      onClick={handleGeneratePDF}
                      disabled={!canGeneratePDF()}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        canGeneratePDF()
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      title={
                        canGeneratePDF()
                          ? 'Generate PDF'
                          : 'PDF only available for signed reports'
                      }
                    >
                      📄 Generate PDF
                    </button>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className='px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors'
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className='px-6 py-4'>
                {formLoading ? (
                  <div className='text-center py-12'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                    <p className='text-gray-600'>Loading form data...</p>
                  </div>
                ) : formData ? (
                  <div className='space-y-6'>
                    {/* Report Heading */}
                    <div className='bg-blue-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-blue-900 mb-3'>
                        Report Heading
                      </h4>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <strong>Report ID:</strong>{' '}
                          {formData.report_heading?.report_id}
                        </div>
                        <div>
                          <strong>Doctor Name:</strong>{' '}
                          {formData.report_heading?.doctor_name || 'Unassigned'}
                        </div>
                        <div>
                          <strong>Nurse Name:</strong>{' '}
                          {formData.report_heading?.nurse_name || 'Unassigned'}
                        </div>
                        <div>
                          <strong>Date Updated:</strong>{' '}
                          {formData.report_heading?.date_updated
                            ? new Date(
                                formData.report_heading.date_updated
                              ).toLocaleDateString()
                            : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Personal Details */}
                    <div className='bg-green-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-green-900 mb-3'>
                        Personal Details
                      </h4>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <strong>ID:</strong> {formData.personal_details?.id}
                        </div>
                        <div>
                          <strong>Name:</strong>{' '}
                          {formData.personal_details?.name}
                        </div>
                        <div>
                          <strong>Surname:</strong>{' '}
                          {formData.personal_details?.surname}
                        </div>
                        <div>
                          <strong>Gender:</strong>{' '}
                          {formData.personal_details?.gender}
                        </div>
                        <div>
                          <strong>ID or Passport:</strong>{' '}
                          {formData.personal_details?.id_or_passport}
                        </div>
                        <div>
                          <strong>Age:</strong> {formData.personal_details?.age}
                        </div>
                        <div>
                          <strong>Height (cm):</strong>{' '}
                          {formData.personal_details?.height_cm}
                        </div>
                        <div>
                          <strong>Waist (cm):</strong>{' '}
                          {formData.personal_details?.waist}
                        </div>
                        <div>
                          <strong>Weight (kg):</strong>{' '}
                          {formData.personal_details?.weight_kg}
                        </div>
                        <div>
                          <strong>Blood Pressure:</strong>{' '}
                          {formData.personal_details?.blood_pressure}
                        </div>
                        <div>
                          <strong>Blood Pressure Status:</strong>{' '}
                          {formData.personal_details?.blood_pressure_status}
                        </div>
                        <div>
                          <strong>BMI:</strong> {formData.personal_details?.bmi}
                        </div>
                        <div>
                          <strong>BMI Status:</strong>{' '}
                          {formData.personal_details?.bmi_status}
                        </div>
                        <div>
                          <strong>WHtR Percent:</strong>{' '}
                          {formData.personal_details?.whtr_percent}
                        </div>
                        <div>
                          <strong>WHtR Status:</strong>{' '}
                          {formData.personal_details?.whtr_status}
                        </div>
                      </div>
                    </div>

                    {/* Clinical Examinations */}
                    <div className='bg-yellow-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-yellow-900 mb-3'>
                        Clinical Examinations
                      </h4>
                      <div className='grid grid-cols-1 gap-2 text-sm'>
                        <div>
                          <strong>General Assessment:</strong>{' '}
                          {formData.clinical_examinations?.general_assessment ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>Head & Neck (incl Thyroid):</strong>{' '}
                          {formData.clinical_examinations
                            ?.head_neck_incl_thyroid || 'Not Done'}
                        </div>
                        <div>
                          <strong>Cardiovascular:</strong>{' '}
                          {formData.clinical_examinations?.cardiovascular ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>Respiratory:</strong>{' '}
                          {formData.clinical_examinations?.respiratory ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>Gastrointestinal:</strong>{' '}
                          {formData.clinical_examinations?.gastrointestinal ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>Musculoskeletal:</strong>{' '}
                          {formData.clinical_examinations?.musculoskeletal ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>Neurological:</strong>{' '}
                          {formData.clinical_examinations?.neurological ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>Skin:</strong>{' '}
                          {formData.clinical_examinations?.skin || 'Not Done'}
                        </div>
                        <div>
                          <strong>Hearing Assessment:</strong>{' '}
                          {formData.clinical_examinations?.hearing_assessment ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>Eyesight Status:</strong>{' '}
                          {formData.clinical_examinations?.eyesight_status ||
                            'Not Done'}
                        </div>
                      </div>
                    </div>

                    {/* Lab Tests */}
                    <div className='bg-purple-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-purple-900 mb-3'>
                        Lab Tests
                      </h4>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <strong>Full Blood Count & ESR:</strong>{' '}
                          {formData.lab_tests?.full_blood_count_an_esr ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>Kidney Function:</strong>{' '}
                          {formData.lab_tests?.kidney_function || 'Not Done'}
                        </div>
                        <div>
                          <strong>Liver Enzymes:</strong>{' '}
                          {formData.lab_tests?.liver_enzymes || 'Not Done'}
                        </div>
                        <div>
                          <strong>Vitamin D:</strong>{' '}
                          {formData.lab_tests?.vitamin_d || 'Not Done'}
                        </div>
                        <div>
                          <strong>Uric Acid:</strong>{' '}
                          {formData.lab_tests?.uric_acid || 'Not Done'}
                        </div>
                        <div>
                          <strong>hs-CRP:</strong>{' '}
                          {formData.lab_tests?.hs_crp || 'Not Done'}
                        </div>
                        <div>
                          <strong>Homocysteine:</strong>{' '}
                          {formData.lab_tests?.homocysteine || 'Not Done'}
                        </div>
                        <div>
                          <strong>Total Cholesterol:</strong>{' '}
                          {formData.lab_tests?.total_cholesterol || 'Not Done'}
                        </div>
                        <div>
                          <strong>Fasting Glucose:</strong>{' '}
                          {formData.lab_tests?.fasting_glucose || 'Not Done'}
                        </div>
                        <div>
                          <strong>Insulin Level:</strong>{' '}
                          {formData.lab_tests?.insulin_level || 'Not Done'}
                        </div>
                        <div>
                          <strong>Thyroid Stimulating Hormone:</strong>{' '}
                          {formData.lab_tests?.thyroid_stimulating_hormone ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>Adrenal Response:</strong>{' '}
                          {formData.lab_tests?.adrenal_response || 'Not Done'}
                        </div>
                        <div>
                          <strong>Sex Hormones:</strong>{' '}
                          {formData.lab_tests?.sex_hormones || 'Not Done'}
                        </div>
                        <div>
                          <strong>PSA:</strong>{' '}
                          {formData.lab_tests?.psa || 'Not Done'}
                        </div>
                        <div>
                          <strong>HIV:</strong>{' '}
                          {formData.lab_tests?.hiv || 'Not Done'}
                        </div>
                      </div>
                    </div>

                    {/* Special Investigations */}
                    <div className='bg-cyan-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-cyan-900 mb-3'>
                        Special Investigations
                      </h4>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <strong>Resting ECG:</strong>{' '}
                          {formData.special_investigations?.resting_ecg ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>Stress ECG:</strong>{' '}
                          {formData.special_investigations?.stress_ecg ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>Lung Function:</strong>{' '}
                          {formData.special_investigations?.lung_function ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>Urine Dipstix:</strong>{' '}
                          {formData.special_investigations?.urine_dipstix ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>KardioFit:</strong>{' '}
                          {formData.special_investigations?.kardiofit ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>NerveIQ Cardio:</strong>{' '}
                          {formData.special_investigations?.nerveiq_cardio ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>NerveIQ CNS:</strong>{' '}
                          {formData.special_investigations?.nerveiq_cns ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>NerveIQ:</strong>{' '}
                          {formData.special_investigations?.nerveiq ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>Predicted VO2 Max:</strong>{' '}
                          {formData.special_investigations?.predicted_vo2_max ||
                            'Not Done'}
                        </div>
                        <div>
                          <strong>Body Fat Percentage:</strong>{' '}
                          {formData.special_investigations
                            ?.body_fat_percentage || 'Not Done'}
                        </div>
                      </div>
                    </div>

                    {/* Medical History */}
                    <div className='bg-red-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-red-900 mb-3'>
                        Medical History
                      </h4>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <strong>High Blood Pressure:</strong>{' '}
                          {formData.medical_history?.high_blood_pressure}
                        </div>
                        <div>
                          <strong>High Cholesterol:</strong>{' '}
                          {formData.medical_history?.high_cholesterol}
                        </div>
                        <div>
                          <strong>Diabetes:</strong>{' '}
                          {formData.medical_history?.diabetes}
                        </div>
                        <div>
                          <strong>Asthma:</strong>{' '}
                          {formData.medical_history?.asthma}
                        </div>
                        <div>
                          <strong>Epilepsy:</strong>{' '}
                          {formData.medical_history?.epilepsy}
                        </div>
                        <div>
                          <strong>Thyroid Disease:</strong>{' '}
                          {formData.medical_history?.thyroid_disease}
                        </div>
                        <div>
                          <strong>Inflammatory Bowel Disease:</strong>{' '}
                          {formData.medical_history?.inflammatory_bowel_disease}
                        </div>
                        <div>
                          <strong>Hepatitis:</strong>{' '}
                          {formData.medical_history?.hepatitis}
                        </div>
                        <div>
                          <strong>Surgery:</strong>{' '}
                          {formData.medical_history?.surgery}
                        </div>
                        <div>
                          <strong>Anxiety or Depression:</strong>{' '}
                          {formData.medical_history?.anxiety_or_depression}
                        </div>
                        <div>
                          <strong>Bipolar Mood Disorder:</strong>{' '}
                          {formData.medical_history?.bipolar_mood_disorder}
                        </div>
                        <div>
                          <strong>HIV:</strong> {formData.medical_history?.hiv}
                        </div>
                        <div>
                          <strong>TB:</strong> {formData.medical_history?.tb}
                        </div>
                        <div>
                          <strong>Disability:</strong>{' '}
                          {formData.medical_history?.disability}
                        </div>
                        <div>
                          <strong>Cardiac Event in Family:</strong>{' '}
                          {formData.medical_history?.cardiac_event_in_family}
                        </div>
                        <div>
                          <strong>Cancer Family:</strong>{' '}
                          {formData.medical_history?.cancer_family}
                        </div>
                      </div>
                    </div>

                    {/* Allergies */}
                    <div className='bg-orange-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-orange-900 mb-3'>
                        Allergies
                      </h4>
                      <div className='grid grid-cols-3 gap-4 text-sm'>
                        <div>
                          <strong>Environmental:</strong>{' '}
                          {formData.allergies?.environmental}
                        </div>
                        <div>
                          <strong>Food:</strong> {formData.allergies?.food}
                        </div>
                        <div>
                          <strong>Medication:</strong>{' '}
                          {formData.allergies?.medication}
                        </div>
                      </div>
                    </div>

                    {/* Current Medication and Supplements */}
                    <div className='bg-indigo-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-indigo-900 mb-3'>
                        Current Medication and Supplements
                      </h4>
                      <div className='grid grid-cols-1 gap-2 text-sm'>
                        <div>
                          <strong>Chronic Medication:</strong>{' '}
                          {
                            formData.current_medication_supplements
                              ?.chronic_medication
                          }
                        </div>
                        <div>
                          <strong>Vitamins/Supplements:</strong>{' '}
                          {
                            formData.current_medication_supplements
                              ?.vitamins_supplements
                          }
                        </div>
                      </div>
                    </div>

                    {/* Screening */}
                    <div className='bg-amber-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-amber-900 mb-3'>
                        Screening
                      </h4>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <strong>Abdominal UltraSound:</strong>{' '}
                          {formData.screening?.abdominal_ultrasound}
                        </div>
                        <div>
                          <strong>Colonoscopy:</strong>{' '}
                          {formData.screening?.colonoscopy}
                        </div>
                        <div>
                          <strong>Gastroscopy:</strong>{' '}
                          {formData.screening?.gastroscopy}
                        </div>
                        <div>
                          <strong>Bone Density Scan:</strong>{' '}
                          {formData.screening?.bone_density_scan}
                        </div>
                        <div>
                          <strong>Annual Screening for Prostate:</strong>{' '}
                          {formData.screening?.annual_screening_prostate}
                        </div>
                      </div>
                    </div>

                    {/* Mental Health */}
                    <div className='bg-teal-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-teal-900 mb-3'>
                        Mental Health
                      </h4>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <strong>Anxiety Level:</strong>{' '}
                          {formData.mental_health?.anxiety_level ||
                            'Not assessed'}
                        </div>
                        <div>
                          <strong>Energy Level:</strong>{' '}
                          {formData.mental_health?.energy_level ||
                            'Not assessed'}
                        </div>
                        <div>
                          <strong>Mood Level:</strong>{' '}
                          {formData.mental_health?.mood_level || 'Not assessed'}
                        </div>
                        <div>
                          <strong>Stress Level:</strong>{' '}
                          {formData.mental_health?.stress_level ||
                            'Not assessed'}
                        </div>
                        <div>
                          <strong>Sleep Rating:</strong>{' '}
                          {formData.mental_health?.sleep_rating ||
                            'Not assessed'}
                        </div>
                      </div>
                    </div>

                    {/* Cardiovascular/Stroke Risk */}
                    <div className='bg-pink-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-pink-900 mb-3'>
                        Cardiovascular/Stroke Risk
                      </h4>

                      <div className='flex gap-6'>
                        {/* Risk factors table */}
                        <div className='flex-1'>
                          <div className='bg-white rounded border divide-y'>
                            {formData.cardiovascular_stroke_risk &&
                              Object.entries({
                                'Age & Gender':
                                  formData.cardiovascular_stroke_risk
                                    .age_and_gender_risk,
                                'Blood Pressure':
                                  formData.cardiovascular_stroke_risk
                                    .blood_pressure,
                                Cholesterol:
                                  formData.cardiovascular_stroke_risk
                                    .cholesterol,
                                Diabetes:
                                  formData.cardiovascular_stroke_risk.diabetes,
                                Obesity:
                                  formData.cardiovascular_stroke_risk.obesity,
                                'Waist to Hip Ratio':
                                  formData.cardiovascular_stroke_risk
                                    .waist_to_hip_ratio,
                                'Overall Diet':
                                  formData.cardiovascular_stroke_risk
                                    .overall_diet,
                                Exercise:
                                  formData.cardiovascular_stroke_risk.exercise,
                                'Alcohol Consumption':
                                  formData.cardiovascular_stroke_risk
                                    .alcohol_consumption,
                                Smoking:
                                  formData.cardiovascular_stroke_risk.smoking,
                                'Stress Level':
                                  formData.cardiovascular_stroke_risk
                                    .stress_level,
                                'Previous Cardiac Event':
                                  formData.cardiovascular_stroke_risk
                                    .previous_cardiac_event,
                                'Cardiac History In Family':
                                  formData.cardiovascular_stroke_risk
                                    .cardiac_history_in_family,
                                'Stroke History In Family':
                                  formData.cardiovascular_stroke_risk
                                    .stroke_history_in_family,
                                'Reynolds Risk Score':
                                  formData.cardiovascular_stroke_risk
                                    .reynolds_risk_score,
                              }).map(([factor, status]) => (
                                <div
                                  key={factor}
                                  className='flex justify-between items-center px-3 py-2 text-sm'
                                >
                                  <span>{factor}</span>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                      status === 'At Risk'
                                        ? 'bg-red-100 text-red-800'
                                        : status === 'Medium Risk' ||
                                            status === 'Medium'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : status === 'Low Risk' ||
                                              status === 'No Risk'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}
                                  >
                                    {status}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Risk distribution pie chart */}
                        <div className='w-64'>
                          <div className='bg-white p-4 rounded border text-center'>
                            <h5 className='font-semibold text-gray-900 mb-3'>
                              Risk Distribution
                            </h5>
                            {(() => {
                              const riskFactors =
                                formData.cardiovascular_stroke_risk
                                  ? Object.values({
                                      age_gender:
                                        formData.cardiovascular_stroke_risk
                                          .age_and_gender_risk,
                                      blood_pressure:
                                        formData.cardiovascular_stroke_risk
                                          .blood_pressure,
                                      cholesterol:
                                        formData.cardiovascular_stroke_risk
                                          .cholesterol,
                                      diabetes:
                                        formData.cardiovascular_stroke_risk
                                          .diabetes,
                                      obesity:
                                        formData.cardiovascular_stroke_risk
                                          .obesity,
                                      waist_to_hip_ratio:
                                        formData.cardiovascular_stroke_risk
                                          .waist_to_hip_ratio,
                                      overall_diet:
                                        formData.cardiovascular_stroke_risk
                                          .overall_diet,
                                      exercise:
                                        formData.cardiovascular_stroke_risk
                                          .exercise,
                                      alcohol_consumption:
                                        formData.cardiovascular_stroke_risk
                                          .alcohol_consumption,
                                      smoking:
                                        formData.cardiovascular_stroke_risk
                                          .smoking,
                                      stress_level:
                                        formData.cardiovascular_stroke_risk
                                          .stress_level,
                                      previous_cardiac_event:
                                        formData.cardiovascular_stroke_risk
                                          .previous_cardiac_event,
                                      cardiac_history_in_family:
                                        formData.cardiovascular_stroke_risk
                                          .cardiac_history_in_family,
                                      stroke_history_in_family:
                                        formData.cardiovascular_stroke_risk
                                          .stroke_history_in_family,
                                      reynolds_risk_score:
                                        formData.cardiovascular_stroke_risk
                                          .reynolds_risk_score,
                                    })
                                  : [];

                              const riskCounts = riskFactors.reduce(
                                (acc: Record<string, number>, risk) => {
                                  const normalizedRisk =
                                    risk === 'No Risk' || risk === 'Low Risk'
                                      ? 'Low Risk'
                                      : risk === 'Medium Risk' ||
                                          risk === 'Medium'
                                        ? 'Medium'
                                        : 'At Risk';
                                  acc[normalizedRisk] =
                                    (acc[normalizedRisk] || 0) + 1;
                                  return acc;
                                },
                                {}
                              );

                              const total = Object.values(riskCounts).reduce(
                                (sum: number, count: number) => sum + count,
                                0
                              );
                              const colors = {
                                'Low Risk': '#10B981',
                                Medium: '#F59E0B',
                                'At Risk': '#EF4444',
                              };

                              // Create slices for pie chart
                              const slices = Object.entries(riskCounts).map(
                                ([status, count]) => ({
                                  status,
                                  count,
                                  percentage: Math.round(
                                    ((count as number) / (total as number)) *
                                      100
                                  ),
                                  color:
                                    colors[status as keyof typeof colors] ||
                                    '#6B7280',
                                })
                              );

                              // Sort by count descending
                              slices.sort(
                                (a, b) =>
                                  (b.count as number) - (a.count as number)
                              );
                              const dominantSlice = slices[0];
                              const hasMultiple = slices.length > 1;

                              return (
                                <div className='flex flex-col items-center'>
                                  {/* Pie Chart Visual */}
                                  <div className='relative mb-4'>
                                    <svg
                                      width='80'
                                      height='80'
                                      className='transform -rotate-90'
                                    >
                                      {(() => {
                                        let cumulativeAngle = 0;
                                        const radius = 35;
                                        const centerX = 40;
                                        const centerY = 40;

                                        return slices.map(
                                          (
                                            { status, percentage, color },
                                            index
                                          ) => {
                                            const angle =
                                              (percentage / 100) * 360;
                                            const startAngle = cumulativeAngle;
                                            const endAngle =
                                              cumulativeAngle + angle;

                                            const startAngleRad =
                                              (startAngle * Math.PI) / 180;
                                            const endAngleRad =
                                              (endAngle * Math.PI) / 180;

                                            const x1 =
                                              centerX +
                                              radius * Math.cos(startAngleRad);
                                            const y1 =
                                              centerY +
                                              radius * Math.sin(startAngleRad);
                                            const x2 =
                                              centerX +
                                              radius * Math.cos(endAngleRad);
                                            const y2 =
                                              centerY +
                                              radius * Math.sin(endAngleRad);

                                            const largeArcFlag =
                                              angle > 180 ? 1 : 0;

                                            const pathData = [
                                              `M ${centerX} ${centerY}`,
                                              `L ${x1} ${y1}`,
                                              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                              'Z',
                                            ].join(' ');

                                            cumulativeAngle += angle;

                                            return (
                                              <path
                                                key={status}
                                                d={pathData}
                                                fill={color}
                                                stroke='#ffffff'
                                                strokeWidth='1'
                                              />
                                            );
                                          }
                                        );
                                      })()}
                                    </svg>
                                    <div className='absolute inset-0 flex items-center justify-center'>
                                      <div className='text-center'>
                                        <div className='text-xs font-bold text-gray-800'>
                                          {total as number}
                                        </div>
                                        <div className='text-xs text-gray-600'>
                                          Factors
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Legend */}
                                  <div className='space-y-1'>
                                    {slices.map(
                                      ({
                                        status,
                                        count,
                                        percentage,
                                        color,
                                      }) => (
                                        <div
                                          key={status}
                                          className='flex items-center justify-between gap-3 text-xs'
                                        >
                                          <div className='flex items-center gap-2'>
                                            <div
                                              className='w-2 h-2 rounded'
                                              style={{ backgroundColor: color }}
                                            ></div>
                                            <span>{String(status)}</span>
                                          </div>
                                          <span className='font-semibold'>
                                            {count as number} ({percentage}%)
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes and Recommendations */}
                    {formData.notes_recommendations?.recommendation_text && (
                      <div className='bg-gray-50 p-4 rounded-lg'>
                        <h4 className='font-semibold text-gray-900 mb-3'>
                          Notes and Recommendations
                        </h4>
                        <div className='text-sm'>
                          <p className='text-gray-700'>
                            {formData.notes_recommendations.recommendation_text}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Men's Health - Only show for male employees */}
                    {formData.mens_health?.recommendation_text && (
                      <div className='bg-blue-50 p-4 rounded-lg'>
                        <h4 className='font-semibold text-blue-900 mb-3'>
                          Men's Health
                        </h4>
                        <div className='text-sm'>
                          <p className='text-gray-700'>
                            {formData.mens_health.recommendation_text}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Women's Health - Only show for female employees */}
                    {formData.womens_health?.recommendation_text && (
                      <div className='bg-pink-50 p-4 rounded-lg'>
                        <h4 className='font-semibold text-pink-900 mb-3'>
                          Women's Health
                        </h4>
                        <div className='text-sm'>
                          <p className='text-gray-700'>
                            {formData.womens_health.recommendation_text}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Overview */}
                    {formData.overview?.notes_text && (
                      <div className='bg-slate-50 p-4 rounded-lg'>
                        <h4 className='font-semibold text-slate-900 mb-3'>
                          Overview
                        </h4>
                        <div className='text-sm'>
                          <p className='text-gray-700'>
                            {formData.overview.notes_text}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Important Information and Disclaimer */}
                    <div className='bg-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500'>
                      <h4 className='font-semibold text-yellow-900 mb-3'>
                        Important Information and Disclaimer
                      </h4>
                      <div className='text-sm text-yellow-800'>
                        <p className='whitespace-pre-line'>
                          {
                            formData.important_information_disclaimer
                              ?.disclaimer_text
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <div className='text-4xl mb-4'>📄</div>
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      Failed to load form data
                    </h3>
                    <p className='text-gray-500'>
                      Please try selecting the report again.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
