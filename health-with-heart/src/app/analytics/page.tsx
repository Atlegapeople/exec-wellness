'use client';

import { useState } from 'react';
import { useAPI } from '@/hooks/useAPI';
import DoctorProductivityChart from '@/components/charts/DoctorProductivityChart';
import MedicalOutcomesChart from '@/components/charts/MedicalOutcomesChart';
import VolumeAnalyticsChart from '@/components/charts/VolumeAnalyticsChart';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('productivity');

  // Fetch analytics data
  const { data: doctorData, loading: doctorLoading, error: doctorError } = useAPI('/api/analytics/doctor-productivity');
  const { data: outcomesData, loading: outcomesLoading, error: outcomesError } = useAPI('/api/analytics/medical-outcomes');
  const { data: volumeData, loading: volumeLoading, error: volumeError } = useAPI('/api/analytics/monthly-volume');

  const currentDate = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const tabs = [
    { id: 'productivity', name: 'Doctor Productivity', icon: '👨‍⚕️', description: 'Performance metrics and efficiency' },
    { id: 'outcomes', name: 'Medical Outcomes', icon: '📊', description: 'Health trends and fitness analysis' },
    { id: 'volume', name: 'Volume Analytics', icon: '📈', description: 'Appointment patterns and capacity' }
  ];

  const isLoading = doctorLoading || outcomesLoading || volumeLoading;
  const hasErrors = doctorError || outcomesError || volumeError;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <div className="flex items-center gap-4">
                <a 
                  href="/" 
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2"
                >
                  ← Back to Dashboard
                </a>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    📊 Medical Analytics
                  </h1>
                  <p className="text-sm text-gray-500">
                    Advanced insights for clinical decision making • {currentDate}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Dr. Smith</span> • Analytics View
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                DS
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap border-b-2 py-4 px-6 text-sm font-medium transition-all duration-200 rounded-t-lg`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{tab.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{tab.name}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Analytics Data</h3>
              <p className="text-gray-600">Analyzing medical insights and trends...</p>
              <div className="mt-4 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${doctorLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span>Doctor Productivity</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${outcomesLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span>Medical Outcomes</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${volumeLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span>Volume Analytics</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasErrors && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-500 text-xl">⚠️</span>
              <h3 className="font-semibold text-red-800">Data Loading Error</h3>
            </div>
            <p className="text-red-700">
              Some analytics data could not be loaded. Please check your database connection.
            </p>
            <div className="mt-4">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Content Tabs */}
        {!isLoading && !hasErrors && (
          <div className="space-y-8">
            {/* Doctor Productivity Tab */}
            {activeTab === 'productivity' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    👨‍⚕️ Doctor Productivity Analysis
                  </h2>
                  <p className="text-gray-600">
                    Performance metrics, completion rates, and efficiency analysis for the last 3 months.
                  </p>
                </div>
                {doctorData && <DoctorProductivityChart data={doctorData} />}
              </div>
            )}

            {/* Medical Outcomes Tab */}
            {activeTab === 'outcomes' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    📊 Medical Outcomes & Trends
                  </h2>
                  <p className="text-gray-600">
                    Health trends, fitness rates, and demographic analysis across age groups.
                  </p>
                </div>
                {outcomesData && <MedicalOutcomesChart data={outcomesData} />}
              </div>
            )}

            {/* Volume Analytics Tab */}
            {activeTab === 'volume' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    📈 Volume & Capacity Analytics
                  </h2>
                  <p className="text-gray-600">
                    Appointment patterns, peak hours analysis, and operational efficiency metrics.
                  </p>
                </div>
                {volumeData && <VolumeAnalyticsChart data={volumeData} />}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                🎯 Advanced Medical Analytics
              </h3>
              <p className="text-sm text-gray-600">
                Real-time insights from your OHMS database. Data automatically updates 
                as new medical reports and appointments are processed.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-semibold">
                ✅ Live database connection
              </div>
              <div className="text-sm text-green-600 font-semibold">
                ✅ Real-time analytics
              </div>
              <div className="text-sm text-green-600 font-semibold">
                ✅ Interactive visualizations
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}